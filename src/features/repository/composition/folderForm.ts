import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { projectModule } from '@/features/project/store';
import { Regex } from '@/common/constants';
import { FTPDataType } from '@/common/constants';
import { repositoryModule } from '../store';
import { repositoryService } from '../services/api.service';

const validateCreateFolderFormSchema = yup.object({
    path: yup.string().required(),
    name: yup
        .string()
        .trim()
        .matches(Regex.FODLER_NAME, 'repository.folderForm.error.invalidFolderName')
        .required(),
    type: yup.string().oneOf([...Object.values(FTPDataType)]),
});
export function setupFolderForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        path: '',
        type: FTPDataType.FOLDER,
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateCreateFolderFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.create-folder-form',
        });
        const selectedProjectId = computed(() => projectModule.selectedProjectId);
        const selectedFolderName = computed(() => repositoryModule.selectedFolderName);
        let response;
        if (selectedFolderName.value.length) {
            response = await repositoryService.updateFolderAndFile({
                path: values.path || '',
                name: values.name || '',
                type: values.type || FTPDataType.FOLDER,
                projectId: selectedProjectId.value || '',
            });
        } else {
            response = await repositoryService.createFolder({
                path: values.path || '',
                name: values.name || '',
                type: values.type || FTPDataType.FOLDER,
                projectId: selectedProjectId.value || '',
            });
        }
        loading.close();
        repositoryModule.setIsShowCreateFolderForm(false);
        if (response.success) {
            if (selectedFolderName.value.length) {
                showSuccessNotificationFunction(
                    t('repository.folderForm.success.update') as string,
                );
            } else {
                showSuccessNotificationFunction(
                    t('repository.folderForm.success.create') as string,
                );
            }
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            await repositoryModule.getFolderStructure();
            loading.close();
            repositoryModule.setRecentOpenedFolderKey(response.data.path);
            repositoryModule.setCurrentPath(response.data.path);
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: name } = useField('name');
    const { value: path } = useField('path');
    const { value: type } = useField('type');
    return {
        errors,
        name,
        path,
        type,
        validate,
        onSubmit,
        resetForm,
    };
}
