import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IBodyResponse, IFTPFile, IGetListResponse } from '@/common/interfaces';
import { projectLogService } from './services/api.services';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
} from '@/common/constants';
import {
    IGetListLogServerFileQueryString,
    IProjectLog,
    IProjectLogListQueryString,
} from './interfaces';
import { LogServerType, ProjectLogModules } from './constant';
import { commonService } from '@/common/services/common.service';
import { IProject } from '../project/interfaces';
import { generateRandomColor } from '@/common/helpers';

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    projectIds: [],
    actions: [],
    updatedAtRange: [],
};

export const initLogServerQueryString = {
    type: LogServerType.INSTANCE_LOG,
    date: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'project-log' })
class ProjectLogModule extends VuexModule {
    projectLogListQueryString: IProjectLogListQueryString = initQueryString;
    logServerQueryString: IGetListLogServerFileQueryString = initLogServerQueryString;
    projectLogHistoryList: IProjectLog[] = [];
    projectLogTransactionList: IProjectLog[] = [];
    projectGroupLogList: IProjectLog[] = [];
    projectProfileLogList: IProjectLog[] = [];
    logServerFiles: IFTPFile[] = [];
    totalProjectLogHistories = 0;
    totalProjectLogTransactions = 0;
    totalProjectGroupLogs = 0;
    totalProjectProfileLogs = 0;
    projectList: IProject[] = [];
    companyList: string[] = [];
    randomColors: string[] = [];
    selectedLogServerFile: IFTPFile | null = null;
    selectedLogServerFilePath = '';
    isShowLogServerDetailPopup = false;

