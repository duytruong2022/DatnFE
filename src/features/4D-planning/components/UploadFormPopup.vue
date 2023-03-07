<template>
    <BaseUploadMultiple
        :uploadUrl="uploadUrl"
        :data="customData"
        :title="$t('viewer3d.uploadForm.title')"
        :isShowImportForm="isShowUploadFormPopup"
        :maxFileSize="MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE"
        :autoUpload="false"
        customClass="upload-form-popup"
        @onCloseImportForm="closePopup"
        @onSuccess="onSuccess"
        @submitUpload="submitUpload"
    />
</template>
<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE, megaByteToByteRate } from '@/common/constants';
import { IBodyResponse, UploadMultipleRef } from '@/common/interfaces';
import { IOpenMultipleResponse } from '@/features/3D-viewer/interfaces';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { absModule } from '@/features/abs/store';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { UploadUserFile, ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';
import { ImportSource } from '@/features/3D-viewer/constant';

export default class UploadFormDialog extends mixins(UtilMixins) {
    importErrorMessage = '';
    file: File | undefined;
    MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE = MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE;
    get isShowUploadFormPopup(): boolean {
        return webViewer3DModule.isShowUploadFormPopup;
    }

    closePopup(): void {
        webViewer3DModule.setIsShowUploadFormPopup(false);
    }

    async onUploadSuccess(
        response: IBodyResponse<IOpenMultipleResponse>,
        uploadMultipleRef: UploadMultipleRef,
    ) {
        showSuccessNotificationFunction(this.$t('viewer3d.success.upload') as string);
        webViewer3DModule.setOpenFileId(response.data?.fileId || '');
        absModule.setRecentOpenedFolderKey(response?.data?.parentFolderPath);
        absModule.setCurrentPath(response?.data?.parentFolderPath);
        uploadMultipleRef.clearFiles();
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
        formData.append('sessionToken', webViewer3DModule.sessionToken || '');
        formData.append('projectId', projectModule.selectedProjectId || '');
        formData.append('source', ImportSource.ABS);
        const loading = ElLoading.service({});
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
                const response = await webViewer3DService.uploadOpenMultiple(formData);
                if (response?.success) {
                    this.onUploadSuccess(response, uploadMultipleRef);
                }
            }
        } else {
            const response = await webViewer3DService.uploadOpenMultiple(formData);
            if (response?.success) {
                this.onUploadSuccess(response, uploadMultipleRef);
            }
        }
        loading.close();
        webViewer3DModule.setIsShowUploadFormPopup(false);
    }
}
</script>

<style lang="scss" scoped></style>
