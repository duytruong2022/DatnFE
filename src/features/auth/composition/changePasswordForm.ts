import localStorageAuthService from '@/common/authStorage';
import {
    INPUT_TEXT_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    Regex,
} from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authService } from '@/features/auth/services/api.services';
import { authModule } from '@/features/auth/store';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

const initUser = {
    currentPassword: '',
    password: '',
    confirmPassword: '',
    isCurrentPasswordRequired: false,
};

export const changePasswordFormSchema = yup.object({
    isCurrentPasswordRequired: yup.boolean().required(),
    currentPassword: yup
        .string()
        .optional()
        .max(INPUT_TEXT_MAX_LENGTH)
        .nullable()
        .when('isCurrentPasswordRequired', {
            is: true,
            then: yup
                .string()
                .trim()
                .matches(Regex.PASSWORD, 'common.error.password')
                .min(PASSWORD_MIN_LENGTH)
                .max(PASSWORD_MAX_LENGTH)
                .required(),
        }),
    password: yup
        .string()
        .trim()
        .matches(Regex.PASSWORD, 'common.error.password')
        .notOneOf(
            [yup.ref('currentPassword')],
            'changePasswordForm.error.duplicatePassword',
        )
        .required()
        .min(PASSWORD_MIN_LENGTH)
        .max(PASSWORD_MAX_LENGTH),
    confirmPassword: yup
        .string()
        .oneOf(
            [yup.ref('password'), null],
            'changePasswordForm.error.confirmPasswordDoNotMatch',
        )
        .required(),
});

export const setupChangePasswordForm = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, validate, resetForm } = useForm({
        initialValues: initUser,
        validationSchema: changePasswordFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.change-password-form',
        });
        const response = await authService.changePassword({
            password: values.password as string,
            confirmPassword: values.confirmPassword as string,
            currentPassword: values.currentPassword as string,
        });
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(t('changePasswordForm.message.success'));
            authModule.setIsShowChangePasswordForm(false);
            const response = await authModule.getProfile();
            localStorageAuthService.setUser(response.data);
        } else {
            showErrorNotificationFunction(response.message);
        }
    });
    const { value: isCurrentPasswordRequired } = useField('isCurrentPasswordRequired');
    const { value: password } = useField('password');
    const { value: confirmPassword } = useField('confirmPassword');
    const { value: currentPassword } = useField('currentPassword');

    return {
        errors,
        onSubmit,
        resetForm,
        validate,
        isCurrentPasswordRequired,
        password,
        confirmPassword,
        currentPassword,
    };
};
