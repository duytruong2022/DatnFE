import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { absService } from './services/abs.service';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';
import { ABSUploadedFileExtensions, AbsViewMode } from './constants';
import { IFolderStructureTree, IFTPFile, IGetFolderFiles } from '@/common/interfaces';
import { ExportType } from '@/common/constants';
import { DimensionType } from '../3D-viewer/constant';
import { IABSQueryString } from './interfaces';
import { projectModule } from '../project/store';

@Module({ dynamic: true, namespaced: true, store, name: 'abs' })
class AbsModule extends VuexModule {
    folderStructure: IFolderStructureTree[] = [];
    folderFiles: IFTPFile[] = [];
    currentPath = '';
    isShowCreateFolderForm = false;
    recentOpenedFolderKey: TreeKey = '';
    isShowUploadFormPopup = false;
    absViewMode = AbsViewMode.GRID;
    selectedFolderName = '';
    selectedFileName = '';
    selectedFileType: ABSUploadedFileExtensions | null = null;
    isShowFileForm = false;
    selectedFilePath = '';
    selectedFilePaths: string[] = [];
    isShowAssignToPBSForm = false;
    selectedFileId = '';
    isShowFileAssignCheckBox = false;
    selectedFileIds: string[] = [];
    exportType = ExportType.ZONE;
    fileDimensionType = DimensionType['2D'];
    isAssigningTo4DFile = false;
    isAssigningToPlanningFile = false;
    isAssigningTo4DBoxFile = false;
    isShowSelectABSFilePopup = false;
    selectedFile: IFTPFile = {
        _id: '',
        name: '',
        type: '',
        lastModified: NaN,
        size: NaN,
        thumbnail: '',
        path: '',
        assigned4DFileIds: [],
        assignedPBSIds: [],
    };
    absQueryString: IABSQueryString = {
        extensions: [],
    };
    parentFolderName = '';
    projectFolderAssignPbs: IFTPFile[] = [];
    isAssignPbsToFolder = false;
    isShowExportFileType = false;

    @Action
    async getFolderStructure(projectId: string) {
        const response = await absService.getFolderStructure(projectId);
        if (response.success) {
            this.MUTATE_FOLDER_STRUCTURE(response.data);
        }
    }

    @Action
    async getFolderFiles(data: IGetFolderFiles) {
        const query = this.absQueryString;
        const response = await absService.getFolderFiles(data, query);
        if (response.success) {
            this.MUTATE_FOLDER_FILES(response.data);
        }
    }

    @Action
    setCurrentPath(currentPath: string) {
        this.MUTATE_CURRENT_PATH(currentPath);
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
    setIsShowUploadFormPopup(isShowUploadFormPopup: boolean) {
        this.MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup);
    }

