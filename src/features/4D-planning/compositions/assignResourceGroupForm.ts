import localStorageAuthService from '@/common/authStorage';
import { ARRAY_MAX_LENGTH, HttpStatus } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const assignResourceGroupSchema = yup.object({
    resourceGroupIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .required(),
    taskIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .required(),
    appearanceProfileIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .required(),
});

export const innitAssignResource = {
    resourceGroupIds: [],
    taskIds: [],
    appearanceProfileIds: [],
};

export const setupAssignResourceGroup = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: innitAssignResource,
        validationSchema: assignResourceGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResourceGroup({
            resourceGroupIds: (values.resourceGroupIds as string[]) || [],
            appearanceProfileIds: (values.appearanceProfileIds as string[]) || [],
            taskIds: (values.taskIds as string[]) || [],
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                t('planning.assignResourceGroup.message.assignResourceGroupSuccess'),
            );
            projectPlanningModule.setUpdatedTasks(response.data || []);
            projectPlanningModule.setIsShowAssignResourceGroupForm(false);
            projectPlanningModule.setNeedReload3DViewer(true);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowAssignResourceGroupForm(false);
                projectPlanningModule.setHasTaskDeleted(true);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: resourceGroupIds } = useField('resourceGroupIds');
    const { value: taskIds } = useField('taskIds');
    const { value: appearanceProfileIds } = useField('appearanceProfileIds');

    const openAssignResourceGroupForm = async () => {
        setErrors({});
        const selectedTask = computed(() => projectPlanningModule.selectedTaskIdList);
        // editing mode
        if (selectedTask.value.length === 1) {
            const loading = ElLoading.service({});
            const taskResponse = await projectPlanningService.getTask(
                selectedTask.value[0],
            );
            loading.close();
            if (taskResponse.success) {
                resetForm({
                    values: {
                        ...innitAssignResource,
                        resourceGroupIds: taskResponse.data.resourceGroupIds,
                    },
                });
            }
        } else {
            resetForm({
                values: {
                    ...innitAssignResource,
                },
            });
        }
    };

    return {
        errors,
        onSubmit,
        resetForm,
        setErrors,
        validate,
        openAssignResourceGroupForm,
        resourceGroupIds,
        taskIds,
        appearanceProfileIds,
    };
};
