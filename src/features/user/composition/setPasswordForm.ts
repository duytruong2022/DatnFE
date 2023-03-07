import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { NotificationTypes } from '@/features/notification/constants';
import { notificationModule } from '@/features/notification/store';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setPasswordFormSchema } from '../constant';
import { userService } from '../services/api.services';
import { userModule } from '../store';

const initUser = {
    password: '',
    confirmPassword: '',
    assignRandomPassword: false,
    needToChangePassword: true,
};

export const setupSetPasswordForm = () => {
    const { t } = useI18n();
    const isCreate = computed(() => !userModule.selectedUser?._id);
    const { handleSubmit, errors, validate, resetForm } = useForm({
        initialValues: initUser,
        validationSchema: setPasswordFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.set-password-form',
        });
        const selectedUser = computed(() => userModule.selectedUser);
        const body = {
            password: values.password as string,
            notificationId: notificationModule.selectedNotification?._id,
            confirmPassword: values.confirmPassword as string,
            assignRandomPassword: values.assignRandomPassword as boolean,
            needToChangePassword: values.needToChangePassword as boolean,
        };
        const response =
            notificationModule.selectedNotification?.type ===
            NotificationTypes.RESET_PASSWORD
                ? await userService.resetPassword(selectedUser.value?._id || '', body)
                : await userService.setPassword(selectedUser.value?._id || '', body);

        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(t('setPasswordForm.message.success'));
            userModule.setIsShowSetPasswordForm(false);
            userModule.setSelectedUser(null);

            const selectedNotificationId = computed(
                () => notificationModule.selectedNotification?._id,
            );
            if (selectedNotificationId.value) {
                const loading = ElLoading.service({ target: '.page-wrapper' });
                const selectedAccessModule = computed(
                    () => authModule.selectedAccessModule,
                );
                await Promise.all([
                    notificationModule.getNotificationList(),
                    notificationModule.getPendingNotificationCount(
                        selectedAccessModule.value ? [selectedAccessModule.value] : null,
                    ),
                    userModule.getUserList(),
                ]);
                loading.close();
                notificationModule.setSelectedNotification(null);
            }
        } else {
            showErrorNotificationFunction(response.message);
        }
    });
    const { value: password } = useField('password');
    const { value: confirmPassword } = useField('confirmPassword');
    const { value: assignRandomPassword } = useField('assignRandomPassword');
    const { value: needToChangePassword } = useField('needToChangePassword');

    return {
        errors,
        onSubmit,
        resetForm,
        validate,
        isCreate,
        password,
        confirmPassword,
        assignRandomPassword,
        needToChangePassword,
    };
};
