import { SecurityPermissions, SecurityProfileOrderBy } from './constants';
import { ICommonGetListQuery } from '../../common/interfaces';

export interface ISecurityProfile {
    _id: string;
    name: string;
    description: string;
    permissions: SecurityPermissions[];
    createdAt: Date;
    isDefaultSelect: boolean;
}

export interface ICreateSecurityProfile {
    name: string;
    description: string;
    permissions: SecurityPermissions[];
    isDefaultSelect: boolean;
}

export type IUpdateSecurityProfile = ICreateSecurityProfile;

export interface ISecurityProfileQueryList extends ICommonGetListQuery {
    orderBy: SecurityProfileOrderBy;
}
