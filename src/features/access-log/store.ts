import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { accessLogService } from './services/api.services';
import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
} from '@/common/constants';
import {
    IAccessLog,
    IAccessLogCreateBody,
    IAccessLogListQueryString,
} from './interfaces';
import { showErrorNotificationFunction } from '@/common/helpers';
import localStorageAuthService from '@/common/authStorage';
import { commonService } from '@/common/services/common.service';

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    modules: [],
    loginAtRange: [],
    companies: [],
};

@Module({ dynamic: true, namespaced: true, store, name: 'access-log' })
class AccessLogModule extends VuexModule {
    accessLogListQueryString: IAccessLogListQueryString = initQueryString;
    accessLogList: IAccessLog[] = [];
    totalAccessLogs = 0;
    companyList: string[] = [];

    @Action
    async getAccessLogList(): Promise<IBodyResponse<IGetListResponse<IAccessLog>>> {
        const response = (await accessLogService.getList({
            ...this.accessLogListQueryString,
        })) as IBodyResponse<IGetListResponse<IAccessLog>>;
        if (response.success) {
            this.MUTATE_ACCESS_LOG_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_ACCESS_LOGS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_ACCESS_LOG_LIST([]);
            this.MUTATE_TOTAL_ACCESS_LOGS(0);
        }
        return response;
    }

    @Action
    async createAccessLogModule(accessLog: IAccessLogCreateBody) {
        const response = (await accessLogService.create(
            accessLog,
        )) as unknown as IBodyResponse<IAccessLog>;
        if (response.success) {
            localStorageAuthService.setAccessLogId(response.data._id);
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }

    @Action
    async getCompanyList() {
        const response = await commonService.getCompanyList({
            accessModules: [
                AccessModules.SPACIALYTIC_PLATFORM,
                AccessModules.SPACIALYTIC_CONSTELLATION,
                AccessModules.SPACIALYTIC_3DWEBVIEWER,
            ],
        });
        if (response.success) {
            this.MUTATE_COMPANY_LIST(response.data?.items.filter((item) => item) || []);
        } else {
            this.MUTATE_COMPANY_LIST([]);
        }
    }

    @Action
    async updateAccessLogModule(accessLogId: string) {
        if (accessLogId) {
            const response = await accessLogService.update(accessLogId, {});
            if (!response.success) {
                showErrorNotificationFunction(response.message as string);
            }
        }
    }

    @Action
    setAccessLogListQueryString(query: IAccessLogListQueryString) {
        this.MUTATE_ACCESS_LOG_LIST_QUERY_STRING(query);
    }

    @Action
    clearQueryStringAccessLog() {
        this.MUTATE_ACCESS_LOG_LIST_QUERY_STRING(initQueryString);
    }

    @Mutation
    MUTATE_ACCESS_LOG_LIST(accessLogs: IAccessLog[]) {
        this.accessLogList = accessLogs;
    }

    @Mutation
    MUTATE_TOTAL_ACCESS_LOGS(totalAccessLogs: number) {
        this.totalAccessLogs = totalAccessLogs;
    }

    @Mutation
    MUTATE_ACCESS_LOG_LIST_QUERY_STRING(query: IAccessLogListQueryString) {
        this.accessLogListQueryString = {
            ...this.accessLogListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_COMPANY_LIST(companies: string[]) {
        this.companyList = companies;
    }
}

export const accessLogModule = getModule(AccessLogModule);
