import { AccessModules, UserStatus } from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';
import { ProjectCategories } from '../project/constants';
import { IUser } from '../user/interfaces';
import { LogServerType, ProjectLogActions, ProjectLogModules } from './constant';

export interface IProjectLog {
    _id: string;
    taskOwner: IUser;
    action: string;
    module: string;
    projectId: string;
    description: string;
    newData: Record<string, unknown>;
    oldData: Record<string, unknown>;
}

export interface IProjectLogListQueryString extends ICommonGetListQuery {
    projectIds?: string[];
    modules?: ProjectLogModules[];
    keyword?: string;
    actions?: ProjectLogActions[];
    updatedAtRange?: string[];
}

export interface IUserTimeListQuery {
    company?: string;
    dateRanges?: string[];
    projectId?: string;
    dateRangeType: string;
}

export interface IUserTimeByModule {
    day: number;
    month: number;
    platformModuleTime: number;
    constellationModuleTime: number;
    viewer3DProfileModuleTime: number;
    projectTime: number;
}

export interface ISupportRequestCategoryCount {
    day: number;
    month: number;
    incidentCount: number;
    requestCount: number;
    ideaSuggestionCount: number;
}

export interface IProjectCategoryCount {
    category: ProjectCategories;
    categoryCount: number;
}

export interface IUserStatusListQuery {
    module?: AccessModules;
    projectId?: string;
    company?: string;
}

export interface IUserStatusCount {
    status: UserStatus;
    statusCount: number;
}

interface CountUserInCompany {
    companyName: string;
    userCount: number;
}

export interface IUserInCompaniesCount {
    week: number;
    month: number;
    year: number;
    companies: CountUserInCompany[];
}

export interface IUserInCompanyListQuery {
    dateRanges?: string[];
    projectId?: string;
    dateRangeType: string;
}

export interface IGetListLogServerFileQueryString {
    date: string;
    type: LogServerType;
}

export interface IGetLogServerDetailQuery {
    path: string;
}
