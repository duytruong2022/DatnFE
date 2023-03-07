<template>
    <BaseRightDrawer
        :title="drawerTitle"
        @onClosed="onClosed"
        @onOpen="onOpen"
        v-model:value="isShowCreateFolderForm"
        customClass="create-folder-form"
        size="500px"
    >
        <template #body>
            <div class="text-right">
                <div class="d-flex justify-content-end footer">
                    <el-button type="primary" @click="form.onSubmit">
                        {{ $t('repository.folderForm.save') }}
                    </el-button>
                </div>
            </div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('repository.folderForm.name.label')"
                :placeholder="$t('repository.folderForm.name.placeholder')"
                :isRequired="true"
                :error="translateYupError(form.errors.name)"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { setupFolderForm } from '../composition/folderForm';
import { Watch } from 'vue-property-decorator';
import { repositoryModule } from '../store';
import { FTPDataType } from '@/common/constants';
@Options({})
export default class FolderForm extends mixins(UtilMixins) {
    form = setup(() => setupFolderForm());

    get isShowCreateFolderForm() {
        return repositoryModule.isShowCreateFolderForm;
    }
    get currentPath(): string {
        return repositoryModule.currentPath;
    }
    get selectedFolderName(): string {
        return repositoryModule.selectedFolderName;
    }

    get drawerTitle(): string {
        return !this.selectedFolderName.length
            ? `${this.$t('repository.folderForm.title.create')} ${
                  repositoryModule.parentFolderName
              }`
            : this.$t('repository.folderForm.title.update');
    }

    onOpen() {
        if (repositoryModule.selectedFolderName.length) {
            this.form.name = repositoryModule.selectedFolderName;
        }
        this.form.path = repositoryModule.currentPath;
        this.form.type = FTPDataType.FOLDER;
    }

    onClosed() {
        repositoryModule.setIsShowCreateFolderForm(false);
        repositoryModule.setIsShowExportFileType(false);
        this.form.resetForm();
    }

    @Watch('currentPath')
    onChangeCurrentPath(currentPath: string) {
        this.form.path = currentPath;
    }

    @Watch('selectedFolderName')
    onChangeSelectedFolderName(selectedFolderName: string) {
        this.form.name = selectedFolderName;
    }
}
</script>
<style lang="scss" scoped></style>
