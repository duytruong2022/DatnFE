import { DialogType, DimensionType } from './constant';
import { authService } from '@/features/auth/services/api.services';
import { webViewer3DService } from './services/api.service';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { ILoadFile } from './interfaces';
import i18n from '@/plugins/vue-i18n';
import { showSuccessNotificationFunction } from '@/common/helpers';
import { repositoryModule } from '../repository/store';
import { ElLoading } from 'element-plus';

@Module({ dynamic: true, namespaced: true, store, name: 'web-viewer-3D' })
class WebViewer3DModule extends VuexModule {
    sessionToken: null | string = null;
    viewer3dPermissions: string[] = [];
    openFilePaths: null | string[] = null;
    openFileId: null | string = null;
    isShowUploadFormPopup = false;
    isShowImportFormPopup = false;
    isShowRepositoryPopup = false;
    isShowAbsPopup = false;
    dialogType: DialogType = DialogType.OPEN;
    openFileParentPath = '/';
    openTypeFile: string | null = null;
    extendPermission: string[] = ['T_CUSTOM_FILE_G_3D_BROKER'];
    @Action
    async getViewer3dPermissions() {
        const response = await authService.getviewer3dPermissions();
        if (response.success) {
            this.MUTATE_VIEWER3D_PERMISSIONS(response.data?.viewer3dPermissions || '');
        } else {
            this.MUTATE_VIEWER3D_PERMISSIONS([]);
        }
    }

    @Action
    async getSessionToken() {
        const response = await webViewer3DService.getSessionToken();
        if (response.success) {
            this.MUTATE_SESSION_TOKEN(response.data?.sessionToken || '');
        } else {
            this.MUTATE_SESSION_TOKEN('');
        }
    }

    @Action
    async getOpenTypeFile(sessionToken: string) {
        const response = await webViewer3DService.getTypeFileOpen(sessionToken);
        if (response.success) {
            this.setTypeFileOpen(response?.data.typeFileOpen);
        } else {
            this.setTypeFileOpen(null);
        }
    }

    @Action
    setOpenFilePaths(openFilePaths: null | string[]) {
        this.MUTATE_OPEN_FILE_PATHS(openFilePaths);
    }

    @Action
    setOpenFileId(openFileId: null | string) {
        this.MUTATE_OPEN_FILE_ID(openFileId);
    }

    @Action
    async loadFile(data: ILoadFile) {
        const loading = ElLoading.service({});
        const response = await webViewer3DService.loadFile(data);
        if (response.success) {
            showSuccessNotificationFunction(i18n.global.t('viewer3d.success.load'));
            this.MUTATE_OPEN_FILE_ID(response.data?.fileId || '');
            repositoryModule.setRecentOpenedFolderKey(response.data.parentFolderPath);
            repositoryModule.setCurrentPath(response.data.parentFolderPath);
        } else {
            this.MUTATE_OPEN_FILE_ID(null);
        }
        loading.close();
    }

    @Action
    setSessionToken(sessionToken: string | null) {
        this.MUTATE_SESSION_TOKEN(sessionToken);
    }

    @Action
    setTypeFileOpen(typeFileOpen: string | null) {
        this.MUTATE_TYPE_FILE_OPEN(typeFileOpen);
    }

    @Action
    setIsShowUploadFormPopup(isShowUploadFormPopup: boolean) {
        this.MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup);
    }

    @Action
    setIsShowImportFormPopup(isShowImportFormPopup: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_FORM_POPUP(isShowImportFormPopup);
    }

    @Action
    setIsShowRepositoryPopup(isShowRepositoryPopup: boolean) {
        this.MUTATE_IS_SHOW_REPOSITORY_POPUP(isShowRepositoryPopup);
    }

    @Action
    setIsShowAbsPopup(isShowAbsPopup: boolean) {
        this.MUTATE_IS_SHOW_ABS_POPUP(isShowAbsPopup);
    }

    @Action
    setDialogType(dialogType: DialogType) {
        this.MUTATE_DialogType(dialogType);
    }

    @Action
    setOpenFileParentPath(openFileParentPath: string) {
        this.MUTATE_OPEN_FILE_PARENT_PATH(openFileParentPath);
    }

    @Mutation
    MUTATE_SESSION_TOKEN(sessionToken: null | string) {
        this.sessionToken = sessionToken;
    }

    @Mutation
    MUTATE_TYPE_FILE_OPEN(typeFileOpen: string | null) {
        this.openTypeFile = typeFileOpen as DimensionType;
    }

    @Mutation
    MUTATE_VIEWER3D_PERMISSIONS(permissions: string[]) {
        this.viewer3dPermissions = permissions;
    }

    @Mutation
    MUTATE_OPEN_FILE_PATHS(openFilePaths: null | string[]) {
        this.openFilePaths = openFilePaths;
    }

    @Mutation
    MUTATE_OPEN_FILE_ID(openFileId: null | string) {
        this.openFileId = openFileId;
    }

    @Mutation
    MUTATE_IS_SHOW_UPLOAD_FORM_POPUP(isShowUploadFormPopup: boolean) {
        this.isShowUploadFormPopup = isShowUploadFormPopup;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_FORM_POPUP(isShowImportFormPopup: boolean) {
        this.isShowImportFormPopup = isShowImportFormPopup;
    }

    @Mutation
    MUTATE_IS_SHOW_REPOSITORY_POPUP(isShowRepositoryPopup: boolean) {
        this.isShowRepositoryPopup = isShowRepositoryPopup;
    }

    @Mutation
    MUTATE_IS_SHOW_ABS_POPUP(isShowAbsPopup: boolean) {
        this.isShowAbsPopup = isShowAbsPopup;
    }

    @Mutation
    MUTATE_DialogType(dialogType: DialogType) {
        this.dialogType = dialogType;
    }

    @Mutation
    MUTATE_OPEN_FILE_PARENT_PATH(openFileParentPath: string) {
        this.openFileParentPath = openFileParentPath;
    }
}

export const webViewer3DModule = getModule(WebViewer3DModule);
