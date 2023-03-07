<template>
    <div class="row">
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseInputText
                :isRequired="true"
                :label="$t('planning.gantt.columns.name')"
                v-model:value="form.name"
                :error="translateYupError(form.errors.name  as string)"
                :placeholder="$t('planning.task.form.placeholders.name')"
                :isDisabled="!form.canEdit"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                :isRequired="true"
                :options="taskStatusOptions"
                :label="$t('planning.gantt.columns.status')"
                v-model:value="taskStatus"
                filterable
                :error="translateYupError(form.errors.status  as string)"
                :placeholder="$t('planning.task.form.placeholders.status')"
                @clear="form.setFieldValue('status', null)"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                :isRequired="true"
                :options="calendarOptions"
                :label="$t('planning.gantt.columns.calendar')"
                v-model:value="calendarId"
                filterable
                :error="translateYupError(form.errors.calendarId as string)"
                :placeholder="$t('planning.task.form.placeholders.calendar')"
                @clear="form.setFieldValue('calendarId', null)"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                :valueFormat="null"
                v-model:value="start"
                :label="$t('planning.gantt.columns.start')"
                :isRequired="true"
                :placeholder="$t('planning.task.form.placeholders.start')"
                :error="translateYupError(form.errors.start  as string)"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                :valueFormat="null"
                v-model:value="actualStart"
                :label="$t('planning.gantt.columns.actualStart')"
                :isRequired="form.status && !todoStatus"
                :placeholder="
                    todoStatus ? '' : $t('planning.task.form.placeholders.actualStart')
                "
                :error="translateYupError(form.errors.actualStart  as string)"
                :isDisabled="todoStatus"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                :valueFormat="null"
                v-model:value="finish"
                :label="$t('planning.gantt.columns.finish')"
                :isRequired="true"
                :placeholder="$t('planning.task.form.placeholders.finish')"
                :error="translateYupError(form.errors.finish as string)"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                :valueFormat="null"
                v-model:value="actualFinish"
                :label="$t('planning.gantt.columns.actualFinish')"
                :placeholder="
                    todoStatus || inprogressStatus
                        ? ''
                        : $t('planning.task.form.placeholders.actualFinish')
                "
                :isRequired="finishStatus"
                :error="translateYupError(form.errors.actualFinish as string)"
                :isDisabled="todoStatus || inprogressStatus"
            />
        </div>
        <!-- <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                :options="primaryConstraintOptions"
                :label="$t('planning.gantt.columns.prConstraint')"
                v-model:value="form.primaryConstraints"
                :placeholder="
                    primaryConstraintOptions.length !== 0
                        ? $t('planning.task.form.placeholders.primaryConstraint')
                        : ''
                "
                :isDisabled="primaryConstraintOptions.length === 0"
                filterable
                :error="translateYupError(form.errors.primaryConstraints as string)"
                @clear="form.setFieldValue('primaryConstraints', null)"
            />
        </div> -->
        <!-- <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseDatePicker
                :valueFormat="null"
                v-model:value="form.primaryConstraintDate"
                :label="$t('planning.gantt.columns.prConstraintDate')"
                :placeholder="$t('planning.task.form.placeholders.primaryConstraintDate')"
                :error="translateYupError(form.errors.primaryConstraintDate as string)"
            />
        </div> -->
        <!-- <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                :options="durationTypeOptions"
                :label="$t('planning.gantt.columns.durationType')"
                :placeholder="$t('planning.task.form.placeholders.durationType')"
                v-model:value="form.durationType"
                filterable
                :error="translateYupError(form.errors.durationType as string)"
                @clear="form.setFieldValue('durationType', null)"
            />
        </div>
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseSingleSelect
                :options="percentCompleteOptions"
                :label="$t('planning.gantt.columns.percentCompleteType')"
                :placeholder="$t('planning.task.form.placeholders.completeType')"
                v-model:value="form.percentageCompletion"
                filterable
                :error="translateYupError(form.errors.percentageCompletion as string)"
                @clear="
                    $nextTick(() => {
                        form.setFieldValue('percentageCompletion', null);
                    })
                "
            />
        </div> -->
        <div class="col-xl-4 col-lg-4 col-md-6 sm-12">
            <BaseInputNumber
                v-model:value="form.rules"
                :label="$t('planning.gantt.columns.rules')"
                :placeholder="$t('planning.task.form.placeholders.rules')"
                :allowDecimal="true"
                :error="translateYupError(form.errors.rules as string)"
                :castEmptyToNull="true"
            />
        </div>
        <div
            v-for="(field, index) in additionalFields"
            :key="index"
            class="col-xl-4 col-lg-4 col-md-6 sm-12 additional-fields"
        >
            <BaseSingleSelect
                v-if="field.dataType === TaskFieldDataType.BOOLEAN"
                v-model:value="customTaskFields[index].value"
                :options="booleanOptions"
                :label="field.name"
                :placeholder="$t('planning.taskFields.labels.select')"
                :error="translateYupError(customTaskFields[index].error)"
            />
            <BaseInputNumber
                v-if="field.dataType === TaskFieldDataType.NUMBER"
                v-model:value="customTaskFields[index].value"
                :label="field.name"
                :error="translateYupError(customTaskFields[index].error)"
            />
            <BaseDatePicker
                v-if="field.dataType === TaskFieldDataType.DATE_TIME"
                :valueFormat="null"
                :dateFormat="null"
                v-model:value="customTaskFields[index].value"
                :label="field.name"
                :placeholder="field.name"
                :error="translateYupError(customTaskFields[index].error)"
            />
            <BaseInputText
                v-if="field.dataType === TaskFieldDataType.STRING"
                :label="field.name"
                v-model:value="customTaskFields[index].value"
                :error="translateYupError(customTaskFields[index].error)"
                :placeholder="form[field.name]"
            />
        </div>
    </div>
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import { INTEGER_POSITIVE_MAX_VALUE } from '@/common/constants';
import { showSuccessNotificationFunction } from '@/common/helpers';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { calendarModule } from '@/features/calendar/store';
import cloneDeep from 'lodash-es/cloneDeep';
import moment from 'moment';
import { mixins, Options, setup } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { useTaskForm } from '../../compositions/taskForm';
import {
    ConstraintTypeMapping,
    TaskDuration,
    TaskFieldDataType,
    TaskPercentageCompletion,
    TaskPhysicalQuantityUnit,
    TaskStatus,
    TaskType,
} from '../../constants';
import { IProjectTask } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';
import AssignedResourceToTaskTable from './AssignedResourceToTaskTable.vue';
import AssignedResourceGroupToTaskTable from './AssignResourceGroupToTaskTable.vue';

