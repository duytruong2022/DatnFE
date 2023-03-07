import localStorageAuthService from '@/common/authStorage';
import { PageName } from '@/common/constants';
import {
    ProfilePermissionPrefix,
    ProjectSecurityPermissions,
} from '@/features/3D-viewer-profile/constants';
import { accessLogModule } from '@/features/access-log/store';
import { projectModule } from '@/features/project/store';
import { SecurityPermissions } from '@/features/security-profile/constants';
import router from '@/plugins/vue-router';
import { computed } from 'vue';

//Admin
export const sidebarProject = [
    // Dashboard
    {
        iconLink: require('@/assets/icons/chart-pie.svg'),
        name: 'app.sidebar.constellation.project.dashboard',
        active: false,
        to: '#',
        pageName: PageName.PROJECT_DETAIL_PAGE,
        onClick: () => {
            router.push({
                name: PageName.PROJECT_DETAIL_PAGE,
                params: {
                    projectId: computed(() => projectModule.selectedProjectId).value,
                },
            });
        },
    },

    // Admin
    {
        iconLink: require('@/assets/icons/user.svg'),
        name: 'app.sidebar.constellation.project.admin.title',
        active: false,
        requiredPermissions: [
            ProjectSecurityPermissions.GENERAL_ADD_USER_FROM_CONSTELLATION,
            ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
            ProjectSecurityPermissions.GENERAL_CREATE_PROJECT_PROFILE,
            ProjectSecurityPermissions.GENERAL_CREATE_PBS_STRUCTURE,
        ],
        requireProjectProfile: true,
        children: [
            {
                name: 'app.sidebar.constellation.project.admin.user',
                active: false,
                to: '/user',
                pageName: PageName.USER_LIST_PAGE,
                requiredPermissions: [
                    ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
                ],
            },
            {
                name: 'app.sidebar.constellation.project.admin.group',
                active: false,
                to: '/project-group',
                pageName: PageName.PROJECT_GROUP_LIST_PAGE,
                requiredPermissions: [
                    ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
                ],
            },
            {
                name: 'app.sidebar.constellation.project.admin.projectProfile',
                active: false,
                to: '/project-profile',
                pageName: PageName.PROJECT_PROFILE_LIST_PAGE,
                requiredPermissions: [
                    ProjectSecurityPermissions.GENERAL_CREATE_PROJECT_PROFILE,
                ],
            },
        ],
    },

    // Notifications
    // {
    //     iconLink: require('@/assets/icons/bell.svg'),
    //     name: 'app.sidebar.constellation.project.notifications',
    //     active: false,
    //     to: '/project-notification',
    //     pageName: PageName.PROJECT_NOTIFICATION_PAGE,
    //     requiredPermissions: [SecurityPermissions.ACCESS_NOTIFICATION],
    // },

    // Project
    {
        iconLink: require('@/assets/icons/building.svg'),
        name: 'app.sidebar.constellation.project.project.title',
        active: false,
        requireProjectProfile: true,
        children: [
            {
                name: 'app.sidebar.constellation.project.project.4DAnalyzer',
                active: false,
                to: '/project/4D-analyzer',
                pageName: PageName['4D_ANALYZER_PAGE'],
            },
            {
                name: 'app.sidebar.constellation.project.project.calendar',
                active: false,
                to: '/project/calendar',
                pageName: PageName.CALENDAR_PAGE,
            },
        ],
    },

    // Exit project
    {
        iconLink: require('@/assets/icons/signout.svg'),
        name: 'app.sidebar.constellation.project.exitProject',
        active: false,
        to: '#',
        onClick: () => {
            projectModule.setSelectedProjectId(null);
            localStorageAuthService.setSelectedProjectId('');
            localStorageAuthService.resetProjectSecurityPermissions();
            localStorageAuthService.resetProjectAdminId();
            accessLogModule.updateAccessLogModule(
                localStorageAuthService.getAccessLogId(),
            );
            router.push({
                name: PageName.PROJECT_MAP_PAGE,
            });
        },
    },
];
