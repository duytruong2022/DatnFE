import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';

export const projectGroup = {
    title: {
        groupManagementPage: 'Group Management Page',
        importGroups: 'Import groups',
        importGroupResult: 'Imported groups',
    },
    groupList: {
        name: 'Group name',
        assignUser: 'Assign to',
        assignToUser: 'Assign To {assignedUserCount} User',
        projectProfile: 'Project profile',
        description: 'Description',
        action: 'Action',
        tooltip: {
            delete: 'Delete',
            edit: 'Edit',
        },
    },
    groupForm: {
        title: {
            create: 'Create new group',
            update: 'Update group',
        },
        name: {
            label: 'Group name',
            placeholder: 'Enter group name',
        },
        projectProfile: {
            label: 'Project Profile',
            placeholder: 'Select project profile',
        },
        description: {
            label: 'Description',
            placeholder: 'Enter description',
        },
        assignUser: {
            label: 'Assign user',
            placeholder: 'Assign user',
        },
        button: {
            cancel: 'Cancel',
            save: 'Save',
        },
    },

    button: {
        submit: 'Submit',
    },
    filterForm: {
        keyword: {
            label: 'Keyword',
            placeholder: 'Enter keyword',
        },
        create: 'Create',
    },
    breadcrumb: {
        group: 'Project group',
        admin: 'Admins',
    },
    message: {
        title: 'Notification',
        create: {
            success: 'Create project group successfully',
        },

        update: {
            success: 'Update project group successfully',
        },

        delete: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to delete this group?',
            success: 'Delete group successfully',
        },
        importGroupSuccess: 'Import group successfully',

        assignUser: {
            title: 'Notification',
            confirmAsk:
                'Are you sure you want to assign user: {email} to this project group?',
            success: 'Assign user to project group successfully',
        },

        removeUser: {
            title: 'Notification',
            confirmAsk:
                'Are you sure you want to remove user: {email} from this project group?',
            success: 'Remove user from project group successfully',
        },

        changeProjectProfile: {
            title: 'Notification',
            confirmAsk:
                "User's project profile will be changed, do you want to keep changing?",
        },
    },
    importGroups: {
        name: {
            required: 'The group name field is required',
            uniqueError: 'Group name must be unique',
            maxLength: `Group name length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        description: {
            required: 'The description field is required',
            maxLength: `Description length must be less than or equal to ${TEXTAREA_MAX_LENGTH} characters`,
        },
        projectProfile: {
            maxLength: `Profile name length must be less than or equal to ${TEXTAREA_MAX_LENGTH} characters`,
        },
    },
    assignUserPopup: {
        title: 'Assign User',
        user: 'User',
        newUser: 'Add New User',
        button: {
            delete: 'Delete All',
            tooltip: {
                delete: 'Delete',
            },
        },
        projectGroupName: 'Project group name: {projectGroupName}',
    },
};
