<template>
    <BaseRightDrawer
        :title="
            isShowResourceDetailsForm
                ? selectedResource?._id
                    ? $t(`planning.resource.title.resourceDetail`)
                    : $t(`planning.resource.title.createResource`)
                : $t(`planning.resource.title.resourceList`)
        "
        v-model:value="isShowResourcePopup"
        size="50%"
        customClass="resource-form"
        @onClosed="closePopup"
        @onOpen="openPopup"
    >
        <template #body>
            <div v-if="!isShowResourceDetailsForm">
                <div :style="{ textAlign: 'right' }">
                    <el-button
                        type="primary"
                        @click="onClickCreateButton('')"
                        v-if="canCreateResource"
                    >
                        {{ $t('planning.buttons.create') }}
                    </el-button>
                </div>
                <BaseTableLayout
                    :data="resourceTree"
                    :totalItems="resourceTree.length"
                    :isShowPagination="false"
                    @selection-change="handleSelectionChange"
                    ref="resourceTable"
                    @row-click="handleRowClick"
                >
                    <template #table-columns>
                        <el-table-column
                            prop="label"
                            :label="$t('planning.resource.resourceList.name')"
                            min-width="300"
                        />
                        <el-table-column
                            :label="$t('planning.resource.resourceList.description')"
                            min-width="200"
                        >
                            <template #default="scope">
                                {{ scope.row.data.description }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('planning.resource.resourceList.type')"
                            prop="fullName"
                            min-width="150"
                        >
                            <template #default="scope">
                                {{
                                    $t(
                                        `planning.resource.resourceType.${scope.row.data?.type}`,
                                    )
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('planning.resource.resourceList.taskCount')"
                            prop="data.taskCount"
                            min-width="150"
                        />
                        <el-table-column
                            :label="$t('planning.resource.resourceList.action')"
                            min-width="250"
                        >
                            <template #default="scope">
                                <el-button
                                    size="small"
                                    type="success"
                                    @click.stop="
                                        onClickCreateButton(scope.row?.data?._id)
                                    "
                                    >{{ $t('planning.buttons.create') }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="edit"
                                    @click.stop="onClickButtonEdit(scope.row?.data?._id)"
                                    >{{ $t('planning.buttons.edit') }}</el-button
                                >
                                <el-button
                                    size="small"
                                    type="danger"
                                    @click.stop="
                                        onClickButtonDelete(scope.row?.data?._id)
                                    "
                                    >{{ $t('planning.buttons.delete') }}</el-button
                                >
                            </template>
                        </el-table-column>
                    </template>
                </BaseTableLayout>
                <AssignedTaskToResourceTable :selectedResourceId="selectedResourceId" />
            </div>
            <ResourceDetail v-else />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { projectPlanningModule } from '../../store';
import ResourceDetail from './ResourceDetail.vue';
import { projectModule } from '@/features/project/store';
import { Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { projectPlanningService } from '../../services/planning.service';
import { ABSUploadedFileExtensions } from '@/features/abs/constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { HttpStatus } from '@/common/constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import localStorageAuthService from '@/common/authStorage';
import { calendarModule } from '@/features/calendar/store';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import AssignedTaskToResourceTable from './AssignedTaskToResourceTable.vue';
import { IFolderStructureTree } from '@/common/interfaces';
import { IResource } from '../../interfaces';

@Options({
    components: { ResourceDetail, AssignedTaskToResourceTable, EditIcon, DeleteIcon },
})
export default class ResourcePopup extends mixins(Planning4DMixin) {
    selectedResourceId: string | null = null;
    get isShowResourcePopup() {
        return projectPlanningModule.isShowResourcePopup;
    }

    get isShowResourceDetailsForm() {
        return projectPlanningModule.isShowResourceDetailForm;
    }

    get resourceTree() {
        return projectPlanningModule.resourceTree;
    }

    get selectedResource() {
        return projectPlanningModule.selectedResource;
    }

    get canCreateResource() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_RESOURCE'],
        );
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    onClickCreateButton(selectedNodeId: string) {
        projectPlanningModule.setSelectedResourceNodeId(selectedNodeId);
        projectPlanningModule.setIsShowResourceDetailForm(true);
    }

    openPopup() {
        projectPlanningModule.getResourceTree({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
        calendarModule.getCalendarList(projectModule.selectedProjectId || '');
        projectPlanningModule.setIsShowResourceDetailForm(false);
        projectPlanningModule.setSelectedResource(null);
        projectPlanningModule.getProjectFileList({
            projectId: projectModule.selectedProjectId || '',
            type: [ABSUploadedFileExtensions.VIEWER_3D],
        });
        webViewer3DService.getSelectedNodeIds(webViewer3DModule.sessionToken || '');
    }

    closePopup() {
        projectPlanningModule.setIsShowResourcePopup(false);
    }

    async onClickButtonEdit(id: string) {
        const resource = await projectPlanningService.getResourceDetail(id);
        if (resource.success) {
            projectPlanningModule.setSelectedResource(resource.data);
            projectPlanningModule.setIsShowResourceDetailForm(true);
        }
    }

    async onClickButtonDelete(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('planning.resource.message.confirmAsk') as string,
            i18n.global.t('planning.resource.title.deleteResource') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.resource-form',
            });
            const response = await projectPlanningService.deleteResource(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('planning.resource.message.deleteSuccess') as string,
                );
                const loading = ElLoading.service({
                    target: '.resource-form',
                });
                await projectPlanningModule.getResourceTree({
                    planningId: projectPlanningModule.planning?._id || '',
                    projectId: projectModule.selectedProjectId || '',
                    path: this.planningPath || '',
                });
                loading.close();
                this.$emit('delete-resource-success');
                projectPlanningModule.setNeedReload3DViewer(true);
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await projectPlanningModule.getResourceTree({
                        planningId: projectPlanningModule.planning?._id || '',
                        projectId: projectModule.selectedProjectId || '',
                        path: this.planningPath || '',
                    });
                    loading.close();
                }
            }
        }
    }

    async onClickSeeAllTasks(resourceId: string) {
        const response = await projectPlanningService.getTaskNameByResourceId({
            resourceId,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        });
        if (response.success && response.data?.length) {
            projectPlanningModule.setAssignedTaskNames(response.data);
            projectPlanningModule.setIsShowAssignedTaskNamesPopup(true);
        }
    }

    onClickResource(data: IFolderStructureTree) {
        this.selectedResourceId = data._id || '';
    }

    handleRowClick(selectedResource: IResource) {
        this.selectedResourceId = selectedResource._id || '';
    }
}
</script>

<style scoped lang="scss">
.action-icon {
    height: 16px;
    width: 16px;
}
.task-count {
    text-align: center;
    width: 100%;
}
:deep(.custom-tree-node) {
    display: flex;
}
</style>
