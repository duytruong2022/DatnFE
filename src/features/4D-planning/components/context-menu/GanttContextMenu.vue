<template>
    <div v-click-outside="show && handleOnClickOutside" v-show="show">
        <el-menu class="gantt-context-menu" active-text-color="#303133" :style="style">
            <el-menu-item @click="handleClickAddLink" :disabled="disableAddLink">{{
                $t('planning.contextMenu.options.addLink')
            }}</el-menu-item>
            <el-menu-item @click="handleClickCurrentLink" :disabled="disableAddLink">{{
                $t('planning.contextMenu.options.currentLinks')
            }}</el-menu-item>
        </el-menu>
    </div>
</template>

<script lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { Vue, Options } from 'vue-class-component';
import { projectPlanningModule } from '../../store';

@Options({ components: {} })
export default class GanttContextMenu extends Vue {
    get show() {
        return projectPlanningModule.ganttContextMenuParam.show;
    }

    get disableAddLink() {
        return !projectPlanningModule.ganttContextMenuParam.permissionAddLink || false;
    }

    get style() {
        return {
            top: projectPlanningModule.ganttContextMenuParam.top + 'px',
            left: projectPlanningModule.ganttContextMenuParam.left + 'px',
        };
    }

    handleOnClickOutside() {
        projectPlanningModule.setGanttContextMenuParam({
            task: null,
            link: null,
            show: false,
        });
    }

    handleClickAddLink() {
        const ganttContextMenuParam = cloneDeep(
            projectPlanningModule.ganttContextMenuParam,
        );
        projectPlanningModule.setGanttContextMenuParam({
            ...ganttContextMenuParam,
            show: false,
        });
        projectPlanningModule.setLinkPopupParam({
            selectedTask: ganttContextMenuParam.task,
            show: true,
            isCreate: true,
        });
    }

    handleClickCurrentLink() {
        const ganttContextMenuParam = cloneDeep(
            projectPlanningModule.ganttContextMenuParam,
        );
        projectPlanningModule.setGanttContextMenuParam({
            ...ganttContextMenuParam,
            show: false,
        });
        projectPlanningModule.setLinkPopupParam({
            selectedTask: ganttContextMenuParam.task,
            show: true,
        });
    }
}
</script>
<style lang="scss" scoped>
.gantt-context-menu {
    width: auto;
    padding: 8px 0;
    position: fixed;
    background: white;
    outline: none;
}

:deep(.el-menu-item) {
    line-height: 28px;
    height: 28px;
    padding: 0 12px !important;
}
</style>
