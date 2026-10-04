<script setup>
  import { ref } from 'vue'
  
  const taskName = ref("Task n°67")
  const taskDescription = ref("Follow the tasks to clean the room")
  const roomLocalisation = ref('Clean room 1228')
  
  const tasks = ref([{ title: 'fee', done: false }, { title: 'foo', done: true }])
  function nbOfTaskDone() {
    let done = 0
    for (const task of tasks.value) {
      if (task.done) {
        done++
      }
    }
    return `${done}/${tasks.value.length} task(s) done`
  }
</script>

<template>
  <div class="card">
    <div class="card-body">
        <h1 class="card-title">{{ taskName }}</h1>
        <p class="card-text">{{ taskDescription }}</p>
        <p class="card-text">{{ roomLocalisation }}</p>
        <p class="card-text">{{ nbOfTaskDone() }}</p>

        <ul>
            <li><a href="#">Assigned person 1</a></li>
            <li><a href="#">Assigned person 2</a></li>
        </ul>

        <button class="btn btn-primary">Details</button>
    </div>
  </div>
</template>