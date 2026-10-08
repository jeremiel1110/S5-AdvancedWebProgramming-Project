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
        const remaining = 0
        const total = 0

        for (task in tasks) {
            if (task.completed === false) {
                remaining++
            }
            total++
        }

        return remaining + "/" + total + " task remaining."
    }
</script>
<template>
    <div class="card">
                <div class="card-body">
                    <h1 class="card-title">{{ taskName }}</h1>
                    <p class="card-text">{{ taskDescription }}</p>
                    <p class="card-text">{{ roomLocation }}</p>
                    <p class="card-text"> Method do display number of task done / total number of tasks in the to do list </p>

                    <ul>
                        <li v-for="person in assignPeople">{{ person.name }}</li>
                    </ul>

                    <button class="btn btn-primary" @click="showDetails = true">Details</button>
                </div>
            </div>

    <DetailledTaskCard 
        v-if="showDetails" 
        @close="showDetails = false" 
        :tasks="tasks_1"
        :taskName="taskName"
        :taskDescription="taskDescription"
        :roomLocation="roomLocation"
        :assignPeople="assignPeople"
    />
</template>