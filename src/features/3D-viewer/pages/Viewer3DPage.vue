<template>
    <div class="webviewer-container">
        <iframe
            :src="webviewer3dUrl"
            style="width: 100%; height: calc(106vh - 147px)"
        ></iframe>
    </div>
    <UploadFormPopup />
    <RepositoryPopup />
    <UploadImportFormPopup />
</template>

<script lang="ts">
import {
    generateFullIndex,
    serializeObjectToURL,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
    structure3DViewerPermissions,
    transform3DViewerPermission,
} from '@/common/helpers';
import {
    ProfilePermissionPrefix,
    ProjectSecurityPermissions,
} from '@/features/3D-viewer-profile/constants';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import { Vue, Options } from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import {
    DialogType,
    DimensionType,
    ImportSource,
    Viewer3DActions,
    WEBVIEWER3D_URL,
} from '../constant';
import { webViewer3DModule } from '../store';
import UploadFormPopup from '../components/UploadFormPopup.vue';
import UploadImportFormPopup from '../components/UploadImportFormPopup.vue';
import RepositoryPopup from '../components/RepositoryPopup.vue';
import { repositoryModule } from '@/features/repository/store';
import { ExportType } from '@/common/constants';
import { webViewer3DService } from '../services/api.service';
import { ElLoading } from 'element-plus';

@Options({ components: { UploadFormPopup, RepositoryPopup, UploadImportFormPopup } })
export default class Viewer3DPage extends Vue {
    viewer3dFullPermissions = structure3DViewerPermissions(
        Object.keys(ProjectSecurityPermissions).filter((p) =>
            p.startsWith(ProfilePermissionPrefix.WEBVIEWER3D),
        ),
    );
    currentFile = '';

    get viewer3dPermissions() {
        return structure3DViewerPermissions(webViewer3DModule.viewer3dPermissions);
    }

    get webviewer3dUrl() {
        const permissions = cloneDeep(this.viewer3dFullPermissions);
        permissions.forEach((p) => {
            const currentTab = this.viewer3dPermissions.find((tab) => tab.tab === p.tab);
            p.groups.forEach((g) => {
                const currentGroup = currentTab?.groups.find(
                    (group) => group.group === g.group,
                );
                if (currentGroup && currentTab) {
                    g.withoutFunctions = difference(g.funcs, currentGroup?.funcs);
                } else {
                    g.withoutFunctions = g.funcs;
                }
            });
        });
        let rawPermissions = transform3DViewerPermission(generateFullIndex(permissions));
        if (webViewer3DModule.extendPermission?.length) {
            rawPermissions = rawPermissions.concat(webViewer3DModule.extendPermission);
        }
        return `${WEBVIEWER3D_URL}/index.html?token=${
            this.sessionToken
        }&${serializeObjectToURL({
            permissions: rawPermissions,
        })}`;
    }

    get sessionToken() {
        return webViewer3DModule.sessionToken;
    }

    get openFilePath() {
        return webViewer3DModule.openFilePaths;
    }

    get openTypeFile() {
        return webViewer3DModule.openTypeFile;
    }

