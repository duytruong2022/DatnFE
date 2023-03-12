import {
    AccessModules,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import yup from '@/plugins/yup';
import { IPermissionTree } from './interfaces';
export enum ProjectSecurityPermissionseparators {
    TABS = '_TABS_',
    GROUPS = '_GROUPS_',
    FUNCTIONS = '_FUNCTIONS_',
    TABS_COMPACT = '_T_',
    GROUPS_COMPACT = '_G_',
    FUNCTIONS_COMPACT = '_F_',
}

export enum ProfilePermissionPrefix {
    WEBVIEWER3D = '3D_WEBVIEWER_',
    TABS = '3D_WEBVIEWER_TABS_',
    GROUPS = '3D_WEBVIEWER_GROUPS_',
}

export enum ProfilePermissionCategories {
    ALL = 'ALL',
    GENERAL = 'GENERAL',
    '4DPLANNING' = '4DPLANNING',
    CONSTELLATION = 'CONSTELLATION',
    '3D_WEBVIEWER' = '3D_WEBVIEWER',
}

export enum ProjectSecurityPermissions {
    // ************************************************************************************** GENERAL
    GENERAL_CREATE_CALENDAR = 'GENERAL_CREATE_CALENDAR',
    GENERAL_VIEW_CALENDER = 'GENERAL_VIEW_CALENDER',
    GENERAL_CONFIG_DATE = 'GENERAL_CONFIG_DATE',
    GENERAL_CREATE_DATE_TYPE = 'GENERAL_CREATE_DATE_TYPE',
    GENERAL_CREATE_PLANNING = 'GENERAL_CREATE_PLANNING',
    GENERAL_VIEW_PLANING = 'GENERAL_VIEW_PLANING',
    GENERAL_CREATE_TASK = 'GENERAL_CREATE_TASK',
    GENERAL_MANAGE_USER_GROUP_OF_PROJECT = 'GENERAL_MANAGE_USER_GROUP_OF_PROJECT',
    GENERAL_ADD_USER_FROM_CONSTELLATION = 'GENERAL_ADD_USER_FROM_CONSTELLATION',
    GENERAL_CREATE_PROJECT_PROFILE = 'GENERAL_CREATE_PROJECT_PROFILE',
}

export const ProfilePermissionTree: IPermissionTree[] = [
    {
        name: ProfilePermissionCategories.ALL,
        children: [
            {
                name: ProfilePermissionCategories.GENERAL,
                children: [
                    {
                        name: ProjectSecurityPermissions.GENERAL_CREATE_PROJECT_PROFILE,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_ADD_USER_FROM_CONSTELLATION,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_MANAGE_USER_GROUP_OF_PROJECT,
                    },
                ],
            },
            {
                name: ProfilePermissionCategories['4DPLANNING'],
                children: [
                    {
                        name: ProjectSecurityPermissions.GENERAL_CREATE_CALENDAR,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_VIEW_CALENDER,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_CREATE_DATE_TYPE,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_CREATE_PLANNING,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_VIEW_PLANING,
                    },
                    {
                        name: ProjectSecurityPermissions.GENERAL_CREATE_TASK,
                    },
                ],
            },
        ],
    },
];

export const profileSchema = yup.object({
    description: yup
        .string()
        .trim()
        .nullable()
        .max(TEXTAREA_MAX_LENGTH)
        .label('description'),
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required().label('profileName'),
    projectId: yup.string().when('accessModule', {
        is: AccessModules.SPACIALYTIC_CONSTELLATION,
        then: yup.string().required(),
        otherwise: yup.string().optional(),
    }),
    accessModule: yup
        .string()
        .oneOf([...Object.values(AccessModules)])
        .required(),
    permissions: yup.array().min(1).required().label('permissions'),
    isDefaultSelect: yup.boolean().required(),
});

export const initProjectProfile = {
    id: '',
    name: '',
    description: '',
    permissions: [],
    isDefaultSelect: false,
};
