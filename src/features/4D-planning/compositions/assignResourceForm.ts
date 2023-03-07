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

const assignResourceSchema = yup.object({
    resourceIds: yup
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
    resourceIds: [],
    taskIds: [],
    appearanceProfileIds: [],
};

export const setupAssignResource = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: innitAssignResource,
        validationSchema: assignResourceSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResource({
            resourceIds: (values.resourceIds as string[]) || [],
            appearanceProfileIds: (values.appearanceProfileIds as string[]) || [],
            taskIds: (values.taskIds as string[]) || [],
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                t('planning.assignResource.message.assignResourceSuccess'),
            );
            projectPlanningModule.setUpdatedTasks(response.data || []);
            projectPlanningModule.setIsShowAssignResourceForm(false);
            projectPlanningModule.setNeedReload3DViewer(true);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowAssignResourceForm(false);
                projectPlanningModule.setHasTaskDeleted(true);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: resourceIds } = useField('resourceIds');
    const { value: taskIds } = useField('taskIds');
    const { value: appearanceProfileIds } = useField('appearanceProfileIds');

    const openAssignResourceForm = async () => {
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
                        resourceIds: taskResponse.data.resourceIds,
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
        openAssignResourceForm,
        resourceIds,
        taskIds,
        appearanceProfileIds,
    };
};
