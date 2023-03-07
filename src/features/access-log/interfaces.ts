import { AccessModules } from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';
import { IUser } from '../user/interfaces';

export interface IAccessLog {
    _id: string;
    user: IUser;
    module: AccessModules;
    loginAt: string;
    logoutAt: string;
    duration: string;
}

export interface IAccessLogCreateBody {
    module?: AccessModules | null;
    projectId?: string;
}

export interface IAccessLogListQueryString extends ICommonGetListQuery {
    loginAtRange?: string[] | null;
    modules?: AccessModules[] | null;
    companies?: string[] | null;
}
