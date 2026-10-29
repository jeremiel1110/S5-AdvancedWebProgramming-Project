<script setup>
    import { ref } from 'vue'
    import DetailledTaskCard from './DetailledTaskCard.vue'

    const emit = defineEmits(['task-updated'])

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

    const showDetails = ref(false)

    function displayTaskProgression() {
        if (!props.tasks || props.tasks.length === 0) {
            return '0 tasks in this list'
        }

        let done = 0
        for (const task of props.tasks) {
            if (task.task_done || task.completed) {
                done++
            }
        }

        return `${done}/${props.tasks.length} task(s) done`
    }

    async function toggleTaskDirect(task) {
        const currentStatus = Boolean(task.task_done || task.completed)
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
</script>

<template>
    <div class="card h-100 shadow-sm border-dark-subtle">
        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h4 class="card-title mb-0">{{ taskName }}</h4>
                <span v-if="roomLocation" class="badge bg-primary fs-6">Room {{ roomLocation }}</span>
            </div>

            <p v-if="taskDescription" class="card-text text-muted mb-2">{{ taskDescription }}</p>

            <div class="d-flex justify-content-between align-items-center my-2">
                <span class="card-text fw-semibold text-secondary small">
                    {{ displayTaskProgression() }}
                </span>
            </div>

            <!-- Tasks directly visible on the card -->
            <div class="my-2">
                <div class="small fw-bold text-muted mb-2">Tasks:</div>
                <div v-if="!tasks || tasks.length === 0" class="small text-muted fst-italic">
                    No tasks yet.
                </div>
                <ul v-else class="list-group list-group-flush border rounded-2 mb-2">
                    <li 
                        v-for="task in tasks" 
                        :key="task.task_id || task.id" 
                        class="list-group-item d-flex align-items-center justify-content-between py-2 px-3"
                    >
                        <div class="d-flex align-items-center flex-grow-1 me-2">
                            <input 
                                class="form-check-input me-2 mt-0" 
                                type="checkbox" 
                                :id="'card-task-' + (task.task_id || task.id)" 
                                :checked="Boolean(task.task_done || task.completed)"
                                @change="toggleTaskDirect(task)"
                            >
                            <label 
                                class="form-check-label small mb-0" 
                                :for="'card-task-' + (task.task_id || task.id)" 
                                :class="{'text-decoration-line-through text-muted': task.task_done || task.completed}"
                            >
                                {{ task.task_title || task.title }}
                            </label>
                        </div>
                        <span class="badge" :class="(task.task_done || task.completed) ? 'bg-success' : 'bg-secondary'" style="font-size: 0.7rem;">
                            {{ (task.task_done || task.completed) ? 'Done' : 'Pending' }}
                        </span>
                    </li>
                </ul>
            </div>

            <div v-if="assignPeople && assignPeople.length > 0" class="mt-auto mb-3">
                <div class="small fw-bold text-muted mb-1">Assigned people:</div>
                <div class="d-flex flex-wrap gap-1">
                    <span 
                        v-for="person in assignPeople" 
                        :key="person.user_id || person.id || person"
                        class="badge text-bg-light border"
                    >
                        {{ person.user_firstname ? `${person.user_firstname} ${person.user_lastname}` : (person.name || person) }}
                    </span>
                </div>
            </div>

            <button 
                class="btn border-dark text-white fw-bold mt-2" 
                style="background-color: #83cbeb"
                @click="showDetails = true"
            >
                Details and management
            </button>
        </div>
    </div>

    <DetailledTaskCard 
        v-if="showDetails" 
        @close="showDetails = false" 
        @task-updated="emit('task-updated')"
        :todoId="todoId"
        :tasks="tasks"
        :taskName="taskName"
        :taskDescription="taskDescription"
        :roomLocation="roomLocation"
        :assignPeople="assignPeople"
    />
</template>