<template>
    <BaseUploadMultiple
        :uploadUrl="uploadUrl"
        :data="customData"
        :title="$t('repository.uploadFormPopup.title')"
        :isShowImportForm="isShowUploadFormPopup"
        :maxFileSize="MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE"
        :existFiles="folderFiles"
        customClass="upload-form-popup"
        @onCloseImportForm="closePopup"
        @onSuccess="onSuccess"
    />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { repositoryModule } from '../store';
import { projectModule } from '@/features/project/store';
import { showSuccessNotificationFunction } from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE } from '@/common/constants';

export default class UploadFormDialog extends mixins(UtilMixins) {
    importErrorMessage = '';
    file: File | undefined;
    MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE = MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE;
    get isShowUploadFormPopup(): boolean {
        return repositoryModule.isShowUploadFormPopup;
    }
    get uploadUrl(): string {
        return `${process.env.VUE_APP_API_URL}/repository/file`;
    }

    get customData() {
        return {
            path: repositoryModule.currentPath,
        };
    }

    get folderFiles() {
        return repositoryModule.folderFiles.map((file) => file.name);
    }

    closePopup(): void {
        this.importErrorMessage = '';
        repositoryModule.setIsShowUploadFormPopup(false);
    }

    async onSuccess() {
        showSuccessNotificationFunction(
            this.$t('repository.uploadFormPopup.success.upload'),
        );
        const loading = ElLoading.service({
            target: '.page-wrapper',
        });
        await repositoryModule.getFolderFiles({
            projectId: projectModule.selectedProjectId || '',
            path: repositoryModule.currentPath,
        });
        loading.close();
    }
}
</script>

<style lang="scss" scoped></style>
