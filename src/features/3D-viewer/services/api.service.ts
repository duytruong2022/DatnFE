import { ILoadPlanning, ITypeOpenFile } from './../interfaces';
import { ExportFormatExtension } from './../../../common/constants';
import {
    ICloseFile,
    IImportFile,
    ILoadFile,
    ILoadFileResponse,
    ISaveFile,
    IUploadFile,
    IGetFileResponse,
    IWebviewerSessionToken,
    IGetFileQuery,
    IOpenMultipleResponse,
    IOverrideSaveFile,
} from '../interfaces';
import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import { IBodyResponse } from '@/common/interfaces';
import { da } from 'element-plus/es/locale';

class WebViewer3DService extends ApiService {
    async getSessionToken(): Promise<IBodyResponse<IWebviewerSessionToken>> {
        return await this.client.get(`${this.baseUrl}/token`);
    }

    async getTypeFileOpen(sessionToken: string): Promise<IBodyResponse<ITypeOpenFile>> {
        return await this.client.get(`${this.baseUrl}/type-open-file/${sessionToken}`);
    }

    async loadFile(data: ILoadFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/load-file`,
            {
                ...data,
            },
        );
    }

    async getFile(
        id: string,
        query?: IGetFileQuery,
    ): Promise<IBodyResponse<IGetFileResponse>> {
        return await this.client.get(`${this.baseUrl}/file/${id}`, {
            params: { ...query },
        });
    }

    async uploadFile(data: IUploadFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/upload`,
            {
                sessionToken: data.sessionToken,
                file: data.file,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
    }

    async uploadOpenMultiple(data: FormData) {
        return await this.client.post<void, IBodyResponse<IOpenMultipleResponse>>(
            `${this.baseUrl}/upload-open-multiple`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
    }

    async uploadImportMultiple(data: FormData) {
        return await this.client.post<void, IBodyResponse<IOpenMultipleResponse>>(
            `${this.baseUrl}/upload-import`,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
    }

    async saveFile(data: ISaveFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/save`,
            {
                folderPath: data.folderPath,
                name: `${data.name}.${ExportFormatExtension[data.exportFormat]}`,
                sessionToken: data.sessionToken,
                exportType: data.exportType,
                exportFormat: data.exportFormat,
                projectId: data.projectId,
                exportFileType: data.exportFileType,
            },
        );
    }
    async closeFile(data: ICloseFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/${data.sessionToken}/close`,
        );
    }
    async importFile(data: IImportFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/import`,
            data,
        );
    }
    async importFromRelatedFiles(data: IImportFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/import-from-related-files`,
            {
                ...data,
            },
        );
    }
    async overrideSaveFile(data: IOverrideSaveFile) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/override-save-file`,
            {
                ...data,
            },
        );
    }

    async getSelectedNodeIds(sessionToken: string) {
        return await this.client.post<void, IBodyResponse>(
            `${this.baseUrl}/selected-node-ids`,
            { sessionToken },
        );
    }

    async loadFilePlanning(data: ILoadPlanning) {
        return await this.client.post<void, IBodyResponse<ILoadFileResponse>>(
            `${this.baseUrl}/load-file-planning`,
            { ...data },
        );
    }
}

export const webViewer3DService = new WebViewer3DService(
    { baseUrl: '/webviewer' },
    service,
);
