<script setup>
    import SideBar from '../components/SideBar.vue'
</script>
<template>
    <div class="container-fluid hotel-background">
        <div class="row min-vh-100 align-content-start align-content-md-stretch">

        <SideBar />

        <main class="col-12 col-md">
            <RouterView />
        </main>

        </div>
    </div>
</template>
