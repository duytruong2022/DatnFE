import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';

export enum SecurityPermissions {
    ACCESS_PROJECT_LOGS = 'ACCESS_PROJECT_LOGS',
    ASSIGN_USER_GROUP_TO_PROJECT = 'ASSIGN_USER_GROUP_TO_PROJECT',
    MANAGE_USERS_GROUPS = 'MANAGE_USERS_GROUPS',
    ASSIGN_SECURITY_PROFILE = 'ASSIGN_SECURITY_PROFILE',
    CREATE_SECURITY_PROFILE = 'CREATE_SECURITY_PROFILE',
    CREATE_PROJECT = 'CREATE_PROJECT',
    ACCESS_NOTIFICATION = 'ACCESS_NOTIFICATION',
    HELP_VIEW_ALL = 'HELP_VIEW_ALL',
}

export const ManageUsersGroupsPermissions: SecurityPermissions[] = [
    SecurityPermissions.ASSIGN_USER_GROUP_TO_PROJECT,
    SecurityPermissions.ASSIGN_SECURITY_PROFILE,
];

export const securityPrSchema = yup.object({
    description: yup
        .string()
        .trim()
        .nullable()
        .max(TEXTAREA_MAX_LENGTH)
        .label('securityProfile.table.labels.description'),
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required().label('name'),
    permissions: yup
        .array()
        .min(1, 'securityProfile.form.errors.required.permissions')
        .required(),
    isDefaultSelect: yup.boolean().required(),
});

export enum SecurityProfileOrderBy {
    NAME = 'name',
    IS_DEFAULT_SELECT = 'isDefaultSelect',
    CREATED_AT = 'createdAt',
}
