import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import { IBulkImportResponse } from '@/features/auth/interfaces';
import { IProjectListQueryString, IProject } from '@/features/project/interfaces';
import { IUser, IUserListQueryString } from '@/features/user/interfaces';
import service from '@/plugins/axios';
import {
    IBulkCreateGroupBody,
    IGroup,
    IGroupProfileUpdateBody,
    IGroupProjectIdsUpdateBody,
} from '../interfaces';

class GroupApiService extends ApiService {
    importGroups(
        data: IBulkCreateGroupBody,
    ): Promise<IBodyResponse<IBulkImportResponse>> {
        return this.client.post(`${this.detailUrl}/bulk-create`, data);
    }

    async getAllUsersInGroup(
        id: string,
    ): Promise<IBodyResponse<IGetListResponse<IUser>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/${id}/user`,
        );
    }

    async getUserListNotInGroup(
        id: string,
        query: IUserListQueryString,
    ): Promise<IBodyResponse<IGetListResponse<IUser>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/${id}/user-not-belong`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async getProjectListNotInGroup(
        id: string,
        query: IProjectListQueryString,
    ): Promise<IBodyResponse<IGetListResponse<IProject>>> {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IProject>>>(
            `${this.baseUrl}/${id}/project-not-belong`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async updateGroupProfile(
        id: string,
        data: IGroupProfileUpdateBody,
    ): Promise<IBodyResponse<IGroup>> {
        return await this.client.patch(`${this.baseUrl}/${id}/profile`, data);
    }

    async updateGroupProjectIds(
        id: string,
        data: IGroupProjectIdsUpdateBody,
    ): Promise<IBodyResponse<IGroup>> {
        return await this.client.patch(`${this.baseUrl}/${id}/project`, data);
    }
}

export const groupService = new GroupApiService({ baseUrl: '/group' }, service);
