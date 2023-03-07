import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import ProjectProfileListPage from './pages/ProjectProfileListPage.vue';
import Viewer3DProfilePage from './pages/3DViewerProfilePage.vue';
import { ProjectSecurityPermissions } from './constants';

const profileRouter: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/project-profile',
                name: PageName.PROJECT_PROFILE_LIST_PAGE,
                component: ProjectProfileListPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: '3dViewerProfile.projectProfile.breadcrumb.admin',
                        },
                        {
                            text: '3dViewerProfile.projectProfile.breadcrumb.projectProfile',
                            link: '',
                        },
                    ],
                    requiredPermissions: [
                        ProjectSecurityPermissions.GENERAL_CREATE_PROJECT_PROFILE,
                    ],
                },
            },
            {
                path: '/3d-viewer-profile',
                name: PageName['3D_VIEWER_PROFILE_PAGE'],
                component: Viewer3DProfilePage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: '3dViewerProfile.viewer3dProfile.breadcrumb.admin',
                        },
                        {
                            text: '3dViewerProfile.viewer3dProfile.breadcrumb.viewer3dProfile',
                            link: '',
                        },
                    ],
                    required3DViewerRoles: [UserRoles.ADMIN],
                },
            },
        ],
    },
];

export default profileRouter;
