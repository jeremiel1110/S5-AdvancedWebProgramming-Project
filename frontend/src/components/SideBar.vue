<script setup>
import { ref, computed } from 'vue'
import { auth } from '../stores/auth.js'
import profileIcon from '../assets/sidebar/profile.png'
import tasksIcon from '../assets/sidebar/tasks.png'
import newToDoListIcon from '../assets/sidebar/newtodolist.png'
import presetsIcon from '../assets/sidebar/presets.png'
import informationIcon from '../assets/sidebar/information.png'

const menuOpen = ref(false)

const permissionTaskCreation = computed(() =>
  auth.user?.role === 'Manager' || auth.user?.role === 'Receptionist'
)
const permissionPresetCreationEdition = computed(() =>
  auth.user?.role === 'Manager'
)
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-panel">
      <button
        type="button"
        class="sidebar-toggle"
        :aria-expanded="menuOpen"
        aria-controls="hotel-navigation"
        @click="menuOpen = !menuOpen"
      >
        Menu
      </button>

      <nav
        id="hotel-navigation"
        class="sidebar-nav"
        :class="{ 'is-open': menuOpen }"
        aria-label="Main navigation"
      >
        <RouterLink to="/profile" class="sidebar-link" @click="menuOpen = false">
          <img :src="profileIcon" alt="" width="20" height="20">
          <span>Profile</span>
        </RouterLink>

        <RouterLink to="/tasks" class="sidebar-link" @click="menuOpen = false">
          <img :src="tasksIcon" alt="" width="20" height="20">
          <span>Tasks</span>
        </RouterLink>

        <RouterLink
          v-if="permissionTaskCreation"
          to="/newtodolist"
          class="sidebar-link"
          @click="menuOpen = false"
        >
          <img :src="newToDoListIcon" alt="" width="20" height="20">
          <span>New To Do List</span>
        </RouterLink>

        <RouterLink
          v-if="permissionPresetCreationEdition"
          to="/presets"
          class="sidebar-link"
          @click="menuOpen = false"
        >
          <img :src="presetsIcon" alt="" width="20" height="20">
          <span>Presets</span>
        </RouterLink>

        <RouterLink to="/information" class="sidebar-link" @click="menuOpen = false">
          <img :src="informationIcon" alt="" width="20" height="20">
          <span>Information</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>

<style scoped src="./SideBar.css"></style>
