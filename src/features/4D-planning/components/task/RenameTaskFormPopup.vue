<template>
    <el-dialog
        v-model="isShowRenameTaskFormPopup"
        :title="$t(`planning.task.renameForm.title`)"
        width="30%"
        @open="handleOpen"
        destroy-on-close
    >
        <BaseInputText
            :isRequired="true"
            :label="$t('planning.gantt.columns.name')"
            v-model:value="form.name"
            :error="translateYupError(form.errors.name  as string)"
            :placeholder="$t('planning.task.form.placeholders.name')"
        />
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="isShowRenameTaskFormPopup = false">{{
                    $t('planning.task.renameForm.button.cancel')
                }}</el-button>
                <el-button type="primary" @click="onClickSubmit">{{
                    $t('planning.task.renameForm.button.submit')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { Planning4DMixin } from '../../mixins/mixin';
import AssignedResourceToTaskTable from './AssignedResourceToTaskTable.vue';
import AssignedResourceGroupToTaskTable from './AssignResourceGroupToTaskTable.vue';
import TaskFormPopup from './TaskFormPopup.vue';
import { useRenameTaskForm } from '../../compositions/renameTaskForm';
import { projectPlanningModule } from '../../store';
import { ElLoading } from 'element-plus';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectPlanningService } from '../../services/planning.service';
import cloneDeep from 'lodash/cloneDeep';

@Options({
    components: {
        TaskFormPopup,
        AssignedResourceToTaskTable,
        AssignedResourceGroupToTaskTable,
    },
})
export default class RenameTaskFormPopup extends mixins(Planning4DMixin) {
    form = setup(() => useRenameTaskForm());

    get isShowRenameTaskFormPopup() {
        return projectPlanningModule.isShowRenameTaskFormPopup;
    }

    set isShowRenameTaskFormPopup(value: boolean) {
        projectPlanningModule.setIsShowRenameTaskFormPopup(value);
    }

    get selectedTaskId() {
        return projectPlanningModule.selectedTaskId;
    }

    async onClickSubmit() {
        const response = await this.form.onRenameTask();
        if (!response?.success) {
            showErrorNotificationFunction(response?.message);
        }

        showSuccessNotificationFunction(this.$t('planning.task.messages.renameTask'));
        const planning = cloneDeep(projectPlanningModule.planning);
        if (!planning) {
            return;
        }
        const indexTaskUpdated = planning.tasks.findIndex((item) => {
            return item._id === this.selectedTaskId;
        });
        planning.tasks[indexTaskUpdated].name = this.form.name as string;
        projectPlanningModule.setPlanning(planning);
        this.$emit('update-task', response?.data);
    }

    async handleOpen() {
        const loading = ElLoading.service({ target: '.el-dialog' });
        const taskResponse = await projectPlanningService.getTask(this.selectedTaskId);
        loading.close();
        if (!taskResponse.success) {
            showErrorNotificationFunction(taskResponse.message);
        }
        if (taskResponse.success) {
            this.form.setFieldValue('name', taskResponse.data.name);
        }
    }
}
</script>
