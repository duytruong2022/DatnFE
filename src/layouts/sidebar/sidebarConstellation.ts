import { SecurityPermissions } from '@/features/security-profile/constants';
import { PageName } from '@/common/constants';
import { computed } from 'vue';
import { notificationModule } from '@/features/notification/store';

//Admin
export const sidebarsConstellation = [
    // Dashboard
    {
        iconLink: require('@/assets/icons/chart-pie.svg'),
        name: 'app.sidebar.constellation.admin.dashboard',
        active: false,
        to: '/project-list',
        requiredPermissions: [SecurityPermissions.ACCESS_DASHBOARD],
        pageName: PageName.PROJECT_LIST_PAGE,
    },

    // Project
    {
        iconLink: require('@/assets/icons/building.svg'),
        name: 'app.sidebar.constellation.admin.project',
        active: false,
        to: '/project',
        pageName: PageName.PROJECT_MAP_PAGE,
    },

    // Notifications
    {
        iconLink: require('@/assets/icons/bell.svg'),
        name: 'app.sidebar.constellation.admin.notifications',
        active: false,
        to: '/notification',
        requiredPermissions: [SecurityPermissions.ACCESS_NOTIFICATION],
        badge: () => {
            return computed(() => notificationModule.pendingNotificationCount).value;
        },
        pageName: PageName.NOTIFICATION_LIST_PAGE,
    },

    // User
    {
        iconLink: require('@/assets/icons/user.svg'),
        name: 'app.sidebar.constellation.admin.user.title',
        active: false,
        children: [
            {
                name: 'app.sidebar.constellation.admin.user.user',
                active: false,
                to: '/user',
                pageName: PageName.USER_LIST_PAGE,
                requiredPermissions: [SecurityPermissions.MANAGE_USERS_GROUPS],
            },
            {
                name: 'app.sidebar.constellation.admin.user.group',
                active: false,
                to: '/constellation-group',
                pageName: PageName.CONSTELLATION_GROUP_LIST_PAGE,
                requiredPermissions: [SecurityPermissions.MANAGE_USERS_GROUPS],
            },
            {
                name: 'app.sidebar.constellation.admin.user.securityProfile',
                active: false,
                to: '/security-profile',
                pageName: PageName.SECURITY_PROFILE_LIST_PAGE,
                requiredPermissions: [SecurityPermissions.CREATE_SECURITY_PROFILE],
            },
        ],
    },

    {
        iconLink: require('@/assets/icons/document-text.svg'),
        name: 'app.sidebar.constellation.admin.projectLog.title',
        active: false,
        requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS],
        children: [
            {
                name: 'app.sidebar.constellation.admin.projectLog.projectLogHistory',
                active: false,
                to: '/project-log/project-history',
                pageName: PageName.PROJECT_LOG_HISTORY_LIST_PAGE,
                requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS],
            },
            {
                name: 'app.sidebar.constellation.admin.projectLog.projectLogTransaction',
                active: false,
                to: '/project-log/project-transactions',
                pageName: PageName.PROJECT_LOG_TRANSACTION_LIST_PAGE,
                requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS],
            },
            {
                name: 'app.sidebar.constellation.admin.projectLog.projectLogReport',
                active: false,
                to: '/project-log/log-report',
                pageName: PageName.PROJECT_LOG_REPORT_PAGE,
                requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS_REPORTS],
            },
        ],
    },

    // Help
    {
        iconLink: require('@/assets/icons/question-mark-circle.svg'),
        name: 'app.sidebar.constellation.admin.help',
        active: false,
        to: '/support-request',
        pageName: PageName.SUPPORT_REQUEST_LIST_PAGE,
    },
];
