import {
    ARRAY_MAX_LENGTH,
    HttpStatus,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import yup from '@/plugins/yup';
import { useI18n } from 'vue-i18n';
import { projectPlanningModule } from '../store';
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../services/planning.service';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import localStorageAuthService from '@/common/authStorage';

const resourceGroupSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).required().trim(),
    resourceIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .optional(),
    description: yup.string().max(TEXTAREA_MAX_LENGTH).optional().trim(),
});

export const innitResourceGroup = {
    name: '',
    resourceIds: [],
    description: '',
};

export const setupResourceGroupForm = () => {
    const { t } = useI18n();
    const isCreate = computed(() => !projectPlanningModule.selectedResourceGroup?._id);

    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: innitResourceGroup,
        validationSchema: resourceGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let response;
        const planningPath = localStorageAuthService.getPlanningPermissions().path;
        const loading = ElLoading.service({});

        if (!isCreate.value) {
            response = await projectPlanningService.updateResourceGroup(
                projectPlanningModule.selectedResourceGroup?._id || '',
                {
                    name: values.name || '',
                    resourceIds: values.resourceIds || [],
                    planningId: projectPlanningModule.planning?._id || '',
                    description: values.description || '',
                    path: planningPath || '',
                    projectId: projectModule.selectedProjectId || '',
                },
            );
        } else {
            response = await projectPlanningService.createResourceGroup({
                name: values.name || '',
                resourceIds: values.resourceIds || [],
                planningId: projectPlanningModule.planning?._id || '',
                description: values.description || '',
                path: planningPath || '',
                projectId: projectModule.selectedProjectId || '',
            });
        }
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('planning.resourceGroup.message.updateSuccess')
                    : t('planning.resourceGroup.message.createSuccess'),
            );
            projectPlanningModule.setIsShowResourceGroupDetailForm(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await projectPlanningModule.getResourceGroupList({
                planningId: projectPlanningModule.planning?._id || '',
                projectId: projectModule.selectedProjectId || '',
                path: planningPath || '',
            });
            loading.close();
            projectPlanningModule.setSelectedResourceGroup(null);
            projectPlanningModule.setNeedReload3DViewer(true);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowResourceGroupDetailForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await projectPlanningModule.getResourceGroupList({
                    planningId: projectPlanningModule.planning?._id || '',
                    projectId: projectModule.selectedProjectId || '',
                    path: planningPath || '',
                });
                loading.close();
                projectPlanningModule.setSelectedResourceGroup(null);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: name } = useField('name');
    const { value: resourceIds } = useField('resourceIds');
    const { value: description } = useField('description');

    return {
        errors,
        onSubmit,
        resetForm,
        validate,
        setErrors,
        name,
        resourceIds,
        description,
    };
};
