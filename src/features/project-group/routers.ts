import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import ProjectGroupListPage from './pages/ProjectGroupListPage.vue';

const projectGroupRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/project-group',
                name: PageName.PROJECT_GROUP_LIST_PAGE,
                component: ProjectGroupListPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'projectGroup.breadcrumb.admin',
                        },
                        {
                            index: 2,
                            text: 'projectGroup.breadcrumb.group',
                            link: '',
                        },
                    ],
                },
            },
        ],
    },
];

export default projectGroupRouters;
