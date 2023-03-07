import { AccessModules } from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';

export interface IProjectGroup {
    _id: string;
    name: string;
    projectProfileId: string;
    description: string;
    accessModule: AccessModules;
}

export interface IProjectGroupCreateBody {
    name: string | undefined;
    projectProfileId: string | undefined;
    description: string | undefined;
    accessModule: AccessModules | undefined;
    projectId: string | undefined;
}

export interface IProjectGroupUpdateBody extends IProjectGroupCreateBody {
    _id: string | undefined;
}

export interface IProjectGroupListQueryString extends ICommonGetListQuery {
    keyword?: string;
    accessModule?: AccessModules | null;
    projectId?: string | null;
    profileIds?: string[];
}

export interface IBulkCreateProjectGroup {
    index: number;
    name: string;
    projectProfile: string;
    description: string;
}

export interface IBulkCreateGroupBody {
    groups: IBulkCreateProjectGroup[];
    accessModule: AccessModules | null;
    projectId: string | null;
}

export interface IUserNotInProjectGroup extends ICommonGetListQuery {
    accessModule?: AccessModules | null;
    projectId?: string | null;
}

export interface IProjectGroupUpdateProfileBody {
    projectProfileId: string | undefined;
}
