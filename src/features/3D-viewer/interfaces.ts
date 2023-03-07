import { ExportFormat3D, ExportType, ExportFormat2D } from './../../common/constants';
import { ImportSource } from './constant';
export interface IWebviewerSessionToken {
    sessionToken?: string;
}

export interface ILoadFile {
    sessionToken: string;
    filePaths: string[];
    projectId?: string;
}

export interface IGetFileQuery {
    filePath?: string;
    projectId?: string;
}

export interface IUploadFile {
    sessionToken: string;
    file: File;
}
export interface ILoadFileResponse {
    fileId: string;
    parentFolderPath: string;
}

export interface IOpenMultipleResponse {
    fileId: string;
    parentFolderPath: string;
}

export interface IGetFileResponse {
    name: string;
    path: string;
    importedFilePaths: string[];
    level: number;
    parentFileId: string;
    userId: string;
}

export interface ISaveFile {
    sessionToken: string;
    name: string;
    folderPath: string;
    exportType: ExportType;
    exportFormat: ExportFormat3D | ExportFormat2D;
    projectId?: string;
    exportFileType?: string;
}

export interface ICloseFile {
    sessionToken: string;
}

export interface IImportFile {
    sessionToken: string;
    filePaths: string[];
    projectId?: string;
    source: ImportSource;
}

export interface ITypeOpenFile {
    typeFileOpen: string;
}

export interface IOverrideSaveFile {
    sessionToken: string;
    fileId: string;
    projectId?: string;
}

export interface ILoadPlanning {
    sessionToken: string;
    projectId: string;
    name: string;
}
