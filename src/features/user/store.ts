import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import {
    IBodyResponse,
    ICommonGetListQuery,
    ICountry,
    IGetListResponse,
} from '@/common/interfaces';
import { IBulkCreateUser, ILdapUser, IUser, IUserListQueryString } from './interfaces';
import { userService } from './services/api.services';
import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
    UserRoles,
} from '@/common/constants';
import { commonService } from '@/common/services/common.service';
import { ISecurityProfile } from '../security-profile/interface';
import { IGroup } from '../group/interfaces';
import { trimObject } from '@/common/helpers';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';

import i18n from '@/plugins/vue-i18n';
import { authModule } from '../auth/store';
import { projectModule } from '../project/store';
import uniq from 'lodash/uniq';
import { IProject, IProjectListQueryString } from '../project/interfaces';

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    status: [],
};

export const initLdapQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
};

export const initProjectQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'user' })
class UserModule extends VuexModule {
    isShowUserForm = false;
    isShowLdapUserForm = false;
    isShowContactForm = false;
    isDisableSaveButton = false;
    isShowImportUserFileForm = false;
    isShowImportUserResultPopUp = false;
    userListQueryString: IUserListQueryString = initQueryString;
    userLdapListQueryString: ICommonGetListQuery = initLdapQueryString;
    userList: IUser[] = [];
    totalUsers = 0;
    totalLdapUsers = 0;
    selectedUser: IUser | null = null;
    countryList: ICountry[] = [];
    securityProfileList: ISecurityProfile[] = [];
    projectProfileList: ISecurityProfile[] = [];
    viewer3dProfileList: ISecurityProfile[] = [];
    projectGroupList: IGroup[] = [];
    groupList: IGroup[] = [];
    specialistic3DWebviewRoles: UserRoles[] = [UserRoles.NONE];
    specialisticConstellationRole: UserRoles = UserRoles.NONE;
    specialisticPlatformRole: UserRoles = UserRoles.NONE;
    importUsers: IBulkCreateUser[] = [];
    isShowSetPasswordForm = false;
    ldapUserList: ILdapUser[] = [];
    selectedLdapUserList: ILdapUser[] = [];

    isShowAssignProjectUser = false;
    projectNotAssignUserList: IProject[] = [];
    projectListQueryString: IProjectListQueryString = initProjectQueryString;
    totalProjectNotAssignUser = 0;

    projectAssignedUserList: IProject[] = [];
    companyList: string[] = [];

    securityProfileDefault: ISecurityProfile | null = null;
    projectProfileDefault: ISecurityProfile | null = null;
    viewer3dProfileDefault: ISecurityProfile | null = null;

    isShowAddUserToProjectForm = false;

    @Action
    async getUserList(): Promise<IBodyResponse<IGetListResponse<IUser>>> {
        const response = (await userService.getList({
            ...this.userListQueryString,
        })) as IBodyResponse<IGetListResponse<IUser>>;
        if (response.success) {
            this.MUTATE_USER_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_USERS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_USER_LIST([]);
            this.MUTATE_TOTAL_USERS(0);
        }
        return response;
    }

    @Action
    async getLdapUserList(): Promise<IBodyResponse<IGetListResponse<ILdapUser>>> {
        const response = (await userService.getLdapUsers({
            ...this.userLdapListQueryString,
        })) as IBodyResponse<IGetListResponse<ILdapUser>>;
        if (response.success) {
            this.MUTATE_LDAP_USER_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_LDAP_USERS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_LDAP_USER_LIST([]);
            this.MUTATE_TOTAL_LDAP_USERS(0);
        }
        return response;
    }

