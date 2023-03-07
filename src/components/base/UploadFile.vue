<template>
    <div class="d-flex" :class="{ 'flex-column': !isHorizontal }">
        <label
            v-if="label"
            class="fw-bold text-start mb-2"
            :class="{ 'w-100': !isHorizontal, 'label mt-1': isHorizontal }"
        >
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div
            class="position-relative"
            :class="{ 'w-100': !isHorizontal, input: isHorizontal }"
        >
            <div class="file-upload-input">
                <label class="label-file" for="file"> {{ fileNameUpload }}</label>
                <input
                    type="file"
                    ref="file"
                    accept="application/pdf"
                    @change="selectFile($event)"
                    class="custom-file-input"
                    :disabled="isDisabled"
                    :placeholder="placeholder"
                />
                <button @click="onClickButtonSelectFile">+</button>
            </div>
        </div>
        <div class="position-relative">
            <div v-if="fileUploadError" class="validation-error text-start d-block mb-3">
                <span>{{ fileUploadError }}</span>
            </div>
            <div
                v-if="!fileUploadError && error"
                class="validation-error text-start d-block mb-3"
            >
                <span>{{ translateYupError(error) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { MAX_UPLOAD_FILE_SIZE_IN_BYTE } from '@/common/constants';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import get from 'lodash/get';
import { Prop } from 'vue-property-decorator';

export default class UploadFile extends mixins(UtilMixins) {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: false }) readonly isHorizontal!: boolean;
    @Prop({ default: '' }) readonly error!: string;

    fileUploadError = '';
    fileNameUpload = '';

    declare $refs: { uploader: HTMLInputElement; file: HTMLFormElement };

    onBeforeUploadFile(file: File): boolean {
        const isValidFileSize = file.size < MAX_UPLOAD_FILE_SIZE_IN_BYTE;
        if (!isValidFileSize) {
            this.fileUploadError = this.$t('common.uploadFile.rules.tooBig') as string;
            return false;
        }
        this.fileUploadError = '';
        return isValidFileSize;
    }

    selectFile(event: Event): void {
        const target = event.target;
        const file = get(target, 'files[0]', '') as File;

        if (file?.size) {
            this.onBeforeUploadFile(file);
            if (!this.fileUploadError) {
                this.fileNameUpload = file.name;
                this.$emit('upload-file', file);
            }
        }
    }

    onClickButtonSelectFile() {
        this.$refs.file.click();
    }
}
</script>

<style lang="scss" scoped>
/** Remove Arrows/Spinners */
/* Chrome, Safari, Edge, Opera */
.custom-file-input {
    &:hover {
        cursor: pointer;
    }
}
.file-upload-input {
    position: relative;
}
.file-upload-input label {
    align-items: center;
    color: setColor(primary, 0.5);
    background: setColor(white);
    transition: 0.4s ease;
    font-family: arial, sans-serif;
    font-size: 14px;
    font-weight: regular;
    position: absolute;
    top: 12px;
    left: 10px;
    white-space: nowrap;
    width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-upload-input input {
    position: relative;
    z-index: map-get($map: $zIndex, $key: fileUploadInput);
    padding: 0 gap(m);
    width: 100%;
    height: 46px;
    border: 1px solid #b1c0f3;
    border-radius: 8px;
    font-family: arial, sans-serif;
    font-size: 1rem;
    font-weight: regular;
}
.file-upload-input input[type='file'] {
    padding: 0 gap(m);
    color: transparent;
}
.file-upload-input input[type='file']::-webkit-file-upload-button {
    visibility: hidden;
    margin-left: 10px;
    padding: 0;
    height: 46px;
    width: 0;
}

.file-upload-input button {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50px;
    height: 46px;
    line-height: 0;
    user-select: none;
    color: white;
    background-color: #3c61e0;
    border-radius: 0 8px 8px 0;
    border: 1px solid #b1c0f3;
    font-family: arial, sans-serif;
    font-size: 25px;
    font-weight: 800;
}
.label {
    word-break: break-word;
    width: 25%;
}
.input {
    width: 75%;
}
label {
    font-size: 15px;
}
.mark-required {
    color: red;
}
</style>
