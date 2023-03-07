import { IUser } from '../user/interfaces';

export interface IPbsGroup {
    _id: string;
    name?: string;
    projectId?: string;
    parentId?: string;
    groupIds?: string[];
    userIds?: string[];
    users?: IUser[];
    level: number;
}

export interface IPbsGroupQueryString {
    limit?: number;
    projectId: string;
}
