import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import { IMPORT_USER_GROUP_MAX_AMOUNT, INPUT_NAME_MAX_LENGTH } from '../../constant';

export const userForm = {
    message: {
        createSuccess: 'Create user successfully',
        updateSuccess: 'Update user successfully',
        deleteSuccess: 'Delete user successfully',
        contactSuccess: 'Send email to user successfully',
        importUserSuccess: 'Import user successfully',
    },
    title: {
        firstName: 'First Name',
        lastName: 'Last Name',
        ldapUsername: 'LDAP Username',
        email: 'Email',
        country: 'Country',
        language: 'Language',
        city: 'City',
        jobTitle: 'Job Title',
        phoneNumber: 'Phone Number',
        company: 'Company',
        address: 'Address',
        timezone: 'Timezone',
        securityProfiles: 'Constellation Profiles',
        viewer3dProfiles: '3D Viewer Profiles',
        projectProfiles: 'Project Profiles',
        groups: 'Groups',
        toEmail: 'To email',
        subject: 'Subject',
        description: 'Description',
    },
    placeholder: {
        firstName: 'Enter first name',
        lastName: 'Enter last name',
        ldapUsername: 'Enter ldap username',
        email: 'Enter email',
        country: 'Choose country',
        language: 'Choose language',
        city: 'Enter city',
        jobTitle: 'Enter job title',
        phoneNumber: 'Enter phone number',
        company: 'Enter company',
        address: 'Enter address',
        timezone: 'Choose timezone',
        securityProfiles: 'Choose constellation profiles',
        viewer3dProfiles: 'Choose 3D viewer profiles',
        projectProfiles: 'Choose project profiles',
        groups: 'Choose groups',
        subject: 'Enter subject',
        description: 'Enter description',
    },
    button: {
        save: 'Save',
        send: 'Send',
        feedback: 'Feedback',
    },
    accessModule: {
        title: 'Access modules',
        specialistic3DViewer: 'Spacialytic 3D Viewer',
        specialisticConstellation: 'Spacialytic Constellation',
        specialisticPlatform: 'Spacialytic Platform',
        administration: 'Administration',
        user: 'User',
        none: 'None',
    },
    importUsers: {
        email: {
            required: 'The email field is required',
            formatError: 'The email must be correct format',
            uniqueError: 'Email must be unique',
            maxLength: `Email length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        firstName: {
            required: 'The first name field is required',
            maxLength: `First name length must be less than or equal to ${INPUT_NAME_MAX_LENGTH} characters`,
        },
        lastName: {
            required: 'The last name field is required',
            maxLength: `Last name length must be less than or equal to ${INPUT_NAME_MAX_LENGTH} characters`,
        },
        phoneNumber: {
            invalid: 'Phone number is invalid',
        },
        company: {
            maxLength: `Company length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        jobTitle: {
            maxLength: `Job title length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        country: {
            invalid: 'Country is invalid',
            required: 'The country field is required',
            maxLength: `Country length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        city: {
            maxLength: `City length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
        },
        language: {
            invalid: 'Language field is invalid',
        },
        timezone: {
            invalid: 'Timezone field is invalid',
        },
        address: {
            maxLength: `Address length must be less than or equal to ${TEXTAREA_MAX_LENGTH} characters`,
        },
        group: {
            maxLength: `Some group length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
            tooMany: `Can not import more than ${IMPORT_USER_GROUP_MAX_AMOUNT} groups`,
            permission: "You can't permission to add group for user",
        },
        securityProfile: {
            maxLength: `Some constellation profile length must be less than or equal to ${INPUT_TEXT_MAX_LENGTH} characters`,
            permission: "You can't permission to add constellation profile for user",
        },
    },
};
