<template>
    <div class="row ms-0">
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputText
                :isRequired="true"
                :label="$t('planning.planningForm.labels.planningId')"
                :placeholder="$t('planning.planningForm.placeholders.planningId')"
                v-model:value="delegateForm.planningId"
                :error="translateYupError(delegateForm.errors.planningId as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputText
                :isRequired="true"
                :label="$t('planning.folderForm.labels.planName')"
                :placeholder="$t('planning.planningForm.placeholders.name')"
                v-model:value="delegateForm.name"
                :error="translateYupError(delegateForm.errors.name as string)"
                :maxLength="FILE_NAME_MAX_LENGTH"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputText
                v-model:value="delegateForm.taskIdPrefix"
                :label="$t('project.projectForm.taskIdPrefix.label')"
                :placeholder="$t('project.projectForm.taskIdPrefix.placeholder')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.taskIdPrefix as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputNumber
                v-model:value="delegateForm.taskIdSuffix"
                :label="$t('project.projectForm.taskIdSuffix.label')"
                :placeholder="$t('project.projectForm.taskIdSuffix.placeholder')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.taskIdSuffix as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputNumber
                v-model:value="delegateForm.taskIdIncrement"
                :label="$t('project.projectForm.taskIdIncrement.label')"
                :placeholder="$t('project.projectForm.taskIdIncrement.placeholder')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.taskIdIncrement as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.currency"
                :label="$t('planning.planningForm.labels.currency')"
                :placeholder="$t('planning.planningForm.placeholders.currency')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.currency as string)"
                :options="currencyOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.activityType"
                :label="$t('planning.planningForm.labels.activityType')"
                :placeholder="$t('planning.planningForm.placeholders.activityType')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.activityType as string)"
                :options="activityTypeOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.defaultCalendar"
                :label="$t('planning.gantt.columns.calendar')"
                :placeholder="$t('planning.task.form.placeholders.calendar')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.defaultCalendar as string)"
                :options="calendarOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.durationType"
                :label="$t('planning.planningForm.labels.durationType')"
                :placeholder="$t('planning.planningForm.placeholders.durationType')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.durationType as string)"
                :options="durationTypeOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.durationFormat"
                :label="$t('planning.planningForm.labels.durationFormat')"
                :placeholder="$t('planning.planningForm.placeholders.durationFormat')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.durationFormat as string)"
                :options="durationFormatOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseInputNumber
                v-model:value="delegateForm.defaultDuration"
                :label="$t('planning.planningForm.labels.defaultDuration')"
                :placeholder="$t('planning.planningForm.placeholders.defaultDuration')"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.defaultDuration as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                v-model:value="delegateForm.percentageCompletion"
                :label="$t('planning.planningForm.labels.percentCompleteType')"
                :placeholder="
                    $t('planning.planningForm.placeholders.percentCompleteType')
                "
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.percentageCompletion as string)"
                :options="percentCompleteTypeOptions"
                filterable
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                v-model:value="projectStart"
                :label="$t('planning.planningForm.labels.projectStart')"
                :placeholder="$t('planning.planningForm.placeholders.projectStart')"
                :valueFormat="null"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.projectStart as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                v-model:value="dataDate"
                :label="$t('planning.planningForm.labels.dataDate')"
                :placeholder="$t('planning.planningForm.placeholders.dataDate')"
                :valueFormat="null"
                :isRequired="true"
                :error="translateYupError(delegateForm.errors.dataDate as string)"
                :isDisabled="isAllowedCancelDelegation"
            />
        </div>
    </div>
    <div class="row ms-0">
        <div class="col-xl-3 col-lg-4 col-md-6 sm-12">
            <el-checkbox
                v-model="delegateForm.autoScheduling"
                :label="$t('planning.planningForm.labels.autoScheduling')"
                :disabled="isAllowedCancelDelegation"
            />
        </div>
    </div>

    <div class="ps-3">
        <span>{{ $t('planning.folderForm.folders') }}</span>
        <div class="breadcrumb">
            <span
                class="d-flex align-items-center"
                v-for="(item, index) in folderNames"
                :key="index"
                @click="goToFolder(index)"
            >
                {{ item }}<el-icon class="mx-1"><CaretRight /></el-icon>
            </span>
        </div>
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
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import { FILE_NAME_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IFolderStructureTree } from '@/common/interfaces';
import { absService } from '@/features/abs/services/abs.service';
import { calendarModule } from '@/features/calendar/store';
import { projectModule } from '@/features/project/store';
import { UtilMixins } from '@/mixins/utilMixins';
import { CaretRight, Folder } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { boolean } from 'yup';
import { setupDelegateForm } from '../../compositions/delegateForm';
import {
    CurrencyType,
    PlanningStatus,
    TaskDuration,
    TaskDurationFormat,
    TaskPercentageCompletion,
    TaskStatus,
    TaskType,
} from '../../constants';
import { projectPlanningModule } from '../../store';

