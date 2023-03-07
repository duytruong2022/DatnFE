<template>
    <el-dialog
        v-model="isShowBottomUpFormPopup"
        :title="$t('planning.bottomUp.popup.title')"
        width="60%"
        height="60%"
        @open="handleOpen"
        @closed="handleClosed"
        destroy-on-close
        class="bottom-up-popup"
    >
        <BaseTableLayout
            :data="planningList"
            :totalItems="planningList.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @selection-change="handleSelectionChange"
        >
            <template #table-columns>
                <el-table-column type="selection" width="55" />
                <el-table-column
                    :label="$t('abs.table.header.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.type')"
                    :width="200"
                    align="center"
                >
                    {{ planningExtension }}
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.4d')" align="center">
                    <template #default="scope">
                        {{ scope.row?.userAccess?.city || '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.pbs')" align="center">
                    <template #default="scope">
                        {{ scope.row?.pbs }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.modifiedDate')"
                    :width="220"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.updatedAt) }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
        <template #footer>
            <el-button
                type="primary"
                v-if="!isSynthesized"
                @click="onClickUpdateMilestones"
                :disabled="isDisableUpdateMilestones"
                >{{ $t('planning.buttons.updateMilestones') }}</el-button
            >
            <el-button
                v-if="isSynthesized"
                type="primary"
                @click="onClickBottomUp"
                :disabled="isDisableBottomUpButton"
                >{{ $t('planning.buttons.bottomUp') }}</el-button
            >
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { Folder, CaretRight } from '@element-plus/icons-vue';
import { IFolderStructureTree } from '@/common/interfaces';
import { projectPlanningModule } from '../store';
import { PlanningOrderBy } from '../constants';
import { IPlanning } from '../interfaces';
import { ABSUploadedFileExtensions } from '@/features/abs/constants';
import { AbsFileMixin } from '@/features/abs/mixin';
import localStorageAuthService from '@/common/authStorage';
import { projectModule } from '@/features/project/store';
import { showConfirmPopUpFunction } from '@/common/helpers';

@Options({
    components: {
        Folder,
        CaretRight,
    },
})
export default class BottomUpFormPopup extends mixins(AbsFileMixin) {
    planningExtension = ABSUploadedFileExtensions.PLANNING;
    selectedPlanningIds: string[] = [];

    get isSynthesized() {
        return projectPlanningModule.planning?.isSynthesized;
    }

    get isDisableBottomUpButton(): boolean {
        return this.selectedPlanningIds.length === 0;
    }

    get isDisableUpdateMilestones(): boolean {
        return (
            !projectPlanningModule.planning?.clonedFromPlanningIds ||
            this.selectedPlanningIds.length === 0
        );
    }

    get isShowBottomUpFormPopup(): boolean {
        return projectPlanningModule.isShowBottomUpFormPopup;
    }

    set isShowBottomUpFormPopup(isShowBottomUpFormPopup: boolean) {
        projectPlanningModule.setIsShowBottomUpFormPopup(isShowBottomUpFormPopup);
    }

    get planningList(): IPlanning[] {
        return projectPlanningModule.planningList;
    }

    planningListErrorText = '';
    folderTree: IFolderStructureTree[] = [];
    currentFolderList: IFolderStructureTree[] = [];
    folderNames: string[] = [];

    onCancel() {
        projectPlanningModule.setIsShowSynthesisPopup(false);
    }

    goToFolder(index: number) {
        this.folderNames.splice(index + 1);
        const findChildFolder = (
            from: number,
            rs: IFolderStructureTree[],
        ): IFolderStructureTree[] => {
            if (index == from) {
                return rs;
            }
            return findChildFolder(
                from + 1,
                rs.find((item) => item.name === this.folderNames[index])?.children || [],
            );
        };
        this.currentFolderList = findChildFolder(0, this.folderTree);
    }

    async handleOpen() {
        const loading = ElLoading.service({ target: '.bottom-up-popup' });
        if (projectPlanningModule.planning?.isSynthesized) {
            await projectPlanningModule.getDeligatedFromFileList(
                projectPlanningModule.planning?._id || '',
                {
                    orderBy: PlanningOrderBy.CREATED_AT,
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                    projectId: projectModule.selectedProjectId || '',
                },
            );
        } else {
            if (projectPlanningModule.planning?.clonedFromPlanningIds) {
                await projectPlanningModule.getOriginalPlanning(
                    projectPlanningModule.planning?.clonedFromPlanningIds[0] || '',
                );
            }
        }
        loading.close();
    }

    handleSelectionChange(rows: IPlanning[]) {
        this.selectedPlanningIds = rows.map((row) => row._id);
    }

    handleClosed() {
        this.selectedPlanningIds = [];
    }

    onClickBottomUp() {
        this.$emit('onBottomUp', this.selectedPlanningIds);
    }

    async onClickUpdateMilestones() {
        const clonedFromPlanningIds =
            projectPlanningModule.planning?.clonedFromPlanningIds;
        if (!clonedFromPlanningIds) {
            return;
        }
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.bottomUp.message.confirmUpdateMilestone', {
                name: projectPlanningModule.taskPopupParams.selectedTask?.name,
            }),
            this.$t('planning.bottomUp.message.titleConfirmUpdateUpdateMilestone'),
        );

        if (confirm) {
            const generalPlanningId = clonedFromPlanningIds[0];
            this.$emit('onUpdateMilestone', generalPlanningId);
        }
    }
}
</script>

<style lang="scss" scoped>
.folder-item {
    display: flex;
    align-items: center;
    padding: 15px, 10px !important;
    border: solid 1px rgb(207, 207, 207);
    border-radius: 6px;
    .folder-item-name {
        word-break: break-all;
        margin-left: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.folder-space {
    max-height: 350px;
    overflow: auto;
}

.row {
    max-width: 100% !important;
}

.cursor-pointer {
    cursor: pointer;
}

:deep(.el-empty) {
    padding: 15px 0 15px 0;
    .el-empty__image {
        height: 100px;
    }
}
</style>
