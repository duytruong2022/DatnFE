import MainLayout from '@/layouts/MainLayout.vue';
import { RouteRecordRaw } from 'vue-router';
import GroupConstellationListPage from './pages/GroupConstellationListPage.vue';
import Group3DViewerListPage from './pages/Group3DViewerListPage.vue';
import { PageName, UserRoles } from '@/common/constants';

const groupRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/constellation-group',
                name: PageName.CONSTELLATION_GROUP_LIST_PAGE,
                component: GroupConstellationListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'group.breadcrumb.admin',
                        },
                        {
                            text: 'group.breadcrumb.groupConstellation',
                            link: '',
                        },
                    ],
                },
            },
            {
                path: '/3d-viewer-group',
                name: PageName['3D_VIEWER_GROUP_LIST_PAGE'],
                component: Group3DViewerListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'group.breadcrumb.admin',
                        },
                        {
                            text: 'group.breadcrumb.group3DViewer',
                            link: '',
                        },
                    ],
                    required3DViewerRoles: [UserRoles.ADMIN],
                },
            },
        ],
    },
];

export default groupRouters;
