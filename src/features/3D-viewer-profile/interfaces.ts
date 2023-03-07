import { ICommonGetListQuery } from '@/common/interfaces';
import { IProject } from '../project/interfaces';
import { ProfilePermissionCategories, ProjectSecurityPermissions } from './constants';

export interface IPermissionTree {
    name: ProjectSecurityPermissions | ProfilePermissionCategories;
    children?: IPermissionTree[];
}

export interface ITreeStatus {
    checkedKeys: string[];
    checkedNodes: { name: ProjectSecurityPermissions | ProfilePermissionCategories }[];
    halfCheckedKeys: string[];
    halfCheckedNodes: IPermissionTree[];
}
export interface IGetListProfileQueryString extends ICommonGetListQuery {
    projectId: string | null;
}
export interface IProfile {
    name: string;
    _id?: string;
    createdAt?: Date;
    description: string;
    permissions: ProjectSecurityPermissions[];
    project?: IProject;
    isDefaultSelect: boolean;
    projectId?: string | null;
}

export interface ICreateProfileBody {
    name: string;
    isDefaultSelect: boolean;
    description: string;
    permissions: ProjectSecurityPermissions[];
}

export type IUpdateProfileBody = ICreateProfileBody;
