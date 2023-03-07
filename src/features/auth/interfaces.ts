import {
    AccessModules,
    UserRoles,
    SUPPORT_LANGUAGE,
    UserStatus,
    Timezones,
} from '@/common/constants';
import { ProjectSecurityPermissions } from '../3D-viewer-profile/constants';
import { SecurityPermissions } from '../security-profile/constants';
export interface ILoginForm {
    email: string | undefined;
    password: string | undefined;
}

export interface ILoginLDAPForm {
    username: string | undefined;
    password: string | undefined;
}

export interface IUpdateProfileBody {
    firstName?: string;
    lastName?: string;
    username?: string;
    countryId?: string;
    city?: string | null;
    language?: SUPPORT_LANGUAGE | string | null;
    timezone?: Timezones | string | null;
    jobTitle?: string | null;
    phoneNumber?: string | null;
    company?: string | null;
    address?: string | null;
}

export interface IRegisterForm {
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    countryId: string | undefined;
    language: SUPPORT_LANGUAGE;
    module: AccessModules | undefined;
    projectName: string | undefined | null;
    projectAdminEmail: string | undefined | null;
}

export interface ILoginResponse {
    accessToken: {
        token: string;
        expiresIn: number;
    };
    refreshToken: {
        token: string;
        expiresIn: number;
    };
    isExistOtherTokenUnexpired: boolean;
    profile: IUser;
}
export interface IUser {
    email: string;
    fullName: string;
    needToChangePassword: boolean;
    accessModules?: IUserAccessModule[];
    _id: string;
    firstName: string;
    lastName: string;
    ldapUsername: string;
    phoneNumber: string;
    company: string;
    jobTitle: string;
    city: string;
    language?: SUPPORT_LANGUAGE;
    timezone?: Timezones;
    address: string;
    countryId: string;
    status: UserStatus;
    isCurrentPasswordRequired: boolean;
}

export interface IUserAccessModule {
    module: AccessModules;
    roles: UserRoles[];
}

export interface ILogoutBody {
    refreshToken: string;
    accessLogId: string;
}

export interface ILogoutOtherDeviceBody {
    refreshToken: string;
}

export interface IImportError {
    column: string;
    errorMessage: string;
    errorCode: string;
}

export interface IImportResponse {
    isValid: boolean;
    errors: IImportError[];
}

export interface IBulkImportResponse {
    results: Record<string, IImportResponse>;
}
export interface IActive {
    token: string;
}

export interface IChangePasswordForm {
    currentPassword: string;
    password: string;
    confirmPassword: string;
}

export interface IConstellationSecurityPermissions {
    constellationSecurityPermissions: SecurityPermissions[];
}

export interface IProjectSecurityPermissions {
    adminId?: string;
    projectSecurityPermissions?: ProjectSecurityPermissions[];
    pbsGroupPermissions: IPbsPermission[];
}
export interface IViewer3dPermissions {
    viewer3dPermissions: string[];
}

export interface IForgotPasswordForm {
    email: string | undefined;
}

export interface IPreLoginResponse {
    isBeingLoggedIn: boolean;
}

export interface IPbsPermission {
    pbsGroupId: string;
    permissions: ProjectSecurityPermissions[];
}

export interface IPlanningPermission {
    path: string;
    permissions: ProjectSecurityPermissions[];
}
