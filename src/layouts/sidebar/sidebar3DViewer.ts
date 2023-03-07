import { PageName } from '@/common/constants';
import { notificationModule } from '@/features/notification/store';
import { computed } from 'vue';

//Admin
export const sidebars3DViewerAdmin = [
    // Admin
    {
        iconLink: require('@/assets/icons/user.svg'),
        name: 'app.sidebar.3DViewer.admin.admin.title',
        active: false,
        children: [
            {
                name: 'app.sidebar.3DViewer.admin.admin.user',
                active: false,
                to: '/user',
                pageName: PageName.USER_LIST_PAGE,
            },
            {
                name: 'app.sidebar.3DViewer.admin.admin.group',
                active: false,
                to: '/3d-viewer-group',
                pageName: PageName['3D_VIEWER_GROUP_LIST_PAGE'],
            },
            {
                name: 'app.sidebar.3DViewer.admin.admin.profile',
                active: false,
                to: '/3d-viewer-profile',
                pageName: PageName['3D_VIEWER_PROFILE_PAGE'],
            },
        ],
    },
    // Notifications:
    {
        iconLink: require('@/assets/icons/bell.svg'),
        name: 'app.sidebar.3DViewer.admin.notifications',
        active: false,
        to: '/notification',
        badge: () => {
            return computed(() => notificationModule.pendingNotificationCount).value;
        },
        pageName: PageName.NOTIFICATION_LIST_PAGE,
    },
];

// User
export const sidebars3DViewerUser = [
    // 3DViewer:
    {
        iconLink: require('@/assets/icons/puzzle.svg'),
        name: 'app.sidebar.3DViewer.user.3DViewer',
        active: false,
        to: '/3D-viewer',
        pageName: PageName.VIEWER_3D_PAGE,
    },
    // Repository:
    {
        iconLink: require('@/assets/icons/computer.svg'),
        name: 'app.sidebar.3DViewer.user.repository',
        active: false,
        to: '/repository',
        pageName: PageName.REPOSITORY_PAGE,
    },
];
