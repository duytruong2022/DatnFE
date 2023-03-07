import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import RepositoryPage from './pages/RepositoryPage.vue';

const repositoryRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/repository',
                name: PageName.REPOSITORY_PAGE,
                component: RepositoryPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'repository.breadcrumb',
                        },
                    ],
                    required3DViewerRoles: [UserRoles.NORMAL_USER],
                },
            },
        ],
    },
];

export default repositoryRouters;
