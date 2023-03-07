import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import SupportRequestListPage from './pages/SupportRequestListPage.vue';

const supportRequestRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/support-request',
                name: PageName.SUPPORT_REQUEST_LIST_PAGE,
                component: SupportRequestListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'supportRequest.breadcrumb.supportRequest',
                            link: '',
                        },
                    ],
                },
            },
        ],
    },
];

export default supportRequestRouters;
