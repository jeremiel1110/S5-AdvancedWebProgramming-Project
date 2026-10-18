<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import eyeIcon from '../assets/eye.png'

const router = useRouter()

const username = ref('')
const password = ref('')
const showPassword = ref(false)

function connect() {
  // Insert database connection here
  router.push('/main')
}
</script>

<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center">
    <form class="col-lg-4 text-center" @submit.prevent="connect">

      <div class="mb-3">
        <input type="text" class="form-control text-center rounded-pill bg-light border-dark" placeholder="Username"
          v-model="username">
      </div>

      <div class="input-group mb-5">
        <input :type="showPassword ? 'text' : 'password'"
          class="form-control text-center rounded-start-pill bg-light border-dark" placeholder="Password"
          v-model="password">
        <button class="btn border-dark rounded-end-pill" type="button" @click="showPassword = !showPassword">
          <img :src="eyeIcon" width="22" height="22">
        </button>
      </div>

      <div class="mt-3">
        <button type="submit" class="btn border-3 text-white fs-2 fw-bold rounded-pill w-100"
          style="background-color: #83cbeb; border-color: #215f9a;">
          Connect
        </button>
      </div>

    </form>
  </div>
</template>