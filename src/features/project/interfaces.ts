import { IGroup } from './../group/interfaces';
import { ICommonGetListQuery } from '@/common/interfaces';
import { IProfile } from '../3D-viewer-profile/interfaces';
import { IUser } from '../auth/interfaces';
import { ProjectCategories } from './constants';

export interface IProject {
    _id?: string;
    name: string;
    adminId: string;
    dataDate: Date | string;
    category: ProjectCategories;
    description: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    taskIdPrefix: string;
    taskIdSuffix: number;
    taskIdIncrement: number;
    displayActivityCode?: boolean;
    manager?: IUser;
    admin?: IUser;
    groups?: IGroup[];
    projectProfiles?: IProfile[];
    projectProfileSelected?: IProfile;
    coordinatesDetails?: string;
    createdAt?: string[];
    updatedAt?: string;
}

export interface IGetPostalCodeResponse {
    postalCode: string;
}
export interface IGetCoordinatesFromPostalCode {
    coordinates: ICoordinates;
    displayName: string;
}

export interface ICoordinates {
    latitude: number;
    longitude: number;
}

export enum MapStyleNames {
    ICON = 'icon',
}

export interface IProjectListQueryString extends ICommonGetListQuery {
    keyword?: string;
    category?: ProjectCategories;
    createdBy?: string;
    createdAt?: string[] | null;
}
export interface ICoordinates {
    latitude: number;
    longitude: number;
}

export interface IResourceCountGroupByType {
    human_resource?: number;
    location?: number;
    material?: number;
    equipment?: number;
}

export interface IProjectSettingField {
    category: boolean;
    description: boolean;
    postalCode: boolean;
    address: boolean;
    coordinates: boolean;
    projectAdmin: boolean;
    time: boolean;
}

export interface IUserProjectFieldSetting {
    _id?: string | null;
    userId: string;
    projectId: string;
    settings: IProjectSettingField;
}
export interface IGetProjectDashboardResponse {
    assignedUserCount: number;
    planningCount: number;
    file3DCount: number;
    taskCount: number;
    linkCount: number;
    countTaskGroupByStatus?: {
        todo?: number;
        in_progress?: number;
        finished?: number;
    };
    companyCount: number;
    assignedResourceCount?: IResourceCountGroupByType;
    allResourceCount?: IResourceCountGroupByType;
    assignedResourceWith3DObjectCount: number;
    project: IProject;
    userProjectFieldSetting?: IUserProjectFieldSetting | null;
}

export interface IUpdateActivityCodeDisplayStatus {
    status: boolean;
}
import { ProjectNotificationType } from './constants';
export interface IProjectNotification {
    createdAt: string;
    target: string;
    type: ProjectNotificationType;
    user: {
        firstName: string;
        lastName: string;
    };
}

export interface IProjectNotificationQueryString extends ICommonGetListQuery {
    type?: ProjectNotificationType | null;
}
