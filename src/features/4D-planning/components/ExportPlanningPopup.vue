<template>
    <el-dialog
        :title="$t('planning.exportForm.title.primavera')"
        width="40%"
        v-model="isShowExportPlanningPopup"
        @open="openPopup"
        @close="closedPopup"
        @selection-change="handleSelectionChange"
    >
        <div v-show="step === 1">
            <div class="row">
                <div class="col">
                    <BaseInputText
                        :isRequired="true"
                        :label="$t('planning.exportForm.labels.planningId')"
                        :placeholder="$t('planning.exportForm.placeholders.planningId')"
                        v-model:value="form.planningId"
                        :error="translateYupError(form.errors.planningId as string)"
                    />
                </div>
                <div class="col">
                    <BaseInputText
                        :isRequired="true"
                        :label="$t('planning.exportForm.labels.planningName')"
                        :placeholder="$t('planning.exportForm.placeholders.planningName')"
                        v-model:value="form.planningName"
                        :error="translateYupError(form.errors.planningName as string)"
                    />
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <BaseInputText
                        :isRequired="true"
                        :label="$t('planning.exportForm.labels.fileName')"
                        :placeholder="$t('planning.exportForm.placeholders.fileName')"
                        v-model:value="form.fileName"
                        :error="translateYupError(form.errors.fileName as string)"
                        :maxLength="FILE_NAME_MAX_LENGTH"
                    />
                </div>
            </div>
            <div>{{ $t('planning.folderForm.folders') }}</div>
            <div class="breadcrumb">
                <span
                    class="d-flex align-items-center"
                    v-for="(item, index) in folderNames"
                    :key="index"
                    @click="goToFolder(index)"
                >
                    {{ item }}<el-icon class="mx-1"><CaretRight /></el-icon>
                </span>
            </div>
            <div>
                <div class="folder-space pt-3">
                    <div class="row">
                        <div
                            class="col-4 pt-2 cursor-pointer"
                            @click="
                            () => {
                                folderNames.push(item.name);
                                currentFolderList = item.children as IFolderStructureTree[];
                            }
                        "
                            v-for="(item, index) in currentFolderList"
                            :key="index"
                        >
                            <div class="folder-item px-3 py-3">
                                <el-icon><Folder /></el-icon>
                                <div class="folder-item-name">{{ item.name }}</div>
                            </div>
                        </div>
                        <div v-if="currentFolderList.length === 0">
                            <BaseEmptyData />
                        </div>
                    </div>
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
        <template #footer>
            <span class="dialog-footer">
                <el-button type="danger" @click="onCancel">{{
                    $t('planning.buttons.cancel')
                }}</el-button>
                <el-button v-if="step > 1" @click="onBackStep()">{{
                    $t('planning.folderForm.buttons.back')
                }}</el-button>
                <el-button v-if="step < maxStep" @click="onNextStep()">{{
                    $t('planning.folderForm.buttons.next')
                }}</el-button>
                <el-button v-if="step === maxStep" type="primary" @click="handleSubmit">{{
                    $t('planning.buttons.export')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { projectPlanningModule } from '../store';
import { setupExportPlanningForm } from '../compositions/exportPlanningForm';
import { IFolderStructureTree } from '@/common/interfaces';
import { ElLoading, ElTable } from 'element-plus';
import localStorageAuthService from '@/common/authStorage';
import { showErrorNotificationFunction } from '@/common/helpers';
import { absService } from '@/features/abs/services/abs.service';
import { Folder, CaretRight } from '@element-plus/icons-vue';
import { ExportObjectList } from '../constants';
import isEmpty from 'lodash/isEmpty';

@Options({
    components: {
        Folder,
        CaretRight,
    },
})
export default class ExportPlanningPopup extends mixins(UtilMixins) {
    form = setup(() => setupExportPlanningForm());

    folderTree: IFolderStructureTree[] = [];
    currentFolderList: IFolderStructureTree[] = [];
    folderNames: string[] = [];
    exportObjectsSelected: string[] = [];
    step = 1;
    maxStep = 2;

    get isShowExportPlanningPopup() {
        return projectPlanningModule.isShowExportPlanningPopup;
    }

    get exportObjectList() {
        return Object.values(ExportObjectList).map((item) => ({
            label: this.$t(`planning.exportForm.exportObjects.${item}`),
            value: item,
        }));
    }

    goToFolder(index: number) {
        this.folderNames.splice(index + 1);
        const findChildFolder = (
            from: number,
            rs: IFolderStructureTree[],
        ): IFolderStructureTree[] => {
            if (index == from) {
                return rs;
            }
            return findChildFolder(
                from + 1,
                rs.find((item) => item.name === this.folderNames[index])?.children || [],
            );
        };
        this.currentFolderList = findChildFolder(0, this.folderTree);
    }

    async fetchFolderStructure() {
        const projectId = localStorageAuthService.getSelectedProjectId();
        this.$nextTick(async () => {
            const response = await absService.getFolderStructure(projectId);
            if (response.success) {
                this.folderTree = response.data[0].children || [];
                this.currentFolderList = response.data[0].children || [];
                this.folderNames.push(response.data[0].name);
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
        });
    }

    async openPopup() {
        (this.$refs.tableRef as InstanceType<typeof ElTable>).toggleAllSelection();
        const loading = ElLoading.service({});
        await this.fetchFolderStructure();
        loading.close();
    }

    closedPopup() {
        projectPlanningModule.setIsShowExportPlanningPopup(false);
        this.form.resetForm();
        (this.$refs.tableRef as InstanceType<typeof ElTable>).clearSelection();
        this.currentFolderList = [];
        this.folderNames = [];
        this.step = 1;
    }

    async handleSubmit() {
        this.form.setFieldValue('savePath', `/${this.folderNames.slice(1).join('/')}`);
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
        this.form.setFieldValue('savePath', `/${this.folderNames.slice(1).join('/')}`);
        await this.form.validate();
        if (isEmpty(this.form.errors)) {
            this.step += 1;
        }
    }

    onCancel() {
        projectPlanningModule.setIsShowExportPlanningPopup(false);
        this.form.resetForm();
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
</style>
