import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';
import { TaskFieldDataType } from '../constants';
import { ICreateTaskFieldBody, TaskActions } from '../interfaces';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';

const taskFieldFormSchema = yup.object({
    name: yup.string().trim().required().label('fieldName'),
    dataType: yup
        .string()
        .nullable()
        .oneOf([...Object.values(TaskFieldDataType)])
        .required(),
});
export function setupTaskFieldForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        dataType: null,
    };
    const {
        handleSubmit,
        errors,
        resetForm,
        validate,
        setValues,
        setFieldValue,
        setFieldError,
        setErrors,
    } = useForm({
        initialValues: initValues,
        validationSchema: taskFieldFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const planningId = computed(() => projectPlanningModule.planning?._id);
        const updating = computed(
            () => projectPlanningModule.taskFieldsParams.action === TaskActions.UPDATE,
        );
        const selectedTaskFieldId = computed(
            () => projectPlanningModule.taskFieldsParams.selectedField?._id,
        );
        const planningPath = localStorageAuthService.getPlanningPermissions().path;
        let response;
        if (updating.value) {
            response = await projectPlanningService.updateAdditionalTaskField(
                planningId.value as string,
                selectedTaskFieldId.value as string,
                {
                    name: values.name as string,
                    path: planningPath,
                    projectId: projectModule.selectedProjectId || '',
                },
            );
        } else {
            response = await projectPlanningService.createAdditionalTaskField(
                planningId.value as string,
                {
                    ...values,
                    path: planningPath,
                    projectId: projectModule.selectedProjectId || '',
                } as ICreateTaskFieldBody,
            );
        }
        if (response.success) {
            if (updating.value) {
                showSuccessNotificationFunction(
                    t('planning.taskFields.successMessage.update.name') as string,
                );
            } else {
                showSuccessNotificationFunction(
                    t('planning.taskFields.successMessage.create.field') as string,
                );
            }

            return response;
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: name } = useField('name');
    const { value: dataType } = useField('dataType');
    const { value: value } = useField('value');
    return {
        initValues,
        errors,
        name,
        value,
        dataType,
        setErrors,
        setFieldError,
        setFieldValue,
        validate,
        setValues,
        onSubmit,
        resetForm,
    };
}
