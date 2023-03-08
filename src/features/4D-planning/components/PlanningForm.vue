<template>
    <el-dialog
        width="500px"
        lock-scroll
        v-model="isOpening"
        @open="handleOpen"
        @closed="handleClose"
        custom-class="calendar-config-form-popup"
        destroy-on-close
    >
        <template #header>
            <h3 class="text-start">
                {{ title }}
            </h3>
        </template>
        <div class="row">
            <BaseInputText
                :isRequired="true"
                :label="$t('planning.folderForm.labels.planName')"
                :placeholder="$t('planning.planningForm.placeholders.name')"
                v-model:value="form.name"
                :error="translateYupError(form.errors.name as string)"
                :maxLength="FILE_NAME_MAX_LENGTH"
                :isDisabled="isTemplatePlanning"
            />
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">{{
                    $t('planning.folderForm.buttons.cancel')
                }}</el-button>
                <el-button type="primary" @click="handleSubmit">{{
                    $t('planning.folderForm.buttons.submit')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { mixins, Options, setup } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectPlanningModule } from '../store';
import { usePlanningForm } from '../compositions/planningForm';
import { PlanningStatus } from '../constants';
import { calendarModule } from '@/features/calendar/store';
import { projectPlanningService } from '../services/planning.service';
import { FILE_NAME_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';

@Options({
    component: {},
})
export default class PlanningForm extends mixins(UtilMixins) {
    form = setup(() => usePlanningForm());
    FILE_NAME_MAX_LENGTH = FILE_NAME_MAX_LENGTH;
    PlanningStatus = PlanningStatus;
    planningStatus = PlanningStatus.ACTIVE;

    get isOpening() {
        return projectPlanningModule.isShowPlanningPopup;
    }

    get calendarOptions() {
        return calendarModule.calendarList.map((calendar) => ({
            label: calendar.name,
            value: calendar._id,
        }));
    }

    get title() {
        return projectPlanningModule.planning?._id
            ? 'Update Planning'
            : 'Create Planning';
    }

    async getCalendarList() {
        const response = await calendarModule.getCalendarList(
            projectModule.selectedProjectId || '',
        );
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        }
    }

    async handleOpen() {
        const loading = ElLoading.service({ target: '.el-dialog' });
        console.log(projectPlanningModule.planning?._id);

        if (projectPlanningModule.planning?._id) {
            const response = await projectPlanningService.getPlanningInformation(
                projectPlanningModule.planning?._id as string,
            );
            if (response.success) {
                this.planningStatus = response.data.status;
                console.log(response.data);

                this.form.setValues({
                    name: response.data.name,
                });
            } else {
                showErrorNotificationFunction(response.message);
            }
        } else {
            this.form.resetForm();
        }
        loading.close();
    }

    handleClose() {
        projectPlanningModule.setIsShowPlanningPopup(false);
        this.form.resetForm();
        projectPlanningModule.setPlanning(null);
    }

    async handleSubmit() {
        const loading = ElLoading.service({});
        const response = await this.form.onSubmit();
        loading.close();
        if (response) {
            const oldPlanning = projectPlanningModule.planning;
            const newPlanning = { ...oldPlanning, ...response };
            projectPlanningModule.setPlanning(newPlanning);

            this.$emit('updated-planning', {
                needRerenderGantt: oldPlanning?.dataDate !== response.dataDate,
                newName: oldPlanning?.name !== response.name ? response.name : null,
            });

            showSuccessNotificationFunction(
                this.$t('planning.planningForm.messages.updateSuccess'),
            );
            this.handleClose();
        }
    }
}
</script>
