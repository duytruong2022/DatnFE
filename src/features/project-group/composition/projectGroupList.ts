import { DEFAULT_FIRST_PAGE, HttpStatus } from '@/common/constants';
import i18n from '@/plugins/vue-i18n';
import { projectGroupModule } from '../store';

import { ElLoading } from 'element-plus';
import { projectGroupService } from '../services/api.services';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
    showConfirmPopUpFunction,
} from '@/common/helpers';

export const setupDelete = () => {
    const deleteGroup = async (id: string) => {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('projectGroup.message.delete.confirmAsk') as string,
            i18n.global.t('projectGroup.message.delete.title') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.content',
            });
            const response = await projectGroupService.delete(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('projectGroup.message.delete.success') as string,
                );
                projectGroupModule.setGroupListQueryString({
                    page: DEFAULT_FIRST_PAGE,
                });
                const loading = ElLoading.service({
                    target: '.content',
                });
                await projectGroupModule.getGroupList();
                loading.close();
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.content',
                    });
                    await projectGroupModule.getGroupList();
                    loading.close();
                }
            }
        }
    };

    return { deleteGroup };
};
