<template>
    <div class="file-table">
        <div class="breadcrumb-container">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{
                    $t('abs.table.breadcrumb.project')
                }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ selectedProject?.name }}</el-breadcrumb-item>
                <el-breadcrumb-item
                    v-for="folder in openedFolders"
                    :key="`folder-${folder}`"
                    >{{ folder }}</el-breadcrumb-item
                >
            </el-breadcrumb>
        </div>
        <div class="button-group">
            <el-button
                @click="onClickButton"
                class="action-button"
                v-show="isShowImportButton || isShowOpenMultipleButton"
                >{{ $t(labelButton) }}</el-button
            >
        </div>
        <BaseTableLayout
            :data="folderFiles"
            :totalItems="folderFiles.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @selection-change="onSelectionChange"
        >
            <template #table-columns>
                <el-table-column type="selection" width="55" />
                <el-table-column
                    :label="$t('abs.table.header.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.type')"
                    align="center"
                    width="150"
                >
                    <template #default="scope">
                        {{ getFileType(scope.row?.name) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.createdBy')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.user?.firstName }}
                        {{ scope.row?.user?.lastName }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.4d')"
                    align="center"
                    width="100"
                >
                    <template #default="scope">
                        <el-button
                            :scope="scope.row?._id"
                            type="small"
                            :disabled="
                                !canAssignTo4D(
                                    scope.row?.name || '',
                                    scope.row?._id || '',
                                )
                            "
                            @click.stop="onClickAssign4D(scope.row?._id, scope.row?.path)"
                            >{{ $t('abs.table.action.assign') }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.pbs')"
                    align="center"
                    width="100"
                >
                    <template #default="scope">
                        <el-button
                            :id="scope.row?._id"
                            type="small"
                            :disabled="
                                !canAssignToPbs(
                                    scope.row?.name || '',
                                    scope.row?._id || '',
                                )
                            "
                            @click="onClickAssignToPbs(scope.row?._id, scope.row?.path)"
                            >{{ $t('abs.table.action.assign') }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.4DBox')"
                    align="center"
                    width="100"
                >
                    <template #default="scope">
                        <el-button
                            :id="scope.row?._id"
                            type="small"
                            :disabled="
                                !canAssignTo4DBox(
                                    scope.row?.name || '',
                                    scope.row?._id || '',
                                )
                            "
                            @click="onClickAssign4DBox(scope.row?._id, scope.row?.path)"
                            >{{ $t('abs.table.action.assign') }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.planning')"
                    align="center"
                    width="120"
                >
                    <template #default="scope">
                        <el-button
                            :id="scope.row?._id"
                            type="small"
                            :disabled="!canAssignToPlanning(scope.row?.name)"
                            @click="
                                onClickAssignPlanning(scope.row?._id, scope.row?.path)
                            "
                            >{{ $t('abs.table.action.assign') }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.modifiedDate')"
                    width="220"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.modifyTime) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.size')"
                    min-width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ getFileSize(scope.row?.size) }}
                    </template>
                </el-table-column>
                <el-table-column align="center">
                    <template #default="scope">
                        <el-dropdown
                            trigger="click"
                            v-if="
                                canRenameDataInABS(scope.row?._id || '') ||
                                canDownloadDataInABS(scope.row?._id || '') ||
                                canDeleteDataInABS(scope.row?._id || '')
                            "
                        >
                            <span class="el-dropdown-link">
                                <SettingIcon class="icon" />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-if="is3DFile(scope.row.name)"
                                        @click="onClickOpenFile([scope.row?.path])"
                                        >{{
                                            $t('abs.table.action.open')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="
                                            onClickRenameFile(
                                                scope.row?.path,
                                                scope.row?.name,
                                                getFileType(scope.row?.path || ''),
                                            )
                                        "
                                        v-if="canRenameDataInABS(scope.row?._id || '')"
                                        >{{
                                            $t('abs.table.action.rename')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="onClickDownload(scope.row)"
                                        v-if="canDownloadDataInABS(scope.row?._id || '')"
                                        >{{
                                            $t('abs.table.action.download')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="handleClickDeleteFile(scope.row)"
                                        v-if="canDeleteDataInABS(scope.row?._id || '')"
                                        >{{
                                            $t('abs.table.action.delete')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="onClickView(scope.row)"
                                        v-if="
                                            getFileType(scope.row?.name) ===
                                                ABSUploadedFileExtensions.PLANNING &&
                                            canReadWBS(scope.row?._id || '')
                                        "
                                        >{{ $t('abs.table.action.view') }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
        <AssignToPBSForm />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { absModule } from '../store';

import {
    Document as DocumentIcon,
    Setting as SettingIcon,
    View,
} from '@element-plus/icons-vue';
import {
    getPbsGroupPermissionsForFile,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { AbsFileMixin } from '../mixin';
import { IBodyResponse, IFTPFile } from '@/common/interfaces';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import {
    ABSUploadedFileExtensions,
    Box4DExtensions,
    PlanningExtensions,
    viewer3DFileExtensions,
    Viewer4DExtensions,
} from '../constants';
import AssignToPBSForm from './forms/AssignToPBSForm.vue';
import { ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';
import { projectPlanningService } from '@/features/4D-planning/services/planning.service';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { DialogType, ImportSource } from '@/features/3D-viewer/constant';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { projectService } from '@/features/project/services/project.service';
import { IProject } from '@/features/project/interfaces';
import { rootFolderPath } from '@/common/constants';
import localStorageAuthService from '@/common/authStorage';

@Options({
    components: {
        DocumentIcon,
        SettingIcon,
        View,
        AssignToPBSForm,
    },
})
export default class FileTable extends mixins(AbsFileMixin) {
    ABSUploadedFileExtensions = ABSUploadedFileExtensions;
    planningNameExtension = ABSUploadedFileExtensions.PLANNING;

    // eslint-disable-next-line vue/return-in-computed-property
    get labelButton() {
        if (this.isShowOpenMultipleButton) {
            return 'abs.table.action.open';
        } else if (this.isShowImportButton) {
            return 'abs.table.action.import';
        }
        return '';
    }

    get projectFolderAssignPbs() {
        return absModule.projectFolderAssignPbs;
    }

    get pbsGroupPermissions() {
        return localStorageAuthService.getPbsGroupPermissions();
    }

    get folderFiles(): IFTPFile[] {
        return absModule.folderFiles;
    }

    get isShowOpenMultipleButton(): boolean {
        const non3DFileSelected = absModule.selectedFilePaths.find(
            (path) => !this.is3DFile(path),
        );
        if (non3DFileSelected) {
            return false;
        }
        return absModule.selectedFilePaths.length > 0 && !this.isShowImportButton;
    }

    get isShowImportButton(): boolean {
        const non3DFileSelected = absModule.selectedFilePaths.find(
            (path) => !this.is3DFile(path),
        );
        if (non3DFileSelected) {
            return false;
        }
        return (
            webViewer3DModule.dialogType === DialogType.IMPORT &&
            absModule.selectedFilePaths.length > 0 &&
            webViewer3DModule?.openFileId !== null
        );
    }

    get openedFolders() {
        if (absModule.currentPath === rootFolderPath) {
            return [];
        }
        return absModule.currentPath.split('/').filter((folder) => !!folder.length);
    }

    canRenameDataInABS(fileId: string): boolean {
        return getPbsGroupPermissionsForFile(
            this.projectFolderAssignPbs,
            this.folderFiles,
            this.pbsGroupPermissions,
            fileId,
        )?.includes(ProjectSecurityPermissions.GENERAL_RENAME_DATA_IN_ABS);
    }

    canDeleteDataInABS(fileId: string): boolean {
        return getPbsGroupPermissionsForFile(
            this.projectFolderAssignPbs,
            this.folderFiles,
            this.pbsGroupPermissions,
            fileId,
        )?.includes(ProjectSecurityPermissions.GENERAL_DELETE_IN_ABS);
    }

    canDownloadDataInABS(fileId: string): boolean {
        return getPbsGroupPermissionsForFile(
            this.projectFolderAssignPbs,
            this.folderFiles,
            this.pbsGroupPermissions,
            fileId,
        )?.includes(ProjectSecurityPermissions.GENERAL_DOWNLOAD_DATA_IN_ABS);
    }

    canReadWBS(fileId: string): boolean {
        return getPbsGroupPermissionsForFile(
            this.projectFolderAssignPbs,
            this.folderFiles,
            this.pbsGroupPermissions,
            fileId,
        )?.includes(ProjectSecurityPermissions['4DPLANNING_READ_WBS_STRUCTURE']);
    }

    async handleClickDeleteFile(row: IFTPFile): Promise<void> {
        const type = this.getFileType(row?.path || '');
        if (type === ABSUploadedFileExtensions.PLANNING) {
            const confirm = await showConfirmPopUpFunction(
                this.$t('abs.fileForm.delete.confirm.message'),
                this.$t('abs.fileForm.delete.confirm.title'),
            );
            if (confirm) {
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                // call api to delete planning, the backend server will also delete the file in ftp server.
                const splitPath = row?.path?.split('/') || [''];
                const planningResponse = await projectPlanningService.getPlanning(
                    projectModule.selectedProjectId as string,
                    // {
                    //     name: row?.name.split('.')?.[0],
                    //     planningFilePath:
                    //         splitPath.slice(0, splitPath.length - 1).join('/') || '/',
                    //     path: localStorageAuthService.getPlanningPermissions().path || '',
                    //     projectId: projectModule.selectedProjectId || '',
                    // },
                );
                if (planningResponse.success) {
                    const response = await projectPlanningService.deletePlanning(
                        planningResponse.data._id,
                    );
                    if (response.success) {
                        showSuccessNotificationFunction(
                            this.$t('abs.fileForm.success.delete'),
                        );
                    } else if (!response.isRequestError) {
                        showErrorNotificationFunction(response.message);
                    }
                }
                await absModule.getFolderFiles({
                    projectId: projectModule.selectedProjectId || '',
                    path: absModule.currentPath,
                });
                loading.close();
            }
        } else {
            this.onClickDeleteFile(row?.path as string);
        }
    }

    get isShowFileAssignCheckBox(): boolean {
        return absModule.isShowFileAssignCheckBox;
    }

    get selectedFileIds(): string[] {
        return absModule.selectedFileIds;
    }

    set selectedFileIds(selectedFileIds: string[]) {
        absModule.setSelectedFileIds(selectedFileIds);
    }

    get isAssigningTo4DFile(): boolean {
        return absModule.isAssigningTo4DFile;
    }

    get isAssigningToPlanningFile(): boolean {
        return absModule.isAssigningToPlanningFile;
    }

    get selectedProject() {
        return projectModule.selectedProject;
    }

    async mounted() {
        const loading = ElLoading.service({
            target: '.main-wrapper',
        });
        const response = (await projectService.getDetail(
            projectModule.selectedProjectId || '',
        )) as IBodyResponse<IProject>;
        loading.close();
        if (response.success) {
            projectModule.setSelectedProject(response.data);
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }

    unmounted() {
        absModule.setSelectedFilePaths([]);
    }

    canAssignToPbs(fileName: string, fileId: string) {
        const fileType = this.getFileType(fileName);
        return (
            [
                ...PlanningExtensions,

                ...Viewer4DExtensions,
                ...Box4DExtensions,
                ...viewer3DFileExtensions,
            ].includes(fileType as ABSUploadedFileExtensions) &&
            getPbsGroupPermissionsForFile(
                this.projectFolderAssignPbs,
                this.folderFiles,
                this.pbsGroupPermissions,
                fileId,
            )?.includes(ProjectSecurityPermissions.GENERAL_ASSIGN_PBS_TO_PLANNING)
        );
    }

    canAssignTo4D(fileName: string, fileId: string) {
        const fileType = this.getFileType(fileName);
        return (
            [
                ...PlanningExtensions,
                ...Box4DExtensions,
                ...viewer3DFileExtensions,
            ].includes(fileType as ABSUploadedFileExtensions) &&
            getPbsGroupPermissionsForFile(
                this.projectFolderAssignPbs,
                this.folderFiles,
                this.pbsGroupPermissions,
                fileId,
            )?.includes(ProjectSecurityPermissions.GENERAL_ASSIGN_4DBOX_TO_PLANNING)
        );
    }

    canAssignTo4DBox(fileName: string, fileId: string) {
        const fileType = this.getFileType(fileName);
        return (
            [...PlanningExtensions, ...Viewer4DExtensions].includes(
                fileType as ABSUploadedFileExtensions,
            ) &&
            getPbsGroupPermissionsForFile(
                this.projectFolderAssignPbs,
                this.folderFiles,
                this.pbsGroupPermissions,
                fileId,
            )?.includes(ProjectSecurityPermissions.GENERAL_ASSIGN_4DBOX_TO_PLANNING)
        );
    }

    canAssignToPlanning(fileName: string) {
        const fileType = this.getFileType(fileName);
        return [
            ...PlanningExtensions,
            ...Viewer4DExtensions,
            ...viewer3DFileExtensions,
        ].includes(fileType as ABSUploadedFileExtensions);
    }

    getFileType(fileName: string) {
        if (!fileName) {
            return '';
        }

        const fileNameSplitted = fileName.split('.');

        if (fileNameSplitted.length > 1) {
            return `.${fileNameSplitted[fileNameSplitted.length - 1]}`;
        }
        return '';
    }

    async onClickView(row: IFTPFile) {
        const splitPath = row?.path?.split('/') || [''];
        const nameParts = row?.name.split('.');
        const response = await projectPlanningService.getPlanningByPathAndName({
            name: nameParts.slice(0, nameParts.length - 1).join('.'),
            planningFilePath: splitPath.slice(0, splitPath.length - 1).join('/') || '/',
            path: localStorageAuthService.getPlanningPermissions().path || '',
            projectId: projectModule.selectedProjectId || '',
        });
        localStorageAuthService.setPlanningPermissions({
            path: row.path || '',
            permissions: getPbsGroupPermissionsForFile(
                this.projectFolderAssignPbs,
                this.folderFiles,
                this.pbsGroupPermissions,
                row._id,
            ),
        });

        if (response.success) {
            this.$router.push({
                path: '/project/4d-planning',
                query: {
                    name: response.data.name,
                    planningFilePath: response.data.planningFilePath,
                },
            });
        }
    }

    onSelectionChange(rows: IFTPFile[]) {
        absModule.setSelectedFilePaths(rows.map((row) => row?.path || ''));
        absModule.setSelectedFileIds(rows.map((row) => row?._id || ''));
    }

    onClickAssignToPbs(fileId: string, path: string) {
        absModule.setSelectedFileId(fileId);
        absModule.setIsShowAssignToPBSForm(true);
        absModule.setSelectedFilePath(path);
    }

    onClickAssign4D(fileId: string, path: string) {
        absModule.setSelectedFileId(fileId);
        absModule.setIsShowFileAssignCheckBox(true);
        absModule.setIsAssigningTo4DFile(true);
        absModule.setIsShowSelectABSFilePopup(true);
        absModule.setSelectedFilePath(path);
        absModule.setABSQueryString({
            extensions: Viewer4DExtensions,
        });
    }

    onClickAssignPlanning(fileId: string, path: string) {
        absModule.setSelectedFileId(fileId);
        absModule.setIsShowFileAssignCheckBox(true);
        absModule.setIsAssigningToPlanningFile(true);
        absModule.setIsShowSelectABSFilePopup(true);
        absModule.setSelectedFilePath(path);
        absModule.setABSQueryString({
            extensions: PlanningExtensions,
        });
    }

    onClickAssign4DBox(fileId: string, path: string) {
        absModule.setSelectedFileId(fileId);
        absModule.setIsShowFileAssignCheckBox(true);
        absModule.setIsAssigningTo4DBoxFile(true);
        absModule.setIsShowSelectABSFilePopup(true);
        absModule.setSelectedFilePath(path);
        absModule.setABSQueryString({
            extensions: Box4DExtensions,
        });
    }

    onClickButton() {
        if (this.isShowOpenMultipleButton) {
            this.onClickOpenMultipleFiles();
        } else if (this.isShowImportButton) {
            this.onClickImportFile();
        }
    }

    async onClickOpenMultipleFiles() {
        this.onClickOpenFile(absModule.selectedFilePaths);
    }

    async onClickImportFile() {
        const loading = ElLoading.service({});
        const response = await webViewer3DService.importFile({
            sessionToken: webViewer3DModule.sessionToken || '',
            filePaths: absModule.selectedFilePaths,
            source: ImportSource.ABS,
            projectId: projectModule.selectedProjectId || '',
        });
        if (response.success) {
            webViewer3DModule.setIsShowRepositoryPopup(false);
            showSuccessNotificationFunction(
                this.$t('viewer3d.repositoryPopup.message.import'),
            );
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }
}
</script>

<style scoped lang="scss">
.file-table {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 0px;

    .button-group {
        padding-left: 20px;
        flex: auto;
    }
    .breadcrumb-container {
        padding-left: 20px;
        font-size: 13px;
        min-height: 30px;
    }
}
.icon {
    width: 18px;
}
</style>
