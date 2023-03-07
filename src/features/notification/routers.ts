import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import NotificationPage from './pages/NotificationPage.vue';
import { SecurityPermissions } from '../security-profile/constants';

const notificationRouters: Array<RouteRecordRaw> = [
    {
        path: '/notification',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.NOTIFICATION_LIST_PAGE,
                component: NotificationPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'notification.breadcrumb.notifications',
                            link: '/notification',
                        },
                    ],
                    requiredPermissions: [SecurityPermissions.ACCESS_NOTIFICATION],
                    required3DViewerRoles: [UserRoles.ADMIN],
                },
            },
        ],
    },
];

export default notificationRouters;
