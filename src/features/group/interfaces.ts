import { UpdateGroupAction } from './constant';
import { AccessModules } from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';
import { IProject } from '../project/interfaces';

export interface IGroup {
    _id: string;
    name: string;
    projectIds: string[];
    projects: IProject[];
    securityProfileId?: string;
    viewer3dProfileId?: string;
    assignedUserCount: number;
    description: string;
    accessModule: AccessModules;
}

export interface IGroupCreateBody {
    name: string | undefined;
    projectIds: string[] | undefined;
    projects: IProject[] | undefined;
    securityProfileId?: string | undefined;
    viewer3dProfileId?: string | undefined;
    description: string | undefined;
    accessModule: AccessModules | undefined;
}

export interface IGroupUpdateBody extends IGroupCreateBody {
    _id: string | undefined;
}

export interface IGroupProfileUpdateBody {
    securityProfileId?: string;
    viewer3dProfileId?: string;
}

export interface IGroupProjectIdsUpdateBody {
    projectId: string;
    action: UpdateGroupAction;
}

export interface IProjectGroupUpdateBody {
    projectIds: string[] | undefined;
}

export interface IGroupListQueryString extends ICommonGetListQuery {
    keyword?: string;
    accessModule?: AccessModules | null;
    profileIds?: string[];
}

export interface IBulkCreateGroup {
    index: number;
    name: string;
    securityProfile: string;
    viewer3dProfile: string;
    description: string;
}

export interface IBulkCreateGroupBody {
    groups: IBulkCreateGroup[];
    accessModule: AccessModules | null;
}
