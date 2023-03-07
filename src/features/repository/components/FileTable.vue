<template>
    <div class="file-table">
        <div class="breadcrumb-container">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{
                    $t('repository.table.breadcrumb.project')
                }}</el-breadcrumb-item>
                <el-breadcrumb-item
                    >{{ profile?.firstName }} {{ profile?.lastName }}</el-breadcrumb-item
                >
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
                v-show="isShowOpenButton || isShowImportButton"
                >{{ $t(labelButton) }}</el-button
            >
            <el-button
                type="danger"
                @click="onClickDeleteButton"
                v-show="isShowOpenButton || isShowImportButton"
                >{{ $t('abs.table.action.delete') }}</el-button
            >
        </div>
        <BaseTableLayout
            :data="folderFiles"
            :totalItems="folderFiles.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @selection-change="handleSelectionChange"
        >
            <template #table-columns>
                <el-table-column type="selection" width="55" />
                <el-table-column
                    :label="$t('repository.table.header.name')"
                    min-width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('repository.table.header.type')"
                    align="center"
                >
                    <template #default="scope">
                        {{ getFileType(scope.row?.name) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('repository.table.header.modifiedDate')"
                    min-width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.modifyTime) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('repository.table.header.size')"
                    align="center"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ getFileSize(scope.row.size) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('repository.table.header.action')"
                    align="center"
                >
                    <template #default="scope">
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                <SettingIcon class="icon" />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        @click="onClickOpenFile([scope.row.path])"
                                        >{{
                                            $t('repository.table.action.open')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="
                                            onClickRenameFile(
                                                scope.row.path,
                                                scope.row.name,
                                            )
                                        "
                                        >{{
                                            $t('repository.table.action.rename')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="onClickDownload(scope.row.path)"
                                        >{{
                                            $t('repository.table.action.download')
                                        }}</el-dropdown-item
                                    >
                                    <el-dropdown-item
                                        @click="onClickDeleteFile(scope.row.path)"
                                        >{{
                                            $t('repository.table.action.delete')
                                        }}</el-dropdown-item
                                    >
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import moment from 'moment';
import { mixins, Options } from 'vue-class-component';
import {
    Document as DocumentIcon,
    Setting as SettingIcon,
} from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import {
    downloadFile,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import { IFTPFile } from '@/common/interfaces';
import {
    FTPDataType,
    kiloByteToByteRateInDecimal,
    megaByteToByteRateInDecimal,
    rootFolderPath,
} from '@/common/constants';
import { repositoryModule } from '../store';
import { repositoryService } from '../services/api.service';
import { webViewer3DModule } from '@/features/3D-viewer/store';

import router from '@/plugins/vue-router';
import { PageName } from '@/common/constants';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { DialogType, ImportSource } from '@/features/3D-viewer/constant';
import { authModule } from '@/features/auth/store';

@Options({
    components: { DocumentIcon, SettingIcon },
})
export default class FileTable extends mixins(UtilMixins) {
    selectedFiles: string[] = [];
    // eslint-disable-next-line vue/return-in-computed-property
    get labelButton() {
        if (this.isShowOpenButton) {
            return 'abs.table.action.open';
        } else if (this.isShowImportButton) {
            return 'abs.table.action.import';
        }
        return '';
    }

    get folderFiles(): IFTPFile[] {
        return repositoryModule.folderFiles;
    }

    get isShowOpenButton(): boolean {
        return this.selectedFiles.length > 0 && !this.isShowImportButton;
    }

    get isShowImportButton(): boolean {
        return (
            webViewer3DModule.dialogType === DialogType.IMPORT &&
            this.selectedFiles.length > 0 &&
            webViewer3DModule?.openFileId !== null
        );
    }

    get openedFolders() {
        if (!repositoryModule.currentPath) {
            return [];
        }
        if (repositoryModule.currentPath === rootFolderPath) {
            return [];
        }
        return repositoryModule.currentPath
            .split('/')
            .filter((folder) => !!folder.length);
    }

    get profile() {
        return authModule.profile;
    }

    unmounted() {
        repositoryModule.setCurrentPath('');
        repositoryModule.setRecentOpenedFolderKey('');
    }

    getFileType(fileName: string) {
        const fileNameSplitted = fileName.split('.');
        if (fileNameSplitted.length > 1) {
            return `.${fileNameSplitted[fileNameSplitted.length - 1]}`;
        }
        return '';
    }

    getFileSize(fileSize: number) {
        // as we round the size to 2 numbers after the dot so we need to subtract fileSize % 10000 to avoid rounding
        const sizeInMb = +(
            (fileSize - (fileSize % 10000)) /
            megaByteToByteRateInDecimal
        ).toFixed(2);

        if (sizeInMb > 0) {
            return `${sizeInMb} ${this.$t('repository.table.sizeUnit.mb')}`;
        }
        const sizeInKb = +(fileSize / kiloByteToByteRateInDecimal).toFixed(2);

        if (sizeInKb > 0) {
            return `${sizeInKb} ${this.$t('repository.table.sizeUnit.kb')}`;
        }
        return `${fileSize} ${this.$t('repository.table.sizeUnit.b')}`;
    }

    formatModifiedDate(timestamp: number) {
        return moment(timestamp).fmFullTimeWithoutSecond();
    }

    onClickButton() {
        if (this.isShowOpenButton) {
            this.onClickOpenFile(this.selectedFiles);
        } else if (this.isShowImportButton) {
            this.onClickImportFile();
        }
    }

    onClickRenameFile(path: string, fileName: string) {
        repositoryModule.setSelectedFileName(fileName);
        repositoryModule.setSelectedFilePath(path);
        repositoryModule.setIsShowFileForm(true);
    }

    async onClickDeleteFile(path: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('repository.fileForm.delete.confirm.message'),
            this.$t('repository.fileForm.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const response = await repositoryService.deleteFolderAndFile({
                path,
                type: FTPDataType.FILE,
                projectId: projectModule.selectedProjectId || '',
            });
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('repository.fileForm.success.delete'),
                );
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                await repositoryModule.getFolderFiles({
                    projectId: projectModule.selectedProjectId || '',
                    path: repositoryModule.currentPath,
                });
                loading.close();
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
        }
    }

    async onClickDownload(path: string) {
        const loading = ElLoading.service({
            target: '.page-wrapper',
        });
        const response = await repositoryService.downloadFile({
            path,
            projectId: projectModule.selectedProjectId || '',
        });
        loading.close();
        downloadFile(response.data.downloadFileName, response.data.downloadUrl);
    }

    async onClickOpenFile(path: string[]) {
        if (webViewer3DModule.openFileId) {
            const confirm = await showConfirmPopUpFunction(
                this.$t('viewer3d.open.confirm.message'),
                this.$t('viewer3d.open.confirm.title'),
            );
            if (confirm) {
                await webViewer3DService.closeFile({
                    sessionToken: webViewer3DModule.sessionToken || '',
                });
                webViewer3DModule.setOpenFileId(null);
                webViewer3DModule.setOpenFilePaths(path);
            }
        } else {
            webViewer3DModule.setOpenFilePaths(path);
        }
        if (webViewer3DModule.isShowRepositoryPopup) {
            webViewer3DModule.setIsShowRepositoryPopup(false);
        } else {
            router.push({
                name: PageName.VIEWER_3D_PAGE,
            });
        }
    }

    async onClickImportFile() {
        const loading = ElLoading.service({});
        const response = await webViewer3DService.importFile({
            sessionToken: webViewer3DModule.sessionToken || '',
            filePaths: this.selectedFiles,
            source: ImportSource.REPOSITORY,
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

    async onClickDeleteButton() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('abs.fileForm.delete.confirm.message'),
            this.$t('abs.fileForm.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({});
            const response = await repositoryService.deleteMutipleFile({
                paths: this.selectedFiles,
            });
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('repository.fileForm.success.delete'),
                );
                await repositoryModule.getFolderFiles({
                    projectId: projectModule.selectedProjectId || '',
                    path: repositoryModule.currentPath,
                });
            } else {
                showErrorNotificationFunction(response.message);
            }
            loading.close();
            this.selectedFiles = [];
        }
    }

    handleSelectionChange(files: IFTPFile[]) {
        this.selectedFiles = files.map((file) => file.path || '');
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
