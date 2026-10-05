<script setup>
    import { ref } from 'vue'
    import DetailledTaskCard from './DetailledTaskCard.vue'

    defineProps({
        taskName: String,
        taskDescription: String,
        roomLocalisation: String,
        assignPeople: Array
    })

    const showDetails = ref(false)
    
    const tasks_1 = ref([
        { id: 1, title: "Clean mirrors", completed: true },
        { id: 2, title: "Change sheets", completed: false },
        { id: 3, title: "Clean Bath", completed: false }
    ])
</script>
<template>
    <div class="card">
                <div class="card-body">
                    <h1 class="card-title">{{ taskName }}</h1>
                    <p class="card-text">{{ taskDescription }}</p>
                    <p class="card-text">{{ roomLocalisation }}</p>
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
        :roomLocalisation="roomLocalisation"
        :assignPeople="assignPeople"
    />
</template>