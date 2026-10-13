<script setup>
defineProps({
    task: {
        type: Object,
        required: true
    }
})

defineEmits(['update:title', 'update:description'])
</script>

<template>
    <div class="card my-2">
        <div class="card-body">
            <label :for="`task-title-${task.id}`">Task title:</label>
            <input
                :id="`task-title-${task.id}`"
                type="text"
                :value="task.title"
                @input="$emit('update:title', $event.target.value)"
            >

            <label :for="`task-description-${task.id}`">Task description:</label>
            <textarea
                :id="`task-description-${task.id}`"
                :value="task.description"
                @input="$emit('update:description', $event.target.value)"
            ></textarea>
        </div>
    </div>
</template>