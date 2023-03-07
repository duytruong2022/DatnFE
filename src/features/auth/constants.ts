import { AccessModules } from '@/common/constants';

export enum KEY_CODE {
    ENTER = 'Enter',
}

export enum FormValidation {
    FIRST_NAME_MAX_LENGTH = 40,
    LAST_NAME_MAX_LENGTH = 40,
    USERNAME_MAX_LENGTH = 60,
}

export const RegisterModuleOptions = [
    {
        label: 'register.registerForm.module.constellation',
        value: AccessModules.SPACIALYTIC_CONSTELLATION,
    },
    {
        label: 'register.registerForm.module.3dViewer',
        value: AccessModules.SPACIALYTIC_3DWEBVIEWER,
    },
];

export const DEFAULT_COUNTRY_CODE = 'fr';
