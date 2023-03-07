import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import PbsGroupPage from './pages/PbsGroupPage.vue';

const pbsGroupRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/pbs',
                name: PageName.PBS_PAGE,
                component: PbsGroupPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'pbsGroup.breadcrumb.admin',
                        },
                        {
                            text: 'pbsGroup.breadcrumb.pbsGroup',
                            link: '',
                        },
                    ],
                },
            },
        ],
    },
];

export default pbsGroupRouters;
