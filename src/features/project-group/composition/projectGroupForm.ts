import localStorageAuthService from '@/common/authStorage';
import { IProjectGroup, IProjectGroupCreateBody } from '../interfaces';
import { projectGroupModule } from '../store';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import { DEFAULT_FIRST_PAGE, HttpStatus } from '@/common/constants';
import { validateProjectGroupSchema } from '../constant';
import { IBodyResponse } from '@/common/interfaces';
import { projectGroupService } from '../services/api.services';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';

export function setupProjectGroupForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        description: '',
        projectProfileId: '',
    };
    const isCreate = computed(() => !projectGroupModule.selectedGroup?._id);
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const createBody = {
            ...values,
            name: values.name?.trim(),
            description: values.description?.trim(),
            projectProfileId: values.projectProfileId?.trim(),
            projectId: projectModule.selectedProjectId,
            accessModule: localStorageAuthService.getSelectedAccessModule(),
        } as IProjectGroupCreateBody;
        let response;
        const groupId = projectGroupModule.selectedGroup?._id;
        const loading = ElLoading.service({
            target: '.group-form',
        });
        if (!isCreate.value) {
            response = await projectGroupService.update(groupId as string, createBody);
        } else {
            response = await projectGroupService.create(createBody);
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('projectGroup.message.update.success')
                    : (t('projectGroup.message.create.success') as string),
            );
            projectGroupModule.setIsShowGroupForm(false);
            projectGroupModule.setGroupListQueryString({
                page: DEFAULT_FIRST_PAGE,
            });
            const loading = ElLoading.service({
                target: '.content',
            });
            await projectGroupModule.getGroupList();
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectGroupModule.setIsShowGroupForm(false);
                const loading = ElLoading.service({
                    target: '.content',
                });
                await projectGroupModule.getGroupList();
                loading.close();
            }
        }
    });
    const { value: name } = useField('name');
    const { value: description } = useField('description');
    const { value: projectProfileId } = useField('projectProfileId');

    const openPopup = async () => {
        if (!isCreate.value) {
            const loading = ElLoading.service({ target: '.group-form-popup' });
            const groupDetail = (await projectGroupService.getDetail(
                projectGroupModule.selectedGroup?._id || 0,
            )) as IBodyResponse<IProjectGroup>;
            loading.close();
            resetForm({
                values: {
                    name: groupDetail.data?.name,
                    description: groupDetail.data?.description,
                    projectProfileId: groupDetail.data?.projectProfileId,
                },
            });
        } else {
            initValues.projectProfileId = projectGroupModule.projectProfileDefault
                .value as string;
            resetForm({
                values: initValues,
            });
        }
    };
    return {
        errors,
        name,
        description,
        projectProfileId,
        isCreate,
        validate,
        openPopup,
        onSubmit,
        resetForm,
    };
}
