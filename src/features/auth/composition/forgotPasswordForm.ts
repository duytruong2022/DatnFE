import { authModule } from '@/features/auth/store';
import { useField, useForm } from 'vee-validate';

import { ElLoading } from 'element-plus';
import { INPUT_TEXT_MAX_LENGTH, FORM_VALIDATION } from '@/common/constants';
import yup from '@/plugins/yup';
import { authService } from '../services/api.services';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { useI18n } from 'vue-i18n';

const validateForgotPasswordFormSchema = yup.object({
    email: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .matches(FORM_VALIDATION.email)
        .required()
        .trim()
        .label('email'),
});

export function setupForgotPasswordForm() {
    const { t } = useI18n();
    const initValues = {
        email: '',
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateForgotPasswordFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.forgot-password-form-popup-wrapper',
        });
        values.email = values.email?.trim().toLowerCase();
        const response = await authService.forgotPassword(values);
        if (response.success) {
            authModule.setIsShowForgotPasswordFormPopUp(false);
            showSuccessNotificationFunction(
                t('forgotPassword.message.sendRequestSuccess'),
            );
            loading.close();
        } else {
            showErrorNotificationFunction(response.message);
            loading.close();
        }
    });

    const { value: email } = useField('email');

    return {
        errors,
        email,
        validate,
        onSubmit,
        resetForm,
    };
}
