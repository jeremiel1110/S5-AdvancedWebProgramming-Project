<script setup>
  import SideBar from '../components/SideBar.vue';
  import ToDoListCard from '../components/ToDoListCard.vue'

  const assignPeople = [
          {id: 6, name: "fee"},
          {id: 7, name: "foo"}
        ]
</script>

<template>
  <div class="container-fluid">
    <div class="row min-vh-100">
      
      <SideBar class="col-2 bg-info"/>



      <main class="col-10">
        <h1>Hello, this is App.vue</h1>

        <p>This is a To Do List Card from component</p>
        
        

        <ToDoListCard
          taskName = "My try to do a responsibe card"
          taskDescription = "A to do list of tasks"
          roomLocation = "1228"
          :assignPeople="assignPeople"
        />

      </main>

    </div>
  </div>
</template>