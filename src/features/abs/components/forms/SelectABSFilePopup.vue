<template>
    <div>
        <el-dialog
            width="90%"
            v-model="isShowSelectABSFilePopup"
            @closed="closedPopup"
            @opened="openedPopup"
            destroy-on-close
            custom-class="select-abs-file-popup"
        >
            <template #title>
                <h3 class="text-start">
                    {{ title }}
                </h3>
            </template>
            <div class="row abs-page">
                <div class="col-md-4 col-lg-3">
                    <FolderStructure />
                </div>
                <div class="col-md-8 col-lg-9">
                    <FileTable />
                </div>
            </div>
            <template #footer>
                <el-button type="success" @click="onClickClose">{{
                    $t('abs.assignToFileForm.button.close')
                }}</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { Options } from 'vue-class-component';
import { absModule } from '../../store';
import { IFolderStructureTree } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { AbsViewMode } from '../../constants';
import FileTable from './FileTable.vue';
import FolderStructure from '../FolderStructure.vue';
import { projectFileService } from '../../services/project-file.service';

@Options({ components: { FileTable, FolderStructure } })
export default class SelectABSFilePopup extends mixins(UtilMixins) {
    AbsViewMode = AbsViewMode;
    lastOpenFolderPath = '';

    get isShowSelectABSFilePopup() {
        return absModule.isShowSelectABSFilePopup;
    }

    set isShowSelectABSFilePopup(isShowSelectABSFilePopup: boolean) {
        absModule.setIsShowSelectABSFilePopup(isShowSelectABSFilePopup);
    }

    get folderStructure(): IFolderStructureTree[] {
        return absModule.folderStructure;
    }

    get absViewMode(): AbsViewMode {
        return absModule.absViewMode;
    }

    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    get isAssigningTo4DFile(): boolean {
        return absModule.isAssigningTo4DFile;
    }

    get isAssigningTo4DBoxFile(): boolean {
        return absModule.isAssigningTo4DBoxFile;
    }

    get isAssigningToPlanning(): boolean {
        return absModule.isAssigningToPlanningFile;
    }

    get title(): string {
        if (this.isAssigningTo4DFile) {
            return this.$t('abs.assignToFileForm.title.assign4D');
        }
        if (this.isAssigningTo4DBoxFile) {
            return this.$t('abs.assignToFileForm.title.assign4DBox');
        }
        if (this.isAssigningToPlanning) {
            return this.$t('abs.assignToFileForm.title.assignPlanning');
        }
        return '';
    }

    onClickChangeViewMode(viewMode: AbsViewMode) {
        absModule.setAbsViewMode(viewMode);
    }

    async initData() {
        let loading = ElLoading.service({ target: '.select-abs-file-popup' });
        absModule.setCurrentPath('/');
        await Promise.all([
            absModule.getFolderStructure(this.selectedProjectId),
            absModule.getFolderFiles({
                projectId: projectModule.selectedProjectId || '',
                path: '/',
            }),
        ]);
        absModule.setRecentOpenedFolderKey('/');
        loading.close();
    }

    created() {
        this.initData();
    }

    unmounted() {
        absModule.setCurrentPath('');
        absModule.setRecentOpenedFolderKey('');
    }

    async openedPopup() {
        this.lastOpenFolderPath = absModule.currentPath;
        const loading = ElLoading.service({ target: '.select-abs-file-popup' });
        const [response] = await Promise.all([
            projectFileService.getDetail(absModule.selectedFileId),
            absModule.getFolderFiles({
                path: absModule.currentPath,
                projectId: projectModule.selectedProjectId || '',
            }),
        ]);
        loading.close();
        absModule.setSelectedFile(response.data);
    }

    async closedPopup() {
        absModule.setIsAssigningTo4DBoxFile(false);
        absModule.setIsAssigningToPlanningFile(false);
        absModule.setIsAssigningTo4DFile(false);
        absModule.setCurrentPath(this.lastOpenFolderPath);
        absModule.setABSQueryString({
            extensions: [],
        });
        const loading = ElLoading.service({ target: '.file-table' });
        await absModule.getFolderFiles({
            path: absModule.currentPath,
            projectId: projectModule.selectedProjectId || '',
        });
        loading.close();
    }

    onClickClose() {
        this.isShowSelectABSFilePopup = false;
    }
}
</script>

<style lang="scss" scoped>
.abs-page {
    padding: 0 24px 24px 24px;
}
.el-button {
    padding: 5px !important;
    img {
        max-width: 24px;
    }
}
.button-group {
    margin-bottom: 12px;
}
</style>
