import { PageName } from '@/common/constants';
import { notificationModule } from '@/features/notification/store';
import { computed } from 'vue';

export const sidebarPlatform = [
    // Admin
    {
        iconLink: require('@/assets/icons/user.svg'),
        name: 'app.sidebar.platform.admin',
        active: false,
        to: '/user',
        pageName: PageName.USER_LIST_PAGE,
    },

    // Notifications
    {
        iconLink: require('@/assets/icons/bell.svg'),
        name: 'app.sidebar.platform.notifications',
        active: false,
        to: '/notification',
        pageName: PageName.NOTIFICATION_LIST_PAGE,
        badge: () => {
            return computed(() => notificationModule.pendingNotificationCount).value;
        },
    },

    // Logs
    {
        iconLink: require('@/assets/icons/document-text.svg'),
        name: 'app.sidebar.platform.accessLogs',
        active: false,
        to: '/access-log',
        pageName: PageName.ACCESS_LOG_LIST_PAGE,
    },

    // Help
    {
        iconLink: require('@/assets/icons/question-mark-circle.svg'),
        name: 'app.sidebar.platform.help',
        active: false,
        to: '/support-request',
        pageName: PageName.SUPPORT_REQUEST_LIST_PAGE,
    },
];
