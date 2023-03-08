import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import ProjectLogHistoryListPage from './pages/ProjectLogHistoryListPage.vue';
import ProjectLogTransactionListPage from './pages/ProjectLogTransactionListPage.vue';
import LogReportPage from './pages/LogReportPage.vue';
import LogServerPage from './pages/LogServerPage.vue';
import { SecurityPermissions } from '../security-profile/constants';

const projectLogRouters: Array<RouteRecordRaw> = [
    {
        path: '/project-log/project-history',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_LOG_HISTORY_LIST_PAGE,
                component: ProjectLogHistoryListPage,
                meta: {
                    requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS],
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'projectLog.breadcrumb.projectLog',
                        },
                        {
                            text: 'projectLog.breadcrumb.projectLogHistory',
                            link: '/projectLog/project',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project-log/project-transactions',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_LOG_TRANSACTION_LIST_PAGE,
                component: ProjectLogTransactionListPage,
                meta: {
                    requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS],
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'projectLog.breadcrumb.projectLog',
                        },
                        {
                            text: 'projectLog.breadcrumb.projectLogTransaction',
                            link: '/projectLog/project',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project-log/log-report',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_LOG_REPORT_PAGE,
                component: LogReportPage,
                meta: {
                    requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS],
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'projectLog.breadcrumb.projectLog',
                        },
                        {
                            text: 'projectLog.breadcrumb.projectLogReport',
                            link: '/projectLog/project',
                        },
                    ],
                },
            },
        ],
    },
    {
        path: '/project-log/log-server',
        component: MainLayout,
        children: [
            {
                path: '',
                name: PageName.PROJECT_LOG_SERVER_PAGE,
                component: LogServerPage,
                meta: {
                    requiredPermissions: [SecurityPermissions.ACCESS_PROJECT_LOGS],
                    requiresAuth: true,
                    breadcrumb: [
                        {
                            text: 'projectLog.breadcrumb.projectLog',
                        },
                        {
                            text: 'projectLog.breadcrumb.logServer',
                            link: '/projectLog/log-server',
                        },
                    ],
                },
            },
        ],
    },
];

export default projectLogRouters;
