<template>
    <el-dialog v-model="open" :title="title" width="60%" @open="handleOpen">
        <div class="content">
            <TaskFieldList
                @update="onUpdateField"
                @create="onCreateField"
                @deleted="(_id) => $emit('deleted-field', _id)"
                v-if="step === 1"
            />
            <TaskFieldForm :taskFieldForm="taskFieldForm" v-if="step === 2" />
        </div>
        <template #footer>
            <div v-show="step === 2">
                <span class="dialog-footer">
                    <el-button @click="() => (step = 1)">{{
                        $t('planning.folderForm.buttons.back')
                    }}</el-button>
                    <el-button type="primary" @click="handleSubmit">{{
                        $t('planning.folderForm.buttons.submit')
                    }}</el-button>
                </span>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import TaskFieldList from './TaskFieldList.vue';
import TaskFieldForm from './TaskFieldForm.vue';
import { projectPlanningModule } from '../../store';

import { IAdditionalTaskField, ITaskFieldParams, TaskActions } from '../../interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import { setupTaskFieldForm } from '../../compositions/taskFieldForm';
import { TaskFieldDataType } from '../../constants';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../../services/planning.service';
import { showSuccessNotificationFunction } from '@/common/helpers';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';
@Options({
    components: { TaskFieldForm, TaskFieldList },
})
export default class TaskFieldPopup extends mixins(UtilMixins) {
    step = 1;
    taskFieldForm = setup(() => setupTaskFieldForm());

    get fieldList(): IAdditionalTaskField[] {
        return projectPlanningModule.planning?.additionalTaskFields || [];
    }

    get taskFieldsParams(): ITaskFieldParams {
        return projectPlanningModule.taskFieldsParams;
    }

    get open(): boolean {
        return this.taskFieldsParams.open;
    }

    set open(value: boolean) {
        projectPlanningModule.setTaskFieldParams({ open: value });
    }

    get title(): string {
        if (this.step === 1) {
            return this.$t('planning.taskFields.title.list');
        }

        if (this.taskFieldsParams.action === TaskActions.CREATE) {
            return this.$t('planning.taskFields.title.create');
        }

        return this.$t('planning.taskFields.title.update');
    }

    async handleSubmit() {
        const loading = ElLoading.service({});
        const response = await this.taskFieldForm.onSubmit();
        if (response) {
            if (projectPlanningModule.planning)
                if (!this.updating) {
                    // create mode
                    projectPlanningModule.setPlanning({
                        ...projectPlanningModule.planning,
                        additionalTaskFields: [
                            response.data,
                            ...(projectPlanningModule.planning.additionalTaskFields ||
                                []),
                        ],
                    });
                } else {
                    projectPlanningModule.setPlanning({
                        ...projectPlanningModule.planning,
                        additionalTaskFields: [
                            ...(
                                projectPlanningModule.planning.additionalTaskFields || []
                            ).map((item) => {
                                if (item._id === response.data._id) {
                                    return response.data;
                                }
                                return item;
                            }),
                        ],
                    });
                }
            this.step = 1;
        }
        loading.close();
    }

    onCreateField() {
        this.taskFieldForm.setErrors({});
        this.taskFieldForm.resetForm({ values: { ...this.taskFieldForm.initValues } });
        this.step = 2;
        projectPlanningModule.setTaskFieldParams({ action: TaskActions.CREATE });
    }

    async onUpdateField(_id: string) {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.getAdditionalTaskField(
            projectPlanningModule.planning?._id as string,
            _id,
            localStorageAuthService.getPlanningPermissions().path || '',
            projectModule.selectedProjectId || '',
        );
        if (response.success) {
            this.step = 2;
            projectPlanningModule.setTaskFieldParams({
                action: TaskActions.UPDATE,
                selectedField: response.data,
            });
            this.taskFieldForm.resetForm({
                values: {
                    name: response.data.name,
                    dataType: response.data.dataType,
                },
            });
        } else if (!response?.isRequestError) {
            showSuccessNotificationFunction(response.message);
            await projectPlanningModule.getPlanning(projectPlanningModule.planningId);
        }
        loading.close();
    }

    handleOpen() {
        this.step = 1;
        this.initFormData();
    }

    get updating(): boolean {
        return projectPlanningModule.taskFieldsParams.action === TaskActions.UPDATE;
    }

    initFormData(): void {
        this.taskFieldForm.resetForm({
            values: {
                ...this.taskFieldForm.initValues,
            },
        });

        // init value for hidden field so that it can be pass the yup validation
        if (this.updating) {
            this.taskFieldForm.resetForm({
                values: {
                    ...this.taskFieldForm.initValues,
                    dataType: TaskFieldDataType.NUMBER,
                },
            });
        }
    }
}
</script>

<style scoped lang="scss"></style>
