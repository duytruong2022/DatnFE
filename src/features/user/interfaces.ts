import { UpdateGroupAction } from '../group/constant';
import {
    AccessModules,
    SUPPORT_LANGUAGE,
    Timezones,
    UserRoles,
    UserStatus,
} from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';
import { UpdateProjectGroupAction } from '../project-group/constant';
import { RegistrationFrom, UpdateProjectUserAction } from './constant';

export interface IUserAccessModule {
    module?: AccessModules | null;
    roles: UserRoles[];
}

interface IProjectUser {
    projectId: string;
    projectProfileIds: string[];
    projectGroupIds: string[];
}
export interface IUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    ldapUsername: string;
    phoneNumber: string;
    language: SUPPORT_LANGUAGE;
    timezone: Timezones;
    countryId: string;
    jobTitle: string;
    company: string;
    address: string;
    city: string;
    status?: UserStatus;
    constellationGroupIds?: string[];
    viewer3dGroupIds?: string[];
    securityProfileIds?: string[];
    projectProfileIds?: string[];
    viewer3dProfileIds?: string[];
    accessModules: IUserAccessModule[];
    createdBy?: string;
    projects: IProjectUser[];
    projectAssignedCount?: number;
    assignedProjectIds: string[];
}

export interface IUserListQueryString extends ICommonGetListQuery {
    keyword?: string;
    accessModules?: AccessModules[];
    status?: UserStatus[];
    accessModule?: AccessModules;
    excludeGroupIds?: string[];
    projectId?: string | null;
    companies?: string[];
    countryIds?: string[];
    registrationFrom?: RegistrationFrom[];
    constellationGroupIds?: string[];
    constellationProfileIds?: string[];
    viewer3dGroupIds?: string[];
    viewer3dProfileIds?: string[];
    projectGroupIds?: string[];
    projectProfileIds?: string[];
}

export interface IContact {
    email: string;
    subject: string;
    description: string;
}

export interface IBulkCreateUser {
    index?: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    company: string;
    jobTitle: string;
    country: string;
    city: string;
    language: SUPPORT_LANGUAGE;
    timezone: Timezones;
    groups?: string[];
    groupNames?: string;
    securityProfiles?: string[];
    viewer3dProfiles?: string[];
    projectProfiles?: string[];
    securityProfileNames?: string;
    viewer3dProfileNames?: string;
    projectProfileNames?: string;
}

export interface IBulkCreateUserBody {
    users: IBulkCreateUser[];
    accessModule: AccessModules | null;
    projectId?: string;
}
export interface ISetPasswordForm {
    password: string;
    confirmPassword: string;
    assignRandomPassword: boolean;
    needToChangePassword: boolean;
    notificationId?: string;
}

export interface IImportLDAPBody {
    accessModule: AccessModules | null;
}

export interface ILdapConfig {
    ldapServerUrl: string;
    ldapBaseUsersDn: string;
    ldapAdminPassword: string;
    ldapAdminDn: string;
}

export interface ILdapUser {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    ldapUsername: string;
    ldapDn: string;
}

export interface IBulkCreateLdapUserBody {
    ldapUserIds: string[];
    accessModule: AccessModules | null;
    projectId?: string | null;
}
export interface IUpdateGroupIdsUserBody {
    isConfirm: boolean | undefined;
    groupId: string | undefined;
    action: UpdateGroupAction | undefined;
    accessModule: AccessModules;
}

export interface IUpdateProjectGroupIdsUserBody {
    isConfirm: boolean | undefined;
    projectId: string | null;
    projectGroupId: string | undefined;
    action: UpdateProjectGroupAction | undefined;
    accessModule: AccessModules;
}

export interface IUpdateGroupIdsUserResponse {
    isChangeProfile: boolean;
    updatedUser: IUser;
}

export interface IAssignPbsProfileBody {
    projectProfileIds: string[];
    pbsGroupId: string;
}

export interface IUpdateProjectGroupIdsUserResponse {
    isChangeProfile: boolean;
    updatedUser: IUser;
}

export interface IUpdateUser {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    language: SUPPORT_LANGUAGE;
    timezone: Timezones;
    countryId: string;
    jobTitle: string;
    company: string;
    address: string;
    city: string;
    constellationGroupIds?: string[];
    viewer3dGroupIds?: string[];
    projectGroupIds?: string[];
    securityProfileIds?: string[];
    projectProfileIds?: string[];
    viewer3dProfileIds?: string[];
    accessModules: IUserAccessModule[];
}

export interface IUserProjectIdsUpdateBody {
    projectId: string;
    action: UpdateProjectUserAction;
}