    @Action
    async importUserLDAP() {
        const ldapUserIdList = this.selectedLdapUserList.map((user) => user._id);
        let projectId = null;
        if (
            authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION &&
            projectModule.selectedProjectId
        ) {
            projectId = projectModule.selectedProjectId;
        }

        const response = (await userService.importLdapUsers({
            ldapUserIds: ldapUserIdList,
            accessModule: authModule.selectedAccessModule,
            projectId,
        })) as unknown as IBodyResponse<boolean>;
        if (response.success && response.data) {
            showSuccessNotificationFunction(i18n.global.t('user.waitingImportLDAP'));
        } else {
            showErrorNotificationFunction(response.message as string);
        }
        return response;
    }

    @Action
    async getProjectAssignedUserList() {
        const response = (await userService.getAllProjectsAssignedUser(
            this.selectedUser?._id as string,
        )) as IBodyResponse<IGetListResponse<IProject>>;
        if (response.success) {
            this.MUTATE_PROJECT_ASSIGNED_USER_LIST(response?.data?.items);
        } else {
            this.MUTATE_PROJECT_ASSIGNED_USER_LIST([]);
        }
    }

    @Action
    async getProjectNotAssignUserList() {
        const response = (await userService.getProjectListNotAssignUser(
            this.selectedUser?._id as string,
            {
                ...this.projectListQueryString,
            },
        )) as IBodyResponse<IGetListResponse<IProject>>;
        if (response.success) {
            this.MUTATE_PROJECT_NOT_ASSIGN_USER_LIST(response?.data?.items);
            this.MUTATE_TOTAL_PROJECT_NOT_ASSIGN_USER(response?.data?.totalItems);
        } else {
            this.MUTATE_PROJECT_NOT_ASSIGN_USER_LIST([]);
            this.MUTATE_TOTAL_PROJECT_NOT_ASSIGN_USER(0);
        }
    }

    @Action
    async selectLdapUsers(ldapUsers: ILdapUser[]) {
        this.MUTATE_SELECTED_LDAP_USER_LIST(ldapUsers);
    }

    @Action
    async getCountryList() {
        const response =
            (await commonService.getCountryList()) as unknown as IBodyResponse<
                IGetListResponse<ICountry>
            >;
        if (response.success) {
            this.MUTATE_COUNTRY_LIST(response.data?.items || []);
        } else {
            this.MUTATE_COUNTRY_LIST([]);
        }
    }

