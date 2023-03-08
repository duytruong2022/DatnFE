import localStorageAuthService from '@/common/authStorage';
import { HttpStatus } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { validateSupportRequestSchema } from '../contanst';
import { supportRequestService } from '../services/api.service';
import { initSupportRequestQuery, supportRequestModule } from '../store';

export const initValues = {
    email: '',
    firstName: '',
    lastName: '',
    category: '',
    priority: '',
    version: '',
    object: '',
    reference: '',
    detail: '',
};
export function setupSupportRequestForm() {
    const { t } = useI18n();

    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: initValues,
        validationSchema: validateSupportRequestSchema,
    });
    const onSubmit = handleSubmit(async (supportRequest) => {
        const supportRequestBody = {
            firstName: supportRequest.firstName?.trim(),
            lastName: supportRequest.lastName?.trim(),
            email: supportRequest.email?.trim(),
            category: supportRequest.category?.trim(),
            priority: supportRequest.priority?.trim(),
            version: supportRequest.version?.trim(),
            object: supportRequest.object?.trim(),
            reference: supportRequest.reference?.trim(),
            detail: supportRequest.detail?.trim(),
            accessModule: localStorageAuthService.getSelectedAccessModule(),
            file: supportRequestModule.uploadFile
                ? {
                      path: supportRequestModule.uploadFile.path,
                      originalname: supportRequestModule.uploadFile.originalname,
                      size: supportRequestModule.uploadFile.size,
                      type: supportRequestModule.uploadFile.type,
                      filename: supportRequestModule.uploadFile.filename,
                  }
                : null,
        };
        const loading = ElLoading.service({
            target: '.support-request-form',
        });
        const response = await supportRequestService.create(supportRequestBody);

        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(t('supportRequest.sendEmail'));
            supportRequestModule.setIsShowSupportRequestForm(false);
            supportRequestModule.setQueryList(initSupportRequestQuery);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await supportRequestModule.getSupportRequestList();
            loading.close();
            supportRequestModule.setSelectedSupportRequest(null);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                supportRequestModule.setIsShowSupportRequestForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await supportRequestModule.getSupportRequestList();
                loading.close();
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: email } = useField('email');
    const { value: firstName } = useField('firstName');
    const { value: lastName } = useField('lastName');
    const { value: category } = useField('category');
    const { value: priority } = useField('priority');
    const { value: version } = useField('version');
    const { value: site } = useField('site');
    const { value: object } = useField('object');
    const { value: reference } = useField('reference');
    const { value: detail } = useField('detail');

    const openForm = async () => {
        setErrors({});
        const user = localStorageAuthService.getUser();
        resetForm({
            values: {
                ...initValues,
                email: user.email,
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
            },
        });
    };
    return {
        errors,
        resetForm,
        validate,
        onSubmit,
        openForm,
        email,
        firstName,
        lastName,
        category,
        priority,
        version,
        site,
        object,
        reference,
        detail,
    };
}
