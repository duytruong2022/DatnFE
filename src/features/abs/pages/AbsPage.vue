<template>
    <div class="row abs-page">
        <div class="col-md-4 col-lg-3">
            <FolderStructure />
        </div>
        <div class="col-md-8 col-lg-9">
            <div class="button-group">
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    :content="$t('abs.table.tooltip.grid')"
                    :show-after="100"
                    placement="top-start"
                >
                    <el-button @click="onClickChangeViewMode(AbsViewMode.GRID)">
                        <img :src="require('@/assets/images/grid.png')" />
                    </el-button>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    :content="$t('abs.table.tooltip.tree')"
                    :show-after="100"
                    placement="top-start"
                >
                    <el-button @click="onClickChangeViewMode(AbsViewMode.TREE)"
                        ><img :src="require('@/assets/images/tree-view.png')" />
                    </el-button>
                </el-tooltip>
                <el-tooltip
                    class="box-item"
                    effect="dark"
                    :content="$t('abs.table.tooltip.model')"
                    :show-after="100"
                    placement="top-start"
                >
                    <el-button @click="onClickChangeViewMode(AbsViewMode['3D_MODELING'])"
                        ><img :src="require('@/assets/images/3d-modeling.png')" />
                    </el-button>
                </el-tooltip>
            </div>
            <FileTable v-if="absViewMode === AbsViewMode.GRID" />
            <Model3DPreviewList v-else-if="absViewMode === AbsViewMode['3D_MODELING']" />
            <FolderTreeChart v-else />
        </div>
    </div>
    <FolderForm />
    <FileForm />
    <UploadFormPopup />
    <SelectABSFilePopup />
</template>

<script lang="ts">
import { projectModule } from '@/features/project/store';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import FolderStructure from '../components/FolderStructure.vue';
import FileTable from '../components/FileTable.vue';
import { absModule } from '../store';
import FolderTreeChart from '../components/FolderTreeChart.vue';
import { AbsViewMode } from '../constants';
import { IFolderStructureTree } from '@/common/interfaces';
import Model3DPreviewList from '../components/Model3DPreviewList.vue';
import FolderForm from '../components/FolderForm.vue';
import UploadFormPopup from '../components/UploadFormPopup.vue';
import FileForm from '../components/FileForm.vue';
import SelectABSFilePopup from '../components/forms/SelectABSFilePopup.vue';
@Options({
    components: {
        FolderStructure,
        FileTable,
        FolderTreeChart,
        Model3DPreviewList,
        FolderForm,
        UploadFormPopup,
        FileForm,
        SelectABSFilePopup,
    },
})
export default class AbsPage extends mixins(UtilMixins) {
    AbsViewMode = AbsViewMode;

    get folderStructure(): IFolderStructureTree[] {
        return absModule.folderStructure;
    }

    get absViewMode(): AbsViewMode {
        return absModule.absViewMode;
    }

    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    onClickChangeViewMode(viewMode: AbsViewMode) {
        absModule.setAbsViewMode(viewMode);
    }

    async initData() {
        let loading = ElLoading.service();
        absModule.setCurrentPath('/');
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
