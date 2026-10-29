<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'task-updated'])

const props = defineProps({
    todoId: [Number, String],
    taskName: String,
    taskDescription: String,
    roomLocation: String,
    assignPeople: {
        type: Array,
        default: () => []
    },
    tasks: {
        type: Array,
        default: () => []
    }
})

const newTaskTitle = ref('')

async function toggleTask(task) {
    const currentStatus = !!(task.task_done || task.completed)
    const newStatus = !currentStatus
    task.task_done = newStatus
    task.completed = newStatus

    const taskId = task.task_id || task.id
    if (taskId) {
        try {
            await fetch(`http://localhost:8080/api/task/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_done: newStatus })
            })
            emit('task-updated')
        } catch (e) {
            console.error('Failed to update task:', e)
        }
    }
}

async function addNewTask() {
    if (!newTaskTitle.value.trim() || !props.todoId) return

    try {
        const response = await fetch('http://localhost:8080/api/task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task_title: newTaskTitle.value.trim(),
                to_do_id: props.todoId,
                task_done: false
            })
        })

        if (response.ok) {
            const created = await response.json()
            props.tasks.push(created)
            newTaskTitle.value = ''
            emit('task-updated')
        }
    } catch (e) {
        console.error('Failed to create task:', e)
    }
}
</script>

<template>
    <div class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style="background: rgba(0,0,0,0.5); z-index: 1050;" @click.self="$emit('close')">
        <div class="card w-75 shadow-lg" style="max-height: 90vh; overflow-y: auto;">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-1">{{ taskName }}</h5>
                    <p class="text-muted mb-0">{{ taskDescription }}</p>
                </div>
                <div class="text-end">
                    <span v-if="roomLocation" class="badge bg-primary p-2 me-2">Room {{ roomLocation }}</span>
                    <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
                </div>
            </div>
            
            <div class="card-body">
                <div v-if="assignPeople && assignPeople.length > 0" class="mb-3">
                    <h6>Assigned people:</h6>
                    <div class="d-flex flex-wrap gap-2">
                        <span v-for="person in assignPeople" :key="person.user_id || person.id || person" class="badge bg-secondary">
                            {{ person.user_firstname ? `${person.user_firstname} ${person.user_lastname}` : (person.name || person) }}
                        </span>
                    </div>
                </div>

                <h6>Tasks:</h6>
                <div v-if="!tasks || tasks.length === 0" class="text-muted mb-3">
                    No tasks in this list yet.
                </div>
                <ul v-else class="list-group mb-3">
                    <li v-for="task in tasks" :key="task.task_id || task.id" class="list-group-item d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <input 
                                class="form-check-input me-3" 
                                type="checkbox" 
                                :id="'task-' + (task.task_id || task.id)" 
                                :checked="task.task_done || task.completed"
                                @change="toggleTask(task)"
                            >
                            <label 
                                class="form-check-label mb-0" 
                                :for="'task-' + (task.task_id || task.id)" 
                                :class="{'text-decoration-line-through text-muted': task.task_done || task.completed}"
                            >
                                <span class="fw-semibold">{{ task.task_title || task.title }}</span>
                                <span v-if="task.task_description || task.description" class="d-block small text-muted">
                                    {{ task.task_description || task.description }}
                                </span>
                            </label>
                        </div>
                        <span class="badge" :class="(task.task_done || task.completed) ? 'bg-success' : 'bg-warning text-dark'">
                            {{ (task.task_done || task.completed) ? 'Done' : 'Pending' }}
                        </span>
                    </li>
                </ul>

                <div v-if="todoId" class="mt-3 pt-2 border-top">
                    <label class="form-label fw-bold small">Add a task to this list</label>
                    <div class="input-group">
                        <input 
                            v-model="newTaskTitle" 
                            type="text" 
                            class="form-control" 
                            placeholder="New task title..."
                            @keyup.enter="addNewTask"
                        >
                        <button class="btn text-white fw-bold" style="background-color: #83cbeb" type="button" @click="addNewTask">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
