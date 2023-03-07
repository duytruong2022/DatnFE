<template>
    <div class="row abs-page">
        <div class="col-md-4 col-lg-3 col-sm-12">
            <FolderStructure />
        </div>
        <div class="col-md-8 col-lg-9 col-sm-12">
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
import FolderStructure from '../components/FolderStructure.vue';
import FileTable from '../components/FileTable.vue';
import { repositoryModule } from '../store';
import FolderForm from '../components/FolderForm.vue';
import UploadFormPopup from '../components/UploadFormPopup.vue';
import FileForm from '../components/FileForm.vue';
import { IFolderStructureTree } from '@/common/interfaces';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { DialogType } from '@/features/3D-viewer/constant';
@Options({
    components: {
        FolderStructure,
        FileTable,
        FolderForm,
        UploadFormPopup,
        FileForm,
    },
})
export default class RepositoryPage extends mixins(UtilMixins) {
    get folderStructure(): IFolderStructureTree[] {
        return repositoryModule.folderStructure;
    }

    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    async initData() {
        let loading = ElLoading.service({ target: '.folder-tree' });
        await repositoryModule.getFolderStructure();
        loading.close();
        if (webViewer3DModule.dialogType !== DialogType.SAVE) {
            repositoryModule.setCurrentPath('/');
            repositoryModule.setRecentOpenedFolderKey('/');
        }
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
