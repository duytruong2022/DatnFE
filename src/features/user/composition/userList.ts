import { AccessModules, DEFAULT_FIRST_PAGE, HttpStatus } from '@/common/constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { notificationModule } from '@/features/notification/store';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { userService } from '../services/api.services';
import { userModule } from '../store';

export const setupDelete = () => {
    const deleteUser = async (id: string) => {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('user.delete.confirmAsk') as string,
            i18n.global.t('user.delete.title') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            const response = await userService.delete(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('userForm.message.deleteSuccess') as string,
                );
                userModule.setUserListQueryString({
                    page: DEFAULT_FIRST_PAGE,
                });
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await Promise.all([
                    userModule.getUserList(),
                    userModule.getCompanyList(),
                    notificationModule.getPendingNotificationCount([
                        authModule.selectedAccessModule ||
                            AccessModules.SPACIALYTIC_PLATFORM,
                    ]),
                ]);
                loading.close();
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await userModule.getUserList();
                    await userModule.getCompanyList();
                    loading.close();
                }
            }
        }
    };

    return { deleteUser };
};