@Options({
    components: {
        AssignedResourceToTaskTable,
        AssignedResourceGroupToTaskTable,
    },
})
export default class TaskForm extends mixins(Planning4DMixin) {
    @Prop({ default: '' }) newFinishDate!: string | Date | null;
    @Prop({ default: '' }) newDuration!: number;
    form = setup(() => useTaskForm());
    TaskPercentageCompletion = TaskPercentageCompletion;
    TaskDuration = TaskDuration;
    TaskStatus = TaskStatus;
    TaskFieldDataType = TaskFieldDataType;
    taskTreeSelectProps = {
        label: 'label',
        children: 'children',
        isLeaf: 'isLeaf',
    };
    INTEGER_POSITIVE_MAX_VALUE = INTEGER_POSITIVE_MAX_VALUE;
    customTaskFields: { error: string; value: any; key: string }[] = [];

    get updatingParentTask(): boolean {
        if (
            projectPlanningModule.taskPopupParams.selectedTask?.taskType ===
            TaskType.WBS_SUMMARY
        ) {
            return true;
        }
        return false;
    }

    get booleanOptions() {
        return [
            {
                label: this.$t('planning.taskFields.labels.true'),
                value: true,
            },
            {
                label: this.$t('planning.taskFields.labels.false'),
                value: false,
            },
        ];
    }

    get additionalFields() {
        this.customTaskFields.splice(0, this.customTaskFields.length);
        (projectPlanningModule.planning?.additionalTaskFields || []).forEach((item) => {
            this.customTaskFields.push({ error: '', value: null, key: item.name });
        });
        return projectPlanningModule.planning?.additionalTaskFields || [];
    }

    get open(): boolean {
        return projectPlanningModule.taskPopupParams.show;
    }

    set open(value: boolean) {
        projectPlanningModule.setTaskPopupParams({
            show: value,
        });
    }

    get parentTaskId(): string | null {
        return this.form.parentId as string | null;
    }

    set parentTaskId(value: string | null) {
        this.form.setFieldValue('parentId', value as string | null);
    }

    get start(): Date {
        return this.form.start as Date;
    }

    set start(value: Date) {
        this.form.setFieldValue('start', value);

        if (this.actualStart !== value) {
            this.form.setFieldValue('actualStart', value);
        }
        if (!value || !this.form.finish) {
            return;
        } else {
            this.$emit('calculateNewDuration', this.form.start, this.form.finish);
        }
    }

