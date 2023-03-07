<template>
    <div class="model-3d-list row">
        <div class="col-md-4" v-for="file in folderFiles" :key="file.name">
            <Model3DPreview :fileDetail="file" />
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { IFTPFile } from '@/common/interfaces';
import { absModule } from '../store';
import Model3DPreview from './Model3DPreview.vue';

@Options({
    components: { Model3DPreview },
})
export default class Model3DPreviewList extends mixins(UtilMixins) {
    get folderFiles(): IFTPFile[] {
        return absModule.folderFiles;
    }
}
</script>

<style scoped lang="scss">
.model-3d-list {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 0px;
    min-height: calc(100vh - 135px);
}
</style>
