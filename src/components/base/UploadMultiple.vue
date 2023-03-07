<template>
    <el-dialog
        width="700px"
        lock-scroll
        :model-value="isShowImportForm"
        @open="onOpenImportForm"
        @closed="onCloseImportForm"
        :custom-class="customClass"
    >
        <template #header>
            <h3 class="text-start">
                {{ title }}
            </h3>
        </template>
        <el-upload
            ref="uploadMultiple"
            v-model:file-list="fileList"
            multiple
            drag
            :action="uploadUrl"
            :headers="headers"
            :data="data"
            :limit="limit"
            :before-upload="beforeUpload"
            :on-success="onSuccess"
            :auto-upload="autoUpload"
            :on-error="onError"
            :accept="acceptedFileTypes"
        >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
                {{ $t('common.uploadMultiple.dropFileHereOr') }}
                <em>{{ $t('common.uploadMultiple.clickToUpload') }}</em>
            </div>
        </el-upload>
        <el-button
            v-if="!autoUpload"
            class="float-end"
            type="success"
            @click="submitUpload"
        >
            {{ $t('common.uploadMultiple.uploadFile') }}
        </el-button>
    </el-dialog>
</template>

<script lang="ts">
import { sessionStorageAuthService } from '@/common/authStorage';
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { UploadFilled } from '@element-plus/icons-vue';
import {
    MAX_CONCURRENCY_UPLOAD_FILE,
    MAX_FILE_SIZE_IN_BYTE,
    megaByteToByteRate,
} from '@/common/constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { UploadUserFile } from 'element-plus/lib/components';
import { UploadMultipleRef } from '@/common/interfaces';
import { UploadRawFile } from 'element-plus';
@Options({
    components: { UploadFilled },
})
export default class UploadMultiple extends Vue {
    @Prop({ default: '' }) readonly uploadUrl!: string;
    @Prop({ default: '_' }) readonly acceptedFileTypes!: string;
    @Prop({ default: '' }) readonly data!: any;
    @Prop({ default: true }) readonly autoUpload!: boolean;

    @Prop({ default: false }) isShowImportForm!: boolean;
    @Prop({ default: '' }) readonly title!: string;
    @Prop({ default: '' }) error!: string;
    @Prop({ default: '' }) customClass!: string;
    @Prop({ default: MAX_CONCURRENCY_UPLOAD_FILE }) limit!: number;
    @Prop({ default: MAX_FILE_SIZE_IN_BYTE }) maxFileSize!: number;
    @Prop({ default: [] }) existFiles!: string[];

    headers = {};
    fileList!: UploadUserFile[];

    get imageUrlAlt(): string {
        return require('@/assets/icons/avatar-default.png');
    }

    get uploadMultipleRef() {
        return this.$refs.uploadMultiple as UploadMultipleRef;
    }

    onOpenImportForm(): void {
        this.$emit('onOpenImportForm');
    }

    onCloseImportForm(): void {
        this.uploadMultipleRef.clearFiles();
        this.$emit('onCloseImportForm');
    }

    async beforeUpload(file: UploadRawFile) {
        if (file.size > this.maxFileSize) {
            const fileSizeInMB = this.maxFileSize / megaByteToByteRate;
            showErrorNotificationFunction(
                this.$t('common.uploadMultiple.sizeLimit', {
                    size: fileSizeInMB,
                }),
            );
            return false;
        }
        if (this.existFiles.some((fileName) => fileName === file.name)) {
            const confirm = await showConfirmPopUpFunction(
                `${file.name} ${this.$t('fileForm.upload.confirm.fileExist')}`,
                this.$t('fileForm.upload.confirm.title'),
            );
            if (!confirm) {
                return false;
            }
        }
        this.headers = {
            Authorization: `Bearer ${sessionStorageAuthService.getAccessToken()}`,
        };
    }

    onSuccess(response: Record<string, string | number>) {
        this.$emit('onSuccess', response, this.uploadMultipleRef);
    }

    onError(error: Error) {
        try {
            const response = JSON.parse(error.message);
            showErrorNotificationFunction(response.message);
        } catch (error) {
            //
        } finally {
            this.$emit('onError');
        }
    }
    submitUpload() {
        this.$emit('submitUpload', this.fileList, this.uploadMultipleRef);
    }
}
</script>
