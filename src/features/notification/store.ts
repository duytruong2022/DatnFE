import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { INotification, INotificationListQueryString } from './interfaces';
import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    LIMIT_PER_PAGE,
    OrderDirection,
} from '@/common/constants';
import { NotificationStatus } from './constants';
import { notificationService } from './services/notification.service';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import localStorageAuthService from '@/common/authStorage';
export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: OrderDirection.DESCENDING,
    keyword: '',
    status: NotificationStatus.PENDING,
    accessModules: [localStorageAuthService.getSelectedAccessModule()],
    projectId: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'notification' })
class NotificationModule extends VuexModule {
    notificationList: INotification[] = [];
    totalNotifications = 0;
    pendingNotificationCount = 0;
    notificationListQueryString: INotificationListQueryString = initQueryString;
    selectedNotification: INotification | null = null;
    isShowRejectNotificationForm = false;
    selectedNotificationTab = NotificationStatus.PENDING;

    @Action
    async getNotificationList(): Promise<IBodyResponse<IGetListResponse<INotification>>> {
        const response = (await notificationService.getList({
            ...this.notificationListQueryString,
        })) as IBodyResponse<IGetListResponse<INotification>>;
        if (response.success) {
            this.MUTATE_NOTIFICATION_LIST(response.data.items);
            this.MUTATE_TOTAL_NOTIFCATION(response.data.totalItems);
        }
        return response;
    }

    @Action
    setNotificationListQueryString(query: INotificationListQueryString) {
        this.MUTATE_NOTIFICATION_LIST_QUERY_STRING(query);
    }

    @Action
    setIsShowRejectNotificationForm(isShowRejectNotificationForm: boolean) {
        this.MUTATE_IS_SHOW_REJECT_NOTIFICATION_FORM(isShowRejectNotificationForm);
    }

    @Action
    setSelectedNotification(selectedNotification: INotification | null) {
        this.MUTATE_SELECTED_NOTIFICATION(selectedNotification);
    }

    @Action
    setSelectedNotificationTab(notificationTab: NotificationStatus) {
        this.MUTATE_SELECTED_NOTIFICATION_TAB(notificationTab);
    }

    @Action
    async getPendingNotificationCount(accessModules: AccessModules[] | null) {
        const response = await notificationService.countPendingNotification(
            accessModules,
        );
        if (response.success) {
            this.MUTATE_PENDING_NOTIFICATION_COUNT(response.data.totalItems);
        }
        return response;
    }

    @Mutation
    MUTATE_NOTIFICATION_LIST(notificationList: INotification[]) {
        this.notificationList = notificationList;
    }

    @Mutation
    MUTATE_TOTAL_NOTIFCATION(totalNotification: number) {
        this.totalNotifications = totalNotification;
    }

    @Mutation
    MUTATE_NOTIFICATION_LIST_QUERY_STRING(query: INotificationListQueryString) {
        this.notificationListQueryString = {
            ...this.notificationListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_SELECTED_NOTIFICATION(selectedNotification: INotification | null) {
        this.selectedNotification = selectedNotification;
    }

    @Mutation
    MUTATE_IS_SHOW_REJECT_NOTIFICATION_FORM(isShowRejectNotificationForm: boolean) {
        this.isShowRejectNotificationForm = isShowRejectNotificationForm;
    }

    @Mutation
    MUTATE_SELECTED_NOTIFICATION_TAB(notificationTab: NotificationStatus) {
        this.selectedNotificationTab = notificationTab;
    }

    @Mutation
    MUTATE_PENDING_NOTIFICATION_COUNT(pendingNotificationCount: number) {
        this.pendingNotificationCount = pendingNotificationCount;
    }
}

export const notificationModule = getModule(NotificationModule);
