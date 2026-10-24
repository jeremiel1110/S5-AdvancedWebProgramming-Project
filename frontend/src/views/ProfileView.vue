<script setup>
    import { useRouter } from 'vue-router'
    import { logout } from '../stores/auth'

    const router = useRouter()

    function disconnect() {
        logout()
        router.push('/login')
    }
</script>
<template>
    <h1>Profile</h1>

    <button type="button" class="btn btn-danger" @click="disconnect">Log out</button>
</template>
