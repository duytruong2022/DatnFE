import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import CalendarPage from './pages/CalendarPage.vue';
import CalendarDetailPage from './pages/CalendarDetailPage.vue';

const calendarRouter: Array<RouteRecordRaw> = [
    {
        path: '/project',
        component: MainLayout,
        children: [
            {
                path: 'calendar',
                name: PageName.CALENDAR_PAGE,
                component: CalendarPage,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'calendar.breadcrumb',
                            link: '/project/calendar',
                        },
                    ],
                },
            },
            {
                path: 'calendar/:calendarId',
                name: PageName.CALENDAR_CONFIG_PAGE,
                component: CalendarDetailPage,
                props: true,
                meta: {
                    requiresAuth: true,
                    isViewProject: true,
                    breadcrumb: [
                        {
                            text: 'calendar.breadcrumb',
                            link: '/project/calendar',
                        },
                    ],
                },
            },
        ],
    },
];

export default calendarRouter;
