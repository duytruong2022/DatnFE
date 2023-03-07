<template>
    <div>
        <div class="resource-container">
            <BaseTableLayout
                :data="resourceTree"
                :totalItems="resourceTree.length"
                :isShowPagination="false"
                @selection-change="handleSelectionChange"
                ref="resourceTable"
            >
                <template #table-columns>
                    <el-table-column type="selection" width="55" />
                    <el-table-column
                        prop="label"
                        :label="$t('planning.assignResource.table.header.resourceName')"
                    />
                    <el-table-column
                        :label="$t('planning.assignResource.table.header.status')"
                        min-width="150"
                    >
                        <template #default="scope">
                            {{
                                isAssignedToThisResource(scope.row._id)
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
    </div>
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ICommonTableRefs, IFolderStructureTree } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IProjectTask, IResource } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';

@Options({ components: {} })
export default class AssignedResourceToTaskTable extends mixins(Planning4DMixin) {
    @Prop({ required: true }) taskDetail!: IProjectTask;
    selectedResourceIds: string[] = [];

    get resourceTree() {
        return projectPlanningModule.resourceTree;
    }
    set resourceTree(value: IFolderStructureTree[]) {
        projectPlanningModule.setResourceTree(value);
    }

    get resourceList() {
        return projectPlanningModule.resourceList || [];
    }

    get shouldEnableActionButton() {
        return !!this.selectedResourceIds?.length;
    }

    created() {
        this.resourceTree = [];
        projectPlanningModule.getResourceTree({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
    }

    handleSelectionChange(rows: IResource[]) {
        this.selectedResourceIds = rows.map((row) => row._id || '');
    }

    async onClickAssign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.assignResource({
            resourceIds: this.selectedResourceIds,
            appearanceProfileIds: [],
            taskIds: [this.taskDetail._id],
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                this.$t('planning.assignResource.message.assignResourceSuccess'),
            );
            this.$emit('fetchTaskDetail');
            (this.$refs.resourceTable as ICommonTableRefs).clearSelection();
        }
        loading.close();
    }

    async onClickUnassign() {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.unassignResource({
            resourceIds: this.selectedResourceIds,
            appearanceProfileIds: [],
            taskIds: [this.taskDetail._id],
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                this.$t('planning.assignResource.message.unassignResourceSuccess'),
            );
            this.$emit('fetchTaskDetail');
            (this.$refs.resourceTable as ICommonTableRefs).clearSelection();
        }
        loading.close();
    }

    isAssignedToThisResource(resourceId: string) {
        return this.taskDetail?.resourceIds?.includes(resourceId);
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
