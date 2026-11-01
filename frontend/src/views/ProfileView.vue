<script setup>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { auth, logout, apiFetch } from '../stores/auth'

    const router = useRouter()

    const userProfile = ref(null)
    const isLoading = ref(true)
    const errorMessage = ref('')

    async function fetchProfile() {
        const userId = auth.user?.user_id || auth.user?.id
        if (!userId) {
            errorMessage.value = 'No user connected.'
            isLoading.value = false
            return
        }

        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await apiFetch(`http://localhost:8080/api/user/${userId}`)
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            userProfile.value = await response.json()
        } catch (err) {
            console.error('Error fetching profile:', err)
            errorMessage.value = 'Unable to load the profile. Check that the server is running.'
        } finally {
            isLoading.value = false
        }
    }

    async function disconnect() {
        try {
            await logout()
            router.push('/login')
        } catch (err) {
            errorMessage.value = 'Unable to log out. Check that the server is running.'
        }
    }

    onMounted(() => {
        fetchProfile()
    })
</script>
<template>
    <div class="container-fluid py-4">
        <h1 class="h2 mb-4">Profile</h1>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Loading profile...</p>
        </div>

        <div v-else-if="errorMessage" class="col-lg-6 alert alert-danger" role="alert">
            {{ errorMessage }}
        </div>

        <div v-else-if="userProfile" class="card col-lg-6 shadow-sm border-dark-subtle mb-4">
            <div class="card-body">
                <div class="mb-3">
                    <span class="fw-bold">First name: </span>
                    <span>{{ userProfile.user_firstname }}</span>
                </div>
                <div class="mb-3">
                    <span class="fw-bold">Last name: </span>
                    <span>{{ userProfile.user_lastname }}</span>
                </div>
                <div class="mb-3">
                    <span class="fw-bold">Email: </span>
                    <span>{{ userProfile.email }}</span>
                </div>
                <div>
                    <span class="fw-bold">Role: </span>
                    <span class="badge bg-secondary">{{ userProfile.role }}</span>
                </div>
            </div>
        </div>

        <button type="button" class="btn btn-danger" @click="disconnect">Log out</button>
    </div>
</template>