@Options({
    components: {
        Folder,
        CaretRight,
    },
})
export default class DelegateFormPopup extends mixins(UtilMixins) {
    FILE_NAME_MAX_LENGTH = FILE_NAME_MAX_LENGTH;
    @Prop({ type: Array(String), default: [] })
    readonly taskIds!: [];
    @Prop({ type: boolean, default: false })
    readonly getDataDefault!: false;

    delegateForm = setup(() => setupDelegateForm());

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

    get isAllowedCancelDelegation() {
        const selectedTaskIdList = projectPlanningModule.selectedTaskIdList;
        if (selectedTaskIdList.length !== 1) {
            return false;
        }
        const task = projectPlanningModule.planning?.tasks.find(
            (task) => task._id === selectedTaskIdList[0],
        );
        return !!task?.delegatedTo;
    }

    get projectStart(): Date {
        return this.delegateForm.projectStart as Date;
    }

    set projectStart(value: Date) {
        this.delegateForm.setFieldValue('projectStart', value);

        if (
            !this.checkPlanningStarted(this.taskIds) &&
            this.delegateForm.dataDate !== value
        ) {
            this.delegateForm.setFieldValue('dataDate', value);
        }
    }

    get dataDate(): Date {
        return this.delegateForm.dataDate as Date;
    }

    set dataDate(value: Date) {
        this.delegateForm.setFieldValue('dataDate', value);

        if (
            !this.checkPlanningStarted(this.taskIds) &&
            this.delegateForm.projectStart !== value
        ) {
            this.delegateForm.setFieldValue('projectStart', value);
        }
    }

    folderTree: IFolderStructureTree[] = [];
    currentFolderList: IFolderStructureTree[] = [];
    folderNames: string[] = [];

    checkPlanningStarted = (taskIds: []) => {
        return taskIds.some((id) => {
            const task = projectPlanningModule.planning?.tasks.find((task) => {
                return task._id === id;
            });
            return task?.status !== TaskStatus.TODO;
        });
    };

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

    async fetchFolderStructure() {
        const projectId = localStorageAuthService.getSelectedProjectId();
        this.$nextTick(async () => {
            const response = await absService.getFolderStructure(projectId);
            if (response.success) {
                this.folderTree = response.data[0].children || [];
                this.currentFolderList = response.data[0].children || [];
                this.folderNames.push(response.data[0].name);
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
        });
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
        this.delegateForm.resetForm({
            values: this.delegateForm.initValues,
        });
    }

    @Watch('getDataDefault')
    async handleOnChangeGetDataDefault(value: boolean) {
        if (value) {
            const loading = ElLoading.service({});
            this.resetForm();
            await this.fetchFolderStructure();
            await this.getCalendarList();
            loading.close();
        } else {
            this.resetForm();
            this.currentFolderList = [];
            this.folderNames = [];
        }
    }

    async handleSubmit() {
        if (this.checkPlanningStarted(this.taskIds)) {
            this.delegateForm.setFieldValue('status', PlanningStatus.ACTIVE);
        }
        this.delegateForm.setFieldValue('taskIds', this.taskIds);
        this.delegateForm.setFieldValue(
            'planningFilePath',
            `/${this.folderNames.slice(1).join('/')}`,
        );
        const response = await this.delegateForm.onSubmit();

        if (response?.success) {
            this.$emit('delegated', response.data);
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
