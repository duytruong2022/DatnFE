import { IBodyResponse, IFTPFile, IGetListResponse } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import {
    IGetListLogServerFileQueryString,
    IGetLogServerDetailQuery,
    IProjectCategoryCount,
    ISupportRequestCategoryCount,
    IUserInCompaniesCount,
    IUserInCompanyListQuery,
    IUserStatusCount,
    IUserStatusListQuery,
    IUserTimeByModule,
    IUserTimeListQuery,
} from '../interfaces';

class ProjectLogService extends ApiService {
    getLogServerFileList(query: IGetListLogServerFileQueryString) {
        return this.client.get<void, IBodyResponse<IFTPFile[]>>(
            this.baseUrl + '/log-server',
            { params: query },
        );
    }

    getLogServerFileDetail(query: IGetLogServerDetailQuery) {
        return this.client.get<void, IBodyResponse<string>>(
            this.baseUrl + '/log-server-detail',
            { params: query },
        );
    }
}

export const projectLogService = new ProjectLogService(
    { baseUrl: '/project-log' },
    service,
);

class LogReportService extends ApiService {
    getUserTimeByModule(query: IUserTimeListQuery) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IUserTimeByModule>>>(
            this.baseUrl + '/user-time-by-module',
            { params: query },
        );
    }

    getSupportRequestCategoryCount(query: IUserTimeListQuery) {
        return this.client.get<
            void,
            IBodyResponse<IGetListResponse<ISupportRequestCategoryCount>>
        >(this.baseUrl + '/support-request-categories', { params: query });
    }

    getProjectCategoryCount() {
        return this.client.get<
            void,
            IBodyResponse<IGetListResponse<IProjectCategoryCount>>
        >(this.baseUrl + '/project-categories', {});
    }

    getUserStatusList(query: IUserStatusListQuery) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IUserStatusCount>>>(
            this.baseUrl + '/user-status',
            { params: query },
        );
    }

    getUserInCompanyList(query: IUserInCompanyListQuery) {
        return this.client.get<
            void,
            IBodyResponse<IGetListResponse<IUserInCompaniesCount>>
        >(this.baseUrl + '/user-in-company', { params: query });
    }
}

export const logReportService = new LogReportService({ baseUrl: '/log-report' }, service);
