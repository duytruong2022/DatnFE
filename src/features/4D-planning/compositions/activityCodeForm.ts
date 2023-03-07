import localStorageAuthService from '@/common/authStorage';
import {
    HttpStatus,
    INPUT_TEXT_MAX_LENGTH,
    INTEGER_POSITIVE_MAX_VALUE,
    INTEGER_POSITIVE_MIN_VALUE,
} from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const activityCodeSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    maxLength: yup
        .number()
        .min(INTEGER_POSITIVE_MIN_VALUE)
        .max(INTEGER_POSITIVE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? 0 : +val))
        .required(),
});

export const setupActivityCodeForm = () => {
    const initValues = {
        name: '',
        maxLength: NaN,
    };

    const isCreate = computed(
        () => projectPlanningModule.activityCodePopupParam.isCreate,
    );

    const { handleSubmit, errors, setValues, setFieldValue, resetForm } = useForm({
        initialValues: initValues,
        validationSchema: activityCodeSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({ target: '.el-dialog' });
        let response;
        if (isCreate.value) {
            response = await projectPlanningService.createActivityCode({
                name: values.name || '',
                maxLength: values.maxLength || 0,
                projectId: projectPlanningModule.planning?.projectId || '',
                path: localStorageAuthService.getPlanningPermissions().path || '',
            });
        } else {
            response = await projectPlanningService.updateActivityCode(
                projectPlanningModule.activityCodePopupParam.activityCodeIdSelected,
                {
                    name: values.name || '',
                    maxLength: values.maxLength || 0,
                    projectId: projectPlanningModule.planning?.projectId || '',
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                },
            );
        }
        loading.close();

        if (response.success) {
            await projectPlanningModule.getActivityCodeList();
            return response.data;
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                const loading = ElLoading.service({ target: '.el-drawer__body' });
                await projectPlanningModule.getActivityCodeList();
                loading.close();
            }
            showErrorNotificationFunction(response.message);
            return false;
        }
    });

    const { value: name } = useField('name');
    const { value: maxLength } = useField('maxLength');

    return {
        initValues,
        onSubmit,
        setValues,
        setFieldValue,
        resetForm,
        errors,
        name,
        maxLength,
    };
};
