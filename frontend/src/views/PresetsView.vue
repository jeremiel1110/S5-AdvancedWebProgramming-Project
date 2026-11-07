<script setup>
    import { ref, onMounted } from 'vue'
    import { apiFetch } from '../stores/auth.js'
    import NewTask from '../components/NewTask.vue'

    const presets = ref([])
    const isLoading = ref(true)
    const errorMessage = ref('')

    const showForm = ref(false)
    const editingId = ref(null)
    const presetName = ref('')
    const presetDescription = ref('')
    const taskList = ref([])
    const formError = ref('')
    const isSubmitting = ref(false)

    let nextTaskId = 0

    async function fetchPresets() {
        isLoading.value = true
        errorMessage.value = ''
        try {
            const response = await apiFetch('http://localhost:8080/api/preset')
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            presets.value = await response.json()
        } catch (err) {
            console.error('Error fetching presets:', err)
            errorMessage.value = 'Unable to load the presets. Check that the server is running.'
        } finally {
            isLoading.value = false
        }
    }

    function addTask(title = '', description = '') {
        taskList.value.push({
            id: nextTaskId++,
            title,
            description
        })
    }

    function removeTask(taskId) {
        taskList.value = taskList.value.filter(t => t.id !== taskId)
    }

    function openCreate() {
        editingId.value = null
        presetName.value = ''
        presetDescription.value = ''
        taskList.value = []
        formError.value = ''
        showForm.value = true
    }

    function openEdit(preset) {
        editingId.value = preset.preset_id
        presetName.value = preset.preset_title
        presetDescription.value = preset.preset_description || ''
        taskList.value = []
        for (const task of preset.tasks || []) {
            addTask(task.preset_task_title, task.preset_task_description || '')
        }
        formError.value = ''
        showForm.value = true
    }

    function closeForm() {
        showForm.value = false
        editingId.value = null
    }

    async function savePreset() {
        if (!presetName.value.trim()) {
            formError.value = 'The name of the preset is required.'
            return
        }

        formError.value = ''
        isSubmitting.value = true

        const payload = {
            preset_title: presetName.value.trim(),
            preset_description: presetDescription.value.trim(),
            tasks: taskList.value
                .filter(t => t.title.trim() !== '')
                .map(t => ({
                    preset_task_title: t.title.trim(),
                    preset_task_description: t.description.trim()
                }))
        }

        const isEdit = editingId.value !== null
        const url = isEdit
            ? `http://localhost:8080/api/preset/${editingId.value}`
            : 'http://localhost:8080/api/preset'

        try {
            const response = await apiFetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.message || 'Error while saving the preset.')
            }

            closeForm()
            await fetchPresets()
        } catch (err) {
            console.error('Failed to save preset:', err)
            formError.value = err.message || 'Unable to reach the server.'
        } finally {
            isSubmitting.value = false
        }
    }

    async function deletePreset(preset) {
        if (!window.confirm(`Delete the preset "${preset.preset_title}"?`)) {
            return
        }

        try {
            const response = await apiFetch(`http://localhost:8080/api/preset/${preset.preset_id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            if (editingId.value === preset.preset_id) {
                closeForm()
            }
            await fetchPresets()
        } catch (err) {
            console.error('Failed to delete preset:', err)
            errorMessage.value = 'Unable to delete the preset.'
        }
    }

    onMounted(() => {
        fetchPresets()
    })
</script>
<template>
    <div class="container-fluid py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h2 mb-1">Presets</h1>
                <p class="text-muted mb-0">Ready-made To Do lists: a name, a description and a list of tasks.</p>
            </div>
            <button
                v-if="!showForm"
                type="button"
                class="btn text-white fw-bold"
                style="background-color: #83cbeb"
                @click="openCreate"
            >
                + New preset
            </button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            {{ errorMessage }}
        </div>

        <form v-if="showForm" class="card col-lg-6 shadow-sm border-dark-subtle mb-4" @submit.prevent="savePreset">
            <div class="card-body">
                <h2 class="h4 mb-3">{{ editingId !== null ? 'Edit the preset' : 'New preset' }}</h2>

                <div v-if="formError" class="alert alert-danger py-2" role="alert">
                    {{ formError }}
                </div>

                <div class="mb-3">
                    <label for="presetName" class="form-label fw-bold">Preset name</label>
                    <input id="presetName" type="text" class="form-control bg-light border-dark" v-model="presetName">
                </div>

                <div class="mb-3">
                    <label for="presetDescription" class="form-label fw-bold">Description</label>
                    <textarea id="presetDescription" class="form-control bg-light border-dark" rows="2" v-model="presetDescription"></textarea>
                </div>

                <h3 class="fs-5">Tasks</h3>

                <NewTask
                    v-for="task in taskList"
                    :key="task.id"
                    :task="task"
                    @update:title="task.title = $event"
                    @update:description="task.description = $event"
                    @remove="removeTask(task.id)"
                />

                <button type="button" class="btn btn-outline-dark rounded-pill mt-2 mb-4" @click="addTask()">
                    + Add a task
                </button>

                <div class="d-flex gap-2">
                    <button
                        type="submit"
                        class="btn text-white fw-bold flex-grow-1"
                        style="background-color: #83cbeb"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        {{ editingId !== null ? 'Save changes' : 'Create preset' }}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" :disabled="isSubmitting" @click="closeForm">
                        Cancel
                    </button>
                </div>
            </div>
        </form>

        <div v-if="isLoading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2">Loading presets...</p>
        </div>

        <div v-else-if="!errorMessage && presets.length === 0 && !showForm" class="text-center py-5 border rounded bg-light">
            <h3 class="h5 text-muted mb-2">No presets yet</h3>
            <p class="text-muted mb-0">Create your first preset to save time when creating To Do lists.</p>
        </div>

        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            <div v-for="preset in presets" :key="preset.preset_id" class="col">
                <div class="card h-100 shadow-sm border-dark-subtle">
                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title">{{ preset.preset_title }}</h4>
                        <p v-if="preset.preset_description" class="card-text text-muted mb-2">{{ preset.preset_description }}</p>

                        <div class="small fw-bold text-muted mb-2">Tasks:</div>
                        <div v-if="!preset.tasks || preset.tasks.length === 0" class="small text-muted fst-italic mb-2">
                            No tasks yet.
                        </div>
                        <ul v-else class="list-group list-group-flush border rounded-2 mb-3">
                            <li v-for="task in preset.tasks" :key="task.preset_task_id" class="list-group-item py-2 px-3">
                                <span class="small fw-semibold">{{ task.preset_task_title }}</span>
                                <span v-if="task.preset_task_description" class="d-block small text-muted">
                                    {{ task.preset_task_description }}
                                </span>
                            </li>
                        </ul>

                        <div class="d-flex gap-2 mt-auto">
                            <button type="button" class="btn btn-outline-dark btn-sm" @click="openEdit(preset)">Edit</button>
                            <button type="button" class="btn btn-outline-danger btn-sm" @click="deletePreset(preset)">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
