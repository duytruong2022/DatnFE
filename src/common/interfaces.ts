import { AxiosResponse } from 'axios';
import { AccessModules, HttpStatus, OrderDirection } from './constants';
import { Component } from 'vue';
import { IUser } from '@/features/auth/interfaces';
import { Vue } from 'vue-class-component';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';
import Node from 'element-plus/lib/components/tree/src/model/node';

export interface IBodyResponse<T = Record<string, string | number>>
    extends AxiosResponse {
    success: boolean;
    isRequestError?: boolean;
    code: HttpStatus;
    message: string;
    data: T;
    errors?: { key: string; message: string; errorCode: HttpStatus }[];
}

export interface ICommonGetListQuery {
    page?: number;
    limit?: number;
    keyword?: string;
    orderBy?: string;
    orderDirection?: OrderDirection;
}

export interface IGetListResponse<T> {
    items: T[];
    totalItems: number;
}

export interface IDropDownOption {
    value?: string | number;
    label?: string;
}

export interface IDropDownOrderOption extends IDropDownOption {
    order: number;
}

export interface ISidebar {
    icon?: string;
    iconComponent?: Component;
    iconLink?: string;
    name?: string;
    to?: string;
    active?: boolean;
    children?: ISidebar[];
    pageName?: string;
    requiredPermissions?: string[];
    onClick?: () => void;
    badge?: () => number;
    requireProjectProfile?: boolean;
}

export interface IBreadcrumb {
    index: number;
    text: string;
    link: string;
}

export interface ICountry {
    _id: string;
    name: string;
    code: string;
}

export interface IELColumnSort {
    prop: string;
    order: OrderDirection;
}

// TO DD: move to group.interface later
export interface IGroup {
    id: string;
    name: string;
    description: string;
}

export interface ILoginedUser {
    user: IUser;
}

export interface ITreeNode {
    _id: string;
    level?: number;
    children?: ITreeNode[];
    parentId?: string;
    label: string;
}

export type StructureTree = Vue & {
    setCurrentKey: (nodeKey: TreeKey, shouldAutoExpandParent: boolean) => void;
    getCurrentKey: () => void;
    filter: (keyword: string) => void;
};

export interface IQueryDropdownByModules {
    page?: number;
    limit?: number;
    accessModules?: AccessModules[];
    projectId?: string;
}

export interface IQueryDropdown {
    page?: number;
    limit?: number;
    accessModule?: AccessModules;
    projectId?: string;
}
export interface IViewer3DTab {
    tab: string;
    groups: IViewer3DGroup[];
}
export interface IViewer3DGroup {
    group: string;
    funcs: string[];
    withoutFunctions: string[];
}
export interface ITreeOption {
    label?: string;
    value: string;
    children?: ITreeOption[];
}

export interface IFile {
    type: string;
    originalname: string;
    filename: string;
    path: string;
    size: number;
}

export interface IExportCSVData {
    fileName: string;
    filePath: string;
}

export interface IFolderStructureTree {
    _id?: string;
    name: string;
    label?: string;
    children?: IFolderStructureTree[];
    path: string;
    level: number;
    value?: null | string;
}

export type FolderStructureTree = Vue & {
    getNode: (nodeKey: TreeKey) => Node;
    setCurrentKey: (nodeKey: TreeKey) => void;
};

export interface IFTPFile {
    _id: string;
    name: string;
    type?: string;
    lastModified: number;
    size: number;
    thumbnail?: string;
    path?: string;
    assigned4DFileIds?: string[];
    assignedPlanningFileIds?: string[];
    assignedPBSIds?: string[];
    parentId?: string;
}

export interface IGetFolderFiles {
    path: string;
    projectId: string;
}

export interface ICreateFolder {
    projectId: string;
    path: string;
    name: string;
    type: string;
}

export interface IDeleteFileFolder {
    projectId: string;
    path: string;
    type: string;
}

export interface IDeleteMutipleFile {
    paths: string[];
}

export interface IDownloadFileFolder {
    projectId: string;
    path: string;
}

export interface ICreateFolderResponse {
    path: string;
}
export interface IDownloadFileResponse {
    downloadFileName: string;
    downloadUrl: string;
}

export interface IUploadFile {
    projectId: string;
    path: string;
    file: File;
}

export type UploadMultipleRef = Vue & {
    clearFiles: () => void;
    submit: () => void;
};

export interface IQueryDropdownFile {
    type?: string[];
    projectId: string;
}

export interface IProjectFile {
    _id?: string;
    name: string;
    path: string;
    projectId?: string;
}

export interface IMoveContent {
    source: string;
    destination: string;
    projectId: string;
}

export interface ICommonGetListInProjectQuery extends ICommonGetListQuery {
    projectId: string;
}

export interface ICommonTableRefs {
    clearSelection: () => void;
}
