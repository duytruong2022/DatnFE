<template>
    <div>
        <el-dialog
            width="90%"
            v-model="isShowRepositoryPopup"
            @closed="closePopup"
            @open="openePopup"
            destroy-on-close
            custom-class="repository-popup"
        >
            <template #title>
                <h3 class="text-start">
                    {{ title }}
                </h3>
            </template>
            <div class="input-container">
                <BaseInputText
                    v-if="dialogType === DialogType.SAVE"
                    v-model:value="form.name"
                    :label="$t('abs.fileForm.name.label')"
                    :placeholder="$t('abs.fileForm.name.placeholder')"
                    :isRequired="true"
                    :maxLength="FILE_NAME_MAX_LENGTH"
                    :error="translateYupError(form.errors.name)"
                />
                <BaseSingleSelect
                    v-if="isShowExportFileType"
                    :options="optionExportType"
                    v-model:value="form.exportFileType"
                    :label="$t('abs.fileForm.exportType.label')"
                    :placeholder="$t('abs.fileForm.exportType.placeholder')"
                    :error="translateYupError(form.errors.exportFileType)"
                    :isRequired="true"
                />
                <BaseSingleSelect
                    v-if="dialogType === DialogType.SAVE"
                    v-model:value="form.exportFormat"
                    :options="exportFormatOptions"
                    :label="$t('abs.fileForm.exportFormat.label')"
                    :placeholder="$t('abs.fileForm.exportFormat.placeholder')"
                    :error="translateYupError(form.errors.exportFormat)"
                    :isRequired="true"
                    :isDisabled="isDisableSelectFileFormat"
                />
            </div>

            <label
                v-if="dialogType === DialogType.SAVE"
                class="fw-bold text-start mb-2 d-flex align-items-center w-100"
            >
                {{ $t('viewer3d.repositoryPopup.selectLocation') }}
                <span class="mark-required">*</span></label
            >
            <RepositoryPage />
            <template #footer>
                <el-button
                    v-if="dialogType === DialogType.SAVE"
                    type="success"
                    @click="onClickSave"
                    >{{ $t('viewer3d.uploadForm.save') }}</el-button
                >
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Watch } from 'vue-property-decorator';
import { webViewer3DModule } from '../store';
import RepositoryPage from '../../repository/pages/RepositoryPage.vue';
import { Options, setup } from 'vue-class-component';
import { setupSaveFileForm } from '../composition/saveFileForm';
import { repositoryModule } from '@/features/repository/store';
import { ExportFormat2D, ExportFormat3D, ExportType } from '@/common/constants';
import {
    ExportFormat2DOptions,
    ExportFormat3DOptions,
    ExportFileType,
} from '@/features/4D-planning/constants';
import { DialogType, DimensionType } from '../constant';

@Options({ components: { RepositoryPage } })
export default class RepositoryPopup extends mixins(UtilMixins) {
    form = setup(() => setupSaveFileForm());
    get isShowRepositoryPopup(): boolean {
        return webViewer3DModule.isShowRepositoryPopup;
    }

    get isShowExportFileType(): boolean {
        return repositoryModule.isShowExportFileType;
    }

    get dialogType(): DialogType {
        return webViewer3DModule.dialogType;
    }

    get title(): string {
        switch (this.dialogType) {
            case DialogType.OPEN:
                return this.$t('viewer3d.repositoryPopup.title.select');
            case DialogType.SAVE:
                return this.$t('viewer3d.repositoryPopup.title.save');
            case DialogType.IMPORT:
                return this.$t('viewer3d.repositoryPopup.title.import');
            default:
                return '';
        }
    }

    get openFileId(): string | null {
        return webViewer3DModule.openFileId;
    }

    get currentPath(): string | null {
        return repositoryModule.currentPath;
    }

    get exportType(): ExportType | null {
        return repositoryModule.exportType;
    }

    get exportFormat(): ExportFormat2D | ExportFormat3D {
        return repositoryModule.fileDimensionType === DimensionType['2D']
            ? ExportFormat2D.DXF
            : ExportFormat3D['3DSP'];
    }

    get exportFormatOptions() {
        if (this.exportType === ExportType.EXPORT) {
            return this.form.exportFileType === DimensionType['3D']
                ? ExportFormat3DOptions
                : ExportFormat2DOptions;
        }
        return repositoryModule.fileDimensionType === DimensionType['3D']
            ? ExportFormat3DOptions
            : ExportFormat2DOptions;
    }

    get optionExportType() {
        return ExportFileType;
    }

    get exportFileType() {
        return this.form.exportFileType;
    }

    get isDisableSelectFileFormat(): boolean {
        return this.exportType === ExportType.SAVE_AS;
    }

    openePopup() {
        this.form.resetForm();
        this.form.folderPath = this.currentPath;
        this.form.exportType = this.exportType;
        this.form.exportFormat = this.exportFormat;
        if (this.exportType === ExportType.EXPORT && this.isShowExportFileType) {
            this.form.exportFileType = DimensionType['3D'];
        }
    }

    async onClickSave() {
        this.form.onSubmit();
    }

    closePopup(): void {
        webViewer3DModule.setIsShowRepositoryPopup(false);
        repositoryModule.setIsShowExportFileType(false);
    }

    @Watch('currentPath')
    onChangeFolderPath(folderPath: string | null) {
        this.form.folderPath = folderPath;
    }

    @Watch('exportType')
    onChangeExportType(exportType: ExportType | null) {
        this.form.exportType = exportType;
    }

    @Watch('exportFileType')
    onChangeExportFormatOptions(exportFileType: DimensionType) {
        if (exportFileType === DimensionType['2D']) {
            this.form.exportFormat = ExportFormat2D.DXF;
        } else {
            this.form.exportFormat = ExportFormat3D['3DSP'];
        }
    }
}
</script>

<style lang="scss" scoped>
:deep(.abs-page) {
    padding: 0 !important;
}
:deep(.folder-tree) {
    padding: 0 !important;
    height: unset !important;
}
.input-container {
    max-width: 300px;
}
.mark-required {
    color: red;
}

.label {
    word-break: break-word;
    width: 25%;
}
label {
    font-size: 15px;
}
</style>
