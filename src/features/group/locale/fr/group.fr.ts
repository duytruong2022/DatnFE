import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';

export const group = {
    title: {
        groupManagementPage: 'Group Management Page',
        importGroups: 'Import groups',
        importGroupResult: 'Imported groups',
    },
    groupList: {
        name: 'Group name',
        assignToUserHeader: 'User assigned to',
        assignToUser: 'Assign To {assignedUserCount} User',
        assignToProjectHeader: 'Project assigned to',
        assignToProject: 'Assign To {assignedProjectCount} Project',
        profile: {
            spacialytic_3dwebviewer: {
                tableHeader: '3D Viewer Profile',
                placeholder: 'Select 3D Viewer Profile',
            },
            spacialytic_constellation: {
                tableHeader: 'Constellation Profile',
                placeholder: 'Select Constellation Profile',
            },
        },
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
        profile: {
            spacialytic_constellation: {
                label: 'Constellation Profile',
                placeholder: 'Select constellation profile',
            },
            spacialytic_3dwebviewer: {
                label: '3D Viewer Profile',
                placeholder: 'Select 3D Viewer Profile',
            },
        },
        description: {
            label: 'Description',
            placeholder: 'Enter description',
        },
        button: {
            cancel: 'Cancel',
            save: 'Save',
        },
    },

    assignUserPopup: {
        title: 'Assign User',
        groupName: 'Group name: {groupName}',
        user: 'User list',
        newUser: 'Add New User',
        button: {
            delete: 'Delete All',
            tooltip: {
                delete: 'Delete',
            },
        },
    },

    assignProjectPopup: {
        title: 'Assign Project',
        groupName: 'Group name: {groupName}',
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
        groupConstellation: 'Constellation Group',
        group3DViewer: '3D Viewer Group',
        admin: 'Admins',
    },
    message: {
        title: 'Notification',
        create: {
            success: 'Create group successfully',
        },

        update: {
            success: 'Update group successfully',
        },

        delete: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to delete this group?',
            success: 'Delete group successfully',
        },

        assignUser: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to assign user: {email} to this group?',
            success: 'Assign User to group successfully',
        },

        removeUser: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to remove user: {email} from this group?',
            success: 'Remove User from group successfully',
        },

        changeSecurityProfile: {
            title: 'Notification',
            confirmAsk:
                "User's module profile will be changed, do you want to keep changing?",
        },

        assignProject: {
            title: 'Notification',
            confirmAsk:
                'Are you sure you want to assign project: {projectName} to this group?',
            success: 'Assign project to group successfully',
        },

        removeProject: {
            title: 'Notification',
            confirmAsk: 'Are you sure you want to remove this project from this group?',
            success: 'Remove project from group successfully',
        },

        importGroupSuccess: 'Import group successfully',
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
        securityProfile: {
            maxLength: `Constellation profile length must be less than or equal to ${TEXTAREA_MAX_LENGTH} characters`,
            permission: "You can't permission to add constellation profile for group",
        },
        viewer3dProfile: {
            maxLength: `3D viewer profile length must be less than or equal to ${TEXTAREA_MAX_LENGTH} characters`,
        },
    },
};
