import MainLayout from '@/layouts/MainLayout.vue';
import { PageName } from '@/common/constants';
import { RouteRecordRaw } from 'vue-router';
import AuthLayout from '../../layouts/AuthLayout.vue';
import LoginPage from './pages/LoginPage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import ActiveUserPage from './pages/ActiveUserPage.vue';
import ActiveNewPasswordPage from './pages/ActiveNewPasswordPage.vue';

const authRouters: Array<RouteRecordRaw> = [
    {
        path: '/',
        component: AuthLayout,
        children: [
            {
                path: '/login',
                name: PageName.LOGIN_PAGE,
                component: LoginPage,
                meta: {
                    onlyWhenLoggedOut: true,
                    public: true,
                },
            },
            {
                path: '/register',
                name: PageName.REGISTER_PAGE,
                component: RegisterPage,
                meta: {
                    onlyWhenLoggedOut: true,
                    public: true,
                },
            },
            {
                path: '/active-user/:token',
                name: PageName.ACTIVE_USER_PAGE,
                component: ActiveUserPage,
                props: true,
                meta: {
                    public: true,
                },
            },
            {
                path: '/active-new-password/:token',
                name: PageName.ACTIVE_NEW_PASWORD_PAGE,
                component: ActiveNewPasswordPage,
                props: true,
                meta: {
                    public: true,
                },
            },
        ],
    },
    {
        path: '/',
        component: MainLayout,
        children: [
            {
                path: '/profile',
                name: PageName.PROFILE_VIEW_PAGE,
                component: ProfilePage,
                meta: {
                    requiresAuth: true,
                },
            },
        ],
    },
];

export default authRouters;
