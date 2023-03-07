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
                        {{ $t('abs.folderForm.save') }}
                    </el-button>
                </div>
            </div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('abs.folderForm.name.label')"
                :placeholder="$t('abs.folderForm.name.placeholder')"
                :isRequired="true"
                :error="translateYupError(form.errors.name)"
            />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { absModule } from '../store';
import { setupFolderForm } from '../composition/folderForm';
import { Watch } from 'vue-property-decorator';
import { FTPDataType } from '@/common/constants';
@Options({})
export default class FolderForm extends mixins(UtilMixins) {
    form = setup(() => setupFolderForm());

    get isShowCreateFolderForm() {
        return absModule.isShowCreateFolderForm;
    }
    get currentPath(): string {
        return absModule.currentPath;
    }
    get selectedFolderName(): string {
        return absModule.selectedFolderName;
    }

    get drawerTitle(): string {
        return !this.selectedFolderName.length
            ? `${this.$t('abs.folderForm.title.create')} ${absModule.parentFolderName}`
            : this.$t('abs.folderForm.title.update');
    }

    onOpen() {
        if (absModule.selectedFolderName.length) {
            this.form.name = absModule.selectedFolderName;
        }
        this.form.path = absModule.currentPath;
        this.form.type = FTPDataType.FOLDER;
    }

    onClosed() {
        absModule.setIsShowCreateFolderForm(false);
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
