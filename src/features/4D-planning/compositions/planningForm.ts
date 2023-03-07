import {
    DATE_TIME_FORMAT,
    FILE_NAME_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    INTEGER_POSITIVE_MAX_VALUE,
    INTEGER_POSITIVE_MIN_VALUE,
} from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import moment from 'moment';
import { useField, useForm } from 'vee-validate';
import {
    CurrencyType,
    TaskDuration,
    TaskDurationFormat,
    TaskPercentageCompletion,
    TaskType,
} from '../constants';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const planningFormSchema = yup.object({
    name: yup.string().trim().max(FILE_NAME_MAX_LENGTH).required(),
});

export const usePlanningForm = () => {
    const initValues = {
        name: '',
    };

    const { handleSubmit, setValues, setFieldValue, resetForm, errors } = useForm({
        initialValues: initValues,
        validationSchema: planningFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let response;
        if (!projectPlanningModule.planning?._id) {
            response = await projectPlanningService.createPlanning(
                projectModule.selectedProjectId as string,
                values,
            );
        } else {
            response = await projectPlanningService.updatePlanning(
                projectPlanningModule.planning?._id as string,
                values,
            );
        }
        if (response.success) {
            const loading = ElLoading.service({
                target: '.content',
            });
            await projectPlanningModule.getPlanningList({
                projectId: projectModule.selectedProjectId as string,
                query: projectPlanningModule.getGroupListQueryString(),
            });
            loading.close();
            return response.data;
        } else {
            showErrorNotificationFunction(response.message);
            return undefined;
        }
    });

    const { value: name } = useField('name');
    const { value: currency } = useField('currency');
    const { value: durationType } = useField('durationType');
    const { value: durationFormat } = useField('durationFormat');
    const { value: defaultDuration } = useField('defaultDuration');
    const { value: activityType } = useField('activityType');
    const { value: percentageCompletion } = useField('percentageCompletion');
    const { value: autoScheduling } = useField('autoScheduling');
    const { value: defaultCalendar } = useField('defaultCalendar');

    return {
        onSubmit,
        setValues,
        resetForm,
        setFieldValue,
        errors,
        name,
        currency,
        durationType,
        durationFormat,
        defaultDuration,
        activityType,
        percentageCompletion,
        autoScheduling,
        defaultCalendar,
        initValues,
    };
};
