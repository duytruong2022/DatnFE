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
                    :label="$t('planning.assignResource.table.header.taskId')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ scope.row.ganttId }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.assignResource.table.header.taskName')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('planning.assignResource.table.header.status')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{
                            isAssignedToThisResource(scope.row.resourceIds)
                                ? $t('planning.assignResource.table.assigned')
                                : $t('planning.assignResource.table.unassigned')
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
                >{{ $t('planning.assignResource.table.button.assign') }}</el-button
            >
            <el-button
                :disabled="!shouldEnableActionButton"
                type="warning"
                @click="onClickUnassign"
                >{{ $t('planning.assignResource.table.button.unassign') }}</el-button
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
export default class AssignedTaskToResourceTable extends mixins(Planning4DMixin) {
    @Prop({ required: true }) selectedResourceId!: string;
    selectedTaskIds: string[] = [];
    get projectTasks() {
        return projectPlanningModule.planning?.tasks || [];
    }

    get shouldEnableActionButton() {
        return !!this.selectedResourceId?.length && !!this.selectedTaskIds.length;
    }

    isAssignedToThisResource(assignedResourceIds: string[]) {
        return assignedResourceIds.includes(this.selectedResourceId);
    }

    handleSelectionChange(rows: IProjectTask[]) {
        this.selectedTaskIds = rows.map((row) => row._id);
    }

    async onClickAssign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResource({
            resourceIds: [this.selectedResourceId],
            appearanceProfileIds: [],
            taskIds: this.selectedTaskIds,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                this.$t('planning.assignResource.message.assignResourceSuccess'),
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
        const response = await projectPlanningService.unassignResource({
            resourceIds: [this.selectedResourceId],
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
                this.$t('planning.assignResource.message.unassignResourceSuccess'),
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
