import {
    DATE_TIME_FORMAT,
    INPUT_TEXT_MAX_LENGTH,
    INTEGER_POSITIVE_MAX_VALUE,
} from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import moment from 'moment';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue-demi';
import {
    TaskDuration,
    TaskPercentageCompletion,
    TaskStatus,
    TaskType,
} from '../constants';
import { IUpdateProjectTaskDto } from '../interfaces';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';
import uniq from 'lodash/uniq';
import { ref } from 'vue';
import { projectModule } from '@/features/project/store';
import localStorageAuthService from '@/common/authStorage';

const taskFormSchema = yup
    .object({
        isUpdate: yup.boolean(),
        name: yup
            .string()
            .trim()
            .max(INPUT_TEXT_MAX_LENGTH)
            .label('activityName')
            .required(),
        parentId: yup.string().optional().nullable(),
        status: yup
            .string()
            .nullable()
            .oneOf(Object.values(TaskStatus))
            .label('activityStatus')
            .required(),
        // add calendarName later
        calendarId: yup.string().nullable().notRequired(),
        // primaryConstraints: yup
        //     .string()
        //     .transform((val) => (val ? val : null))
        //     .oneOf([null, ...Object.values(TaskConstraint)])
        //     .nullable()
        //     .notRequired(),
        // primaryConstraintDate: yup.date().nullable().notRequired(),
        durationType: yup
            .string()
            .transform((val) => (val ? val : null))
            .nullable()
            .optional()
            .oneOf([...Object.values(TaskDuration), null])
            .notRequired(),
        rules: yup
            .number()
            .max(100)
            .transform((val) => (+val ? val : null))
            .nullable()
            .notRequired(),
        isRootFolder: yup.boolean().required(),
        canEdit: yup.boolean().required(),
    })
    .shape({
        start: yup
            .date()
            .nullable()
            .when('taskType', {
                is: TaskType.FINISH_MILESTONE,
                then: yup.date().nullable(),
                otherwise: yup
                    .date()
                    .nullable()
                    .test({
                        name: 'start',
                        message: 'planning.task.form.errors.maxStart',
                        exclusive: false,
                        params: {},
                        test: function (value) {
                            if (value && this.parent.finish)
                                return (
                                    moment(value)
                                        .startOfDay()
                                        .diff(
                                            moment(this.parent.finish).startOfDay(),
                                            'millisecond',
                                        ) <= 0
                                );
                            return true;
                        },
                    })
                    .required(),
            }),
        finish: yup
            .date()
            .nullable()
            .when('taskType', {
                is: TaskType.START_MILESTONE,
                then: yup.date().nullable(),
                otherwise: yup
                    .date()
                    .nullable()
                    .test({
                        name: 'finish',
                        message: 'planning.task.form.errors.minFinish',
                        exclusive: false,
                        params: {},
                        test: function (value) {
                            if (value && this.parent.start)
                                return (
                                    moment(value)
                                        .startOfDay()
                                        .diff(
                                            moment(this.parent.start).startOfDay(),
                                            'millisecond',
                                        ) >= 0
                                );
                            return true;
                        },
                    })
                    .required(),
            }),
    })
    .shape(
        {
            actualStart: yup
                .date()
                .nullable()
                .when('status', {
                    is: (value: TaskStatus | null) =>
                        value !== TaskStatus.FINISHED && value !== TaskStatus.IN_PROGRESS,
                    then: (schema) => schema.nullable().notRequired(),
                    otherwise: (schema) => schema.required(),
                })
                .test({
                    name: 'actualStart',
                    message: 'planning.task.form.errors.maxActualStart',
                    exclusive: false,
                    params: {},
                    test: function (value) {
                        if (value && this.parent.actualFinish)
                            return (
                                moment(value)
                                    .startOfDay()
                                    .diff(
                                        moment(this.parent.actualFinish).startOfDay(),
                                        'millisecond',
                                    ) <= 0
                            );
                        return true;
                    },
                }),
            actualFinish: yup
                .date()
                .nullable()
                .when('status', {
                    is: (value: TaskStatus | null) => value !== TaskStatus.FINISHED,
                    then: (schema) => schema.nullable().notRequired(),
                    otherwise: (schema) => schema.required(),
                })
                .test({
                    name: 'actualFinish',
                    message: 'planning.task.form.errors.minActualFinish',
                    exclusive: false,
                    params: {},
                    test: function (value) {
                        if (value && this.parent.actualStart)
                            return (
                                moment(value)
                                    .startOfDay()
                                    .diff(
                                        moment(this.parent.actualStart).startOfDay(),
                                        'millisecond',
                                    ) >= 0
                            );
                        return true;
                    },
                }),
        },
        [['actualFinish', 'actualStart']],
    );

