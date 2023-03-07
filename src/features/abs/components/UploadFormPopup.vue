<template>
    <BaseUploadMultiple
        :uploadUrl="uploadUrl"
        :data="customData"
        :title="$t('abs.uploadFormPopup.title')"
        :isShowImportForm="isShowUploadFormPopup"
        :acceptedFileTypes="acceptedFileTypes"
        :existFiles="folderFiles"
        :maxFileSize="MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE"
        customClass="upload-form-popup"
        @onCloseImportForm="closePopup"
        @onSuccess="onSuccess"
    />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { absModule } from '../store';
import { projectModule } from '@/features/project/store';
import {
    hasPermissionToAccessRouteInProject,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import {
    ABSUploadedFileExtensions,
    Box4DExtensions,
    PlanningExtensions,
    viewer3DFileExtensions,
    Viewer4DExtensions,
} from '../constants';
import { ElLoading } from 'element-plus';
import { MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE } from '@/common/constants';

export default class UploadFormDialog extends mixins(UtilMixins) {
    importErrorMessage = '';
    file: File | undefined;
    MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE = MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE;
    get isShowUploadFormPopup(): boolean {
        return absModule.isShowUploadFormPopup;
    }

    get canUpload3D(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_UPLOAD_3D_TO_ABS,
        ]);
    }

    get canUpload4D(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_UPLOAD_4D_TO_ABS,
        ]);
    }

    get canUploadPlanning(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_UPLOAD_PLANNING_TO_ABS,
        ]);
    }

    get acceptedFileTypes(): string {
        const types: ABSUploadedFileExtensions[] = [];
        if (this.canUpload3D) {
            types.concat(viewer3DFileExtensions, Box4DExtensions);
        }
        if (this.canUpload4D) {
            types.concat(Viewer4DExtensions);
        }
        if (this.canUploadPlanning) {
            types.concat(PlanningExtensions);
        }

        return types.join(', ');
    }

    get uploadUrl(): string {
        return `${process.env.VUE_APP_API_URL}/abs/${projectModule.selectedProjectId}/file`;
    }

    get customData() {
        return {
            path: absModule.currentPath,
        };
    }

    get folderFiles() {
        return absModule.folderFiles.map((file) => file.name);
    }

    closePopup(): void {
        this.importErrorMessage = '';
        absModule.setIsShowUploadFormPopup(false);
    }

    async onSuccess() {
        showSuccessNotificationFunction(this.$t('abs.uploadFormPopup.success.upload'));
        const loading = ElLoading.service({
            target: '.page-wrapper',
        });
        await absModule.getFolderFiles({
            projectId: projectModule.selectedProjectId || '',
            path: absModule.currentPath,
        });
        loading.close();
    }
}
</script>

<style lang="scss" scoped></style>
