<template>
    <div>
        <BaseTableLayout
            :data="projectTasks"
            :totalItems="projectTasks.length"
            :isShowPagination="false"
            @selection-change="handleSelectionChange"
        >
            <template #table-columns>
                <el-table-column type="selection" width="55" />
                <el-table-column
                    :label="$t('planning.assignResourceGroup.table.header.taskId')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ scope.row.ganttId }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.assignResourceGroup.table.header.taskName')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.assignResourceGroup.table.header.status')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{
                            isAssignedToThisResource(scope.row.resourceGroupIds)
                                ? $t('planning.assignResourceGroup.table.assigned')
                                : $t('planning.assignResourceGroup.table.unassigned')
                        }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
        <div class="action-button-container">
            <el-button
                :disabled="!shouldEnableActionButton"
                type="success"
                @click="onClickAssign"
                >{{ $t('planning.assignResourceGroup.table.button.assign') }}</el-button
            >
            <el-button
                :disabled="!shouldEnableActionButton"
                type="warning"
                @click="onClickUnassign"
                >{{ $t('planning.assignResourceGroup.table.button.unassign') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IProjectTask } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({ components: {} })
export default class AssignedTaskToResourceGroupTable extends mixins(Planning4DMixin) {
    @Prop({ required: true }) selectedResourceGroupId!: string;
    selectedTaskIds: string[] = [];
    get projectTasks() {
        return projectPlanningModule.planning?.tasks || [];
    }

    get shouldEnableActionButton() {
        return !!this.selectedResourceGroupId?.length && !!this.selectedTaskIds.length;
    }

    isAssignedToThisResource(assignedResourceGroupIds: string[]) {
        return assignedResourceGroupIds.includes(this.selectedResourceGroupId);
    }

    handleSelectionChange(rows: IProjectTask[]) {
        this.selectedTaskIds = rows.map((row) => row._id);
    }

    async onClickAssign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResourceGroup({
            resourceGroupIds: [this.selectedResourceGroupId],
            appearanceProfileIds: [],
            taskIds: this.selectedTaskIds,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                this.$t(
                    'planning.assignResourceGroup.message.assignResourceGroupSuccess',
                ),
            );
            const { name, planningFilePath } = this.$route.query as {
                name?: string;
                planningFilePath?: string;
            };
            const projectId = localStorageAuthService.getSelectedProjectId();
            const path = localStorageAuthService.getPlanningPermissions().path || '';

            if (!name || !planningFilePath || !projectId) {
                return;
            }
            projectPlanningModule.getPlanning(projectPlanningModule.planningId);
        }
        loading.close();
    }

    async onClickUnassign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.unassignResourceGroup({
            resourceGroupIds: [this.selectedResourceGroupId],
            appearanceProfileIds: [],
            taskIds: this.selectedTaskIds,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            const { name, planningFilePath } = this.$route.query as {
                name?: string;
                planningFilePath?: string;
            };
            showSuccessNotificationFunction(
                this.$t(
                    'planning.assignResourceGroup.message.unassignResourceGroupSuccess',
                ),
            );
            const projectId = localStorageAuthService.getSelectedProjectId();
            const path = localStorageAuthService.getPlanningPermissions().path || '';

            if (!name || !planningFilePath || !projectId) {
                return;
            }
            projectPlanningModule.getPlanning(projectPlanningModule.planningId);
        }
        loading.close();
    }
}
</script>
<style scoped>
.action-button-container {
    margin-top: 10px;
}
</style>
