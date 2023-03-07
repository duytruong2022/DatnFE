import MainLayout from '@/layouts/MainLayout.vue';
import { PageName, UserRoles } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import Viewer3DPage from './pages/Viewer3DPage.vue';

const viewer3dRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/3D-viewer',
                name: PageName.VIEWER_3D_PAGE,
                component: Viewer3DPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'viewer3d.breadcrumb.viewer3d',
                            link: '',
                        },
                    ],
                    required3DViewerRoles: [UserRoles.NORMAL_USER],
                },
            },
        ],
    },
];

export default viewer3dRouters;
