import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { projectModule } from '@/features/project/store';
import {
    FILE_NAME_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    INTEGER_POSITIVE_MAX_VALUE,
    INTEGER_POSITIVE_MIN_VALUE,
} from '@/common/constants';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';
import cloneDeep from 'lodash-es/cloneDeep';
import {
    CurrencyType,
    PlanningStatus,
    TaskDuration,
    TaskDurationFormat,
    TaskPercentageCompletion,
    TaskType,
} from '../constants';
import localStorageAuthService from '@/common/authStorage';
import moment from 'moment';

const delegateFormSchema = yup.object({
    planningId: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required(),
    planningFilePath: yup.string().required(),
    name: yup.string().trim().max(FILE_NAME_MAX_LENGTH).required(),
    status: yup
        .string()
        .oneOf([...Object.values(PlanningStatus)])
        .required(),
    taskIds: yup.array(yup.string().required()).min(1).required(),
    taskIdPrefix: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    taskIdSuffix: yup
        .number()
        .min(INTEGER_POSITIVE_MIN_VALUE)
        .max(INTEGER_POSITIVE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? 0 : +val))
        .required(),
    taskIdIncrement: yup
        .number()
        .min(INTEGER_POSITIVE_MIN_VALUE)
        .max(INTEGER_POSITIVE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? 0 : +val))
        .required(),
    currency: yup
        .string()
        .oneOf([...Object.values(CurrencyType)])
        .required(),
    durationType: yup
        .string()
        .oneOf([...Object.values(TaskDuration)])
        .required(),
    durationFormat: yup
        .string()
        .oneOf([...Object.values(TaskDurationFormat)])
        .required(),
    defaultDuration: yup
        .number()
        .min(INTEGER_POSITIVE_MIN_VALUE)
        .max(INTEGER_POSITIVE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? 0 : +val))
        .required(),
    projectStart: yup
        .date()
        .test({
            name: 'projectStart',
            message: 'planning.planningForm.messages.errors.maxProjectStart',
            exclusive: false,
            params: {},
            test: function (value) {
                if (
                    value &&
                    moment(this.parent.dataDate).isValid() &&
                    this.parent.dataDate
                )
                    return (
                        moment(value)
                            .startOfDay()
                            .diff(
                                moment(this.parent.dataDate).startOfDay(),
                                'millisecond',
                            ) <= 0
                    );

                return true;
            },
        })
        .required(),
    dataDate: yup
        .date()
        .test({
            name: 'dataDate',
            message: 'planning.planningForm.messages.errors.minDataDate',
            exclusive: false,
            params: {},
            test: function (value) {
                if (
                    value &&
                    moment(this.parent.projectStart).isValid() &&
                    this.parent.projectStart
                )
                    return (
                        moment(value)
                            .startOfDay()
                            .diff(
                                moment(this.parent.projectStart).startOfDay(),
                                'millisecond',
                            ) >= 0
                    );

                return true;
            },
        })
        .required(),
    activityType: yup
        .string()
        .oneOf([...Object.values(TaskType)])
        .required(),
    defaultCalendar: yup.string().required(),
    percentageCompletion: yup
        .string()
        .oneOf([...Object.values(TaskPercentageCompletion)])
        .required(),
    autoScheduling: yup.boolean().required(),
});
export function setupDelegateForm() {
    const { t } = useI18n();
    const initValues = {
        planningId: '',
        name: '',
        status: PlanningStatus.PLANNED,
        planningFilePath: '/',
        taskIds: [],
        taskIdPrefix: '',
        taskIdSuffix: NaN,
        taskIdIncrement: NaN,
        currency: undefined,
        durationType: undefined,
        durationFormat: undefined,
        defaultDuration: NaN,
        activityType: undefined,
        percentageCompletion: undefined,
        projectStart: undefined,
        dataDate: undefined,
        autoScheduling: true,
        defaultCalendar: undefined,
    };
    const { handleSubmit, errors, resetForm, validate, setValues, setFieldValue } =
        useForm({
            initialValues: initValues,
            validationSchema: delegateFormSchema,
        });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const selectedProjectId = computed(() => projectModule.selectedProjectId);
        const response = await projectPlanningService.delegateTask(
            selectedProjectId.value || '',
            {
                ...values,
                planningFilePath: values.planningFilePath || '/',
                name: values.name || '',
                taskIds: values.taskIds as string[],
                projectId: projectModule.selectedProjectId || '',
                path: localStorageAuthService.getPlanningPermissions().path || '',
            },
        );
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                t('planning.folderForm.delegate.success') as string,
            );
        } else {
            showErrorNotificationFunction(response.message as string);
        }
        return response;
    });
    const { value: planningId } = useField('planningId');
    const { value: name } = useField('name');
    const { value: planningFilePath } = useField('planningFilePath');
    const { value: taskIds } = useField('taskIds');
    const { value: taskIdPrefix } = useField('taskIdPrefix');
    const { value: taskIdSuffix } = useField('taskIdSuffix');
    const { value: taskIdIncrement } = useField('taskIdIncrement');
    const { value: currency } = useField('currency');
    const { value: durationType } = useField('durationType');
    const { value: durationFormat } = useField('durationFormat');
    const { value: defaultDuration } = useField('defaultDuration');
    const { value: activityType } = useField('activityType');
    const { value: percentageCompletion } = useField('percentageCompletion');
    const { value: projectStart } = useField('projectStart');
    const { value: dataDate } = useField('dataDate');
    const { value: autoScheduling } = useField('autoScheduling');
    const { value: defaultCalendar } = useField('defaultCalendar');
    const { value: status } = useField('status');

    return {
        errors,
        planningId,
        name,
        taskIds,
        planningFilePath,
        taskIdPrefix,
        taskIdSuffix,
        taskIdIncrement,
        status,
        currency,
        durationType,
        durationFormat,
        defaultDuration,
        activityType,
        percentageCompletion,
        projectStart,
        dataDate,
        autoScheduling,
        defaultCalendar,
        initValues,
        setFieldValue,
        validate,
        setValues,
        onSubmit,
        resetForm,
    };
}