    get actualStart(): Date {
        return this.form.actualStart as Date;
    }

    set actualStart(value: Date) {
        this.form.setFieldValue('actualStart', value);

        if (TaskStatus.TODO !== this.form.status && this.start !== value) {
            this.form.setFieldValue('start', value);

            this.$emit('calculateNewDuration', this.form.start, this.form.finish);
        }
    }

    get finish(): Date {
        return this.form.finish as Date;
    }

    set finish(value: Date) {
        this.form.setFieldValue('finish', value);

        if (this.form.status === TaskStatus.FINISHED && this.actualFinish !== value) {
            this.form.setFieldValue('actualFinish', value);
        }
    }

    get actualFinish(): Date {
        return this.form.actualFinish as Date;
    }

    set actualFinish(value: Date | null) {
        this.form.setFieldValue('actualFinish', value ? value : null);
        if (!value) {
            return;
        }
        if (this.form.status === TaskStatus.FINISHED && this.finish !== value) {
            this.finish = value;
        }
    }

    get taskStatus(): TaskStatus {
        return this.form.status as TaskStatus;
    }

    set taskStatus(value: TaskStatus) {
        this.form.setFieldValue('status', value);
        if (value === TaskStatus.TODO) {
            this.form.setFieldValue('actualStart', null);
            this.form.setFieldValue('actualFinish', null);
        } else if (value === TaskStatus.IN_PROGRESS) {
            this.form.setFieldValue('actualStart', this.start);
            this.form.setFieldValue('actualFinish', null);
        } else if (value === TaskStatus.FINISHED) {
            this.form.setFieldValue('actualStart', this.start);
            this.form.setFieldValue('actualFinish', this.finish);
            // this.form.setFieldValue('actualDuration', this.originalDuration);
        }
    }

    get taskStatusOptions() {
        return Object.values(TaskStatus).map((item) => ({
            label: this.$t(`planning.gantt.status.${item}`),
            value: item,
        }));
    }

    get primaryConstraintOptions() {
        if (this.form.taskType) {
            return ConstraintTypeMapping[this.form.taskType as TaskType].map((item) => ({
                label: this.$t(`planning.gantt.primaryConstraints.${item}`),
                value: item,
            }));
        }
        return [];
    }

    get durationTypeOptions() {
        return Object.values(TaskDuration).map((item) => ({
            label: this.$t(`planning.gantt.durationTypes.${item}`),
            value: item,
        }));
    }

    get percentCompleteOptions() {
        return Object.values(TaskPercentageCompletion).map((item) => ({
            label: this.$t(`planning.gantt.percentCompleteTypes.${item}`),
            value: item,
        }));
    }

    get physicalQuantityUnitOptions() {
        return Object.values(TaskPhysicalQuantityUnit).map((item) => ({
            label: this.$t(`planning.gantt.physicalQuantityUnit.${item}`),
            value: item,
        }));
    }

    get todoStatus(): boolean {
        return this.form.status === TaskStatus.TODO;
    }

    get inprogressStatus(): boolean {
        return this.form.status === TaskStatus.IN_PROGRESS;
    }

    get finishStatus(): boolean {
        return this.form.status === TaskStatus.FINISHED;
    }

    get calendarOptions() {
        return calendarModule.calendarList.map((calendar) => ({
            label: calendar.name,
            value: calendar._id,
        }));
    }

    get durationType(): TaskDuration | null {
        return this.form.durationType as TaskDuration | null;
    }

    get selectedTaskId(): string {
        return projectPlanningModule.taskPopupParams.selectedTaskId as string;
    }

    get calendarId(): string | null {
        return this.form.calendarId as string | null;
    }

    set calendarId(value: string | null) {
        this.form.setFieldValue('calendarId', value);
    }

