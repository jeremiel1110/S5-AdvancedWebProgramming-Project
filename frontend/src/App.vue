<script setup>
  import SideBar from './components/SideBar.vue';
  import ToDoListCard from './components/ToDoListCard.vue';
</script>

<template>
  <div class="container-fluid">
    <div class="row min-vh-100">
      
      <SideBar class="col-2 bg-info"/>



      <main class="col-10">
        <h1>Hello, this is App.vue</h1>

        <p>This is a To Do List Card from component</p>
        <ToDoListCard/>
      </main>

    </div>
  </div>
</template>