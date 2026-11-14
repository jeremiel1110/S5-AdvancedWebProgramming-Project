<script setup>
    import SideBar from '../components/SideBar.vue'
    import { DEMO_MODE } from '../config.js'

    // Forget the changes made in the demo and start again from the seed data
    async function resetDemo() {
        if (import.meta.env.VITE_DEMO_MODE === 'true') {
            const { resetDemo } = await import('../demo/mockApi.js')
            resetDemo()
            window.location.reload()
        }
    }
</script>
<template>
    <div class="container-fluid hotel-background">
        <div class="row min-vh-100 align-content-start align-content-md-stretch">

        <SideBar />

        <main class="col-12 col-md">
            <div v-if="DEMO_MODE" class="alert alert-info py-2 small d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-0">
                <span>Preview mode: no server, the data stays in your browser.</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetDemo">Reset demo data</button>
            </div>
            <RouterView />
        </main>

        </div>
    </div>
</template>