    get isNotAllowUpdateId() {
        const task = projectPlanningModule.planning?.tasks.find(
            (task) => task._id.toString() === this.selectedTaskId,
        );
        return !!(
            task?.delegatedTo ||
            task?.isSynthesizedToOtherTask ||
            task?.clonedFromTaskId
        );
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    get canAssignResource() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_ASSIGN_RESOURCE_TO_TASK'],
        );
    }

    async handleOpen(taskDetail: IProjectTask): Promise<void> {
        this.form.setErrors({
            isUpdate: undefined,
            name: undefined,
            parentId: undefined,
            status: undefined,
            start: undefined,
            actualStart: undefined,
            finish: undefined,
            actualFinish: undefined,
            // primaryConstraints: undefined,
            // primaryConstraintDate: undefined,
            durationType: undefined,
            rules: undefined,
            calendarId: undefined,
        });

        this.form.setValues({
            isUpdate: true,
            name: taskDetail.name,
            parentId: taskDetail.parentId || null,
            status: taskDetail.status,
            start: taskDetail.start,
            actualStart: taskDetail.actualStart || null,
            finish: taskDetail.finish,
            actualFinish: taskDetail.actualFinish || null,
            // primaryConstraints: taskDetail.primaryConstraints || null,
            // primaryConstraintDate: taskDetail.primaryConstraintDate || null,
            durationType: taskDetail.durationType || null,
            rules: taskDetail.rules || null,
            isRootFolder: !taskDetail.parentGanttId,
            calendarId: taskDetail.calendarId,
            canEdit: taskDetail.canEdit,
        });
        const fieldKeys = Object.keys(taskDetail?.additionalFields || {});
        fieldKeys.forEach((key) => {
            const corespondingFieldIndex = this.customTaskFields.findIndex(
                (field) => field.key === key,
            );
            if (corespondingFieldIndex !== -1) {
                this.customTaskFields[corespondingFieldIndex].value =
                    taskDetail.additionalFields?.[key];
            }
        });
    }

    async onSubmit(): Promise<void> {
        this.customTaskFields.forEach((field) => {
            this.form.additionalFields[field.key] = field.value;
        });

        const response = await this.form.onUpdateTask();
        if (!response) {
            return;
        }

        const task = response;

        this.form.additionalFields = {};
        let oldGanttId = '';
        const planning = cloneDeep(projectPlanningModule.planning);
        if (task && planning) {
            const indexTaskUpdated = planning.tasks.findIndex((item) => {
                return item._id === task._id;
            });

            if (indexTaskUpdated >= 0) {
                oldGanttId = planning.tasks[indexTaskUpdated].ganttId;
                planning.tasks[indexTaskUpdated] = task;
            }

            projectPlanningModule.setPlanning(planning);
            projectPlanningModule.setTaskPopupParams({
                show: false,
                selectedTask: null,
                parentOfSelectedTask: null,
            });
            showSuccessNotificationFunction(
                this.$t('planning.task.messages.updatedTask'),
            );
            this.$emit('task-response', {
                oldGanttId,
                task,
            });
        }
    }

    filterParentNodeMethod(value: any, data: any) {
        return data.label.includes(value);
    }

    taskLoad(
        node:
            | {
                  isLeaf: boolean;
                  level: number;
                  data: { value: string; label: string; isLeaf: boolean };
              }
            | undefined,
        resolve: any,
    ): void {
        const tasks = projectPlanningModule.planning?.tasks || [];
        if (node?.isLeaf) {
            return resolve([]);
        }
        if (node?.level === 0) {
            return resolve(
                tasks
                    .filter((task) => {
                        if (task._id === this.selectedTaskId) {
                            return false;
                        }
                        return task.parentId === null;
                    })
                    .map((task) => ({
                        value: task._id,
                        label: task.name,
                        isLeaf:
                            tasks.findIndex((item) => item.parentId === task._id) === -1,
                    })),
            );
        }

        resolve(
            tasks
                .filter((task) => {
                    if (task._id === this.selectedTaskId) {
                        return false;
                    }

                    return task.parentId === node?.data?.value;
                })
                .map((task) => ({
                    value: task._id,
                    label: task.name,
                    isLeaf: tasks.findIndex((item) => item.parentId === task._id) === -1,
                })),
        );
    }

    // Temporary disabled to fix infinite loop when input finish date
    @Watch('form.finish', { deep: true })
    onChangeFinish(finish: Date | null) {
        //     if (finish !== null && this.form.calendarId) {
        //         this.$emit(
        //             'calculateNewDuration',
        //             this.form.ganttId,
        //             this.form.start,
        //             finish,
        //             this.form.calendarId,
        //         );
        //     }
    }

    @Watch('form.calendarId', { deep: true })
    onCalendarId(calendarId: string) {
        if (calendarId) {
            this.$emit(
                'calculateNewFinishDate',
                this.form.start,
                this.form.finish,
                calendarId,
            );
        }
    }
}
</script>

<style scoped lang="scss">
:deep(.additional-fields label) {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    white-space: nowrap;
    display: block !important;
}
</style>
