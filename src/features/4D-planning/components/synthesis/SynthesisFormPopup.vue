<template>
    <el-dialog
        v-model="open"
        :title="
            step === 2
                ? $t('planning.buttons.createPlanningN')
                : $t('planning.table.navigation.synthesis')
        "
        width="80%"
        height="60%"
        @open="hanldeOpen"
        @closed="handleClosed"
        destroy-on-close
        class="synthesis-popup"
    >
        <div v-show="step === 1">
            <PlanningList :selectedIds="selectedIds" @select="handleSelect" />
            <div class="validation-error text-start mb-3">
                {{ planningListErrorText }}
            </div>
        </div>
        <div v-show="step === 2">
            <div class="row">
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputText
                        :isRequired="true"
                        :label="$t('planning.planningForm.labels.planningId')"
                        :placeholder="$t('planning.planningForm.placeholders.planningId')"
                        v-model:value="synthesisForm.planningId"
                        :error="translateYupError(synthesisForm.errors.planningId as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputText
                        :isRequired="true"
                        :label="$t('planning.folderForm.labels.planName')"
                        :placeholder="$t('planning.planningForm.placeholders.name')"
                        v-model:value="synthesisForm.name"
                        :error="translateYupError(synthesisForm.errors.name as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputText
                        v-model:value="synthesisForm.taskIdPrefix"
                        :label="$t('project.projectForm.taskIdPrefix.label')"
                        :placeholder="$t('project.projectForm.taskIdPrefix.placeholder')"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.taskIdPrefix as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputNumber
                        v-model:value="synthesisForm.taskIdSuffix"
                        :label="$t('project.projectForm.taskIdSuffix.label')"
                        :placeholder="$t('project.projectForm.taskIdSuffix.placeholder')"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.taskIdSuffix as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputNumber
                        v-model:value="synthesisForm.taskIdIncrement"
                        :label="$t('project.projectForm.taskIdIncrement.label')"
                        :placeholder="
                            $t('project.projectForm.taskIdIncrement.placeholder')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.taskIdIncrement as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.currency"
                        :label="$t('planning.planningForm.labels.currency')"
                        :placeholder="$t('planning.planningForm.placeholders.currency')"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.currency as string)"
                        :options="currencyOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.activityType"
                        :label="$t('planning.planningForm.labels.activityType')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.activityType')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.activityType as string)"
                        :options="activityTypeOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.defaultCalendar"
                        :label="$t('planning.gantt.columns.calendar')"
                        :placeholder="$t('planning.task.form.placeholders.calendar')"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.defaultCalendar as string)"
                        :options="calendarOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.durationType"
                        :label="$t('planning.planningForm.labels.durationType')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.durationType')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.durationType as string)"
                        :options="durationTypeOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.durationFormat"
                        :label="$t('planning.planningForm.labels.durationFormat')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.durationFormat')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.durationFormat as string)"
                        :options="durationFormatOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseInputNumber
                        v-model:value="synthesisForm.defaultDuration"
                        :label="$t('planning.planningForm.labels.defaultDuration')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.defaultDuration')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.defaultDuration as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseSingleSelect
                        v-model:value="synthesisForm.percentageCompletion"
                        :label="$t('planning.planningForm.labels.percentCompleteType')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.percentCompleteType')
                        "
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.percentageCompletion as string)"
                        :options="percentCompleteTypeOptions"
                        filterable
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseDatePicker
                        v-model:value="synthesisForm.projectStart"
                        :label="$t('planning.planningForm.labels.projectStart')"
                        :placeholder="
                            $t('planning.planningForm.placeholders.projectStart')
                        "
                        :valueFormat="null"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.projectStart as string)"
                    />
                </div>
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <BaseDatePicker
                        v-model:value="synthesisForm.dataDate"
                        :label="$t('planning.planningForm.labels.dataDate')"
                        :placeholder="$t('planning.planningForm.placeholders.dataDate')"
                        :valueFormat="null"
                        :isRequired="true"
                        :error="translateYupError(synthesisForm.errors.dataDate as string)"
                    />
                </div>
            </div>
            <div class="row">
                <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
                    <el-checkbox
                        v-model="synthesisForm.autoScheduling"
                        :label="$t('planning.planningForm.labels.autoScheduling')"
                    />
                </div>
            </div>
            <div>{{ $t('planning.folderForm.folders') }}</div>
            <div class="breadcrumb">
                <span
                    class="d-flex align-items-center cursor-pointer"
                    v-for="(item, index) in folderNames"
                    :key="index"
                    @click="goToFolder(index)"
                >
                    {{ item }}<el-icon class="mx-1"><CaretRight /></el-icon>
                </span>
            </div>
            <div>
                <div class="folder-space pt-3">
                    <div class="row">
                        <div
                            class="col-4 pt-2 cursor-pointer"
                            @click="
                                () => {
                                    folderNames.push(item.name);
                                    currentFolderList = item.children as IFolderStructureTree[];
                                }
                            "
                            v-for="(item, index) in currentFolderList"
                            :key="index"
                        >
                            <div class="folder-item px-3 py-3">
                                <el-icon><Folder /></el-icon>
                                <div class="folder-item-name">{{ item.name }}</div>
                            </div>
                        </div>
                        <div v-if="currentFolderList.length === 0">
                            <BaseEmptyData />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div v-show="step === 1">
                <span class="dialog-footer">
                    <el-button @click="onCancel">{{
                        $t('planning.folderForm.buttons.cancel')
                    }}</el-button>
                    <el-button type="primary" @click="handleNext">{{
                        $t('planning.folderForm.buttons.next')
                    }}</el-button>
                </span>
            </div>
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
import localStorageAuthService from '@/common/authStorage';
import { showErrorNotificationFunction } from '@/common/helpers';
import { absService } from '@/features/abs/services/abs.service';
import { ElLoading } from 'element-plus';
import { mixins, Options, setup } from 'vue-class-component';
import { Folder, CaretRight } from '@element-plus/icons-vue';
import { setupSynthesisForm } from '../../compositions/synthesisForm';
import { projectPlanningModule } from '../../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { IFolderStructureTree } from '@/common/interfaces';
import PlanningList from './PlanningList.vue';
import {
    PlanningOrderBy,
    CurrencyType,
    TaskDuration,
    TaskDurationFormat,
    TaskPercentageCompletion,
    TaskType,
    PlanningStatus,
} from '../../constants';
import { IPlanning } from '../../interfaces';

