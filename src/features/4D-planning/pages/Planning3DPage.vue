<template>
    <div class="webviewer-container">
        <iframe
            :src="webviewer3dUrl"
            style="width: 100%; height: calc(106vh - 147px)"
        ></iframe>
    </div>
    <UploadFormPopup />
    <AbsPopup />
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
import { ExportType } from '@/common/constants';
import {
    WEBVIEWER3D_URL,
    Viewer3DActions,
    DimensionType,
    DialogType,
    ImportSource,
} from '@/features/3D-viewer/constant';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import UploadFormPopup from '@/features/4D-planning/components/UploadFormPopup.vue';
import AbsPopup from '@/features/4D-planning/components/AbsPopup.vue';
import UploadImportFormPopup from '@/features/4D-planning/components/UploadImportFormPopup.vue';
import { projectModule } from '@/features/project/store';
import { absModule } from '@/features/abs/store';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { ElLoading } from 'element-plus';
import { projectPlanningModule } from '../store';

@Options({ components: { UploadFormPopup, AbsPopup, UploadImportFormPopup } })
export default class Planning3DPage extends Vue {
    viewer3dFullPermissions = structure3DViewerPermissions(
        Object.keys(ProjectSecurityPermissions).filter((p) =>
            p.startsWith(ProfilePermissionPrefix.WEBVIEWER3D),
        ),
    );
    currentFile = '';

    get viewer3dPermissions() {
        return structure3DViewerPermissions(webViewer3DModule.viewer3dPermissions);
    }

    get projectId() {
        return projectModule.selectedProjectId || '';
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
        if (projectPlanningModule.extendPermission?.length) {
            rawPermissions = rawPermissions.concat(
                projectPlanningModule.extendPermission,
            );
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

    get openTypeFile() {
        return webViewer3DModule.openTypeFile;
    }

    get openFilePath() {
        return webViewer3DModule.openFilePaths;
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
                    this.onClickOpenFromAbs();
                    break;
                case Viewer3DActions.CREATE_ZONE:
                    if (webViewer3DModule.openFileId) {
                        absModule.setDimensionType(DimensionType['3D']);
                        absModule.setExportType(ExportType.ZONE);
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        this.onClickSave();
                    }
                    break;
                case Viewer3DActions.CREATE_4D_BOX:
                    if (webViewer3DModule.openFileId) {
                        absModule.setDimensionType(DimensionType['3D']);
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        absModule.setExportType(ExportType.BOX4D);
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
                        this.onClickOpenFromAbs();
                    }
                    break;
                case Viewer3DActions.EXPORT:
                    if (webViewer3DModule.openFileId) {
                        await webViewer3DModule.getOpenTypeFile(this.sessionToken || '');
                        if (this.openTypeFile === DimensionType['3D']) {
                            absModule.setDimensionType(DimensionType['3D']);
                            absModule.setIsShowExportFileType(true);
                        }
                        if (this.openTypeFile === DimensionType['2D']) {
                            absModule.setDimensionType(DimensionType['2D']);
                            absModule.setIsShowExportFileType(false);
                        }
                        webViewer3DModule.setDialogType(DialogType.SAVE);
                        absModule.setExportType(ExportType.EXPORT);
                        this.onClickSave();
                    }
                    break;
                case Viewer3DActions.SAVE:
                    if (webViewer3DModule.openFileId) {
                        this.onClickOverrideSave();
                    }
                    break;
                case Viewer3DActions.SAVE_AS:
                    if (webViewer3DModule.openFileId) {
                        await webViewer3DModule.getOpenTypeFile(this.sessionToken || '');
                        if (this.openTypeFile === DimensionType['3D']) {
                            absModule.setDimensionType(DimensionType['3D']);
                            webViewer3DModule.setDialogType(DialogType.SAVE);
                            absModule.setExportType(ExportType.SAVE_AS);
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
        webViewer3DModule.setDialogType(DialogType.OPEN);
        webViewer3DModule.setTypeFileOpen(null);
        absModule.setIsShowExportFileType(false);
    }

    loadFile() {
        if (webViewer3DModule.openFilePaths?.length && webViewer3DModule.sessionToken) {
            webViewer3DModule.loadFile({
                filePaths: webViewer3DModule.openFilePaths,
                sessionToken: webViewer3DModule.sessionToken,
                projectId: this.projectId,
            });
        }
    }

    onClickUpload() {
        webViewer3DModule.setIsShowUploadFormPopup(true);
    }

    async onClickSave() {
        if (webViewer3DModule.openFileId?.length) {
            webViewer3DModule.setIsShowAbsPopup(true);
        }
    }

    async onClickOverrideSave() {
        const response = await webViewer3DService.overrideSaveFile({
            sessionToken: this.sessionToken || '',
            projectId: this.projectId,
            fileId: webViewer3DModule.openFileId || '',
        });
        if (response.success) {
            showSuccessNotificationFunction(response.message);
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    onClickOpenFromAbs() {
        webViewer3DModule.setIsShowAbsPopup(true);
    }

    @Watch('sessionToken')
    onChangeSessionToken(sessionToken: null | string) {
        if (webViewer3DModule.openFilePaths?.length && sessionToken) {
            webViewer3DModule.loadFile({
                filePaths: webViewer3DModule.openFilePaths,
                sessionToken,
                projectId: this.projectId,
            });
        }
    }

    @Watch('openFilePath')
    async onChangeOpenFilePath(openFilePaths: null | string[]) {
        if (openFilePaths?.length && webViewer3DModule.sessionToken) {
            await webViewer3DModule.loadFile({
                filePaths: openFilePaths,
                sessionToken: webViewer3DModule.sessionToken,
                projectId: this.projectId,
            });
            if (webViewer3DModule.openFileId) {
                const response = await webViewer3DService.getFile(
                    webViewer3DModule.openFileId,
                    {
                        projectId: this.projectId,
                    },
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
                            source: ImportSource.ABS,
                            projectId: this.projectId,
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
