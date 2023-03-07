import localStorageAuthService from '@/common/authStorage';
import { IGroup, IGroupCreateBody } from '../interfaces';
import { groupModule } from '../store';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import { AccessModules, DEFAULT_FIRST_PAGE, HttpStatus } from '@/common/constants';
import { validateGroupSchema } from '../constant';
import { IBodyResponse } from '@/common/interfaces';
import { groupService } from '../services/api.services';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';

export function setupGroupForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        description: '',
        profileId: '',
    };
    const isCreate = computed(() => !groupModule.selectedGroup?._id);
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let createBody;
        if (
            localStorageAuthService.getSelectedAccessModule() ===
            AccessModules.SPACIALYTIC_CONSTELLATION
        ) {
            createBody = {
                name: values.name?.trim(),
                description: values.description?.trim(),
                accessModule: localStorageAuthService.getSelectedAccessModule(),
                securityProfileId: values.profileId?.trim(),
            } as unknown as IGroupCreateBody;
        } else if (
            localStorageAuthService.getSelectedAccessModule() ===
            AccessModules.SPACIALYTIC_3DWEBVIEWER
        ) {
            createBody = {
                name: values.name?.trim(),
                description: values.description?.trim(),
                accessModule: localStorageAuthService.getSelectedAccessModule(),
                viewer3dProfileId: values.profileId?.trim(),
            } as unknown as IGroupCreateBody;
        }
        let response;
        const groupId = groupModule.selectedGroup?._id;
        const loading = ElLoading.service({
            target: '.group-form',
        });
        if (!isCreate.value) {
            response = await groupService.update(groupId as string, createBody);
        } else {
            response = await groupService.create(createBody);
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('group.message.update.success')
                    : (t('group.message.create.success') as string),
            );
            groupModule.setIsShowGroupForm(false);
            groupModule.setGroupListQueryString({ page: DEFAULT_FIRST_PAGE });
            const loading = ElLoading.service({
                target: '.content',
            });
            await groupModule.getGroupList();
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                groupModule.setIsShowGroupForm(false);
                const loading = ElLoading.service({
                    target: '.content',
                });
                await groupModule.getGroupList();
                loading.close();
            }
        }
    });
    const { value: name } = useField('name');
    const { value: description } = useField('description');
    const { value: profileId } = useField('profileId');

    const openPopup = async () => {
        if (!isCreate.value) {
            const loading = ElLoading.service({ target: '.group-form-popup' });
            const groupDetail = (await groupService.getDetail(
                groupModule.selectedGroup?._id || 0,
            )) as IBodyResponse<IGroup>;
            loading.close();
            resetForm({
                values: {
                    name: groupDetail.data?.name,
                    description: groupDetail.data?.description,
                    profileId:
                        groupDetail.data?.securityProfileId ||
                        groupDetail.data?.viewer3dProfileId ||
                        '',
                },
            });
        } else {
            initValues.profileId = groupModule.securityProfileDefault.value as string;
            resetForm({
                values: initValues,
            });
        }
    };
    return {
        errors,
        name,
        description,
        profileId,
        isCreate,
        validate,
        openPopup,
        onSubmit,
        resetForm,
    };
}
