<template>
    <BaseRightDrawer
        :title="
            isShowResourceGroupDetailsForm
                ? selectedResourceGroup?._id
                    ? $t(`planning.resourceGroup.title.resourceGroupDetail`)
                    : $t(`planning.resourceGroup.title.createResourceGroup`)
                : $t(`planning.resourceGroup.title.resourceGroupList`)
        "
        v-model:value="isShowResourceGroupPopup"
        size="50%"
        customClass="resource-group-form"
        @onClosed="closePopup"
        @onOpen="openPopup"
    >
        <template #body>
            <div v-if="!isShowResourceGroupDetailsForm">
                <div :style="{ textAlign: 'right' }">
                    <el-button
                        type="primary"
                        @click="onClickCreateButton"
                        v-if="canCreateResource"
                    >
                        {{ $t('planning.buttons.create') }}
                    </el-button>
                </div>
                <BaseTableLayout
                    :data="resourceGroupList"
                    :totalItems="resourceGroupList?.length"
                    :isShowPagination="false"
                    @rowClick="onRowClick"
                >
                    <template #table-columns>
                        <el-table-column
                            :label="$t('planning.resource.resourceList.name')"
                            min-width="150"
                        >
                            <template #default="scope">
                                {{ scope.row.name }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="$t('planning.resource.resourceList.description')"
                            min-width="250"
                        >
                            <template #default="scope">
                                {{ scope.row.description }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            fixed="right"
                            align="center"
                            :label="$t('planning.resource.resourceList.action')"
                            width="170"
                        >
                            <template #default="scope">
                                <div class="button-group">
                                    <el-tooltip
                                        effect="dark"
                                        :content="$t('planning.buttons.edit')"
                                        placement="top"
                                        v-if="canCreateResource"
                                    >
                                        <el-button
                                            type="warning"
                                            size="mini"
                                            @click="onClickButtonEdit(scope.row._id)"
                                        >
                                            <EditIcon class="action-icon" />
                                        </el-button>
                                    </el-tooltip>
                                    <el-tooltip
                                        effect="dark"
                                        :content="$t('planning.buttons.delete')"
                                        placement="top"
                                    >
                                        <el-button
                                            type="danger"
                                            size="mini"
                                            @click.stop="
                                                onClickButtonDelete(scope.row._id)
                                            "
                                        >
                                            <DeleteIcon class="action-icon" />
                                        </el-button>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                    </template>
                </BaseTableLayout>
                <AssignedTaskToResourceGroupTable
                    :selectedResourceGroupId="selectedResourceGroupId"
                />
            </div>
            <ResourceGroupDetail v-else />
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { projectPlanningModule } from '../../store';
import ResourceGroupDetail from './ResourceGroupDetail.vue';
import { Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { projectPlanningService } from '../../services/planning.service';
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
import { projectModule } from '@/features/project/store';
import AssignedTaskToResourceGroupTable from './AssignedTaskToResourceGroupTable.vue';
import { IResourceGroup } from '../../interfaces';

@Options({
    components: {
        ResourceGroupDetail,
        AssignedTaskToResourceGroupTable,
        EditIcon,
        DeleteIcon,
    },
})
export default class ResourceGroupPopup extends mixins(Planning4DMixin) {
    selectedResourceGroupId: string | null = null;
    get isShowResourceGroupPopup() {
        return projectPlanningModule.isShowResourceGroupPopup;
    }

    get isShowResourceGroupDetailsForm() {
        return projectPlanningModule.isShowResourceGroupDetailForm;
    }

    get resourceGroupList() {
        return projectPlanningModule.resourceGroupList;
    }

    get selectedResourceGroup() {
        return projectPlanningModule.selectedResourceGroup;
    }

    get canCreateResource() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_RESOURCE'],
        );
    }

    get planningPath() {
        return localStorageAuthService.getPlanningPermissions().path;
    }

    onClickCreateButton() {
        projectPlanningModule.setIsShowResourceGroupDetailForm(true);
    }

    openPopup() {
        projectPlanningModule.getResourceGroupList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
        projectPlanningModule.setIsShowResourceGroupDetailForm(false);
        projectPlanningModule.setSelectedResourceGroup(null);
        projectPlanningModule.getResourceList({
            planningId: projectPlanningModule.planning?._id || '',
            projectId: projectModule.selectedProjectId || '',
            path: this.planningPath || '',
        });
    }

    closePopup() {
        projectPlanningModule.setIsShowResourceGroupPopup(false);
    }

    async onClickButtonEdit(id: string) {
        const resource = await projectPlanningService.getResourceGroupDetail(id);
        if (resource.success) {
            projectPlanningModule.setSelectedResourceGroup(resource.data);
            projectPlanningModule.setIsShowResourceGroupDetailForm(true);
        }
    }

    async onClickButtonDelete(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('planning.resourceGroup.message.confirmAsk') as string,
            i18n.global.t('planning.resourceGroup.title.deleteResourceGroup') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.resource-group-form',
            });
            const response = await projectPlanningService.deleteResourceGroup(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t(
                        'planning.resourceGroup.message.deleteSuccess',
                    ) as string,
                );
                const loading = ElLoading.service({
                    target: '.resource-group-form',
                });
                await projectPlanningModule.getResourceGroupList({
                    planningId: projectPlanningModule.planning?._id || '',
                    projectId: projectModule.selectedProjectId || '',
                    path: this.planningPath || '',
                });
                loading.close();
                this.$emit('delete-resource-group-success');
                projectPlanningModule.setNeedReload3DViewer(true);
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await projectPlanningModule.getResourceGroupList({
                        planningId: projectPlanningModule.planning?._id || '',
                        projectId: projectModule.selectedProjectId || '',
                        path: this.planningPath || '',
                    });
                    loading.close();
                }
            }
        }
    }

    onRowClick(data: IResourceGroup) {
        this.selectedResourceGroupId = data._id || '';
    }
}
</script>

<style scoped lang="scss">
.action-icon {
    height: 16px;
    width: 16px;
}
</style>
