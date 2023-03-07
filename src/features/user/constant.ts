import {
    ARRAY_MAX_LENGTH,
    FORM_VALIDATION,
    INPUT_TEXT_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    Regex,
    SUPPORT_LANGUAGE,
    TEXTAREA_MAX_LENGTH,
    UserRoles,
    UserStatus,
} from '@/common/constants';
import yup from '@/plugins/yup/index';

export const UserStatusOptions = [
    {
        label: 'user.filterForm.status.active',
        value: UserStatus.ACTIVE,
    },
    // {
    //     label: 'user.filterForm.status.inactive',
    //     value: UserStatus.INACTIVE,
    // },
    {
        label: 'user.filterForm.status.registering',
        value: UserStatus.REGISTERING,
    },
];

export const INPUT_NAME_MAX_LENGTH = 40;

export enum UpdateProjectUserAction {
    ASSIGN_PROJECT = 'assignProject',
    REMOVE_PROJECT = 'removeProject',
}

export const userFormSchema = {
    firstName: yup
        .string()
        .trim()
        .required()
        .max(INPUT_NAME_MAX_LENGTH)
        .label('firstName'),
    lastName: yup.string().trim().required().max(INPUT_NAME_MAX_LENGTH).label('lastName'),
    ldapUsername: yup
        .string()
        .trim()
        .optional()
        .nullable()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapUsername'),
    email: yup
        .string()
        .required()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .matches(FORM_VALIDATION.email)
        .label('email'),
    countryId: yup.string().trim().required().max(INPUT_TEXT_MAX_LENGTH).label('country'),
    language: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .oneOf([...Object.values(SUPPORT_LANGUAGE), ''])
        .nullable()
        .optional()
        .label('language'),
    city: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('city'),
    jobTitle: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('jobTitle'),
    phoneNumber: yup
        .string()
        .trim()
        .nullable()
        .optional()
        .transform((val) => (val ? val : null))
        .matches(FORM_VALIDATION.phoneRegExp)
        .label('phoneNumber'),
    company: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('company'),
    timezone: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('company'),
    address: yup
        .string()
        .trim()
        .max(TEXTAREA_MAX_LENGTH)
        .optional()
        .nullable()
        .label('address'),
    groupIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .max(ARRAY_MAX_LENGTH)
        .optional()
        .nullable(),
    securityProfileIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .max(ARRAY_MAX_LENGTH)
        .optional()
        .nullable(),
    projectProfileIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .max(ARRAY_MAX_LENGTH)
        .optional()
        .nullable(),
    viewer3dProfileIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .max(ARRAY_MAX_LENGTH)
        .optional()
        .nullable(),
};

export const contactFormSchema = {
    email: yup
        .string()
        .matches(FORM_VALIDATION.email)
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable(),
    subject: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required().label('subject'),
    description: yup
        .string()
        .trim()
        .max(TEXTAREA_MAX_LENGTH)
        .required()
        .label('description'),
    phoneNumber: yup
        .string()
        .trim()
        .nullable()
        .optional()
        .transform((val) => (val ? val : null))
        .matches(FORM_VALIDATION.phoneRegExp)
        .label('phoneNumber'),
    firstName: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('firstName'),
    lastName: yup.string().trim().required().max(INPUT_TEXT_MAX_LENGTH).label('lastName'),
};

export const accessModuleRoleOptions = [
    {
        label: 'userForm.accessModule.administration',
        value: UserRoles.ADMIN,
    },
    {
        label: 'userForm.accessModule.user',
        value: UserRoles.NORMAL_USER,
    },
    {
        label: 'userForm.accessModule.none',
        value: UserRoles.NONE,
    },
];

export const setPasswordFormSchema = yup.object({
    password: yup
        .string()
        .trim()
        .nullable()
        .when('assignRandomPassword', {
            is: false,
            then: yup
                .string()
                .trim()
                .matches(Regex.PASSWORD, 'common.error.password')
                .required()
                .min(PASSWORD_MIN_LENGTH)
                .max(PASSWORD_MAX_LENGTH),
        }),
    confirmPassword: yup
        .string()
        .trim()
        .nullable()
        .when('assignRandomPassword', {
            is: false,
            then: yup
                .string()
                .matches(Regex.PASSWORD, 'common.error.password')
                .trim()
                .required()
                .min(PASSWORD_MIN_LENGTH)
                .max(PASSWORD_MAX_LENGTH)
                .oneOf(
                    [yup.ref('password'), null],
                    'setPasswordForm.error.confirmPasswordDoNotMatch',
                ),
        }),
    assignRandomPassword: yup.boolean().required(),
    needToChangePassword: yup.boolean().required(),
});

export const ldapConfigFormSchema = {
    ldapServerUrl: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapServerUrl'),
    ldapAdminDn: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapAdminDn'),
    ldapAdminPassword: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapAdminPassword'),
    ldapBaseUsersDn: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapBaseUsersDn'),
};

export const ldapImportFormSchema = {
    ldapCountryId: yup
        .string()
        .trim()
        .required()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('ldapCountryId'),
};
export const importPlatformUserHeader = [
    'email',
    'firstName',
    'lastName',
    'phoneNumber',
    'company',
    'jobTitle',
    'country',
    'city',
    'language',
    'timezone',
];

export const importConstellationUserHeader = [
    'email',
    'firstName',
    'lastName',
    'phoneNumber',
    'company',
    'jobTitle',
    'country',
    'city',
    'language',
    'timezone',
    'groupNames',
    'securityProfileNames',
];

export const importProjectUserHeader = [
    'email',
    'firstName',
    'lastName',
    'phoneNumber',
    'company',
    'jobTitle',
    'country',
    'city',
    'language',
    'timezone',
    'groupNames',
    'projectProfileNames',
];

export const importView3DUserHeader = [
    'email',
    'firstName',
    'lastName',
    'phoneNumber',
    'company',
    'jobTitle',
    'country',
    'city',
    'language',
    'timezone',
    'groupNames',
    'viewer3dProfileNames',
];

export const IMPORT_USER_GROUP_MAX_AMOUNT = 30;

export enum RegistrationFrom {
    SELF_REGISTER = 'self_register',
    ADMIN_CREATE = 'admin_create',
    CSV_IMPORT = 'csv_import',
    LDAP_IMPORT = 'ldap_import',
}

export const RegistrationFromOptions = [
    {
        label: 'user.filterForm.registrationFrom.self_register',
        value: RegistrationFrom.SELF_REGISTER,
    },
    {
        label: 'user.filterForm.registrationFrom.admin_create',
        value: RegistrationFrom.ADMIN_CREATE,
    },
    {
        label: 'user.filterForm.registrationFrom.csv_import',
        value: RegistrationFrom.CSV_IMPORT,
    },
    {
        label: 'user.filterForm.registrationFrom.ldap_import',
        value: RegistrationFrom.LDAP_IMPORT,
    },
];
