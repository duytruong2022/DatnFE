import { notificationModule } from './../store';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import { DEFAULT_FIRST_PAGE, HttpStatus, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { notificationService } from '../services/notification.service';
import { authModule } from '@/features/auth/store';

const validateRejectNotificationFormSchema = yup.object({
    rejectReason: yup.string().trim().max(TEXTAREA_MAX_LENGTH).required().label('reason'),
});
export function setupRejectNotificationForm() {
    const { t } = useI18n();
    const initValues = {
        rejectReason: '',
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateRejectNotificationFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const selectedNotificationId = computed(
            () => notificationModule.selectedNotification?._id,
        );

        const loading = ElLoading.service({
            target: '.reject-notification-form',
        });
        const response = await notificationService.reject(
            selectedNotificationId.value || '',
            {
                rejectReason: values.rejectReason as string,
            },
        );
        loading.close();
        notificationModule.setIsShowRejectNotificationForm(false);
        if (response.success) {
            showSuccessNotificationFunction(
                t('notification.message.reject.success') as string,
            );
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const selectedAccessModule = computed(() => authModule.selectedAccessModule);
            notificationModule.setNotificationListQueryString({
                page: DEFAULT_FIRST_PAGE,
            });
            await Promise.all([
                notificationModule.getNotificationList(),
                notificationModule.getPendingNotificationCount(
                    selectedAccessModule.value ? [selectedAccessModule.value] : null,
                ),
            ]);
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                await notificationModule.getNotificationList();
                loading.close();
            }
        }
    });
    const { value: rejectReason } = useField('rejectReason');
    return {
        errors,
        rejectReason,
        validate,
        onSubmit,
        resetForm,
    };
}
