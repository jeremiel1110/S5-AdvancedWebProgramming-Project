<script setup>
    import { ref } from 'vue'

    import SideBar from '../components/SideBar.vue'
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
    <div class="container-fluid">
        <div class="row min-vh-100">
        
        <SideBar class="col-auto bg-info"/>



        <main class="col">
            <h1>Create a new To Do list</h1>

            <form @submit.prevent="submitToDoList">
                <label for="listName">To Do List name: </label>
                <input id="listName" type="text" v-model="listName">
                <br>
                <!-- To Change with like a search that can show people name -->
                <label for="personName">Assign Person(s): </label>
                <input id="personName" type="text" v-model="tempPerson">
                <button type="button" @click="addPerson">Add person</button>

                <ul>
                    <li v-for="person in assignedPeopleList">
                        {{ person }}
                    </li>
                </ul>
                <br>
                <label for="room">Room Location: </label>
                <input id="room" type="text" v-model="room">
                <br>

                <NewTask
                    v-for="task in taskList"
                    :key="task.id"
                    :task="task"
                    @update:title="task.title = $event"
                    @update:description="task.description = $event"
                />

                <button type="button" @click="addTask">Add a task</button>
                <br>

                <button>Create To Do List</button>
            </form>

        </main>

        </div>
    </div>
</template>