<script setup>
  import ToDoListCard from '../components/ToDoListCard.vue'

  const assignPeople = [
          {id: 6, name: "fee"},
          {id: 7, name: "foo"}
        ]
</script>

<template>
  <h1>Hello, this is App.vue</h1>

  <p>This is a To Do List Card from component</p>

  <ToDoListCard
    taskName = "My try to do a responsibe card"
    taskDescription = "A to do list of tasks"
    roomLocation = "1228"
    :assignPeople="assignPeople"
  />
</template>