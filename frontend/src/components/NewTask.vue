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
            <div class="mb-3">
                <label :for="`task-title-${task.id}`" class="form-label fw-bold">Task title</label>
                <input
                    :id="`task-title-${task.id}`"
                    type="text"
                    class="form-control bg-light border-dark"
                    :value="task.title"
                    @input="$emit('update:title', $event.target.value)"
                >
            </div>

            <div>
                <label :for="`task-description-${task.id}`" class="form-label fw-bold">Task description</label>
                <textarea
                    :id="`task-description-${task.id}`"
                    class="form-control bg-light border-dark"
                    rows="3"
                    :value="task.description"
                    @input="$emit('update:description', $event.target.value)"
                ></textarea>
            </div>
        </div>
    </div>
</template>