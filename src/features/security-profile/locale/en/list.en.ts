export default {
    table: {
        labels: {
            name: 'Name',
            description: 'Description',
            isDefaultSelect: 'Default select',
            action: 'Action',
        },
    },
    create: {
        success: 'Create constellation profile successfully',
    },
    update: {
        success: 'Update constellation profile successfully',
    },
    delete: {
        success: 'Delete constellation profile successfully',
    },
    form: {
        button: {
            save: 'Save',
            create: 'Create',
            search: 'Search',
            delete: 'Delete',
        },
        errors: {
            required: {
                permissions: 'You must select at least one permission',
            },
        },
        confirm: {
            title: 'Delete constellation profile',
            delete: 'Are you sure to delete this constellation profile?',
            cancel: 'Cancel',
            ok: 'Ok',
        },
        placeholder: {
            name: 'Enter constellation profile name',
            description: 'Enter constellation profile description',
            keyword: 'Enter keyword',
        },
    },
    drawer: {
        title: {
            update: 'Update constellation profile',
            create: 'Create constellation profile',
        },
        permission: {
            list: 'Permissions list',
            defaultCheck: 'Default check',
        },
    },
    permissions: {
        ACCESS_PROJECT_LOGS: 'Access to project logs',
        ACCESS_PROJECT_LOGS_REPORTS: `Access to project logs and reports`,
        ASSIGN_USER_GROUP_TO_PROJECT: 'Assign users/groups to projects',
        MANAGE_USERS_GROUPS: 'Create users/groups',
        ASSIGN_SECURITY_PROFILE: 'Assign constellation profile to user/group',
        CONFIG_LDAP: 'LDAP configuration',
        IMPORT_CSV: 'Import CSV',
        CREATE_SECURITY_PROFILE: 'Create constellation profile',
        CREATE_PROJECT: 'Create project',
        ACCESS_DASHBOARD: 'Access to dashboard',
        ACCESS_NOTIFICATION: 'Access to notification',
        HELP_VIEW_ALL: 'Help view all',
    },
    breadcrumb: { securityProfile: 'Constellation profile', admin: 'Admins' },
};
