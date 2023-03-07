import { mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { DATE_TIME_FORMAT, DEFAULT_FIRST_PAGE, PageName } from '@/common/constants';
import { INotification } from './interfaces';
import { notificationModule } from './store';
import { ElLoading } from 'element-plus';
import { NotificationStatus, NotificationTypes } from './constants';
import moment from 'moment';
export class NotificationTableMixins extends mixins(UtilMixins) {
    PageName = PageName;
    get selectedPage(): number {
        return notificationModule.notificationListQueryString.page || DEFAULT_FIRST_PAGE;
    }

    set selectedPage(value: number) {
        notificationModule.setNotificationListQueryString({
            page: value,
        });
    }

    get notificationList(): INotification[] {
        return notificationModule.notificationList;
    }
    get totalNotifications(): number {
        return notificationModule.totalNotifications;
    }

    get selectedTab(): NotificationStatus {
        return notificationModule.selectedNotificationTab;
    }

    getRequiredAction(type: NotificationTypes): string {
        switch (type) {
            case NotificationTypes.REGISTER:
                return this.$t('notification.table.actions.setPassword');
            case NotificationTypes.RESET_PASSWORD:
                return this.$t('notification.table.actions.resetPassword');
            case NotificationTypes.LDAP_IMPORT:
                return this.$t('notification.table.actions.ldapImport');
            default:
                return '';
        }
    }

    getAction(type: NotificationTypes): string {
        switch (type) {
            case NotificationTypes.REGISTER:
                return this.$t('notification.table.actions.register');
            case NotificationTypes.RESET_PASSWORD:
                return this.$t('notification.table.actions.confirm');
            default:
                return '';
        }
    }

    async handlePaginate(): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        await notificationModule.getNotificationList();
        loading.close();
    }

    formatNotificationDate(date: string) {
        return moment(date).format(DATE_TIME_FORMAT.MM_DD_YYYY_SLASH_HH_MM_COLON);
    }
}
