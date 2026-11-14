<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { auth, apiFetch } from '../stores/auth.js'
    import NewTask from '../components/NewTask.vue'

    const presets = ref([])
    const isLoading = ref(true)
    const errorMessage = ref('')

    const roles = ref(['Receptionist', 'Housekeeping', 'Restaurant', 'Maintenance'])
    const selectedRole = ref('')
    const assignedRoles = ref([])

    const showForm = ref(false)
    const editingId = ref(null)
    const presetName = ref('')
    const presetDescription = ref('')
    const taskList = ref([])
    const formError = ref('')
    const isSubmitting = ref(false)

    const isManager = computed(() => auth.user?.role === 'Manager')

    const availableRoles = computed(() =>
        roles.value.filter(role => !assignedRoles.value.includes(role))
    )

    let nextTaskId = 0

    async function fetchRoles() {
        try {
            const response = await apiFetch('/user/roles')
            if (!response.ok) {
                throw new Error(`Server error (${response.status})`)
            }
            const data = await response.json()
            if (Array.isArray(data) && data.length > 0) {
                roles.value = data
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err)
        }
    }

    async function fetchPresets() {
        isLoading.value = true
        errorMessage.value = ''
        try {
            const response = await apiFetch('/preset')
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

    function addRole() {
        if (selectedRole.value && !assignedRoles.value.includes(selectedRole.value)) {
            assignedRoles.value.push(selectedRole.value)
            selectedRole.value = ''
        }
    }

    function removeRole(role) {
        assignedRoles.value = assignedRoles.value.filter(r => r !== role)
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
        assignedRoles.value = []
        selectedRole.value = ''
        taskList.value = []
        formError.value = ''
        showForm.value = true
    }

    function openEdit(preset) {
        editingId.value = preset.preset_id
        presetName.value = preset.preset_title
        presetDescription.value = preset.preset_description || ''
        assignedRoles.value = (preset.assignedRoles || []).map(r => r.role || r)
        selectedRole.value = ''
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
            assignedRoles: assignedRoles.value,
            tasks: taskList.value
                .filter(t => t.title.trim() !== '')
                .map(t => ({
                    preset_task_title: t.title.trim(),
                    preset_task_description: t.description.trim()
                }))
        }

        const isEdit = editingId.value !== null
        const url = isEdit
            ? `/preset/${editingId.value}`
            : '/preset'

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
            const response = await apiFetch(`/preset/${preset.preset_id}`, {
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
        fetchRoles()
        fetchPresets()
    })
</script>
<template>
    <div class="container-fluid py-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
                <h1 class="h2 hotel-title mb-1">Presets</h1>
                <p class="text-muted mb-0">Ready-made To Do lists: a name, a description, assigned roles and a list of tasks.</p>
            </div>
            <button
                v-if="isManager && !showForm"
                type="button"
                class="btn btn-hotel"
                @click="openCreate"
            >
                + New preset
            </button>
        </div>

        <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
            {{ errorMessage }}
        </div>

        <form v-if="isManager && showForm" class="card hotel-card hotel-form col-lg-8 col-xl-6 mb-4" @submit.prevent="savePreset">
            <div class="card-body">
                <h2 class="h4 hotel-title mb-3">{{ editingId !== null ? 'Edit the preset' : 'New preset' }}</h2>

                <div v-if="formError" class="alert alert-danger py-2" role="alert">
                    {{ formError }}
                </div>

                <div class="mb-3">
                    <label for="presetName" class="form-label fw-bold">Preset name</label>
                    <input id="presetName" type="text" class="form-control" v-model="presetName">
                </div>

                <div class="mb-3">
                    <label for="presetDescription" class="form-label fw-bold">Description</label>
                    <textarea id="presetDescription" class="form-control" rows="2" v-model="presetDescription"></textarea>
                </div>

                <div class="mb-3">
                    <label for="presetRoleName" class="form-label fw-bold">Assign Role(s)</label>
                    <div class="input-group">
                        <select id="presetRoleName" class="form-select" v-model="selectedRole">
                            <option value="" disabled>Select a role</option>
                            <option v-for="role in availableRoles" :key="role" :value="role">
                                {{ role }}
                            </option>
                        </select>
                        <button
                            type="button"
                            class="btn btn-outline-secondary"
                            :disabled="selectedRole === ''"
                            @click="addRole"
                        >
                            Add role
                        </button>
                    </div>

                    <div class="d-flex flex-wrap gap-2 mt-2">
                        <span
                            v-for="role in assignedRoles"
                            :key="role"
                            class="badge hotel-badge d-inline-flex align-items-center gap-1"
                        >
                            {{ role }}
                            <button
                                type="button"
                                class="btn-close ms-1"
                                style="font-size: 0.6rem"
                                :aria-label="`Remove ${role}`"
                                @click="removeRole(role)"
                            ></button>
                        </span>
                    </div>
                </div>

                <h3 class="h5 hotel-title">Tasks</h3>

                <NewTask
                    v-for="task in taskList"
                    :key="task.id"
                    :task="task"
                    @update:title="task.title = $event"
                    @update:description="task.description = $event"
                    @remove="removeTask(task.id)"
                />

                <button type="button" class="btn btn-outline-secondary mt-2 mb-4" @click="addTask()">
                    + Add a task
                </button>

                <div class="d-flex gap-2">
                    <button
                        type="submit"
                        class="btn btn-hotel flex-grow-1"
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

        <div v-else-if="!errorMessage && presets.length === 0 && !showForm" class="hotel-card text-center py-5">
            <h3 class="h5 text-muted mb-2">No presets yet</h3>
            <p class="text-muted mb-0">Create your first preset to save time when creating To Do lists.</p>
        </div>

        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            <div v-for="preset in presets" :key="preset.preset_id" class="col">
                <div class="card hotel-card h-100">
                    <div class="card-body d-flex flex-column">
                        <h4 class="card-title hotel-title">{{ preset.preset_title }}</h4>
                        <p v-if="preset.preset_description" class="card-text text-muted mb-2">{{ preset.preset_description }}</p>

                        <div class="mb-2">
                            <div class="small fw-bold text-muted mb-1">Assigned roles:</div>
                            <div v-if="!preset.assignedRoles || preset.assignedRoles.length === 0" class="small text-muted fst-italic">
                                No roles assigned.
                            </div>
                            <div v-else class="d-flex flex-wrap gap-1">
                                <span
                                    v-for="roleItem in preset.assignedRoles"
                                    :key="roleItem.role || roleItem"
                                    class="badge text-bg-light border"
                                >
                                    {{ roleItem.role || roleItem }}
                                </span>
                            </div>
                        </div>

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

                        <div v-if="isManager" class="d-flex gap-2 mt-auto">
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="openEdit(preset)">Edit</button>
                            <button type="button" class="btn btn-outline-danger btn-sm" @click="deletePreset(preset)">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
