import { IBodyResponse, IDeleteMutipleFile } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import {
    ICreateFolder,
    ICreateFolderResponse,
    IDeleteFileFolder,
    IDownloadFileFolder,
    IDownloadFileResponse,
    IFTPFile,
    IFolderStructureTree,
    IGetFolderFiles,
    IUploadFile,
} from '@/common/interfaces';
import service from '@/plugins/axios';

class RepositoryApiService extends ApiService {
    async getRepositoryFiles() {
        return await this.client.get<void, IBodyResponse<IFTPFile[]>>(
            `${this.baseUrl}/file`,
        );
    }
    async getFolderStructure() {
        return await this.client.get<void, IBodyResponse<IFolderStructureTree[]>>(
            `${this.baseUrl}/folder`,
        );
    }
    async getFolderFiles(data: IGetFolderFiles) {
        return await this.client.get<void, IBodyResponse<IFTPFile[]>>(
            `${this.baseUrl}/file`,
            {
                params: {
                    path: data.path,
                },
            },
        );
    }
    async createFolder(data: ICreateFolder) {
        return await this.client.post<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/folder`,
            {
                path: data.path,
                name: data.name,
            },
        );
    }
    async updateFolderAndFile(data: ICreateFolder) {
        return await this.client.patch<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/folder`,
            {
                path: data.path,
                name: data.name,
                type: data.type,
            },
        );
    }
    async uploadFile(data: IUploadFile) {
        return await this.client.post<void, IBodyResponse<void>>(
            `${this.baseUrl}/file`,
            {
                path: data.path,
                file: data.file,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
    }
    async deleteFolderAndFile(data: IDeleteFileFolder) {
        return await this.client.delete<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/content`,
            {
                data: {
                    path: data.path,
                    type: data.type,
                },
            },
        );
    }

    async deleteMutipleFile(data: IDeleteMutipleFile) {
        return await this.client.delete<void, IBodyResponse<ICreateFolderResponse>>(
            `${this.baseUrl}/delete-mutiple-file`,
            {
                data: { paths: data.paths },
            },
        );
    }

    async downloadFile(data: IDownloadFileFolder) {
        return await this.client.post<void, IBodyResponse<IDownloadFileResponse>>(
            `${this.baseUrl}/download`,
            {
                path: data.path,
            },
        );
    }
    async moveContent(source: string, destination: string) {
        return await this.client.post<void, IBodyResponse>(`${this.baseUrl}/move`, {
            source: source,
            destination: destination,
        });
    }
}

export const repositoryService = new RepositoryApiService(
    { baseUrl: '/repository' },
    service,
);
