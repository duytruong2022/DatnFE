import {
    IBodyResponse,
    ICommonGetListQuery,
    IGetListResponse,
} from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import { IBulkImportResponse } from '@/features/auth/interfaces';
import { IProject, IProjectListQueryString } from '@/features/project/interfaces';
import service from '@/plugins/axios';
import {
    IContact,
    ISetPasswordForm,
    IUser,
    IBulkCreateUserBody,
    IImportLDAPBody,
    ILdapConfig,
    ILdapUser,
    IBulkCreateLdapUserBody,
    IUpdateGroupIdsUserBody,
    IUpdateGroupIdsUserResponse,
    IUserListQueryString,
    IUpdateUser,
    IUpdateProjectGroupIdsUserBody,
    IUpdateProjectGroupIdsUserResponse,
    IUserProjectIdsUpdateBody,
    IAssignPbsProfileBody,
} from '../interfaces';

class UserApiService extends ApiService {
    async contactUser(contact: IContact) {
        this.beforeCreate<IContact>(contact);
        return await this.client.post<IContact, IBodyResponse<IContact>>(
            `${this.baseUrl}/contact`,
            contact,
        );
    }

    importUsers(data: IBulkCreateUserBody): Promise<IBodyResponse<IBulkImportResponse>> {
        return this.client.post(`${this.detailUrl}/bulk-create`, data);
    }

    async setPassword(userId: string, data: ISetPasswordForm) {
        this.beforeCreate<ISetPasswordForm>(data);
        return await this.client.patch<IUser, IBodyResponse<IUser>>(
            `${this.baseUrl}/${userId}/set-password`,
            data,
        );
    }

    async resetPassword(userId: string, data: ISetPasswordForm) {
        this.beforeCreate<ISetPasswordForm>(data);
        return await this.client.patch<IUser, IBodyResponse<IUser>>(
            `${this.baseUrl}/${userId}/reset-password`,
            data,
        );
    }

    async importUserLDAP(accessModule: IImportLDAPBody) {
        return await this.client.post<IBodyResponse<boolean>>(
            `${this.baseUrl}/bulk-create-ldap`,
            accessModule,
        );
    }

    async saveLdapConfig(ldapConfig: ILdapConfig) {
        return await this.client.post<IBodyResponse<boolean>>(
            `/general-setting/ldap`,
            ldapConfig,
        );
    }

    async getLdapConfig() {
        return await this.client.get<IBodyResponse<ILdapConfig>>(`/general-setting/ldap`);
    }

    async getLdapUsers(queryString: ICommonGetListQuery) {
        return await this.client.get<void, IBodyResponse<IGetListResponse<ILdapUser>>>(
            `/ldap-user`,
            {
                params: {
                    ...queryString,
                },
            },
        );
    }

    async updateGroupIds(
        id: string,
        updateGroupIdsUserBody: IUpdateGroupIdsUserBody,
    ): Promise<IBodyResponse<IUpdateGroupIdsUserResponse>> {
        return await this.client.patch(
            `${this.detailUrl}/${id}/group`,
            updateGroupIdsUserBody,
        );
    }

    async updateProjectGroupIds(
        id: string,
        updateProjectGroupIdsUserBody: IUpdateProjectGroupIdsUserBody,
    ): Promise<IBodyResponse<IUpdateProjectGroupIdsUserResponse>> {
        return await this.client.patch(
            `${this.detailUrl}/${id}/project-group`,
            updateProjectGroupIdsUserBody,
        );
    }

    async getUserGroupList(
        query: IUserListQueryString,
    ): Promise<IBodyResponse<IGetListResponse<IUser>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/group`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async importLdapUsers(data: IBulkCreateLdapUserBody) {
        return await this.client.post<IBodyResponse<boolean>>(
            `/ldap-user/bulk-create-ldap`,
            data,
        );
    }

    async updateProjectUser(
        id: string,
        projectId: string,
        user: IUpdateUser,
    ): Promise<IBodyResponse<IUpdateGroupIdsUserResponse>> {
        return await this.client.patch(
            `${this.detailUrl}/${id}/project/${projectId}`,
            user,
        );
    }

    async getAllProjectsAssignedUser(
        id: string,
    ): Promise<IBodyResponse<IGetListResponse<IProject>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IProject>>>(
            `${this.baseUrl}/${id}/project`,
        );
    }

    async getProjectListNotAssignUser(
        id: string,
        query: IProjectListQueryString,
    ): Promise<IBodyResponse<IGetListResponse<IProject>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IProject>>>(
            `${this.baseUrl}/${id}/project-not-assign`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async updateUserProjectIds(
        id: string,
        data: IUserProjectIdsUpdateBody,
    ): Promise<IBodyResponse<IUser>> {
        return await this.client.patch(`${this.baseUrl}/${id}/project`, data);
    }

    async getUserNotInProject(
        query: IUserListQueryString,
    ): Promise<IBodyResponse<IGetListResponse<IUser>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/not-in-project`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async updatePbsProfileUser(
        id: string,
        projectId: string,
        user: IAssignPbsProfileBody,
    ): Promise<IBodyResponse<IUser>> {
        return await this.client.patch(
            `${this.detailUrl}/${id}/pbs-profile/${projectId}`,
            user,
        );
    }
}

export const userService = new UserApiService({ baseUrl: '/user' }, service);
