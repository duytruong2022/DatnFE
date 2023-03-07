import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import { IBulkImportResponse, IUser } from '@/features/auth/interfaces';
import service from '@/plugins/axios';
import {
    IBulkCreateGroupBody,
    IProjectGroup,
    IProjectGroupUpdateProfileBody,
    IUserNotInProjectGroup,
} from '../interfaces';

class ProjectGroupApiService extends ApiService {
    importGroups(
        data: IBulkCreateGroupBody,
    ): Promise<IBodyResponse<IBulkImportResponse>> {
        return this.client.post(`${this.detailUrl}/bulk-create`, data);
    }

    async getAllUsersInGroup(id: string) {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/${id}/user`,
        );
    }

    async getAllUsersNotInGroup(id: string, query: IUserNotInProjectGroup) {
        return await this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            `${this.baseUrl}/${id}/user-not-belong`,
            {
                params: {
                    ...query,
                },
            },
        );
    }

    async updateProjectGroupProfile(
        id: string,
        data: IProjectGroupUpdateProfileBody,
    ): Promise<IBodyResponse<IProjectGroup>> {
        return await this.client.patch(`${this.baseUrl}/${id}/project-profile`, data);
    }
}

export const projectGroupService = new ProjectGroupApiService(
    { baseUrl: '/project-group' },
    service,
);