import { calendarModule } from '@/features/calendar/store';
import { projectModule } from '@/features/project/store';
import { Watch } from 'vue-property-decorator';

@Options({
    components: {
        Folder,
        CaretRight,
        PlanningList,
    },
})
export default class SynthesisFormPopup extends mixins(UtilMixins) {
    step = 1;
    PlanningStatus = PlanningStatus;
    planningStatus = PlanningStatus.ACTIVE;

    get planningIds() {
        return projectPlanningModule.planningList.map((item) => item._id);
    }

    synthesisForm = setup(() => setupSynthesisForm());
    get open(): boolean {
        return projectPlanningModule.isShowSynthesisPopup;
    }

    set open(value: boolean) {
        projectPlanningModule.setIsShowSynthesisPopup(value);
    }

    planningListErrorText = '';
    folderTree: IFolderStructureTree[] = [];
    currentFolderList: IFolderStructureTree[] = [];
    folderNames: string[] = [];

    get selectedIds(): string[] {
        return this.synthesisForm.planningIds as string[];
    }

    get currencyOptions() {
        return Object.values(CurrencyType).map((item) => ({
            label: this.$t(`planning.planningForm.currency.${item}`),
            value: item,
        }));
    }

    get durationTypeOptions() {
        return Object.values(TaskDuration).map((item) => ({
            label: this.$t(`planning.gantt.durationTypes.${item}`),
            value: item,
        }));
    }

    get durationFormatOptions() {
        return Object.values(TaskDurationFormat).map((item) => ({
            label: this.$t(`planning.planningForm.durationFormat.${item}`),
            value: item,
        }));
    }

    get activityTypeOptions() {
        return Object.values(TaskType)
            .filter((item) => ![TaskType.MILESTONE, TaskType.PROJECT].includes(item))
            .map((item) => ({
                label: this.$t(`planning.task.types.${item}`),
                value: item,
            }));
    }

    get percentCompleteTypeOptions() {
        return Object.values(TaskPercentageCompletion).map((item) => ({
            label: this.$t(`planning.gantt.percentCompleteTypes.${item}`),
            value: item,
        }));
    }

    get calendarOptions() {
        return calendarModule.calendarList.map((calendar) => ({
            label: calendar.name,
            value: calendar._id,
        }));
    }

    onCancel() {
        projectPlanningModule.setIsShowSynthesisPopup(false);
    }

