<template>
    <el-dialog
        v-model="isShowAssignedTaskNamesPopup"
        @close="onCancelForm"
        :title="$t(`planning.resource.title.assignedTaskNames`)"
        width="25%"
    >
        <div v-for="name in assignedTaskNames" :key="name">
            {{ name }}
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { projectPlanningModule } from '../../store';

export default class GridViewSettingsPopup extends Vue {
    get assignedTaskNames(): string[] {
        return projectPlanningModule.assignedTaskNames || [];
    }

    get isShowAssignedTaskNamesPopup(): boolean {
        return projectPlanningModule.isShowAssignedTaskNamesPopup;
    }

    onCancelForm() {
        projectPlanningModule.setIsShowAssignedTaskNamesPopup(false);
    }
}
</script>

<style lang="scss" scoped></style>
