<script setup>
import { useRoute } from 'vue-router'
import profileIcon from '../assets/sidebar/profile.png'
import tasksIcon from '../assets/sidebar/tasks.png'
import newToDoListIcon from '../assets/sidebar/newtodolist.png'
import presetsIcon from '../assets/sidebar/presets.png'
import informationIcon from '../assets/sidebar/information.png'

const route = useRoute()

const permissionTaskCreation = true
const permissionPresetCreationEdition = true
</script>

<template>
  <aside class="sidebar min-vh-100 h-100">
    <div class="sidebar-panel bg-info d-flex flex-column py-4">
      <div class="d-flex flex-column gap-3">
        <RouterLink to="/profile" class="sidebar-link text-decoration-none" title="Profile">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" :style="{
            width: '65px',
            height: '65px',
            backgroundColor: '#bfbfbf',
            border: route.path === '/profile' ? '4px solid #0e2841' : '2px solid #000000'
          }">
            <img :src="profileIcon" width="34" height="34">
          </div>
          <span class="sidebar-label">Profile</span>
        </RouterLink>

        <RouterLink to="/tasks" class="sidebar-link text-decoration-none" title="Tasks">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" :style="{
            width: '65px',
            height: '65px',
            backgroundColor: '#bfbfbf',
            border: route.path === '/tasks' ? '4px solid #0e2841' : '2px solid #000000'
          }">
            <img :src="tasksIcon" width="34" height="34">
          </div>
          <span class="sidebar-label">Tasks</span>
        </RouterLink>

        <RouterLink v-if="permissionTaskCreation" to="/newtodolist" class="sidebar-link text-decoration-none"
          title="Create a new To Do List">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" :style="{
            width: '65px',
            height: '65px',
            backgroundColor: '#bfbfbf',
            border: route.path === '/newtodolist' ? '4px solid #0e2841' : '2px solid #000000'
          }">
            <img :src="newToDoListIcon" width="34" height="34">
          </div>
          <span class="sidebar-label">New To Do List</span>
        </RouterLink>

        <RouterLink v-if="permissionPresetCreationEdition" to="/presets" class="sidebar-link text-decoration-none"
          title="Presets">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" :style="{
            width: '65px',
            height: '65px',
            backgroundColor: '#bfbfbf',
            border: route.path === '/presets' ? '4px solid #0e2841' : '2px solid #000000'
          }">
            <img :src="presetsIcon" width="34" height="34">
          </div>
          <span class="sidebar-label">Presets</span>
        </RouterLink>
      </div>

      <div class="mt-auto">
        <RouterLink to="/information" class="sidebar-link text-decoration-none" title="Information">
          <div class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0" :style="{
            width: '65px',
            height: '65px',
            backgroundColor: '#bfbfbf',
            border: route.path === '/information' ? '4px solid #0e2841' : '2px solid #000000'
          }">
            <img :src="informationIcon" width="34" height="34" alt="Information">
          </div>
          <span class="sidebar-label">Information</span>
        </RouterLink>
      </div>
    </div>
  </aside>
</template>

<style scoped src="./SideBar.css"></style>
