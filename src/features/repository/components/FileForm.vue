<template>
    <BaseRightDrawer
        :title="$t('repository.fileForm.title.update')"
        @onClosed="onClosed"
        @onOpen="onOpen"
        v-model:value="isShowFileForm"
        customClass="file-form"
        size="300px"
    >
        <template #body>
            <div class="text-right">
                <div class="d-flex justify-content-end footer">
                    <el-button type="primary" @click="form.onSubmit">
                        {{ $t('repository.fileForm.save') }}
                    </el-button>
                </div>
            </div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('repository.fileForm.name.label')"
                :placeholder="$t('repository.fileForm.name.placeholder')"
                :isRequired="true"
                :error="translateYupError(form.errors.name)"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { setupFileForm } from '../composition/fileForm';
import { Watch } from 'vue-property-decorator';
import { repositoryModule } from '../store';
import { FTPDataType } from '@/common/constants';
@Options({})
export default class FileForm extends mixins(UtilMixins) {
    form = setup(() => setupFileForm());

    get isShowFileForm() {
        return repositoryModule.isShowFileForm;
    }
    get seletedFilePath(): string {
        return repositoryModule.selectedFilePath;
    }
    get selectedFileName(): string {
        return repositoryModule.selectedFileName;
    }
    getFileName(name: string) {
        const nameSplited = name.split('.');
        return nameSplited.slice(0, nameSplited.length - 1).join('.');
    }

    onOpen() {
        if (this.selectedFileName.length) {
            this.form.name = this.getFileName(this.selectedFileName);
        }
        this.form.path = repositoryModule.selectedFilePath;
        this.form.type = FTPDataType.FILE;
    }

    onClosed() {
        repositoryModule.setIsShowFileForm(false);
        this.form.resetForm();
    }

    @Watch('selectedFilePath')
    onChangeSelectedFilePath(selectedFilePath: string) {
        this.form.path = this.getFileName(selectedFilePath);
    }

    @Watch('selectedFileName')
    onChangeSelectedFileName(selectedFileName: string) {
        this.form.name = selectedFileName;
    }
}
</script>
<style lang="scss" scoped></style>