    @Action
    async getProjectLogHistoryList(): Promise<
        IBodyResponse<IGetListResponse<IProjectLog>>
    > {
        const query = {
            ...this.projectLogListQueryString,
            modules: [ProjectLogModules.PROJECT],
        };
        const response = (await projectLogService.getList({
            ...query,
        })) as IBodyResponse<IGetListResponse<IProjectLog>>;
        if (response.success) {
            this.MUTATE_PROJECT_LOG_HISTORY_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_PROJECT_LOG_HISTORIES(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_PROJECT_LOG_HISTORY_LIST([]);
            this.MUTATE_TOTAL_PROJECT_LOG_HISTORIES(0);
        }
        return response;
    }

    @Action
    async getProjectLogTransactionList(): Promise<
        IBodyResponse<IGetListResponse<IProjectLog>>
    > {
        const query = {
            ...this.projectLogListQueryString,
            modules: [
                ProjectLogModules.USER,
                ProjectLogModules.PROJECT_GROUP,
                ProjectLogModules.PROJECT_PROFILE,
                ProjectLogModules.GROUP,
            ],
        };
        const response = (await projectLogService.getList({
            ...query,
        })) as IBodyResponse<IGetListResponse<IProjectLog>>;
        if (response.success) {
            this.MUTATE_PROJECT_LOG_TRANSACTION_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_PROJECT_LOG_TRANSACTIONS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_PROJECT_LOG_TRANSACTION_LIST([]);
            this.MUTATE_TOTAL_PROJECT_LOG_TRANSACTIONS(0);
        }
        return response;
    }

    @Action
    async getProjectList() {
        const response =
            (await commonService.getProjectList()) as unknown as IBodyResponse<
                IGetListResponse<IProject>
            >;
        if (response.success) {
            this.MUTATE_PROJECT_LIST(response.data?.items || []);
        } else {
            this.MUTATE_PROJECT_LIST([]);
        }
    }

    @Action
    async getCompanyList() {
        const response = await commonService.getCompanyList({});
        if (response.success) {
            this.MUTATE_COMPANY_LIST(response.data?.items || []);
        } else {
            this.MUTATE_COMPANY_LIST([]);
        }
    }

    @Action
    async getLogServerFileList() {
        const response = await projectLogService.getLogServerFileList({
            ...this.logServerQueryString,
        });
        if (response.success) {
            this.MUTATE_LOG_SERVER_FILES(response.data || []);
        } else {
            this.MUTATE_LOG_SERVER_FILES([]);
        }
    }

    @Action
    async getSelectedLogServerFilePath(path: string) {
        const response = await projectLogService.getLogServerFileDetail({ path });

        if (response.success) {
            this.MUTATE_SELECTED_LOG_SERVER_FILE_PATH(response.data || '');
        } else {
            this.MUTATE_SELECTED_LOG_SERVER_FILE_PATH('');
        }
    }

    @Action
    setProjectLogListQueryString(query: IProjectLogListQueryString) {
        this.MUTATE_PROJECT_LOG_LIST_QUERY_STRING(query);
    }

    @Action
    setLogServerFileListQueryString(query: IGetListLogServerFileQueryString) {
        this.MUTATE_LOG_SERVER_LIST_QUERY_STRING(query);
    }

    @Action
    clearQueryStringProjectLog() {
        this.MUTATE_PROJECT_LOG_LIST_QUERY_STRING(initQueryString);
    }

    @Action
    generateRandomColor(numColor: number) {
        this.MUTATE_RANDOM_COLOR(numColor);
    }

    @Action
    setSelectedLogServerFile(file: IFTPFile) {
        this.MUTATE_SELECTED_LOG_SERVER_FILE(file);
    }

    @Action
    setIsShowLogServerDetailPopup(values: boolean) {
        this.MUTATE_IS_SHOW_LOG_SERVER_DETAIL_POPUP(values);
    }

    @Mutation
    MUTATE_PROJECT_LOG_HISTORY_LIST(projectLogs: IProjectLog[]) {
        this.projectLogHistoryList = projectLogs;
    }

    @Mutation
    MUTATE_PROJECT_LOG_TRANSACTION_LIST(projectLogTransactions: IProjectLog[]) {
        this.projectLogTransactionList = projectLogTransactions;
    }

    @Mutation
    MUTATE_PROJECT_GROUP_LOG_LIST(projectGroupLogs: IProjectLog[]) {
        this.projectGroupLogList = projectGroupLogs;
    }

    @Mutation
    MUTATE_PROJECT_PROFILE_LOG_LIST(projectProfileLogs: IProjectLog[]) {
        this.projectProfileLogList = projectProfileLogs;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_LOG_HISTORIES(totalProjectLogHistories: number) {
        this.totalProjectLogHistories = totalProjectLogHistories;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_LOG_TRANSACTIONS(totalProjectLogTransactions: number) {
        this.totalProjectLogTransactions = totalProjectLogTransactions;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_GROUP_LOGS(totalProjectGroupLogs: number) {
        this.totalProjectGroupLogs = totalProjectGroupLogs;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_PROFILE_LOGS(totalProjectProfileLogs: number) {
        this.totalProjectProfileLogs = totalProjectProfileLogs;
    }

    @Mutation
    MUTATE_PROJECT_LOG_LIST_QUERY_STRING(query: IProjectLogListQueryString) {
        this.projectLogListQueryString = {
            ...this.projectLogListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_LOG_SERVER_LIST_QUERY_STRING(query: IGetListLogServerFileQueryString) {
        this.logServerQueryString = {
            ...this.logServerQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_PROJECT_LIST(projects: IProject[]) {
        this.projectList = projects;
    }

    @Mutation
    MUTATE_COMPANY_LIST(companies: string[]) {
        this.companyList = companies;
    }

    @Mutation
    MUTATE_RANDOM_COLOR(numColor: number) {
        this.randomColors = generateRandomColor(numColor);
    }

    @Mutation
    MUTATE_LOG_SERVER_FILES(logServerFiles: IFTPFile[]) {
        this.logServerFiles = logServerFiles;
    }

    @Mutation
    MUTATE_SELECTED_LOG_SERVER_FILE(file: IFTPFile) {
        this.selectedLogServerFile = file;
    }

    @Mutation
    MUTATE_SELECTED_LOG_SERVER_FILE_PATH(path: string) {
        this.selectedLogServerFilePath = path;
    }

    @Mutation
    MUTATE_IS_SHOW_LOG_SERVER_DETAIL_POPUP(value: boolean) {
        this.isShowLogServerDetailPopup = value;
    }
}

export const projectLogModule = getModule(ProjectLogModule);
