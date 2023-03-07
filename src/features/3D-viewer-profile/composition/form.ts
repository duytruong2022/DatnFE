import { AccessModules } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { profileSchema } from '../constants';
import { ICreateProfileBody, IUpdateProfileBody } from '../interfaces';
import { viewer3dProfileService, projectProfileService } from '../services/api.service';
import { profileModule } from '../store';

export const initProfileValue = {
    name: '',
    description: '',
    projectId: '',
    accessModule: AccessModules.SPACIALYTIC_CONSTELLATION,
    permissions: [],
    isDefaultSelect: false,
};
export const setupProfileForm = () => {
    const { errors, resetForm, handleSubmit, setFieldValue, setValues, values } = useForm(
        {
            validationSchema: profileSchema,
            initialValues: initProfileValue,
        },
    );
    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const selectedModule = computed(() => authModule.selectedAccessModule);
        let apiService;
        if (selectedModule.value === AccessModules.SPACIALYTIC_CONSTELLATION) {
            apiService = projectProfileService;
        } else {
            apiService = viewer3dProfileService;
            delete values.projectId;
        }
        let response;
        // create
        delete values.accessModule;
        if (!profileModule.selectedProfile?._id) {
            response = await apiService.createProfile(values as ICreateProfileBody);
        } else {
            delete values.projectId;
            response = await apiService.updateProfile(
                profileModule.selectedProfile?._id as string,
                values as IUpdateProfileBody,
            );
        }

        if (response.success) {
            if (!profileModule.selectedProfile?._id) {
                showSuccessNotificationFunction(
                    i18n.global.t('3dViewerProfile.profileForm.create.success'),
                );
            } else {
                showSuccessNotificationFunction(
                    i18n.global.t('3dViewerProfile.profileForm.update.success'),
                );
            }
            profileModule.setSelectedProfile(response.data);
            response = await apiService.getProfileList(
                profileModule.profileListQueryString,
            );
            if (response.success) {
                profileModule.setProfileList(response.data.items);
                profileModule.setTotalProfiles(response.data.totalItems);
            } else if (!response?.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
        } else if (!response?.isRequestError) {
            showErrorNotificationFunction(response.message);
        }

        loading.close();
    });

    const { value: name } = useField('name');
    const { value: description } = useField('description');
    const { value: projectId } = useField('projectId');
    const { value: accessModule } = useField('accessModule');
    const { value: permissions } = useField('permissions');
    const { value: isDefaultSelect } = useField('isDefaultSelect');
    return {
        onSubmit,
        name,
        description,
        projectId,
        accessModule,
        permissions,
        errors,
        setFieldValue,
        isDefaultSelect,
        setValues,
        resetForm,
        values,
    };
};
