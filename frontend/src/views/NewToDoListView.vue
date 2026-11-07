<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { apiFetch } from '../stores/auth.js'
    import NewTask from '../components/NewTask.vue'

    const router = useRouter()

    const listName = ref('')
    const description = ref('')
    const presets = ref([])
    const selectedPresetId = ref('')
    const users = ref([])
    const selectedUserId = ref('')
    const assignedUsers = ref([])
    const room = ref('')
    const taskList = ref([])
    const errorMessage = ref('')
    const isSubmitting = ref(false)

    // Users that can still be assigned (the ones already added are hidden from the select)
    const availableUsers = computed(() =>
        users.value.filter(u => !assignedUsers.value.some(a => a.user_id === u.user_id))
    )

    async function fetchUsers() {
        try {
            const response = await apiFetch('http://localhost:8080/api/user')
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            users.value = await response.json()
        } catch (err) {
            console.error('Failed to fetch users:', err)
            errorMessage.value = 'Unable to load the list of users.'
        }
    }

    async function fetchPresets() {
        try {
            const response = await apiFetch('http://localhost:8080/api/preset')
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            presets.value = await response.json()
        } catch (err) {
            // The form still works without presets, so no error message here
            console.error('Failed to fetch presets:', err)
        }
    }

    onMounted(() => {
        fetchUsers()
        fetchPresets()
    })

    function addPerson() {
        const user = users.value.find(u => u.user_id === selectedUserId.value)

        if (user) {
            assignedUsers.value.push(user)
            selectedUserId.value = ''
        }
    }

    function removePerson(userId) {
        assignedUsers.value = assignedUsers.value.filter(u => u.user_id !== userId)
    }

    let nextTaskId = 0

    function addTask() {
        taskList.value.push({
            id: nextTaskId++,
            title: '',
            description: '',
            done: false
        })
    }

    function removeTask(taskId) {
        taskList.value = taskList.value.filter(t => t.id !== taskId)
    }

    // Fill the name, the description and the tasks of the form with the ones of a preset
    // (the room and the assigned people are specific to each list, so they are kept as they are)
    function applyPreset() {
        const preset = presets.value.find(p => p.preset_id === selectedPresetId.value)
        if (!preset) {
            return
        }

        const formHasData = listName.value.trim() || description.value.trim() || taskList.value.length > 0
        if (formHasData && !window.confirm('Replace the name, the description and the tasks of the form with the ones of this preset?')) {
            return
        }

        listName.value = preset.preset_title
        description.value = preset.preset_description || ''
        taskList.value = (preset.tasks || []).map(task => ({
            id: nextTaskId++,
            title: task.preset_task_title,
            description: task.preset_task_description || '',
            done: false
        }))
        selectedPresetId.value = ''
    }

    async function submitToDoList() {
        if (!listName.value.trim()) {
            errorMessage.value = 'The name of the list is required.'
            return
        }

        errorMessage.value = ''
        isSubmitting.value = true

        const validTasks = taskList.value
            .filter(t => t.title && t.title.trim() !== '')
            .map(t => ({
                task_title: t.title.trim(),
                task_description: t.description ? t.description.trim() : '',
                task_done: false
            }))

        const payload = {
            to_do_title: listName.value.trim(),
            to_do_location: room.value ? room.value.trim() : '',
            to_do_description: description.value.trim(),
            assignedUserIds: assignedUsers.value.map(u => u.user_id),
            tasks: validTasks
        }

        try {
            const response = await apiFetch('http://localhost:8080/api/todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.message || 'Error while creating the To Do list.')
            }

            router.push('/tasks')
        } catch (err) {
            console.error('Failed to create todo list:', err)
            errorMessage.value = err.message || 'Unable to reach the server.'
        } finally {
            isSubmitting.value = false
        }
    }
</script>
<template>
    <h1 class="my-4">Create a new To Do list</h1>

    <div v-if="errorMessage" class="col-lg-6 alert alert-danger py-2 mb-3">
        {{ errorMessage }}
    </div>

    <div class="col-lg-6 card shadow-sm border-dark-subtle mb-4">
        <div class="card-body">
            <label for="presetSelect" class="form-label fw-bold">Create from preset</label>
            <div v-if="presets.length > 0" class="input-group">
                <select id="presetSelect" class="form-select bg-light border-dark" v-model="selectedPresetId">
                    <option value="" disabled>Select a preset</option>
                    <option v-for="preset in presets" :key="preset.preset_id" :value="preset.preset_id">
                        {{ preset.preset_title }} ({{ preset.tasks.length }} task(s))
                    </option>
                </select>
                <button
                    type="button"
                    class="btn border-dark text-white fw-bold"
                    style="background-color: #83cbeb"
                    :disabled="selectedPresetId === ''"
                    @click="applyPreset"
                >
                    Use preset
                </button>
            </div>
            <p v-else class="text-muted mb-0">
                No presets yet. You can create some in the <RouterLink to="/presets">Presets</RouterLink> page.
            </p>
        </div>
    </div>

    <form class="col-lg-6 pb-5" @submit.prevent="submitToDoList">
        <div class="mb-3">
            <label for="listName" class="form-label fw-bold">To Do List name</label>
            <input id="listName" type="text" class="form-control bg-light border-dark" v-model="listName">
        </div>

        <div class="mb-3">
            <label for="listDescription" class="form-label fw-bold">Description</label>
            <textarea id="listDescription" class="form-control bg-light border-dark" rows="2" v-model="description"></textarea>
        </div>

        <div class="mb-3">
            <label for="personName" class="form-label fw-bold">Assign Person(s)</label>
            <div class="input-group">
                <select id="personName" class="form-select bg-light border-dark" v-model="selectedUserId">
                    <option value="" disabled>Select a person</option>
                    <option v-for="user in availableUsers" :key="user.user_id" :value="user.user_id">
                        {{ user.user_firstname }} {{ user.user_lastname }} ({{ user.role }})
                    </option>
                </select>
                <button
                    type="button"
                    class="btn border-dark text-white fw-bold"
                    style="background-color: #83cbeb"
                    :disabled="selectedUserId === ''"
                    @click="addPerson"
                >
                    Add person
                </button>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-2">
                <span
                    v-for="person in assignedUsers"
                    :key="person.user_id"
                    class="badge rounded-pill text-bg-secondary fs-6"
                >
                    {{ person.user_firstname }} {{ person.user_lastname }}
                    <button
                        type="button"
                        class="btn-close btn-close-white ms-1"
                        style="font-size: 0.6rem"
                        :aria-label="`Remove ${person.user_firstname} ${person.user_lastname}`"
                        @click="removePerson(person.user_id)"
                    ></button>
                </span>
            </div>
        </div>

        <div class="mb-4">
            <label for="room" class="form-label fw-bold">Room Location</label>
            <input id="room" type="text" class="form-control bg-light border-dark" v-model="room">
        </div>

        <h2 class="fs-4">Tasks</h2>

        <NewTask
            v-for="task in taskList"
            :key="task.id"
            :task="task"
            @update:title="task.title = $event"
            @update:description="task.description = $event"
            @remove="removeTask(task.id)"
        />

        <button type="button" class="btn btn-outline-dark rounded-pill mt-2 mb-4" @click="addTask">
            + Add a task
        </button>

        <div class="mt-4">
            <button
                type="submit"
                class="btn border-3 text-white fs-4 fw-bold rounded-pill w-100"
                style="background-color: #83cbeb; border-color: #215f9a"
                :disabled="isSubmitting"
            >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isSubmitting ? 'Creation in progress...' : 'Create To Do List' }}
            </button>
        </div>
    </form>
</template>
