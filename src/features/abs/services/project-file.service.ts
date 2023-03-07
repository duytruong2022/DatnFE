import { ApiService } from '@/common/services/api';
import { IBodyResponse, IFTPFile, IGetListResponse } from '@/common/interfaces';
import service from '@/plugins/axios';
import { IGetAssignedPBS, IGetFolderByPathQueryString } from '../interfaces';
import { DEFAULT_FIRST_PAGE } from '@/common/constants';

class ProjectFileService extends ApiService {
    async getAssignedPBS(fileId: string) {
        return await this.client.get<void, IBodyResponse<IGetAssignedPBS[]>>(
            `${this.baseUrl}/${fileId}/assigned-pbs`,
        );
    }
    async getUnassignedPBS(fileId: string, { keyword = '', page = DEFAULT_FIRST_PAGE }) {
        return await this.client.get<
            void,
            IBodyResponse<IGetListResponse<IGetAssignedPBS>>
        >(`${this.baseUrl}/${fileId}/unassigned-pbs`, {
            params: {
                keyword,
                page,
            },
        });
    }
    async unassignToPBS(fileId: string, pbsId: string, path: string, projectId: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${fileId}/unassign/pbs/${projectId}`,
            { pbsId, path },
        );
    }
    async assignToPBS(fileId: string, pbsId: string, path: string, projectId: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${fileId}/assign/pbs/${projectId}`,
            { pbsId, path },
        );
    }
    async assignTo4DFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/assign/4D`,
            { fileId, path },
        );
    }
    async unassignTo4DFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/unassign/4D`,
            { fileId, path },
        );
    }
    async assignToPlanningFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/assign/planning`,
            { fileId, path },
        );
    }
    async unassignToPlanningFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/unassign/planning`,
            { fileId, path },
        );
    }
    async assignTo4DBoxFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/assign/4d-box`,
            { fileId, path },
        );
    }
    async unassignTo4DBoxFile(assignedToFileId: string, fileId: string, path: string) {
        return await this.client.post<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/${assignedToFileId}/unassign/4d-box`,
            { fileId, path },
        );
    }
    async getFolderByPath(query: IGetFolderByPathQueryString) {
        return await this.client.get<void, IBodyResponse<IFTPFile>>(
            `${this.baseUrl}/folder-by-path`,
            {
                params: query,
            },
        );
    }
}

export const projectFileService = new ProjectFileService(
    { baseUrl: '/project-file' },
    service,
);
