import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue-demi';
import { IUpdateTaskName } from '../interfaces';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const taskFormSchema = yup.object({
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).label('activityName').required(),
});

export const useRenameTaskForm = () => {
    const initValues = {
        name: '',
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

    const onRenameTask = handleSubmit(async (values) => {
        const selectedTaskId = computed(() => projectPlanningModule.selectedTaskId);
        const loading = ElLoading.service({});
        const response = await projectPlanningService.updateTaskName(
            selectedTaskId.value as string,
            {
                ...values,
            } as IUpdateTaskName,
        );
        loading.close();
        if (response.success) {
            projectPlanningModule.setIsShowRenameTaskFormPopup(false);
            return response;
        } else if (!response?.isRequestError) {
            showErrorNotificationFunction(response.message);
            return undefined;
        }
    });

    const { value: name } = useField('name');

    return {
        initValues,
        errors,
        name,
        values,
        validate,
        setErrors,
        setValues,
        onRenameTask,
        resetForm,
        setFieldValue,
    };
};
