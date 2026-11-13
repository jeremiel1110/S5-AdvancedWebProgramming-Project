<script setup>
    import { computed, ref } from 'vue'
    import { apiFetch } from '../stores/auth.js'
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

    const taskCount = computed(() => props.tasks?.length ?? 0)
    const completedCount = computed(() =>
        props.tasks?.filter(task => task.task_done || task.completed).length ?? 0
    )

    async function toggleTaskDirect(task) {
        const currentStatus = Boolean(task.task_done || task.completed)
        const newStatus = !currentStatus
        task.task_done = newStatus
        task.completed = newStatus

        const taskId = task.task_id || task.id
        if (taskId) {
            try {
                const response = await apiFetch(`http://localhost:8080/api/task/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task_done: newStatus })
                })
                if (!response.ok) throw new Error(`Server error (${response.status})`)
                emit('task-updated')
            } catch (e) {
                console.error('Failed to update task:', e)
            }
        }
    }
</script>

<template>
    <div class="card h-100 room-card">
        <div class="card-body d-flex flex-column">
            <div class="mb-2">
                <span v-if="roomLocation" class="badge hotel-badge mb-2">
                    Room {{ roomLocation }}
                </span>
                <h4 class="card-title hotel-title mb-0">{{ taskName }}</h4>
            </div>

            <p v-if="taskDescription" class="card-text text-muted mb-2">{{ taskDescription }}</p>

            <div v-if="taskCount > 0" class="my-2">
                <span class="small fw-semibold text-secondary">
                    {{ completedCount }} of {{ taskCount }} {{ taskCount === 1 ? 'task' : 'tasks' }} complete
                </span>
                <progress
                    class="room-progress"
                    :value="completedCount"
                    :max="taskCount"
                    aria-label="Task progress"
                ></progress>
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
                        class="list-group-item d-flex align-items-center py-2 px-3"
                    >
                        <input 
                            class="form-check-input flex-shrink-0 me-2 mt-0" 
                            type="checkbox" 
                            :id="'card-task-' + (task.task_id || task.id)" 
                            :checked="Boolean(task.task_done || task.completed)"
                            @change="toggleTaskDirect(task)"
                        >
                        <label 
                            class="form-check-label small text-break mb-0" 
                            :for="'card-task-' + (task.task_id || task.id)" 
                            :class="{'text-decoration-line-through text-muted': task.task_done || task.completed}"
                        >
                            {{ task.task_title || task.title }}
                        </label>
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
                type="button"
                class="btn btn-hotel mt-2"
                @click="showDetails = true"
            >
                View details
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
<style scoped>
.room-card {
    border: 1px solid #e2e8e4;
    border-radius: 16px;
    background-color: #fff;
    box-shadow: 0 4px 16px rgb(23 58 52 / 8%);
}

.room-card .card-body {
    padding: 1.25rem;
}

.room-card .card-title {
    font-size: 1.125rem;
    font-weight: 700;
}

.room-progress {
    display: block;
    width: 100%;
    height: 0.5rem;
    margin-top: 0.375rem;
    appearance: none;
    border: 0;
    border-radius: 999px;
    overflow: hidden;
    background-color: var(--hotel-green-soft);
}

.room-progress::-webkit-progress-bar {
    background-color: var(--hotel-green-soft);
}

.room-progress::-webkit-progress-value {
    background-color: var(--hotel-green);
}

.room-progress::-moz-progress-bar {
    background-color: var(--hotel-green);
}
</style>