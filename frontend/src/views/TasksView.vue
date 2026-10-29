<script setup>
import { ref, onMounted } from 'vue'
import ToDoListCard from '../components/ToDoListCard.vue'

const todos = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

async function fetchTodos() {
    isLoading.value = true
    errorMessage.value = ''
    try {
        const response = await fetch('http://localhost:8080/api/todo')
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
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h2 mb-1">Hotel Tasks & To-Do Lists</h1>
        <p class="text-muted mb-0">Follow the progress of the tasks and the state of the rooms.</p>
      </div>
      <button 
        class="btn btn-outline-secondary btn-sm"
        @click="fetchTodos" 
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
        Refresh
      </button>
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
    <div v-else-if="todos.length === 0" class="text-center py-5 border rounded bg-light">
      <h3 class="h5 text-muted mb-2">No tasks yet</h3>
      <p class="text-muted mb-3">Create your first To Do list with tasks to get started.</p>
      <RouterLink to="/newtodolist" class="btn text-white fw-bold" style="background-color: #83cbeb">
        + Create a To Do List
      </RouterLink>
    </div>

    <!-- Cards Grid -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      <div v-for="todo in todos" :key="todo.to_do_id" class="col">
        <ToDoListCard
          :todoId="todo.to_do_id"
          :taskName="todo.to_do_title"
          :taskDescription="todo.to_do_description"
          :roomLocation="todo.to_do_location"
          :assignPeople="todo.assignedUsers || []"
          :tasks="todo.tasks || []"
          @task-updated="fetchTodos"
        />
      </div>
    </div>
  </div>
</template>