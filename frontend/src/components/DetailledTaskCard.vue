<script setup>

defineEmits(['close'])

defineProps({
    taskName: String,
    taskDescription: String,
    roomLocalisation: String,
    assignPeople: Array,
    tasks: Array
})
</script>

<template>
    <div class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" @click.self="$emit('close')">
        <div class="card w-75">
            <div class="card-header d-flex justify-content-between">
                <div>
                    <h5 class="mb-1">{{ taskName }}</h5>
                    <p class="text-muted">{{ taskDescription }}</p>
                </div>
                <div class="text-end">
                    <span class="badge bg-primary p-2 mt-1 me-2">Room {{ roomLocalisation }}</span>
                    <button class="btn btn-outline-danger" @click="$emit('close')">X</button>
                    <!-- <br> -->
                </div>
            </div>
            
            <div class="card-body">
                <h6>Assigned people :</h6>
                <ul>
                    <li v-for="person in assignPeople" :key="person.id">{{ person.name }}</li>
                </ul>

                <h6>Tasks :</h6>
                <ul>
                    <li v-for="task in tasks" :key="task.id" class="list-group-item d-flex align-items-center">
                        <input class="form-check-input me-2" type="checkbox" v-model="task.completed">
                        <label class="form-check-label" :for="'task-' + task.id" :class="{'text-decoration-line-through text-muted': task.completed}">
                            {{ task.title }}
                        </label>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
