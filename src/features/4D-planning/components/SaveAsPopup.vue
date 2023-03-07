<template>
    <el-dialog
        width="90%"
        v-model="isShowSaveAsPopup"
        @closed="closedPopup"
        @open="openPopup"
        destroy-on-close
        custom-class="repository-popup"
    >
        <template #title>
            <h3 class="text-start">
                {{ title }}
            </h3>
        </template>
        <div v-if="!isExportXML">
            <div class="input-container">
                <BaseInputText
                    v-model:value="form.file3DName"
                    :label="$t('abs.fileForm.name.label')"
                    :placeholder="$t('abs.fileForm.name.placeholder')"
                    :isRequired="true"
                    :maxLength="FILE_NAME_MAX_LENGTH"
                    :error="translateYupError(form.errors.file3DName as string)"
                />
                <BaseSingleSelect
                    v-model:value="form.exportFormat"
                    :label="$t('abs.fileForm.exportFormat.label')"
                    :placeholder="$t('abs.fileForm.exportFormat.placeholder')"
                    :error="translateYupError(form.errors.exportFormat as string)"
                    :isRequired="true"
                    :isDisabled="true"
                />
            </div>

            <label class="fw-bold text-start mb-2 d-flex align-items-center w-100">
                {{ $t('viewer3d.repositoryPopup.selectLocation') }}
                <span class="mark-required">*</span></label
            >
            <div class="row abs-page">
                <div class="col-md-4 col-lg-3 col-sm-12">
                    <FolderStructure />
                </div>
                <div class="col-md-8 col-lg-9 col-sm-12">
                    <FileTable />
                </div>
            </div>
        </div>
        <div v-else>
            <div v-show="step === 1">
                <div class="row">
                    <div class="col">
                        <BaseInputText
                            :isRequired="true"
                            :label="$t('planning.exportForm.labels.planningId')"
                            :placeholder="
                                $t('planning.exportForm.placeholders.planningId')
                            "
                            v-model:value="form.planningId"
                            :error="translateYupError(form.errors.planningId as string)"
                        />
                    </div>
                    <div class="col">
                        <BaseInputText
                            :isRequired="true"
                            :label="$t('planning.exportForm.labels.planningName')"
                            :placeholder="
                                $t('planning.exportForm.placeholders.planningName')
                            "
                            v-model:value="form.planningName"
                            :error="translateYupError(form.errors.planningName as string)"
                        />
                    </div>
                </div>
                <div class="row">
                    <div class="col name-input">
                        <BaseInputText
                            :isRequired="true"
                            :label="$t('planning.exportForm.labels.fileName')"
                            :placeholder="$t('planning.exportForm.placeholders.fileName')"
                            v-model:value="form.fileXMLName"
                            :error="translateYupError(form.errors.fileXMLName as string)"
                            :maxLength="FILE_NAME_MAX_LENGTH"
                        />
                    </div>
                </div>
                <div>{{ $t('planning.folderForm.folders') }}</div>
                <div class="row abs-page">
                    <div class="col-md-4 col-lg-3 col-sm-12">
                        <FolderStructure />
                    </div>
                    <div class="col-md-8 col-lg-9 col-sm-12">
                        <FileTable />
                    </div>
                </div>
            </div>
            <div v-show="step === 2">
                <span>{{ $t('planning.exportForm.title.exportOptions') }}</span>
                <el-table
                    ref="tableRef"
                    :data="exportObjectList"
                    @selection-change="handleSelectionChange"
                    style="width: 100%"
                    max-height="350"
                >
                    <el-table-column
                        :label="$t('planning.exportForm.selectionColumns.object')"
                    >
                        <template #default="scope">{{ scope.row.label }}</template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('planning.exportForm.selectionColumns.command')"
                        width="150"
                    >
                        {{ $t('planning.buttons.export') }}
                    </el-table-column>
                    <el-table-column type="selection" width="80" />
                </el-table>
                <div class="d-flex flex-row table-buttons">
                    <el-button @click="handleSkipAll">{{
                        $t('planning.buttons.skipAll')
                    }}</el-button>
                </div>
            </div>
        </div>
        <template #footer>
            <el-button v-if="!isExportXML" type="primary" round @click="onExportXML">{{
                $t('planning.folderForm.buttons.next')
            }}</el-button>
            <el-button type="danger" @click="onCancel" round>{{
                $t('planning.buttons.cancel')
            }}</el-button>
            <el-button v-if="step > 1 && isExportXML" @click="onBackStep()" round>{{
                $t('planning.folderForm.buttons.back')
            }}</el-button>
            <el-button v-if="step < maxStep && isExportXML" @click="onNextStep()" round>{{
                $t('planning.folderForm.buttons.next')
            }}</el-button>
            <el-button
                v-if="step === maxStep && isExportXML"
                type="primary"
                @click="handleSubmit"
                round
                >{{ $t('planning.buttons.export') }}</el-button
            >
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { projectPlanningModule } from '../store';
import { setupSaveAsForm } from '../compositions/saveAsForm';
import { IFolderStructureTree } from '@/common/interfaces';
import { ElTable } from 'element-plus';
import { Folder, CaretRight } from '@element-plus/icons-vue';
import { ExportObjectList } from '../constants';
import isEmpty from 'lodash/isEmpty';
import { Watch } from 'vue-property-decorator';
import FolderStructure from '../../abs/components/FolderStructure.vue';
import FileTable from '../../abs/components/FileTable.vue';
import { absModule } from '@/features/abs/store';
import { projectModule } from '@/features/project/store';
@Options({
    components: {
        Folder,
        CaretRight,
        FolderStructure,
        FileTable,
    },
})
export default class SaveAsPlanningPopup extends mixins(UtilMixins) {
    form = setup(() => setupSaveAsForm());

