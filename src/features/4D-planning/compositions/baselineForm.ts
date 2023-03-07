import localStorageAuthService from '@/common/authStorage';
import { HttpStatus, INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';
import i18n from '@/plugins/vue-i18n';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { IBaselinePlanning, IBaselineTaskBody } from '../interfaces';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const baselineFormSchema = yup.object({
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required().label('baselineName'),
});

export const setupBaselineForm = () => {
    const isCreate = computed(() => !projectPlanningModule.selectedBaselineIdToUpdate);
    const initValues = {
        name: '',
    };

    const { handleSubmit, errors, resetForm } = useForm({
        initialValues: initValues,
        validationSchema: baselineFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const baselinePlanningBody: IBaselineTaskBody = {
            name: values.name?.trim() || '',
            planningId: projectPlanningModule.planning?._id || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
            projectId: projectModule.selectedProjectId || '',
        };

        let response;
        if (!isCreate.value) {
            response = (await projectPlanningService.updateBaseline(
                projectPlanningModule.selectedBaselineIdToUpdate || '',
                baselinePlanningBody,
            )) as unknown as IBodyResponse<IBaselinePlanning>;
        } else {
            response = (await projectPlanningService.createTaskBaseline(
                baselinePlanningBody,
            )) as unknown as IBodyResponse<boolean>;
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? i18n.global.t('planning.baselineForm.message.update.updateSuccess')
                    : i18n.global.t('planning.baselineForm.message.saveSuccess'),
            );
            const loading = ElLoading.service({ target: '.form-group' });
            await projectPlanningModule.getBaselineList();
            loading.close();
            return true;
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowBaselinePopup(false);
            }
            return false;
        }
    });

    const { value: name } = useField('name');
    return { name, errors, isCreate, initValues, onSubmit, resetForm };
};
