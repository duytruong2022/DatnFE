import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import ProjectPage from './pages/ProjectPage.vue';
import ProjectListPage from './pages/ProjectListPage.vue';
import ProjectDetailPage from './pages/ProjectDetailPage.vue';
import ProjectNotificationPage from '../project/pages/ProjectNotificationPage.vue';

const projectRouters: Array<RouteRecordRaw> = [
    {
        path: '/project',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_MAP_PAGE,
                component: ProjectPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'project.breadcrumb.projectList',
                            link: '/project',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project-list',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_LIST_PAGE,
                component: ProjectListPage,
                meta: {
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'project.breadcrumb.projectList',
                            link: '/project',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project/:projectId/detail',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_DETAIL_PAGE,
                component: ProjectDetailPage,
                props: true,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'project.breadcrumb.projectDetail',
                            link: '/project-detail',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project-notification',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_NOTIFICATION_PAGE,
                component: ProjectNotificationPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'projectNotification.breadcrumb.projectNotification',
                            link: '/project-notification',
                        },
                    ],
                },
            },
        ],
    },
];

export default projectRouters;
