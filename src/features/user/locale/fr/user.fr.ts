export const user = {
    title: {
        createUserTitle: 'Create a new user',
        updateUserTitle: 'Update user',
        contactUserTitle: 'Send email to',
        importUsers: 'Import users',
        importUserResult: 'Imported users',
        importLdapUser: 'Import LDAP users',
    },
    userList: {
        email: 'Email',
        ldapUsername: 'LDAP username',
        fullName: 'Full name',
        country: 'Country',
        company: 'Company',
        moduleName: 'Module',
        securityProfile: 'Constellation profile',
        viewer3dProfile: '3D webviewer profile',
        projectProfile: 'Project profile',
        projectProfileByPbs: 'Project profile by PBS',
        groups: 'Groups',
        projectGroups: 'Project group',
        accessProjectHeader: 'Access project',
        accessProject: 'Assigned To {assignedProjectCount} project',
        action: 'Action',
        createdAt: 'Created at',
        lastLogin: 'Last login',
        approvedAt: 'Approved at',
        approvedBy: 'Approved by',
        status: 'Status',
        adminModule: 'User is admin of module',
        tooltip: {
            delete: 'Delete',
            edit: 'Edit',
            changePassword: 'Initialize or change password',
            projectAccess: 'Project Access',
            contact: 'Contact',
            general: 'General',
            profileAssign: 'Profile Assign',
        },
    },
    filterForm: {
        keyword: {
            label: 'Keyword',
            placeholder: 'Enter keyword',
        },
        status: {
            label: 'Status',
            placeholder: 'Select status',
            active: 'Active',
            inactive: 'Inactive',
            registering: 'Registering',
            rejected: 'Rejected',
        },
        company: {
            label: 'Company',
            placeholder: 'Select company',
        },
        country: {
            label: 'Country',
            placeholder: 'Select country',
        },
        accessModule: {
            label: 'Access Module',
            placeholder: 'Select access module',
        },
        registrationFrom: {
            label: 'Registration from',
            placeholder: 'Select registration from',
            self_register: 'Self register',
            admin_create: 'Admin create',
            csv_import: 'CSV import',
            ldap_import: 'LDAP import',
        },
        group: {
            label: 'Group',
            placeholder: 'Select group',
        },
        constellationProfile: {
            label: 'Constellation Profile',
            placeholder: 'Select constellation profile',
        },
        viewer3dProfile: {
            label: '3D Viewer Profile',
            placeholder: 'Select 3D viewer profiles',
        },
        projectProfile: {
            label: 'Project Profile',
            placeholder: 'Select project profiles',
        },
        create: 'Create',
        addUser: 'Add user',
    },
    delete: {
        title: 'Notification',
        confirmAsk: 'Are you sure you want to delete this user?',
    },
    waitingImportLDAP:
        'We are importing data from LDAP server, it may takes time, please come back later',
    selectOneLdapUser: 'You must be select one user',
    breadcrumb: { user: 'User List', admin: 'Admins' },

    assignProjectPopup: {
        title: 'Assign Project',
        emailUser: 'Email user: {email}',
        project: 'Current projects',
        newProject: 'Assign a new project',
        projectProfile: 'Project Profile',
        placeholder: {
            projectProfile: 'Select Project Profile',
        },
        tooltip: {
            delete: 'Delete',
            assign: 'Assign',
        },
    },

    message: {
        title: 'Notification',

        assignProject: {
            title: 'Notification',
            confirmAsk:
                'Are you sure you want to assign project: {projectName} to this user?',
            success: 'Assign project to user successfully',
        },

        removeProject: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to remove this project from this user?',
            success: 'Remove project from user successfully',
        },
    },
    assignedUserTable: {
        name: 'Name',
        group: 'Group',
        isAdmin: 'Is Admin',
    },
    addUser: {
        title: 'Add user',
        userList: 'User list',
        addNewUser: 'Add new user',
        confirmAdd: {
            message: 'Are you sure you want to add user {email} to project?',
            title: 'Add user',
        },
        confirmRemove: {
            message: 'Are you sure you want to remove user {email} from project?',
            title: 'Remove user',
        },
        button: {
            delete: 'Delete',
        },
        filterForm: {
            keyword: {
                placeholder: 'Enter keyword',
            },
        },
    },
};
