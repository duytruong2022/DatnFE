import yup from '@/plugins/yup';
import { useField, useForm } from 'vee-validate';
import {
    INPUT_TEXT_MAX_LENGTH,
    COLOR_CODE_LENGTH,
    Regex,
    HttpStatus,
} from '@/common/constants';
import { computed } from 'vue';
import { showErrorNotificationFunction } from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';
import localStorageAuthService from '@/common/authStorage';

const activityCodeValueSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    parentId: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().nullable(),
    description: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().nullable(),
    colorCode: yup
        .string()
        .max(COLOR_CODE_LENGTH)
        .matches(Regex.COLOR_CODE)
        .trim()
        .nullable()
        .required(),
});

export const setupActivityCodeValueForm = () => {
    const initValues = {
        name: '',
        parentId: '',
        description: '',
        colorCode: '',
    };

    const isCreate = computed(
        () => projectPlanningModule.activityCodePopupParam.isCreate,
    );

    const activityCodeIdSelected = computed(
        () => projectPlanningModule.activityCodePopupParam.activityCodeIdSelected,
    );

    const activityCodeValueIdSelected = computed(
        () => projectPlanningModule.activityCodePopupParam.activityCodeValueSelected,
    );

    const { handleSubmit, errors, setValues, setFieldValue, resetForm } = useForm({
        initialValues: initValues,
        validationSchema: activityCodeValueSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({ target: '.el-drawer__body' });
        let response;
        if (isCreate.value) {
            response = await projectPlanningService.createActivityCodeValue({
                name: values.name || '',
                description: values.description || '',
                colorCode: values.colorCode?.toUpperCase() || '',
                activityCodeId: activityCodeIdSelected.value || '',
                parentId: values.parentId || null,
                projectId: projectPlanningModule.planning?.projectId || '',
                path: localStorageAuthService.getPlanningPermissions().path || '',
            });
        } else {
            response = await projectPlanningService.updateActivityCodeValue(
                activityCodeValueIdSelected.value,
                {
                    name: values.name || '',
                    description: values.description || '',
                    colorCode: values.colorCode?.toUpperCase() || '',
                    activityCodeId: activityCodeIdSelected.value || '',
                    parentId: values.parentId || null,
                    projectId: projectPlanningModule.planning?.projectId || '',
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                },
            );
        }
        loading.close();
        if (response.success) {
            const loading = ElLoading.service({ target: '.el-drawer__body' });
            await projectPlanningModule.getActivityCodeList();
            loading.close();
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
    const { value: description } = useField('description');
    const { value: colorCode } = useField('colorCode');
    const { value: parentId } = useField('parentId');

    return {
        initValues,
        onSubmit,
        setValues,
        setFieldValue,
        resetForm,
        errors,
        name,
        description,
        colorCode,
        parentId,
    };
};
