<script setup>
    import { ref } from 'vue'
    import DetailledTaskCard from './DetailledTaskCard.vue'

    defineProps({
        taskName: String,
        taskDescription: String,
        roomLocation: String,
        assignPeople: Array
    })

    const showDetails = ref(false)
    
    const tasks = ref([
        { id: 1, title: "Clean mirrors", completed: true },
        { id: 2, title: "Change sheets", completed: false },
        { id: 3, title: "Clean Bath", completed: false }
    ])

    function displayTaskProgression() {
        let done = 0

        for (const task of tasks.value) {
            if (task.completed === true) {
                done++
            }
        }

        return `${done}/${tasks.value.length} task(s) done.`
    }
</script>
<template>
    <div class="card">
                <div class="card-body">
                    <h1 class="card-title">{{ taskName }}</h1>
                    <p class="card-text">{{ taskDescription }}</p>
                    <p class="card-text">{{ roomLocation }}</p>
                    <p class="card-text"> {{ displayTaskProgression() }} </p>

                    <ul>
                        <li v-for="person in assignPeople">{{ person.name }}</li>
                    </ul>

                    <button class="btn btn-primary" @click="showDetails = true">Details</button>
                </div>
            </div>

    <DetailledTaskCard 
        v-if="showDetails" 
        @close="showDetails = false" 
        :tasks="tasks"
        :taskName="taskName"
        :taskDescription="taskDescription"
        :roomLocation="roomLocation"
        :assignPeople="assignPeople"
    />
</template>