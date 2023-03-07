import { AccessModules } from '@/common/constants';
import { ICommonGetListQuery } from '@/common/interfaces';
import { IProject } from '../project/interfaces';
import { IUser } from '../user/interfaces';
import { NotificationStatus, NotificationTypes } from './constants';

export interface INotification {
    _id?: string;
    userIds: string[];
    type: NotificationTypes;
    requestedUserId: string;
    user: IUser;
    project: IProject;
}

export interface INotificationListQueryString extends ICommonGetListQuery {
    status?: NotificationStatus;
    accessModules?: AccessModules[];
    projectId?: string;
}
export interface IRejectNotification {
    rejectReason: string;
}
export interface ICountPendingNotificationResponse {
    totalItems: number;
}
