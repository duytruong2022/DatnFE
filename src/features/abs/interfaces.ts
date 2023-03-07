import { Vue } from 'vue-class-component';
import { ABSUploadedFileExtensions } from './constants';

export type FolderTreeChartRef = Vue & {
    zoomOut: () => void;
    zoomIn: () => void;
    restoreScale: () => void;
};

export interface IGetAssignedPBS {
    _id: string;
    name: string;
}

export interface IABSQueryString {
    extensions?: ABSUploadedFileExtensions[];
}

export interface IGetFolderByPathQueryString {
    path: string;
    projectId: string;
}
