<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { auth, apiFetch } from '../stores/auth.js'
    import NewTask from '../components/NewTask.vue'

    const router = useRouter()

    const listName = ref('')
    const description = ref('')
    const presets = ref([])
    const selectedPresetId = ref('')
    const roles = ref(['Receptionist', 'Housekeeping', 'Restaurant', 'Maintenance'])
    const selectedRole = ref('')
    const assignedRoles = ref([])
    const room = ref('')
    const taskList = ref([])
    const errorMessage = ref('')
    const isSubmitting = ref(false)

    const isManager = computed(() => auth.user?.role === 'Manager')

    // Roles that can still be assigned (the ones already added are hidden from the select)
    const availableRoles = computed(() =>
        roles.value.filter(role => !assignedRoles.value.includes(role))
    )

    async function fetchRoles() {
        try {
            const response = await apiFetch('/user/roles')
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
                roles.value = data
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err)
        }
    }

    async function fetchPresets() {
        try {
            const response = await apiFetch('/preset')
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
        fetchRoles()
        fetchPresets()
    })

    function addRole() {
        if (selectedRole.value && !assignedRoles.value.includes(selectedRole.value)) {
            assignedRoles.value.push(selectedRole.value)
            selectedRole.value = ''
        }
    }

    function removeRole(role) {
        assignedRoles.value = assignedRoles.value.filter(r => r !== role)
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

    // Fill the name, the description, the assigned roles and the tasks of the form with the ones of a preset
    // (the room is specific to each list, so it is kept as it is)
    function applyPreset() {
        const preset = presets.value.find(p => p.preset_id === selectedPresetId.value)
        if (!preset) {
            return
        }

        const formHasData =
            listName.value.trim() ||
            description.value.trim() ||
            taskList.value.length > 0 ||
            assignedRoles.value.length > 0
        if (formHasData && !window.confirm('Replace the name, the description, the assigned roles and the tasks of the form with the ones of this preset?')) {
            return
        }

        listName.value = preset.preset_title
        description.value = preset.preset_description || ''
        assignedRoles.value = (preset.assignedRoles || []).map(r => r.role || r)
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
            assignedRoles: assignedRoles.value,
            tasks: validTasks
        }

        try {
            const response = await apiFetch('/todo', {
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
    <div class="container-fluid py-4">
        <h1 class="h2 hotel-title mb-4">Create a new To Do list</h1>

        <div v-if="errorMessage" class="col-lg-8 col-xl-6 alert alert-danger py-2 mb-3">
            {{ errorMessage }}
        </div>

        <div class="card hotel-card hotel-form col-lg-8 col-xl-6 mb-4">
            <div class="card-body">
                <label for="presetSelect" class="form-label fw-bold">Create from preset</label>
                <div v-if="presets.length > 0" class="input-group">
                    <select id="presetSelect" class="form-select" v-model="selectedPresetId">
                        <option value="" disabled>Select a preset</option>
                        <option v-for="preset in presets" :key="preset.preset_id" :value="preset.preset_id">
                            {{ preset.preset_title }} ({{ preset.tasks.length }} task(s))
                        </option>
                    </select>
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        :disabled="selectedPresetId === ''"
                        @click="applyPreset"
                    >
                        Use preset
                    </button>
                </div>
                <p v-else class="text-muted mb-0">
                    No presets yet.
                    <template v-if="isManager">
                        You can create some in the <RouterLink to="/presets">Presets</RouterLink> page.
                    </template>
                </p>
            </div>
        </div>

        <form class="hotel-form col-lg-8 col-xl-6" @submit.prevent="submitToDoList">
            <section class="hotel-card p-3 p-sm-4 mb-3">
                <h2 class="h5 hotel-title mb-3">List details</h2>
                <div class="mb-3">
                    <label for="listName" class="form-label fw-bold">To Do List name</label>
                    <input id="listName" type="text" class="form-control" v-model="listName">
                </div>

                <div class="mb-3">
                    <label for="listDescription" class="form-label fw-bold">Description</label>
                    <textarea id="listDescription" class="form-control" rows="2" v-model="description"></textarea>
                </div>

                <div class="mb-0">
                    <label for="room" class="form-label fw-bold">Room Location</label>
                    <input id="room" type="text" class="form-control" v-model="room">
                </div>
            </section>

            <section class="hotel-card p-3 p-sm-4 mb-3">
                <h2 class="h5 hotel-title mb-3">Assigned roles</h2>
                <div>
                    <label for="roleName" class="form-label fw-bold">Assign Role(s)</label>
                    <div class="input-group">
                        <select id="roleName" class="form-select" v-model="selectedRole">
                            <option value="" disabled>Select a role</option>
                            <option v-for="role in availableRoles" :key="role" :value="role">
                                {{ role }}
                            </option>
                        </select>
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            :disabled="selectedRole === ''"
                            @click="addRole"
                        >
                            Add role
                        </button>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-2">
                        <span
                            v-for="role in assignedRoles"
                            :key="role"
                            class="badge hotel-badge d-inline-flex align-items-center gap-1"
                        >
                            {{ role }}
                            <button
                                type="button"
                                class="btn-close ms-1"
                                style="font-size: 0.6rem"
                                :aria-label="`Remove ${role}`"
                                @click="removeRole(role)"
                            ></button>
                        </span>
                    </div>
                </div>
            </section>

            <section class="hotel-card p-3 p-sm-4 mb-3">
                <h2 class="h5 hotel-title mb-3">Tasks</h2>
                <NewTask
                    v-for="task in taskList"
                    :key="task.id"
                    :task="task"
                    @update:title="task.title = $event"
                    @update:description="task.description = $event"
                    @remove="removeTask(task.id)"
                />

                <button type="button" class="btn btn-outline-secondary mt-2" @click="addTask">
                    + Add a task
                </button>
            </section>

            <div class="mt-4">
                <button
                    type="submit"
                    class="btn btn-hotel w-100"
                    :disabled="isSubmitting"
                >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    {{ isSubmitting ? 'Creation in progress...' : 'Create To Do List' }}
                </button>
            </div>
        </form>
    </div>
</template>
