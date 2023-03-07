import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import AccessLogListPage from './pages/AccessLogListPage.vue';

const accessLogRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/access-log',
                name: PageName.ACCESS_LOG_LIST_PAGE,
                component: AccessLogListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'accessLog.breadcrumb.accessLog',
                            link: '',
                        },
                    ],
                    required3DViewerRoles: [UserRoles.ADMIN],
                },
            },
        ],
    },
];

export default accessLogRouters;
