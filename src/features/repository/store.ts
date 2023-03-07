import { DimensionType } from './../3D-viewer/constant';
import { ExportType } from './../../common/constants';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
} from '@/common/constants';
import { IFTPFile, IFolderStructureTree, IGetFolderFiles } from '@/common/interfaces';
import { repositoryService } from './services/api.service';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    status: [],
};

export const initLdapQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'repository' })
class RepositoryModule extends VuexModule {
    repositoryFiles: IFTPFile[] = [];
    isShowUploadFormPopup = false;
    downloadedFileId = '';

    folderStructure: IFolderStructureTree[] = [];
    folderFiles: IFTPFile[] = [];
    currentPath = '';
    exportType = ExportType.ZONE;
    fileDimensionType = DimensionType['3D'];
    isShowCreateFolderForm = false;
    recentOpenedFolderKey: TreeKey = '';
    selectedFolderName = '';
    selectedFileName = '';
    isShowFileForm = false;
    selectedFilePath = '';
    parentFolderName = '';
    isShowExportFileType = false;

    @Action
    async getRepositoryFiles() {
        const response = await repositoryService.getRepositoryFiles();
        if (response.success) {
            this.MUTATE_REPOSITORY_FILES(response.data);
        } else {
            this.MUTATE_REPOSITORY_FILES([]);
        }
    }

    @Action
    setIsShowUploadFormPopup(isShowUploadFormPopup: boolean) {
        this.MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup);
    }

    @Action
    setDownloadedFileId(downloadedFileId: string) {
        this.MUTATE_DOWNLOADED_FILE_ID(downloadedFileId);
    }

    @Action
    async getFolderStructure() {
        const response = await repositoryService.getFolderStructure();
        if (response.success) {
            this.MUTATE_FOLDER_STRUCTURE(response.data);
        }
    }

    @Action
    async getFolderFiles(data: IGetFolderFiles) {
        const response = await repositoryService.getFolderFiles(data);
        if (response.success) {
            this.MUTATE_FOLDER_FILES(response.data);
        }
    }

    @Action
    setCurrentPath(currentPath: string) {
        this.MUTATE_CURRENT_PATH(currentPath);
    }

    @Action
    setExportType(exportType: ExportType) {
        this.MUTATE_EXPORT_TYPE(exportType);
    }

    @Action
    setDimensionType(dimensionType: DimensionType) {
        this.MUTATE_DIMENSION_TYPE(dimensionType);
    }

    @Action
    setIsShowCreateFolderForm(isShowCreateFolderForm: boolean) {
        this.MUTATE_IS_SHOW_CREATE_FOLDER_FORM(isShowCreateFolderForm);
    }

    @Action
    setRecentOpenedFolderKey(recentOpenedFolderKey: TreeKey) {
        this.MUTATE_RECENT_OPENED_FOLDER_KEY(recentOpenedFolderKey);
    }

    @Action
    setSelectedFolderName(folderName: string) {
        this.MUTATE_SELECTED_FOLDER_NAME(folderName);
    }

    @Action
    setSelectedFileName(fileName: string) {
        this.MUTATE_SELECTED_FILE_NAME(fileName);
    }

    @Action
    setIsShowFileForm(isShowFileForm: boolean) {
        this.MUTATE_IS_SHOW_FILE_FORM(isShowFileForm);
    }

    @Action
    setSelectedFilePath(filePath: string) {
        this.MUTATE_SELECTED_FILE_PATH(filePath);
    }

    @Action
    setParentFolderName(parentFolderName: string) {
        this.MUTATE_PARENT_FOLDER_NAME(parentFolderName);
    }

    @Action
    setIsShowExportFileType(isShowExportFileType: boolean) {
        this.MUTATE_IS_SHOW_EXPORT_FORMAT_TYPE(isShowExportFileType);
    }

    @Mutation
    MUTATE_REPOSITORY_FILES(repositoryFiles: IFTPFile[]) {
        this.repositoryFiles = repositoryFiles;
    }

    @Mutation
    MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup: boolean) {
        this.isShowUploadFormPopup = isShowUploadFormPopup;
    }

    @Mutation
    MUTATE_DOWNLOADED_FILE_ID(downloadedFileId: string) {
        this.downloadedFileId = downloadedFileId;
    }

    @Mutation
    MUTATE_FOLDER_STRUCTURE(folderStructure: IFolderStructureTree[]) {
        this.folderStructure = folderStructure;
    }

    @Mutation
    MUTATE_FOLDER_FILES(folderFiles: IFTPFile[]) {
        this.folderFiles = folderFiles;
    }

    @Mutation
    MUTATE_CURRENT_PATH(currentPath: string) {
        this.currentPath = currentPath;
    }

    @Mutation
    MUTATE_EXPORT_TYPE(exportType: ExportType) {
        this.exportType = exportType;
    }

    @Mutation
    MUTATE_DIMENSION_TYPE(dimensionType: DimensionType) {
        this.fileDimensionType = dimensionType;
    }

    @Mutation
    MUTATE_IS_SHOW_CREATE_FOLDER_FORM(isShowCreateFolderForm: boolean) {
        this.isShowCreateFolderForm = isShowCreateFolderForm;
    }

    @Mutation
    MUTATE_RECENT_OPENED_FOLDER_KEY(recentOpenedFolderKey: TreeKey) {
        this.recentOpenedFolderKey = recentOpenedFolderKey;
    }

    @Mutation
    MUTATE_SELECTED_FOLDER_NAME(folderName: string) {
        this.selectedFolderName = folderName;
    }

    @Mutation
    MUTATE_SELECTED_FILE_NAME(fileName: string) {
        this.selectedFileName = fileName;
    }

    @Mutation
    MUTATE_IS_SHOW_FILE_FORM(isShowFileForm: boolean) {
        this.isShowFileForm = isShowFileForm;
    }

    @Mutation
    MUTATE_SELECTED_FILE_PATH(filePath: string) {
        this.selectedFilePath = filePath;
    }

    @Mutation
    MUTATE_PARENT_FOLDER_NAME(parentFolderName: string) {
        this.parentFolderName = parentFolderName;
    }

    @Mutation
    MUTATE_IS_SHOW_EXPORT_FORMAT_TYPE(isShowFileType: boolean) {
        this.isShowExportFileType = isShowFileType;
    }
}

export const repositoryModule = getModule(RepositoryModule);
