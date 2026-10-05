<script setup>
    defineProps({
        taskName: String,
        taskDescription: String,
        roomLocalisation: String,
        assignPeople: Array
    })
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

                    <button class="btn btn-primary">Details</button>
                </div>
            </div>
</template>