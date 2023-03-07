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
import { FILE_NAME_MAX_LENGTH, Regex } from '@/common/constants';
import { FTPDataType } from '@/common/constants';
import { repositoryModule } from '../store';
import { repositoryService } from '../services/api.service';

const validateFileFormSchema = yup.object({
    path: yup.string().required(),
    name: yup
        .string()
        .max(FILE_NAME_MAX_LENGTH)
        .trim()
        .matches(Regex.FILE_NAME, 'repository.fileForm.error.invalidFileName')
        .required(),
    type: yup.string().oneOf([...Object.values(FTPDataType)]),
});
export function setupFileForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        path: '',
        type: FTPDataType.FILE,
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateFileFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.file-form',
        });
        const selectedProjectId = computed(() => projectModule.selectedProjectId);
        const response = await repositoryService.updateFolderAndFile({
            path: values.path || '',
            name: values.name || '',
            type: values.type || FTPDataType.FILE,
            projectId: selectedProjectId.value || '',
        });
        loading.close();
        repositoryModule.setIsShowFileForm(false);
        if (response.success) {
            showSuccessNotificationFunction(
                t('repository.fileForm.success.update') as string,
            );
            const currentPath = computed(() => repositoryModule.currentPath);
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            await repositoryModule.getFolderFiles({
                projectId: selectedProjectId.value || '',
                path: currentPath.value,
            });
            loading.close();
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
