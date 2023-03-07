import { DEFAULT_FIRST_PAGE, HttpStatus } from '@/common/constants';
import i18n from '@/plugins/vue-i18n';
import { supportRequestModule } from '../store';

import { ElLoading } from 'element-plus';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
    showConfirmPopUpFunction,
} from '@/common/helpers';
import { supportRequestService } from '../services/api.service';

export const setupSupportRequestDelete = () => {
    const deleteSupportRequest = async (id: string) => {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('supportRequest.message.delete.confirmAsk') as string,
            i18n.global.t('supportRequest.message.delete.title') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.content',
            });
            const response = await supportRequestService.delete(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('supportRequest.message.delete.success') as string,
                );
                supportRequestModule.setQueryList({
                    page: DEFAULT_FIRST_PAGE,
                });
                const loading = ElLoading.service({
                    target: '.content',
                });
                await supportRequestModule.getSupportRequestList();
                loading.close();
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.content',
                    });
                    await supportRequestModule.getSupportRequestList();
                    loading.close();
                }
            }
        }
    };

    return { deleteSupportRequest };
};
