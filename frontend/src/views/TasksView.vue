<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, apiFetch } from '../stores/auth.js'
import ToDoListCard from '../components/ToDoListCard.vue'

const todos = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const canCreateTodo = computed(() =>
    auth.user?.role === 'Manager' || auth.user?.role === 'Receptionist'
)

const visibleTodos = computed(() => {
    const role = auth.user?.role
    if (!role) return []
    if (role === 'Manager') return todos.value
    return todos.value.filter(todo =>
        (todo.assignedRoles || []).some(r => (r.role || r) === role)
    )
})

async function fetchTodos() {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await apiFetch('/todo')
        if (!response.ok) {
            throw new Error(`Server error (${response.status})`)
        }
        const data = await response.json()
        todos.value = data
    } catch (err) {
        console.error('Error fetching todos:', err)
        errorMessage.value = 'Unable to load the tasks. Check that the server is running.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchTodos()
})
</script>

<template>
  <div class="container-fluid py-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h2 mb-1">Hotel Tasks &amp; To-Do Lists</h1>
        <p class="text-muted mb-0">
          Follow the progress of the tasks and the state of the rooms.
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="isLoading"
          @click="fetchTodos"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-1"
            aria-hidden="true"
          ></span>
          Refresh
        </button>

        <RouterLink v-if="canCreateTodo" to="/newtodolist" class="btn btn-hotel">
          + New list
        </RouterLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Loading tasks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
      {{ errorMessage }}
      <div class="mt-2">
        <button class="btn btn-sm btn-outline-danger" @click="fetchTodos">Try again</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="visibleTodos.length === 0" class="text-center py-5 border rounded bg-light">
      <h3 class="h5 text-muted mb-2">No tasks yet</h3>
      <p class="text-muted mb-0">
        {{ canCreateTodo ? 'Create your first To Do list with tasks to get started.' : 'No To Do lists are assigned to your role yet.' }}
      </p>
    </div>

    <!-- Cards Grid -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      <div v-for="todo in visibleTodos" :key="todo.to_do_id" class="col">
        <ToDoListCard
          :todoId="todo.to_do_id"
          :taskName="todo.to_do_title"
          :taskDescription="todo.to_do_description"
          :roomLocation="todo.to_do_location"
          :assignRoles="todo.assignedRoles || []"
          :joinedUsers="todo.assignedUsers || []"
          :tasks="todo.tasks || []"
          @task-updated="fetchTodos"
        />
      </div>
    </div>
  </div>
</template>
