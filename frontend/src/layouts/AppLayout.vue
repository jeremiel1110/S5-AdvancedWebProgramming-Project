<script setup>
    import SideBar from '../components/SideBar.vue'
</script>
<template>
    <div class="container-fluid">
        <div class="row min-vh-100">

        <SideBar class="col-auto"/>

        <main class="col">
            <RouterView />
        </main>

        </div>
    </div>
</template>
