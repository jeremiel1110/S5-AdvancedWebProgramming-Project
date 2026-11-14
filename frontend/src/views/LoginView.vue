<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import eyeIcon from "../assets/eye.png";
import { login } from "../stores/auth";
import { DEMO_MODE } from "../config.js";

const router = useRouter();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref("");
const isSubmitting = ref(false);

async function connect() {
  if (isSubmitting.value) return;
  error.value = "";
  isSubmitting.value = true;

  try {
    if (await login(email.value, password.value)) {
      router.push("/tasks");
    } else {
      error.value = "Wrong email or password";
    }
  } catch (err) {
    error.value = "Unable to log in. Check that the server is running.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-vh-100 d-flex justify-content-center align-items-center hotel-background p-3">
    <form class="hotel-card hotel-form w-100 p-4" style="max-width: 28rem" @submit.prevent="connect">
      <h1 class="h3 hotel-title mb-4">Hotel To-Do List</h1>

      <div class="mb-3">
        <label for="login-email" class="form-label fw-semibold">Email</label>
        <input
          id="login-email"
          type="email"
          class="form-control"
          autocomplete="username"
          v-model="email"
        />
      </div>

      <div class="mb-4">
        <label for="login-password" class="form-label fw-semibold">Password</label>
        <div class="input-group">
          <input
            id="login-password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            autocomplete="current-password"
            v-model="password"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <img :src="eyeIcon" alt="" width="22" height="22" />
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

      <button type="submit" :disabled="isSubmitting" class="btn btn-hotel w-100">
        Connect
      </button>

      <div class="bg-body-tertiary border rounded-3 mt-4 p-3 small">
        <div class="fw-bold hotel-title">Demo account</div>
        <div>Email: <code>manager@hotel.com</code></div>
        <div>Password: <code>password123</code></div>

        <template v-if="DEMO_MODE">
          <div class="fw-bold hotel-title mt-3">Other roles</div>
          <div><code>alice@hotel.com</code> / <code>password456</code> (Housekeeping)</div>
          <div><code>lucas.bernard@hotel.com</code> / <code>password123</code> (Receptionist)</div>
          <div><code>marc.petit@hotel.com</code> / <code>password123</code> (Maintenance)</div>
          <div><code>emma.rousseau@hotel.com</code> / <code>password123</code> (Restaurant)</div>
          <div class="text-muted mt-3">
            Preview mode: there is no server here. The data stays in your browser and is not shared.
          </div>
        </template>
      </div>
    </form>
  </div>
</template>