export const useTaskForm = () => {
    const initValues = {
        isUpdate: false,
        name: '',
        parentId: null,
        status: TaskStatus.TODO,
        start: null,
        actualStart: null,
        finish: null,
        actualFinish: null,
        // primaryConstraints: null,
        // primaryConstraintDate: null,
        durationType: null,
        remainingDuration: null,
        percentageCompletion: TaskPercentageCompletion.MANUAL_COMPLETE,
        manualComplete: null,
        rules: null,
        isRootFolder: false,
        calendarId: null,
        canEdit: true,
    };

    const {
        handleSubmit,
        errors,
        resetForm,
        validate,
        setValues,
        setFieldValue,
        values,
        setErrors,
    } = useForm({
        initialValues: initValues,
        validationSchema: taskFormSchema,
    });

    const additionalFields = ref<Record<string, any>>({});

    const selectedTaskId = computed(() => {
        return projectPlanningModule.taskPopupParams.selectedTask?._id;
    });

    const onUpdateTask = handleSubmit(async (values) => {
        if (values.isRootFolder) {
            delete values.parentId;
        }
        delete values.canEdit;
        delete values.isRootFolder;
        const loading = ElLoading.service({ target: '.el-dialog' });
        projectPlanningModule.setEditedTaskIds(
            uniq([
                ...projectPlanningModule.editedTaskIds,
                selectedTaskId.value as string,
            ]),
        );
        let response;
        if (values.status === TaskStatus.FINISHED) {
            values.rules = 100;
        } else if (values.status === TaskStatus.TODO) {
            values.rules = 0;
        }
        if (!selectedTaskId.value) {
            response = await projectPlanningService.createTask(
                projectPlanningModule.planning?._id || '',
                {
                    ...values,
                    start: values.start
                        ? moment(values.start)
                              .add(8, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    finish: values.finish
                        ? moment(values.finish)
                              .add(17, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    actualStart: values.actualStart
                        ? moment(values.actualStart)
                              .add(8, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    actualFinish: values.actualFinish
                        ? moment(values.actualFinish)
                              .add(17, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    isUpdate: undefined,
                    parentId: values.parentId || null,
                    additionalFields: additionalFields.value,
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                    projectId: projectModule.selectedProjectId || '',
                } as IUpdateProjectTaskDto,
            );
        } else {
            response = await projectPlanningService.updateTask(
                selectedTaskId.value as string,
                {
                    ...values,
                    start: values.start
                        ? moment(values.start)
                              .add(8, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    finish: values.finish
                        ? moment(values.finish)
                              .add(17, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    actualStart: values.actualStart
                        ? moment(values.actualStart)
                              .add(8, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    actualFinish: values.actualFinish
                        ? moment(values.actualFinish)
                              .add(17, 'hour')
                              .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON)
                        : null,
                    isUpdate: undefined,
                    parentId: values.parentId || null,
                    additionalFields: additionalFields.value,
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                    projectId: projectModule.selectedProjectId || '',
                } as IUpdateProjectTaskDto,
            );
        }
        loading.close();
        if (response.success) {
            return response.data;
        } else if (!response?.isRequestError) {
            showErrorNotificationFunction(response.message);
            return undefined;
        }
    });

    const { value: isUpdate } = useField('isUpdate');
    const { value: name } = useField('name');
    const { value: parentId } = useField('parentId');
    const { value: taskType } = useField('taskType');
    const { value: status } = useField('status');
    const { value: start } = useField('start');
    const { value: actualStart } = useField('actualStart');
    const { value: finish } = useField('finish');
    const { value: actualFinish } = useField('actualFinish');
    // const { value: primaryConstraints } = useField('primaryConstraints');
    // const { value: primaryConstraintDate } = useField('primaryConstraintDate');
    const { value: durationType } = useField('durationType');
    const { value: rules } = useField('rules');
    const { value: isRootFolder } = useField('isRootFolder');
    const { value: calendarId } = useField('calendarId');
    const { value: canEdit } = useField('canEdit');

    return {
        initValues,
        errors,
        isUpdate,
        name,
        parentId,
        taskType,
        status,
        start,
        actualStart,
        finish,
        actualFinish,
        durationType,
        rules,
        additionalFields,
        isRootFolder,
        calendarId,
        canEdit,
        values,
        validate,
        setErrors,
        setValues,
        onUpdateTask,
        resetForm,
        setFieldValue,
    };
};
