import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import AbsPage from './pages/AbsPage.vue';

const absRouter: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/abs',
                name: PageName.ABS_PAGE,
                component: AbsPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'abs.breadcrumb',
                            link: '/abs',
                        },
                    ],
                },
            },
        ],
    },
];

export default absRouter;
