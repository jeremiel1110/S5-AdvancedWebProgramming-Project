<script setup>
import { ref, computed } from 'vue'
import { auth, apiFetch } from '../stores/auth.js'

const emit = defineEmits(['close', 'task-updated'])

const props = defineProps({
    todoId: [Number, String],
    taskName: String,
    taskDescription: String,
    roomLocation: String,
    assignRoles: {
        type: Array,
        default: () => []
    },
    joinedUsers: {
        type: Array,
        default: () => []
    },
    tasks: {
        type: Array,
        default: () => []
    }
})

const newTaskTitle = ref('')
const isJoiningOrLeaving = ref(false)
const isDeleting = ref(false)
const deleteError = ref('')

const currentUserId = computed(() => auth.user?.id || auth.user?.user_id)
const hasJoined = computed(() =>
    (props.joinedUsers || []).some(u => Number(u.user_id || u.id) === Number(currentUserId.value))
)

const canCreateTask = computed(() =>
    auth.user?.role === 'Manager' || auth.user?.role === 'Receptionist'
)

// Same rule as the server: only a Manager or a Receptionist can delete a To Do list
const canDeleteTodo = computed(() =>
    auth.user?.role === 'Manager' || auth.user?.role === 'Receptionist'
)

async function toggleJoin() {
    if (!props.todoId || isJoiningOrLeaving.value) return
    isJoiningOrLeaving.value = true
    const action = hasJoined.value ? 'leave' : 'join'
    try {
        const response = await apiFetch(`/todo/${props.todoId}/${action}`, {
            method: 'POST'
        })
        if (!response.ok) throw new Error(`Server error (${response.status})`)
        emit('task-updated')
    } catch (e) {
        console.error(`Failed to ${action} todo:`, e)
    } finally {
        isJoiningOrLeaving.value = false
    }
}

async function deleteTodo() {
    if (!props.todoId || isDeleting.value) return
    if (!window.confirm(`Delete the To Do list "${props.taskName}" and all its tasks? This cannot be undone.`)) return

    isDeleting.value = true
    deleteError.value = ''
    try {
        const response = await apiFetch(`/todo/${props.todoId}`, {
            method: 'DELETE'
        })
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}))
            throw new Error(errData.message || `Server error (${response.status})`)
        }
        emit('task-updated')
        emit('close')
    } catch (e) {
        console.error('Failed to delete todo:', e)
        deleteError.value = e.message || 'Unable to delete the To Do list.'
    } finally {
        isDeleting.value = false
    }
}

async function toggleTask(task, event) {
    if (!hasJoined.value) {
        if (event?.target) {
            event.target.checked = Boolean(task.task_done || task.completed)
        }
        return
    }

    const currentStatus = !!(task.task_done || task.completed)
    const newStatus = !currentStatus
    task.task_done = newStatus
    task.completed = newStatus

    const taskId = task.task_id || task.id
    if (taskId) {
        try {
            const response = await apiFetch(`/task/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_done: newStatus })
            })
            if (!response.ok) {
                task.task_done = currentStatus
                task.completed = currentStatus
                throw new Error(`Server error (${response.status})`)
            }
            emit('task-updated')
        } catch (e) {
            console.error('Failed to update task:', e)
        }
    }
}

async function addNewTask() {
    if (!newTaskTitle.value.trim() || !props.todoId) return

    try {
        const response = await apiFetch('/task', {
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
        <div class="card hotel-card hotel-form w-100 mx-3" style="max-width: 48rem; max-height: 90vh; overflow-y: auto;">
            <div class="card-header bg-transparent d-flex justify-content-between align-items-start gap-2 p-3">
                <div>
                    <h5 class="hotel-title mb-1">{{ taskName }}</h5>
                    <p class="text-muted mb-0">{{ taskDescription }}</p>
                </div>
                <div class="text-end">
                    <span v-if="roomLocation" class="badge hotel-badge me-2">Room {{ roomLocation }}</span>
                    <button type="button" class="btn-close" aria-label="Close" @click="$emit('close')"></button>
                </div>
            </div>
            
            <div class="card-body">
                <div class="mb-3">
                    <h6>Assigned role(s):</h6>
                    <div v-if="!assignRoles || assignRoles.length === 0" class="text-muted small fst-italic">
                        No role assigned.
                    </div>
                    <div v-else class="d-flex flex-wrap gap-2">
                        <span v-for="roleItem in assignRoles" :key="roleItem.role || roleItem" class="badge hotel-badge">
                            {{ roleItem.role || roleItem }}
                        </span>
                    </div>
                </div>

                <div class="mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border rounded-2 p-3 bg-light">
                    <div>
                        <h6 class="mb-1">Joined by:</h6>
                        <div v-if="!joinedUsers || joinedUsers.length === 0" class="text-muted small fst-italic">
                            No member has joined this To-Do yet.
                        </div>
                        <div v-else class="d-flex flex-wrap gap-2">
                            <span v-for="person in joinedUsers" :key="person.user_id || person.id" class="badge bg-secondary">
                                {{ person.user_firstname }} {{ person.user_lastname }} ({{ person.role }})
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="btn btn-sm"
                        :class="hasJoined ? 'btn-outline-danger' : 'btn-hotel'"
                        :disabled="isJoiningOrLeaving"
                        @click="toggleJoin"
                    >
                        {{ hasJoined ? 'Leave To-Do' : 'Join To-Do' }}
                    </button>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">Tasks:</h6>
                    <span v-if="!hasJoined && tasks && tasks.length > 0" class="small text-muted fst-italic">
                        You must join this To-Do to check tasks.
                    </span>
                </div>
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
                                :disabled="!hasJoined"
                                @change="toggleTask(task, $event)"
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

                <div v-if="todoId && canCreateTask" class="mt-3 pt-2 border-top">
                    <label class="form-label fw-bold small">Add a task to this list</label>
                    <div class="input-group">
                        <input 
                            v-model="newTaskTitle" 
                            type="text" 
                            class="form-control" 
                            placeholder="New task title..."
                            @keyup.enter="addNewTask"
                        >
                        <button class="btn btn-hotel" type="button" @click="addNewTask">
                            Add
                        </button>
                    </div>
                </div>

                <div v-if="todoId && canDeleteTodo" class="mt-4 pt-3 border-top">
                    <div v-if="deleteError" class="alert alert-danger py-2" role="alert">
                        {{ deleteError }}
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm" :disabled="isDeleting" @click="deleteTodo">
                        <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Delete this To-Do
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