    goToFolder(index: number) {
        this.folderNames.splice(index + 1);
        const findChildFolder = (
            from: number,
            rs: IFolderStructureTree[],
        ): IFolderStructureTree[] => {
            if (index == from) {
                return rs;
            }
            return findChildFolder(
                from + 1,
                rs.find((item) => item.name === this.folderNames[index])?.children || [],
            );
        };
        this.currentFolderList = findChildFolder(0, this.folderTree);
    }

    async fetchFolderStructure(projectId: string) {
        const response = await absService.getFolderStructure(projectId);
        if (response.success) {
            this.folderTree = response.data[0].children || [];
            this.currentFolderList = response.data[0].children || [];
            this.folderNames.push(response.data[0].name);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
    }

    async getCalendarList() {
        const response = await calendarModule.getCalendarList(
            projectModule.selectedProjectId || '',
        );
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        }
    }

    resetForm() {
        this.synthesisForm.resetForm({
            values: this.synthesisForm.initValues,
        });
    }

    handleNext() {
        if ((this.synthesisForm.planningIds as string[])?.length === 0) {
            this.planningListErrorText = this.$t(
                'planning.folderForm.synthesis.emptyPlanning',
            );
            return;
        } else {
            this.step = 2;
            const planningSelected = projectPlanningModule.planningList.filter(
                (planning) => {
                    return (this.synthesisForm.planningIds as string[]).includes(
                        planning._id,
                    );
                },
            );
            if (
                planningSelected.every((planning) => {
                    return planning.status === PlanningStatus.PLANNED;
                })
            ) {
                this.planningStatus = PlanningStatus.PLANNED;
            }
        }
    }

    async handleSubmit() {
        this.synthesisForm.setFieldValue(
            'planningIds',
            this.synthesisForm.planningIds as string[],
        );
        this.synthesisForm.setFieldValue(
            'planningFilePath',
            `/${this.folderNames.slice(1).join('/')}`,
        );
        this.synthesisForm.setFieldValue('status', this.planningStatus);

        const canSubmit = await this.synthesisForm.onSubmit();
        if (canSubmit) {
            this.step = 1;
        }
    }

    async hanldeOpen() {
        this.step = 1;
        this.resetForm();
        this.synthesisForm.setErrors({
            name: '',
            planningFilePath: '',
            planningIds: '',
        });
        this.planningListErrorText = '';
        const projectId = localStorageAuthService.getSelectedProjectId();
        if (!projectId) {
            return;
        }
        const loading = ElLoading.service({ target: '.synthesis-popup' });
        await Promise.all([
            this.fetchFolderStructure(projectId),
            projectPlanningModule.getPlanningList({
                projectId,
                query: {
                    orderBy: PlanningOrderBy.CREATED_AT,
                    allowSynthesizedPlanning: false,
                },
            }),
            this.getCalendarList(),
        ]);
        loading.close();
    }

    handleClosed() {
        this.resetForm();
        this.currentFolderList = [];
        this.folderNames = [];
        this.planningListErrorText = '';
    }

    handleSelect(rows: IPlanning[]) {
        this.synthesisForm.setFieldValue(
            'planningIds',
            rows.map((row) => row._id),
        );

        if (rows.length === 0) {
            this.planningListErrorText = this.$t(
                'planning.folderForm.synthesis.emptyPlanning',
            );
        } else {
            this.planningListErrorText = '';
        }
    }

    @Watch('synthesisForm.projectStart')
    onChangeProjectStart(value: Date | undefined) {
        if (
            !value ||
            this.planningStatus !== PlanningStatus.PLANNED ||
            value === this.synthesisForm.dataDate
        ) {
            return;
        } else {
            this.synthesisForm.setFieldValue('dataDate', value);
        }
    }

    @Watch('synthesisForm.dataDate')
    onChangeDataDate(value: Date | undefined) {
        if (
            !value ||
            this.planningStatus !== PlanningStatus.PLANNED ||
            value === this.synthesisForm.projectStart
        ) {
            return;
        } else {
            this.synthesisForm.setFieldValue('projectStart', value);
        }
    }
}
</script>

<style lang="scss" scoped>
.folder-item {
    display: flex;
    align-items: center;
    padding: 15px, 10px !important;
    border: solid 1px rgb(207, 207, 207);
    border-radius: 6px;
    .folder-item-name {
        word-break: break-all;
        margin-left: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.folder-space {
    max-height: 350px;
    overflow: auto;
}

.row {
    max-width: 100% !important;
}

.cursor-pointer {
    cursor: pointer;
}

:deep(.el-empty) {
    padding: 15px 0 15px 0;
    .el-empty__image {
        height: 100px;
    }
}

.el-checkbox {
    margin-bottom: 20px;
}
</style>
