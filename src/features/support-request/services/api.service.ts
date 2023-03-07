import { IBodyResponse, IFile } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import { ISupportRequestExportQueryList } from '../interface';

class SupportRequestApiService extends ApiService {
    async uploadFile(data: File) {
        return await this.client.post<IFile, IBodyResponse<IFile>>(
            `${this.baseUrl}/file`,
            {
                file: data,
            },
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );
    }

    async exportCSVSupportResquestList(query: ISupportRequestExportQueryList) {
        return await this.client.get<void, IBodyResponse<boolean>>(
            `${this.baseUrl}/export-csv`,
            {
                params: {
                    ...query,
                },
            },
        );
    }
}

export const supportRequestService = new SupportRequestApiService(
    { baseUrl: '/support-request' },
    service,
);
