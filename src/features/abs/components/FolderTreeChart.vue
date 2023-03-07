<template>
    <div class="tree-chart-container">
        <div class="action-buttons">
            <el-tooltip :content="$t('abs.table.tooltip.zoomIn')">
                <el-button @click="onCickZoomIn">
                    <zoom-in-icon class="icon" />
                </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('abs.table.tooltip.zoomOut')">
                <el-button @click="onCickZoomOut">
                    <zoom-out-icon class="icon" />
                </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('abs.table.tooltip.fitScreen')">
                <el-button @click="fitChart">
                    <full-screen-icon class="icon" />
                </el-button>
            </el-tooltip>
        </div>
        <vue-tree
            class="tree-chart"
            ref="folderTree"
            :dataset="folderStructure"
            :config="treeConfig"
            linkStyle="straight"
        >
            <template v-slot:node="{ node, collapsed }">
                <div
                    class="rich-media-node"
                    :style="{ border: collapsed ? '2px solid grey' : '' }"
                >
                    <span class="folder-name">{{ node?.name }}</span>
                </div>
            </template>
        </vue-tree>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import VueTree from '@ssthouse/vue3-tree-chart';
import '@ssthouse/vue3-tree-chart/dist/vue3-tree-chart.css';
import { absModule } from '../store';
import { FolderTreeChartRef } from '../interfaces';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    FullScreen as FullScreenIcon,
} from '@element-plus/icons-vue';
@Options({ components: { VueTree, ZoomInIcon, ZoomOutIcon, FullScreenIcon } })
export default class FolderTreeChart extends mixins(UtilMixins) {
    treeConfig = { nodeWidth: 170, nodeHeight: 80, levelHeight: 150 };

    get folderStructure() {
        return absModule.folderStructure;
    }
    mounted() {
        this.$nextTick(() => {
            this.fitChart();
        });
    }

    onCickZoomIn() {
        (this.$refs.folderTree as FolderTreeChartRef).zoomIn();
    }

    onCickZoomOut() {
        (this.$refs.folderTree as FolderTreeChartRef).zoomOut();
    }

    fitChart() {
        (this.$refs.folderTree as FolderTreeChartRef).restoreScale();
        while (this.isChartOverflow()) {
            (this.$refs.folderTree as FolderTreeChartRef).zoomOut();
        }
    }

    isChartOverflow() {
        const el = document.querySelector('.tree-chart') as HTMLElement;
        var curOverflow = el.style.overflow;

        if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';

        var isOverflowing =
            el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

        el.style.overflow = curOverflow;

        return isOverflowing;
    }
}
</script>

<style scoped lang="scss">
.tree-chart-container {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 0px;
    height: calc(100vh - 177px);
    position: relative;

    .action-buttons {
        position: absolute;
        top: 5px;
        right: 5px;
    }
}
.tree-chart {
    height: calc(100vh - 60px);
    width: 100%;
}
.folder-name {
    padding: 4px 0;
    font-weight: bold;
    display: inline;
    -webkit-line-clamp: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    word-wrap: break-word;
    max-width: 150px;
}
.rich-media-node {
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    background-color: #f7c616;
    border-radius: 4px;
    text-align: center;
}
:deep(.tree-container) {
    overflow: auto;
    max-height: calc(100vh - 210px);
}
.icon {
    width: 16px;
}
</style>
