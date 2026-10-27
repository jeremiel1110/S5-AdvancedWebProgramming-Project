<script setup>
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { auth } from '../stores/auth.js'
    import NewTask from '../components/NewTask.vue'

    const router = useRouter()

    const listName = ref('')
    const tempPerson = ref('')
    const assignedPeopleList = ref([])
    const room = ref('')
    const taskList = ref([])
    const errorMessage = ref('')
    const isSubmitting = ref(false)

    // Temp function before having the DB and a real ~search system for adding people
    function addPerson() {
        const name = tempPerson.value.trim()
        
        if (name != '' && !assignedPeopleList.value.includes(name)) {
            assignedPeopleList.value.push(name)
            tempPerson.value = ''
        }
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

    async function submitToDoList() {
        if (!listName.value.trim()) {
            errorMessage.value = 'Le nom de la liste est obligatoire.'
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
            to_do_description: '',
            user_id: auth.user?.id || 1,
            tasks: validTasks
        }

        try {
            const response = await fetch('http://localhost:8080/api/todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.message || 'Erreur lors de la création de la To-Do list.')
            }

            router.push('/tasks')
        } catch (err) {
            console.error('Failed to create todo list:', err)
            errorMessage.value = err.message || 'Erreur de connexion au serveur.'
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

    <form class="col-lg-6 pb-5" @submit.prevent="submitToDoList">
        <div class="mb-3">
            <label for="listName" class="form-label fw-bold">To Do List name</label>
            <input id="listName" type="text" class="form-control bg-light border-dark" v-model="listName">
        </div>

        <div class="mb-3">
            <!-- To Change with like a search that can show people name -->
            <label for="personName" class="form-label fw-bold">Assign Person(s)</label>
            <div class="input-group">
                <input id="personName" type="text" class="form-control bg-light border-dark" v-model="tempPerson">
                <button
                    type="button"
                    class="btn border-dark text-white fw-bold"
                    style="background-color: #83cbeb"
                    @click="addPerson"
                >
                    Add person
                </button>
            </div>

            <div class="d-flex flex-wrap gap-2 mt-2">
                <span
                    v-for="person in assignedPeopleList"
                    :key="person"
                    class="badge rounded-pill text-bg-secondary fs-6"
                >
                    {{ person }}
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