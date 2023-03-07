import { PageName } from '@/common/constants';
import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
    NavigationGuardWithThis,
} from 'vue-router';
import { routers } from './routers';
import NotFoundPage from '@/features/errors/pages/NotFoundPage.vue';
import ForbiddenPage from '@/features/errors/pages/ForbiddenPage.vue';

import VueRouteMiddleware, { GLOBAL_MIDDLEWARE_NAME } from './middleware';
import AuthMiddleware from './authMiddleware';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/profile',
    },
    {
        path: '/404',
        name: PageName.NOT_FOUND_PAGE,
        component: NotFoundPage,
        meta: {
            public: true,
        },
    },
    {
        path: '/403',
        name: PageName.FORBIDDEN_PAGE,
        component: ForbiddenPage,
        meta: {
            public: true,
        },
    },
    {
        path: '/:catchAll(.*)*',
        redirect: '/404',
    },
    ...routers,
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 };
    },
});

router.beforeEach(
    VueRouteMiddleware({
        [GLOBAL_MIDDLEWARE_NAME]: AuthMiddleware,
    }) as NavigationGuardWithThis<unknown>,
);

export default router;
