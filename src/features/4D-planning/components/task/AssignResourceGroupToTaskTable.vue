<template>
    <div>
        <div class="resource-container">
            <BaseTableLayout
                :data="resourceGroupList"
                :totalItems="resourceGroupList.length"
                :isShowPagination="false"
                @selection-change="handleSelectionChange"
                ref="resourceGroupTable"
            >
                <template #table-columns>
                    <el-table-column type="selection" width="55" />
                    <el-table-column
                        prop="name"
                        :label="
                            $t(
                                'planning.assignResourceGroup.table.header.resourceGroupName',
                            )
                        "
                    />
                    <el-table-column
                        :label="$t('planning.assignResourceGroup.table.header.status')"
                        min-width="150"
                    >
                        <template #default="scope">
                            {{
                                isAssignedToThisResourceGroup(scope.row._id)
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
                    >{{
                        $t('planning.assignResourceGroup.table.button.assign')
                    }}</el-button
                >
                <el-button
                    :disabled="!shouldEnableActionButton"
                    type="warning"
                    @click="onClickUnassign"
                    >{{
                        $t('planning.assignResourceGroup.table.button.unassign')
                    }}</el-button
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ICommonTableRefs } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IProjectTask, IResource } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({ components: {} })
export default class AssignedResourceGroupToTaskTable extends mixins(Planning4DMixin) {
    @Prop({ required: true }) taskDetail!: IProjectTask;
    selectedResourceGroupIds: string[] = [];

    get resourceGroupList() {
        return projectPlanningModule.resourceGroupList;
    }

    get resourceList() {
        return projectPlanningModule.resourceList || [];
    }

    get shouldEnableActionButton() {
        return !!this.selectedResourceGroupIds?.length;
    }

    created() {
        projectPlanningModule.getResourceGroupList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
    }

    handleSelectionChange(rows: IResource[]) {
        this.selectedResourceGroupIds = rows.map((row) => row._id || '');
    }

    async onClickAssign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResourceGroup({
            resourceGroupIds: this.selectedResourceGroupIds,
            appearanceProfileIds: [],
            taskIds: [this.taskDetail._id],
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
            this.$emit('fetchTaskDetail');
            (this.$refs.resourceGroupTable as ICommonTableRefs).clearSelection();
        }
        loading.close();
    }

    async onClickUnassign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.unassignResourceGroup({
            resourceGroupIds: this.selectedResourceGroupIds,
            appearanceProfileIds: [],
            taskIds: [this.taskDetail._id],
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                this.$t(
                    'planning.assignResourceGroup.message.unassignResourceGroupSuccess',
                ),
            );
            this.$emit('fetchTaskDetail');
            (this.$refs.resourceGroupTable as ICommonTableRefs).clearSelection();
        }
        loading.close();
    }

    isAssignedToThisResourceGroup(resourceGroupId: string) {
        return this.taskDetail?.resourceGroupIds?.includes(resourceGroupId);
    }
}
</script>
<style scoped>
.action-button-container {
    margin-top: 10px;
}
.selected-resource {
    font-weight: 600;
}
.resource-container {
    background: #fafafa;
}
</style>