    async beforeCreate() {
        await webViewer3DModule.getSessionToken();
        await webViewer3DModule.getViewer3dPermissions();
    }
    created() {
        this.loadFile();
        window.addEventListener('message', async (e) => {
            switch (e.data) {
                case Viewer3DActions.UPLOAD_FROM_LOCAL:
                    this.onClickUpload();
                    break;
                case Viewer3DActions.OPEN_FROM_REPOSITORY:
                    webViewer3DModule.setDialogType(DialogType.OPEN);
                    this.onClickOpenFromRepository();
                    break;
                case Viewer3DActions.CREATE_ZONE:
                    if (webViewer3DModule.openFileId) {
                        repositoryModule.setDimensionType(DimensionType['3D']);
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        repositoryModule.setExportType(ExportType.ZONE);
                        this.onClickSave();
                    }
                    break;
                case Viewer3DActions.CREATE_4D_BOX:
                    if (webViewer3DModule.openFileId) {
                        repositoryModule.setDimensionType(DimensionType['3D']);
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        repositoryModule.setExportType(ExportType.BOX4D);
                        this.onClickSave();
                    }
                    break;
                case Viewer3DActions.IMPORT_FROM_LOCAL:
                    if (webViewer3DModule.openFileId) {
                        webViewer3DModule.setDialogType(DialogType.IMPORT);
                        webViewer3DModule.setIsShowImportFormPopup(true);
                    }
                    break;
                case Viewer3DActions.IMPORT_FROM_REPOSITORY:
                    if (webViewer3DModule.openFileId) {
                        webViewer3DModule.setDialogType(DialogType.IMPORT);
                        this.onClickOpenFromRepository();
                    }
                    break;
                case Viewer3DActions.EXPORT:
                    if (webViewer3DModule.openFileId) {
                        await webViewer3DModule.getOpenTypeFile(this.sessionToken || '');
                        if (this.openTypeFile === DimensionType['3D']) {
                            repositoryModule.setDimensionType(DimensionType['3D']);
                            repositoryModule.setIsShowExportFileType(true);
                        }
                        if (this.openTypeFile === DimensionType['2D']) {
                            repositoryModule.setDimensionType(DimensionType['2D']);
                            repositoryModule.setIsShowExportFileType(false);
                        }
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        repositoryModule.setExportType(ExportType.EXPORT);
                        this.onClickSave();
                    }
                    break;
                case Viewer3DActions.SAVE:
                    if (webViewer3DModule.openFileId) {
                        await this.onClickOverrideSave();
                    }
                    break;
                case Viewer3DActions.SAVE_AS:
                    if (webViewer3DModule.openFileId) {
                        await webViewer3DModule.getOpenTypeFile(this.sessionToken || '');
                        if (this.openTypeFile === DimensionType['3D']) {
                            repositoryModule.setDimensionType(DimensionType['3D']);
                            webViewer3DModule.setDialogType(DialogType.SAVE);
                            repositoryModule.setExportType(ExportType.SAVE_AS);
                            this.onClickSave();
                        }
                    }
                    break;
            }
        });
    }
    unmounted() {
        webViewer3DModule.setSessionToken(null);
        webViewer3DModule.setOpenFileId(null);
        webViewer3DModule.setOpenFilePaths([]);
        webViewer3DModule.setTypeFileOpen(null);
        repositoryModule.setIsShowExportFileType(false);
        webViewer3DModule.setDialogType(DialogType.OPEN);
    }

    loadFile() {
        if (webViewer3DModule.openFilePaths?.length && webViewer3DModule.sessionToken) {
            webViewer3DModule.loadFile({
                filePaths: webViewer3DModule.openFilePaths,
                sessionToken: webViewer3DModule.sessionToken,
            });
        }
    }

    onClickUpload() {
        webViewer3DModule.setIsShowUploadFormPopup(true);
    }

    async onClickSave() {
        if (webViewer3DModule.openFileId?.length) {
            webViewer3DModule.setIsShowRepositoryPopup(true);
        }
    }

    async onClickOverrideSave() {
        const response = await webViewer3DService.overrideSaveFile({
            sessionToken: this.sessionToken || '',
            fileId: webViewer3DModule.openFileId || '',
        });
        if (response.success) {
            showSuccessNotificationFunction(response.message);
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    onClickOpenFromRepository() {
        webViewer3DModule.setIsShowRepositoryPopup(true);
    }

    @Watch('sessionToken')
    onChangeSessionToken(sessionToken: null | string) {
        if (webViewer3DModule.openFilePaths?.length && sessionToken) {
            webViewer3DModule.loadFile({
                filePaths: webViewer3DModule.openFilePaths,
                sessionToken,
            });
        }
    }

    @Watch('openFilePath')
    async onChangeOpenFilePath(openFilePaths: null | string[]) {
        if (openFilePaths?.length && webViewer3DModule.sessionToken) {
            await webViewer3DModule.loadFile({
                filePaths: openFilePaths,
                sessionToken: webViewer3DModule.sessionToken,
            });
            if (webViewer3DModule.openFileId) {
                const response = await webViewer3DService.getFile(
                    webViewer3DModule.openFileId,
                );
                if (response.success && response?.data?.importedFilePaths?.length) {
                    const file = response.data;
                    const confirm = await showConfirmPopUpFunction(
                        this.$t('viewer3d.import.confirm.message', {
                            importedFiles: file.importedFilePaths.join(', '),
                            currentFile: file.path,
                        }),
                        this.$t('viewer3d.import.confirm.title'),
                    );
                    if (confirm) {
                        const loading = ElLoading.service({});
                        const response = await webViewer3DService.importFromRelatedFiles({
                            filePaths: file.importedFilePaths,
                            sessionToken: webViewer3DModule.sessionToken,
                            source: ImportSource.REPOSITORY,
                        });
                        if (response.success) {
                            showSuccessNotificationFunction(
                                this.$t('viewer3d.repositoryPopup.message.import'),
                            );
                        } else {
                            showErrorNotificationFunction(response.message);
                        }
                        loading.close();
                    }
                }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.webviewer-container {
    padding: 0 2px;
}
</style>
