import { PageName } from '@/common/constants';
import MainLayout from '@/layouts/MainLayout.vue';
import { RouteRecordRaw } from 'vue-router';
import Planning4DPage from './pages/Planning4DPage.vue';
import Planning3DPage from './pages/Planning3DPage.vue';
import Planning4DAnalyzerPage from './pages/Planning4DAnalyzerPage.vue';

const planningRouters: Array<RouteRecordRaw> = [
    {
        path: '/project/4d-planning',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PLANNING_4D_PAGE,
                component: Planning4DPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            index: 1,
                            text: 'planning.breadcrumb.planning',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project/4D-analyzer',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName['4D_ANALYZER_PAGE'],
                component: Planning4DAnalyzerPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            index: 1,
                            text: 'planning.breadcrumb.analyzer',
                        },
                    ],
                },
            },
        ],
    },
];
export default planningRouters;
