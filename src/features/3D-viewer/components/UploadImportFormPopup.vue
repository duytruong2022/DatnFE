<template>
    <BaseUploadMultiple
        :autoUpload="false"
        :data="customData"
        :title="$t('viewer3d.importForm.title')"
        :isShowImportForm="isShowImportFormPopup"
        :maxFileSize="MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE"
        customClass="upload-form-popup"
        @onCloseImportForm="closePopup"
        @submitUpload="submitUpload"
    />
</template>
<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE, megaByteToByteRate } from '@/common/constants';
import { webViewer3DModule } from '../store';
import { repositoryModule } from '@/features/repository/store';
import { IBodyResponse, UploadMultipleRef } from '@/common/interfaces';
import { ILoadFileResponse } from '../interfaces';
import { ElLoading, UploadUserFile } from 'element-plus';
import { ImportSource } from '../constant';
import { webViewer3DService } from '../services/api.service';

export default class UploadImportFormPopup extends mixins(UtilMixins) {
    importErrorMessage = '';
    file: File | undefined;
    MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE = MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE;
    get isShowImportFormPopup(): boolean {
        return webViewer3DModule.isShowImportFormPopup;
    }
    get uploadUrl(): string {
        return `${process.env.VUE_APP_API_URL}/webviewer/upload-import`;
    }

    get customData() {
        return {
            sessionToken: webViewer3DModule.sessionToken || '',
        };
    }

    closePopup(): void {
        webViewer3DModule.setIsShowImportFormPopup(false);
    }

    async submitUpload(fileList: UploadUserFile[], uploadMultipleRef: UploadMultipleRef) {
        let formData = new FormData();
        fileList.forEach((file) => {
            if (file.raw?.size && file.raw?.size > MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE) {
                const fileSizeInMB =
                    MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE / megaByteToByteRate;
                showErrorNotificationFunction(
                    this.$t('common.uploadMultiple.sizeLimit', {
                        size: fileSizeInMB,
                    }),
                );
                return;
            }
            formData.append('files', file.raw as File);
        });
        formData.append('source', ImportSource.REPOSITORY);
        formData.append('sessionToken', webViewer3DModule.sessionToken || '');
        const loading = ElLoading.service({});
        if (webViewer3DModule.openFileId) {
            const response = await webViewer3DService.uploadImportMultiple(formData);
            if (response?.success) {
                this.onSuccess(response, uploadMultipleRef);
            }
        }
        loading.close();
        this.closePopup();
    }
    async onSuccess(
        response: IBodyResponse<ILoadFileResponse>,
        uploadMultipleRef: UploadMultipleRef,
    ) {
        showSuccessNotificationFunction(this.$t('viewer3d.success.upload') as string);
        repositoryModule.setCurrentPath(response?.data?.parentFolderPath);
        uploadMultipleRef.clearFiles();
    }
}
</script>

<style lang="scss" scoped></style>
