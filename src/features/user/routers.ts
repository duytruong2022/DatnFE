import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import UserListPage from './pages/UserListPage.vue';
import { SecurityPermissions } from '../security-profile/constants';

const userRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/user',
                name: PageName.USER_LIST_PAGE,
                component: UserListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'user.breadcrumb.admin',
                        },
                        {
                            text: 'user.breadcrumb.user',
                            link: '/user',
                        },
                    ],
                    requiredPermissions: [
                        SecurityPermissions.MANAGE_USERS_GROUPS,
                        ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
                    ],
                    required3DViewerRoles: [UserRoles.ADMIN],
                    isViewProject: true,
                },
            },
        ],
    },
];

export default userRouters;
