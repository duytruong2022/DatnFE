import { ApiService } from '@/common/services/api';
import { IBodyResponse, IMoveContent } from '@/common/interfaces';
import service from '@/plugins/axios';
import {
    IFolderStructureTree,
    IFTPFile,
    IGetFolderFiles,
    ICreateFolder,
    ICreateFolderResponse,
    IDeleteFileFolder,
    IDownloadFileFolder,
    IDownloadFileResponse,
} from '@/common/interfaces';
import { IABSQueryString } from '../interfaces';

class AbsService extends ApiService {
    async getFolderStructure(projectId: string) {
        return await this.client.get<void, IBodyResponse<IFolderStructureTree[]>>(
            `${this.baseUrl}/${projectId}/folder`,
        );
    }
    async getFolderFiles(data: IGetFolderFiles, query: IABSQueryString) {
        return await this.client.get<void, IBodyResponse<IFTPFile[]>>(
            `${this.baseUrl}/${data.projectId}/file`,
            {
                params: {
                    path: data.path,
                    ...query,
                },
            },
        );
    }
    async createFolder(data: ICreateFolder) {
        return await this.client.post<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/${data.projectId}/folder`,
            {
                path: data.path,
                name: data.name,
            },
        );
    }
    async updateFolderAndFile(data: ICreateFolder) {
        return await this.client.patch<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/${data.projectId}`,
            {
                path: data.path,
                name: data.name,
                type: data.type,
            },
        );
    }
    async deleteFolderAndFile(data: IDeleteFileFolder) {
        return await this.client.delete<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/${data.projectId}/content`,
            {
                data: {
                    path: data.path,
                    type: data.type,
                },
            },
        );
    }
    async downloadFolderAndFile(data: IDownloadFileFolder) {
        return await this.client.post<void, IBodyResponse<IDownloadFileResponse>>(
            `${this.baseUrl}/${data.projectId}/download`,
            {
                path: data.path,
            },
        );
    }
    async moveContent(data: IMoveContent) {
        return await this.client.post<void, IBodyResponse>(
            `${this.baseUrl}/${data.projectId}/move`,
            {
                source: data.source,
                destination: data.destination,
            },
        );
    }
}

export const absService = new AbsService({ baseUrl: '/abs' }, service);