    @Action
    setAbsViewMode(absViewMode: AbsViewMode) {
        this.MUTATE_ABS_VIEW_MODE(absViewMode);
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
    setSelectedFileType(type: ABSUploadedFileExtensions | null) {
        this.MUTATE_SELECTED_FILE_TYPE(type);
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
    setSelectedFilePaths(selectedFilePaths: string[]) {
        this.MUTATE_SELECTED_FILE_PATHS(selectedFilePaths);
    }

    @Action
    setIsShowAssignToPBSForm(isShowAssignToPBSForm: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_TO_PBS_FORM(isShowAssignToPBSForm);
    }

    @Action
    setSelectedFileId(selectedFileId: string) {
        this.MUTATE_SELECTED_FILE_ID(selectedFileId);
    }

    @Action
    setIsShowFileAssignCheckBox(isShowFileAssignCheckBox: boolean) {
        this.MUTATE_IS_SHOW_FILE_ASSIGN_CHECK_BOX(isShowFileAssignCheckBox);
    }

    @Action
    setSelectedFileIds(selectedFileIds: string[]) {
        this.MUTATE_SELECTED_FILE_IDS(selectedFileIds);
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
    setIsAssigningTo4DFile(isAssigningTo4DFile: boolean) {
        this.MUTATE_IS_ASSIGNING_TO_4D_FILE(isAssigningTo4DFile);
    }

    @Action
    setIsAssigningToPlanningFile(isAssigningToPlanningFile: boolean) {
        this.MUTATE_IS_ASSIGNING_TO_PLANNING_FILE(isAssigningToPlanningFile);
    }

    @Action
    setIsAssigningTo4DBoxFile(isAssigningTo4DBoxFile: boolean) {
        this.MUTATE_IS_ASSIGNING_TO_4D_BOX_FILE(isAssigningTo4DBoxFile);
    }

    @Action
    setIsShowSelectABSFilePopup(isShowSelectABSFilePopup: boolean) {
        this.MUTATE_IS_SHOW_SELECT_ABS_FILE_POPUP(isShowSelectABSFilePopup);
    }

    @Action
    setSelectedFile(selectedFile: IFTPFile) {
        this.MUTATE_SELECTED_FILE(selectedFile);
    }

    @Action
    setABSQueryString(absQueryString: IABSQueryString) {
        this.MUTATE_ABS_QUERY_STRING(absQueryString);
    }

    @Action
    setParentFolderName(parentFolderName: string) {
        this.MUTATE_PARENT_FOLDER_NAME(parentFolderName);
    }

    @Action
    setIsAssignPbsToFolder(isAssignPbsToFolder: boolean) {
        this.MUTATE_IS_ASSIGN_PBS_TO_FOLDER(isAssignPbsToFolder);
    }

    @Action
    setIsShowExportFileType(isShowExportFileType: boolean) {
        this.MUTATE_IS_SHOW_EXPORT_FORMAT_TYPE(isShowExportFileType);
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
    MUTATE_IS_SHOW_CREATE_FOLDER_FORM(isShowCreateFolderForm: boolean) {
        this.isShowCreateFolderForm = isShowCreateFolderForm;
    }

    @Mutation
    MUTATE_RECENT_OPENED_FOLDER_KEY(recentOpenedFolderKey: TreeKey) {
        this.recentOpenedFolderKey = recentOpenedFolderKey;
    }

    @Mutation
    MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup: boolean) {
        this.isShowUploadFormPopup = isShowUploadFormPopup;
    }

    @Mutation
    MUTATE_ABS_VIEW_MODE(absViewMode: AbsViewMode) {
        this.absViewMode = absViewMode;
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
    MUTATE_SELECTED_FILE_TYPE(type: ABSUploadedFileExtensions | null) {
        this.selectedFileType = type;
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
    MUTATE_SELECTED_FILE_PATHS(selectedFilePaths: string[]) {
        this.selectedFilePaths = selectedFilePaths;
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGN_TO_PBS_FORM(isShowAssignToPBSForm: boolean) {
        this.isShowAssignToPBSForm = isShowAssignToPBSForm;
    }

    @Mutation
    MUTATE_SELECTED_FILE_ID(selectedFileId: string) {
        this.selectedFileId = selectedFileId;
    }

    @Mutation
    MUTATE_IS_SHOW_FILE_ASSIGN_CHECK_BOX(isShowFileAssignCheckBox: boolean) {
        this.isShowFileAssignCheckBox = isShowFileAssignCheckBox;
    }

    @Mutation
    MUTATE_SELECTED_FILE_IDS(selectedFileIds: string[]) {
        this.selectedFileIds = selectedFileIds;
    }

    @Mutation
    MUTATE_IS_ASSIGNING_TO_4D_FILE(isAssigningTo4DFile: boolean) {
        this.isAssigningTo4DFile = isAssigningTo4DFile;
    }

    @Mutation
    MUTATE_IS_ASSIGNING_TO_PLANNING_FILE(isAssigningToPlanningFile: boolean) {
        this.isAssigningToPlanningFile = isAssigningToPlanningFile;
    }

    @Mutation
    MUTATE_IS_ASSIGNING_TO_4D_BOX_FILE(isAssigningToPlanningFile: boolean) {
        this.isAssigningToPlanningFile = isAssigningToPlanningFile;
    }

    @Mutation
    MUTATE_IS_SHOW_SELECT_ABS_FILE_POPUP(isShowSelectABSFilePopup: boolean) {
        this.isShowSelectABSFilePopup = isShowSelectABSFilePopup;
    }

    @Mutation
    MUTATE_SELECTED_FILE(selectedFile: IFTPFile) {
        this.selectedFile = selectedFile;
    }

    @Mutation
    MUTATE_ABS_QUERY_STRING(absQueryString: IABSQueryString) {
        this.absQueryString = {
            ...this.absQueryString,
            ...absQueryString,
        };
    }

    @Mutation
    MUTATE_PARENT_FOLDER_NAME(parentFolderName: string) {
        this.parentFolderName = parentFolderName;
    }

    @Mutation
    MUTATE_PROJECT_FOLDER_ASSIGN_PBS(projectFolderAssignPbs: IFTPFile[]) {
        this.projectFolderAssignPbs = projectFolderAssignPbs;
    }

    @Mutation
    MUTATE_IS_ASSIGN_PBS_TO_FOLDER(isAssignPbsToFolder: boolean) {
        this.isAssignPbsToFolder = isAssignPbsToFolder;
    }

    @Mutation
    MUTATE_IS_SHOW_EXPORT_FORMAT_TYPE(isShowFileType: boolean) {
        this.isShowExportFileType = isShowFileType;
    }
}

export const absModule = getModule(AbsModule);
