import { mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import {
    showConfirmPopUpFunction,
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
    downloadFile,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { projectModule } from '../project/store';
import {
    AbsDataType,
    ABSUploadedFileExtensions,
    viewer3DFileExtensions,
} from './constants';
import { absService } from './services/abs.service';
import { absModule } from './store';
import {
    kiloByteToByteRateInDecimal,
    megaByteToByteRateInDecimal,
    PageName,
} from '@/common/constants';
import moment from 'moment';
import router from '@/plugins/vue-router';
import { webViewer3DModule } from '../3D-viewer/store';
import { IFTPFile } from '@/common/interfaces';
import i18n from '@/plugins/vue-i18n';
import Socket from '@/plugins/socket/socket';
import { projectPlanningService } from '../4D-planning/services/planning.service';
import { webViewer3DService } from '../3D-viewer/services/api.service';
export class AbsFileMixin extends mixins(UtilMixins) {
    is3DFile(fileName: string) {
        const fileNameSplitted = fileName.split('.');
        const fileExtension = fileNameSplitted[fileNameSplitted.length - 1];
        return viewer3DFileExtensions
            .map((extension) => extension as string)
            .includes(`.${fileExtension}`);
    }

    onClickRenameFile(path: string, fileName: string, type?: ABSUploadedFileExtensions) {
        absModule.setSelectedFileName(fileName);
        absModule.setSelectedFilePath(path);
        absModule.setIsShowFileForm(true);
        absModule.setSelectedFileType(type || null);
    }

    async onClickDeleteFile(path: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('abs.fileForm.delete.confirm.message'),
            this.$t('abs.fileForm.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const response = await absService.deleteFolderAndFile({
                path,
                type: AbsDataType.FILE,
                projectId: projectModule.selectedProjectId || '',
            });
            if (response.success) {
                showSuccessNotificationFunction(this.$t('abs.fileForm.success.delete'));
                await absModule.getFolderFiles({
                    projectId: projectModule.selectedProjectId || '',
                    path: absModule.currentPath,
                });
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
            loading.close();
        }
    }

    async onClickDownload(file: IFTPFile) {
        if (this.getFileType(file?.name) === ABSUploadedFileExtensions.PLANNING) {
            const socketClientId = Socket.getSocket()?.id;
            if (!socketClientId) {
                showErrorNotificationFunction(
                    i18n.global.t('supportRequest.exportCSV.error.connectSocketFail'),
                );
                return;
            }
            const splitPath = file?.path?.split('/') || [''];
            const nameParts = file.name.split('.');

            await projectPlanningService.exportPlanning({
                projectId: projectModule.selectedProjectId || '',
                name: nameParts.slice(0, nameParts.length - 1).join('.'),
                planningFilePath:
                    splitPath.slice(0, splitPath.length - 1).join('/') || '/',
                socketClientId,
            });
        } else {
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const response = await absService.downloadFolderAndFile({
                path: file?.path || '',
                projectId: projectModule.selectedProjectId || '',
            });
            loading.close();
            downloadFile(response.data.downloadFileName, response.data.downloadUrl);
        }
    }

    getFileSize(fileSize: number) {
        // as we round the size to 2 numbers after the dot so we need to subtract fileSize % 10000 to avoid rounding
        const sizeInMb = +(
            (fileSize - (fileSize % 10000)) /
            megaByteToByteRateInDecimal
        ).toFixed(2);

        if (sizeInMb > 0) {
            return `${sizeInMb} ${this.$t('abs.table.sizeUnit.mb')}`;
        }
        const sizeInKb = +(fileSize / kiloByteToByteRateInDecimal).toFixed(2);

        if (sizeInKb > 0) {
            return `${sizeInKb} ${this.$t('abs.table.sizeUnit.kb')}`;
        }
        return `${fileSize} ${this.$t('abs.table.sizeUnit.b')}`;
    }
    getFileType(fileName: string) {
        const fileNameSplitted = fileName.split('.');

        if (fileNameSplitted.length > 1) {
            return `.${fileNameSplitted[fileNameSplitted.length - 1]}`;
        }
        return '';
    }

    formatModifiedDate(timestamp: number) {
        return moment(timestamp).fmFullTimeWithoutSecond();
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
        } else if (webViewer3DModule.isShowAbsPopup) {
            webViewer3DModule.setIsShowAbsPopup(false);
        } else {
            router.push({
                name: PageName['3D_PAGE'],
            });
        }
    }
}