    @Action
    async getCompanyList() {
        let accessModules;
        if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
            accessModules = [
                AccessModules.SPACIALYTIC_PLATFORM,
                AccessModules.SPACIALYTIC_CONSTELLATION,
                AccessModules.SPACIALYTIC_3DWEBVIEWER,
            ];
        } else {
            accessModules = [authModule.selectedAccessModule as AccessModules];
        }
        const response = await commonService.getCompanyList({
            accessModules,
            projectId: projectModule.selectedProjectId || '',
        });
        if (response.success) {
            this.MUTATE_COMPANY_LIST(response.data?.items || []);
        } else {
            this.MUTATE_COMPANY_LIST([]);
        }
    }

    @Action
    async getSecurityProfileList() {
        const response =
            (await commonService.getSecurityProfileList()) as unknown as IBodyResponse<
                IGetListResponse<ISecurityProfile>
            >;
        if (response.success) {
            this.MUTATE_SECURITY_PROFILE_LIST(response.data?.items || []);
            const profileDefault = response.data?.items?.find(
                (profile) => profile.isDefaultSelect,
            );

            if (profileDefault) {
                this.MUTATE_SECURITY_PROFILE_DEFAULT(profileDefault);
            } else {
                this.MUTATE_SECURITY_PROFILE_DEFAULT(null);
            }
        } else {
            this.MUTATE_SECURITY_PROFILE_DEFAULT(null);
            this.MUTATE_SECURITY_PROFILE_LIST([]);
        }
    }

    @Action
    async getProjectProfileList() {
        if (projectModule.selectedProjectId) {
            const response = (await commonService.getProjectProfileList(
                projectModule.selectedProjectId,
            )) as unknown as IBodyResponse<IGetListResponse<ISecurityProfile>>;
            if (response.success) {
                this.MUTATE_PROJECT_PROFILE_LIST(response.data?.items || []);
                const profileDefault = response.data?.items?.find(
                    (profile) => profile.isDefaultSelect,
                );

                if (profileDefault) {
                    this.MUTATE_PROJECT_PROFILE_DEFAULT(profileDefault);
                } else {
                    this.MUTATE_PROJECT_PROFILE_DEFAULT(null);
                }
            } else {
                this.MUTATE_PROJECT_PROFILE_LIST([]);
                this.MUTATE_PROJECT_PROFILE_DEFAULT(null);
            }
        } else {
            this.MUTATE_PROJECT_PROFILE_LIST([]);
            this.MUTATE_PROJECT_PROFILE_DEFAULT(null);
        }
    }

    @Action
    async getViewer3dProfileList() {
        const response =
            (await commonService.getViewer3dProfileList()) as unknown as IBodyResponse<
                IGetListResponse<ISecurityProfile>
            >;
        if (response.success) {
            this.MUTATE_VIEW_3D_PROFILE_LIST(response.data?.items || []);
            const profileDefault = response.data?.items?.find(
                (profile) => profile.isDefaultSelect,
            );

            if (profileDefault) {
                this.MUTATE_VIEWER3D_PROFILE_DEFAULT(profileDefault);
            } else {
                this.MUTATE_VIEWER3D_PROFILE_DEFAULT(null);
            }
        } else {
            this.MUTATE_VIEW_3D_PROFILE_LIST([]);
            this.MUTATE_VIEWER3D_PROFILE_DEFAULT(null);
        }
    }

    @Action
    async getGroupList() {
        if (authModule.selectedAccessModule) {
            const response = (await commonService.getGroupList({
                accessModules: [authModule.selectedAccessModule],
            })) as unknown as IBodyResponse<IGetListResponse<IGroup>>;
            if (response.success) {
                this.MUTATE_GROUP_LIST(response.data?.items || []);
            } else {
                this.MUTATE_GROUP_LIST([]);
            }
        } else {
            this.MUTATE_GROUP_LIST([]);
        }
    }

    @Action
    async getProjectGroupList() {
        if (projectModule.selectedProjectId) {
            const response = (await commonService.getProjectGroupList({
                projectId: projectModule.selectedProjectId,
            })) as unknown as IBodyResponse<IGetListResponse<IGroup>>;
            if (response.success) {
                this.MUTATE_PROJECT_GROUP_LIST(response.data?.items || []);
            } else {
                this.MUTATE_PROJECT_GROUP_LIST([]);
            }
        } else {
            this.MUTATE_PROJECT_GROUP_LIST([]);
        }
    }

    @Action
    setIsShowUserForm(value: boolean) {
        this.MUTATE_IS_SHOW_USER_FORM(value);
    }

    @Action
    setIsShowLdapUserForm(value: boolean) {
        this.MUTATE_IS_SHOW_LDAP_USER_FORM(value);
    }
    @Action
    setIsDisableSaveButton(value: boolean) {
        this.MUTATE_IS_DISABLE_SAVE_BUTTON(value);
    }

    @Action
    setUserListQueryString(query: IUserListQueryString) {
        this.MUTATE_USER_LIST_QUERY_STRING(query);
    }

    @Action
    setUserLdapListQueryString(query: ICommonGetListQuery) {
        this.MUTATE_LDAP_USER_LIST_QUERY_STRING(query);
    }

    @Action
    setSelectedUser(user: IUser | null) {
        this.MUTATE_SELECTED_USER(user);
    }

    @Action
    setSpecialistic3DWebviewRoles(specialistic3DWebviewRoles: UserRoles[]) {
        this.MUTATE_SPECIALISTIC_3D_WEB_VIEWER(specialistic3DWebviewRoles);
    }

    @Action
    setSpecialisticConstellationRole(specialisticConstellationRole: UserRoles) {
        this.MUTATE_SPECIALISTIC_CONSTELLATION(specialisticConstellationRole);
    }

    @Action
    setSpecialisticPlatformRole(specialisticPlatformRole: UserRoles) {
        this.MUTATE_SPECIALISTIC_PLATFORM(specialisticPlatformRole);
    }

    @Action
    setIsShowSetPasswordForm(isShow: boolean) {
        this.MUTATE_IS_SHOW_SET_PASSWORD_FORM(isShow);
    }

    @Action
    setIsShowContactForm(value: boolean) {
        this.MUTATE_IS_SHOW_CONTACT_FORM(value);
    }

    @Action
    setIsShowImportUserFileForm(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_USER_FILE_FORM(value);
    }

    @Action
    setImportUsers(importUsers: IBulkCreateUser[]) {
        trimObject(importUsers);
        this.MUTATE_IMPORT_USERS(importUsers);
    }

    @Action
    setIsShowImportUserResultPopup(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_USER_RESULT_POP_UP(value);
    }

    @Action
    setIsShowAssignProjectPopup(value: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_PROJECT_POP_UP(value);
    }

    @Action
    setProjectListQueryString(query: IProjectListQueryString) {
        this.MUTATE_PROJECT_LIST_QUERY_STRING(query);
    }

    @Action
    resetProjectListQueryString() {
        this.MUTATE_PROJECT_LIST_QUERY_STRING({ ...initProjectQueryString });
    }

    @Action
    setIsShowAddUserToProjectForm(isShowAddUserToProjectForm: boolean) {
        this.MUTATE_IS_SHOW_ADD_USER_TO_PROJECT_FORM(isShowAddUserToProjectForm);
    }

    @Mutation
    MUTATE_USER_LIST(users: IUser[]) {
        this.userList = users;
    }

    @Mutation
    MUTATE_LDAP_USER_LIST(ldapUsers: ILdapUser[]) {
        this.ldapUserList = ldapUsers;
    }

    @Mutation
    MUTATE_SELECTED_LDAP_USER_LIST(ldapUsers: ILdapUser[]) {
        this.selectedLdapUserList = ldapUsers;
    }

    @Mutation
    MUTATE_TOTAL_USERS(totalUsers: number) {
        this.totalUsers = totalUsers;
    }

    @Mutation
    MUTATE_TOTAL_LDAP_USERS(totalUsers: number) {
        this.totalLdapUsers = totalUsers;
    }

    @Mutation
    MUTATE_IS_SHOW_USER_FORM(value: boolean) {
        this.isShowUserForm = value;
    }

    @Mutation
    MUTATE_IS_SHOW_LDAP_USER_FORM(value: boolean) {
        this.isShowLdapUserForm = value;
    }

    @Mutation
    MUTATE_IS_DISABLE_SAVE_BUTTON(value: boolean) {
        this.isDisableSaveButton = value;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_USER_FILE_FORM(value: boolean) {
        this.isShowImportUserFileForm = value;
    }

    @Mutation
    MUTATE_USER_LIST_QUERY_STRING(query: IUserListQueryString) {
        this.userListQueryString = {
            ...this.userListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_LDAP_USER_LIST_QUERY_STRING(query: ICommonGetListQuery) {
        this.userLdapListQueryString = {
            ...this.userLdapListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_SELECTED_USER(user: IUser | null) {
        this.selectedUser = user;
    }

    @Mutation
    MUTATE_COUNTRY_LIST(countries: ICountry[]) {
        this.countryList = countries;
    }

    @Mutation
    MUTATE_COMPANY_LIST(companies: string[]) {
        this.companyList = companies;
    }

    @Mutation
    MUTATE_SECURITY_PROFILE_LIST(securityProfiles: ISecurityProfile[]) {
        this.securityProfileList = securityProfiles;
    }

    @Mutation
    MUTATE_PROJECT_PROFILE_LIST(projectProfiles: ISecurityProfile[]) {
        this.projectProfileList = projectProfiles;
    }

    @Mutation
    MUTATE_VIEW_3D_PROFILE_LIST(viewer3dProfiles: ISecurityProfile[]) {
        this.viewer3dProfileList = viewer3dProfiles;
    }

    @Mutation
    MUTATE_GROUP_LIST(groups: IGroup[]) {
        this.groupList = groups;
    }

    @Mutation
    MUTATE_PROJECT_GROUP_LIST(groups: IGroup[]) {
        this.projectGroupList = groups;
    }

    @Mutation
    MUTATE_SPECIALISTIC_3D_WEB_VIEWER(specialistic3DWebviewRoles: UserRoles[]) {
        this.specialistic3DWebviewRoles = specialistic3DWebviewRoles;
    }

    @Mutation
    MUTATE_SPECIALISTIC_PLATFORM(specialisticPlatformRole: UserRoles) {
        this.specialisticPlatformRole = specialisticPlatformRole;
    }

    @Mutation
    MUTATE_SPECIALISTIC_CONSTELLATION(specialisticConstellationRole: UserRoles) {
        this.specialisticConstellationRole = specialisticConstellationRole;
    }

    @Mutation
    MUTATE_IS_SHOW_SET_PASSWORD_FORM(isShow: boolean) {
        this.isShowSetPasswordForm = isShow;
    }

    @Mutation
    MUTATE_IS_SHOW_CONTACT_FORM(value: boolean) {
        this.isShowContactForm = value;
    }

    @Mutation
    MUTATE_IMPORT_USERS(importUsers: IBulkCreateUser[]) {
        this.importUsers = importUsers.map((importUser, index) => {
            return {
                ...importUser,
                index,
                groups:
                    uniq(
                        importUser.groupNames?.split(';').map((group) => group.trim()),
                    ) || [],
                securityProfiles:
                    uniq(
                        importUser.securityProfileNames
                            ?.split(';')
                            .map((securityProfile) => securityProfile.trim()),
                    ) || [],
                viewer3dProfiles:
                    uniq(
                        importUser.viewer3dProfileNames
                            ?.split(';')
                            .map((viewer3dProfile) => viewer3dProfile.trim()),
                    ) || [],
                projectProfiles:
                    uniq(
                        importUser.projectProfileNames
                            ?.split(';')
                            .map((projectProfile) => projectProfile.trim()),
                    ) || [],
            };
        });
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_USER_RESULT_POP_UP(value: boolean) {
        this.isShowImportUserResultPopUp = value;
    }

    @Mutation
    MUTATE_PROJECT_ASSIGNED_USER_LIST(value: IProject[]) {
        this.projectAssignedUserList = value;
    }

    @Mutation
    MUTATE_PROJECT_NOT_ASSIGN_USER_LIST(value: IProject[]) {
        this.projectNotAssignUserList = value;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_NOT_ASSIGN_USER(value: number) {
        this.totalProjectNotAssignUser = value;
    }

    @Mutation
    MUTATE_PROJECT_LIST_QUERY_STRING(query: IProjectListQueryString) {
        this.projectListQueryString = {
            ...this.projectListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGN_PROJECT_POP_UP(value: boolean) {
        this.isShowAssignProjectUser = value;
    }

    @Mutation
    MUTATE_SECURITY_PROFILE_DEFAULT(securityProfileDefault: ISecurityProfile | null) {
        this.securityProfileDefault = securityProfileDefault;
    }

    @Mutation
    MUTATE_PROJECT_PROFILE_DEFAULT(projectProfileDefault: ISecurityProfile | null) {
        this.projectProfileDefault = projectProfileDefault;
    }

    @Mutation
    MUTATE_VIEWER3D_PROFILE_DEFAULT(viewer3dProfileDefault: ISecurityProfile | null) {
        this.viewer3dProfileDefault = viewer3dProfileDefault;
    }

    @Mutation
    MUTATE_IS_SHOW_ADD_USER_TO_PROJECT_FORM(isShowAddUserToProjectForm: boolean) {
        this.isShowAddUserToProjectForm = isShowAddUserToProjectForm;
    }
}

export const userModule = getModule(UserModule);
