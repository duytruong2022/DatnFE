<template>
    <div class="row abs-page">
        <div class="col-md-4 col-lg-3">
            <FolderStructure />
        </div>
        <div class="col-md-8 col-lg-9">
            <FileTable />
        </div>
    </div>
    <FolderForm />
    <FileForm />
    <UploadFormPopup />
</template>

<script lang="ts">
import { projectModule } from '@/features/project/store';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { IFolderStructureTree } from '@/common/interfaces';
import { projectPlanningModule } from '@/features/4D-planning/store';
import FileForm from '../FileForm.vue';
import FileTable from '../FileTable.vue';
import FolderForm from '../FolderForm.vue';
import FolderStructure from '../FolderStructure.vue';
import { AbsViewMode } from '../../constants';
import { absModule } from '../../store';
import UploadFormPopup from '../UploadFormPopup.vue';

@Options({
    components: {
        FolderStructure,
        FileTable,
        FolderForm,
        UploadFormPopup,
        FileForm,
    },
})
export default class AbsForm extends mixins(UtilMixins) {
    AbsViewMode = AbsViewMode;

    get folderStructure(): IFolderStructureTree[] {
        return absModule.folderStructure;
    }

    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    get isShownInTopDownPopup(): boolean {
        return projectPlanningModule.isShowTopDownFormPopup;
    }

    async initData() {
        let loading = ElLoading.service();
        await absModule.getFolderStructure(this.selectedProjectId);
        if (!this.isShownInTopDownPopup) {
            absModule.setCurrentPath('/');
            absModule.setRecentOpenedFolderKey('/');
        } else {
            await absModule.getFolderFiles({
                projectId: projectModule.selectedProjectId || '',
                path: absModule.currentPath,
            });
            absModule.setRecentOpenedFolderKey(absModule.currentPath);
        }
        loading.close();
    }

    created() {
        this.initData();
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
