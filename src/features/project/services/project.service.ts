import {
    IBodyResponse,
    ICommonGetListQuery,
    IGetListResponse,
} from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import { IProjectNotification } from '../interfaces';
import service from '@/plugins/axios';
import {
    IGetProjectDashboardResponse,
    IProject,
    IProjectSettingField,
    IUpdateActivityCodeDisplayStatus,
    IUserProjectFieldSetting,
} from '../interfaces';

class ProjectApiService extends ApiService {
    async getDashboardDetail(projectId: string) {
        return await this.client.get<void, IBodyResponse<IGetProjectDashboardResponse>>(
            `${this.baseUrl}/${projectId}/dashboard`,
        );
    }
    async setProjectFieldSetting(projectId: string, data: IProjectSettingField) {
        return await this.client.patch<void, IBodyResponse<IUserProjectFieldSetting>>(
            `${this.baseUrl}/${projectId}/field-setting`,
            data,
        );
    }
    async getProjectFieldSetting(projectId: string) {
        return await this.client.get<void, IBodyResponse<IUserProjectFieldSetting>>(
            `${this.baseUrl}/${projectId}/field-setting`,
        );
    }
    async updateActivityCodeDisplayStatus(
        projectId: string,
        data: IUpdateActivityCodeDisplayStatus,
    ) {
        return await this.client.patch<void, IBodyResponse<IProject>>(
            `${this.baseUrl}/${projectId}/activity-code-status`,
            data,
        );
    }
    async getProjectNotification(projectId: string, params: ICommonGetListQuery) {
        return await this.client.get<
            void,
            IBodyResponse<IGetListResponse<IProjectNotification>>
        >(`${this.baseUrl}/${projectId}/notification`, {
            params,
        });
    }
}

export const projectService = new ProjectApiService({ baseUrl: '/project' }, service);