    folderTree: IFolderStructureTree[] = [];
    currentFolderList: IFolderStructureTree[] = [];
    folderNames: string[] = [];
    exportObjectsSelected: string[] = [];
    step = 1;
    maxStep = 2;
    exportXML = false;
    title = '';

    get isShowSaveAsPopup() {
        return projectPlanningModule.isShowSaveAsPopup;
    }

    get isExportXML() {
        return this.exportXML;
    }

    get exportObjectList() {
        return Object.values(ExportObjectList).map((item) => ({
            label: this.$t(`planning.exportForm.exportObjects.${item}`),
            value: item,
        }));
    }

    get currentPath(): string {
        return absModule.currentPath;
    }

    async openPopup() {
        await absModule.getFolderStructure(projectModule.selectedProjectId || '');
        this.title = this.$t('planning.saveAsForm.titles.saveResource');
        this.form.folder3DPath = this.currentPath;
    }

    closedPopup() {
        projectPlanningModule.setIsShowSaveAsPopup(false);
        this.exportXML = false;
        this.title = '';
        this.form.resetForm();
        this.currentFolderList = [];
        this.folderNames = [];
        this.step = 1;
    }

    async handleSubmit() {
        this.form.setFieldValue('saveXMLPath', `/${this.folderNames.slice(1).join('/')}`);
        this.form.setFieldValue('selectedObjects', this.exportObjectsSelected);
        await this.form.onSubmit();
    }

    handleSelectionChange(values: { label: string; value: string }[]) {
        this.exportObjectsSelected = values.map((item) => item.value);
    }

    handleSkipAll() {
        (this.$refs.tableRef as InstanceType<typeof ElTable>).clearSelection();
    }

    onBackStep() {
        this.step -= 1;
    }

    async onNextStep() {
        this.form.setFieldValue('saveXMLPath', `/${this.folderNames.slice(1).join('/')}`);
        await this.form.validate();
        if (isEmpty(this.form.errors)) {
            this.step += 1;
        }
    }

    onCancel() {
        projectPlanningModule.setIsShowSaveAsPopup(false);
        this.exportXML = false;
        this.form.resetForm();
    }
    async onExportXML() {
        await this.form.validateField('file3DName');
        await this.form.validateField('folder3DPath');
        if (isEmpty(this.form.errors)) {
            absModule.setCurrentPath('/');
            absModule.setRecentOpenedFolderKey('/');
            this.title = this.$t('planning.saveAsForm.titles.saveXML');
            this.exportXML = true;
        }
    }

    @Watch('currentPath')
    onChangeFolderPath(folderPath: string | null) {
        if (!this.isExportXML) {
            this.form.folder3DPath = folderPath;
        } else {
            this.form.saveXMLPath = folderPath;
        }
    }
}
</script>

<style lang="scss" scoped>
.folder-item {
    display: flex;
    align-items: center;
    padding: 15px, 10px !important;
    border: solid 1px rgb(207, 207, 207);
    border-radius: 6px;
    .folder-item-name {
        word-break: break-all;
        margin-left: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.folder-space {
    max-height: 350px;
    overflow: auto;
}

.row {
    max-width: 100% !important;
}

.cursor-pointer {
    cursor: pointer;
}

:deep(.el-empty) {
    padding: 15px 0 15px 0;
    .el-empty__image {
        height: 100px;
    }
}

.table-buttons {
    margin-top: 10px;
    .el-button {
        width: auto;
    }
}
.abs-page {
    padding: 0 24px 24px 24px;
}
.input-container {
    max-width: 300px;
}
.name-input {
    max-width: 50%;
}
</style>
