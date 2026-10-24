<script setup>
    import { ref } from 'vue'

    import NewTask from '../components/NewTask.vue'

    const listName = ref('')
    const tempPerson = ref('')
    const assignedPeopleList = ref([])
    const room = ref('')
    const taskList = ref([])

    // Temp function before having the DB and a real ~search system for adding people
    function addPerson() {
        const name = tempPerson.value.trim()
        
        if (name != '' && !assignedPeopleList.value.includes(name)) {
            assignedPeopleList.value.push(name)
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

    function submitToDoList() {
        console.log(listName.value, assignedPeopleList.value, room.value, taskList.value)
    }
</script>
<template>
    <h1 class="my-4">Create a new To Do list</h1>

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

        <div>
            <button
                class="btn border-3 text-white fs-4 fw-bold rounded-pill w-100"
                style="background-color: #83cbeb; border-color: #215f9a"
            >
                Create To Do List
            </button>
        </div>
    </form>
</template>