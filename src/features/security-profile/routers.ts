import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import SecurityProfileListPage from './pages/SecurityProfileListPage.vue';

const securtyProfileRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/security-profile',
                name: PageName.SECURITY_PROFILE_LIST_PAGE,
                component: SecurityProfileListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'securityProfile.breadcrumb.admin',
                        },
                        {
                            text: 'securityProfile.breadcrumb.securityProfile',
                            link: '',
                        },
                    ],
                },
            },
        ],
    },
];

export default securtyProfileRouters;
