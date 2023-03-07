<template>
    <el-dialog
        v-model="isShowTopDownFormPopup"
        :title="$t('planning.topDown.popup.title')"
        width="60%"
        height="60%"
        @open="hanldeOpen"
        @closed="handleClosed"
        destroy-on-close
        class="top-down-popup"
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
                v-if="!isSynthesized"
                type="primary"
                @click="onClickUpdateDelegation"
                :disabled="isDisableTopDownButton"
                >{{ $t('planning.buttons.updateDelegation') }}</el-button
            >
            <el-button
                v-else
                type="primary"
                @click="onClickTopDown"
                :disabled="isDisableTopDownButton"
                >{{ $t('planning.buttons.topDown') }}</el-button
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
import { IPlanning, IProjectTask } from '../interfaces';
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
export default class TopDownFormPopup extends mixins(AbsFileMixin) {
    planningExtension = ABSUploadedFileExtensions.PLANNING;
    selectedPlanningIds: string[] = [];

    get isSynthesized() {
        return projectPlanningModule.planning?.isSynthesized;
    }

    get isDisableTopDownButton(): boolean {
        return this.selectedPlanningIds.length === 0;
    }

    get isShowTopDownFormPopup(): boolean {
        return projectPlanningModule.isShowTopDownFormPopup;
    }

    set isShowTopDownFormPopup(isShowTopDownFormPopup: boolean) {
        projectPlanningModule.setIsShowTopDownFormPopup(isShowTopDownFormPopup);
    }

    get planningList() {
        if (this.isSynthesized) {
            return projectPlanningModule.planningList;
        } else {
            return projectPlanningModule.delegationHasModify || [];
        }
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

    async hanldeOpen() {
        const loading = ElLoading.service({ target: '.top-down-popup' });
        if (projectPlanningModule.planning?.isSynthesized) {
            await projectPlanningModule.getSynthesizedFromFileList(
                projectPlanningModule.planning?._id || '',
                {
                    orderBy: PlanningOrderBy.CREATED_AT,
                    path: localStorageAuthService.getPlanningPermissions().path || '',
                    projectId: projectModule.selectedProjectId || '',
                },
            );
        } else {
            await projectPlanningModule.getDelegatePlanningListHasModifyFromOriginal();
        }

        loading.close();
    }

    handleSelectionChange(rows: IPlanning[]) {
        this.selectedPlanningIds = rows.map((row) => row._id);
    }

    handleClosed() {
        this.selectedPlanningIds = [];
    }

    onClickTopDown() {
        this.$emit('onTopDown', this.selectedPlanningIds);
    }

    async onClickUpdateDelegation() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.topDown.message.confirmUpdateDelegation', {
                name: projectPlanningModule.taskPopupParams.selectedTask?.name,
            }),
            this.$t('planning.topDown.message.titleConfirmUpdateDelegation'),
        );

        if (confirm) {
            // find tasks has update in delegation
            let tasks: IProjectTask[] = [];
            projectPlanningModule.delegationHasModify
                ?.filter((planning) => {
                    return this.selectedPlanningIds.includes(planning._id);
                })
                .forEach((planning) => {
                    tasks = [...tasks, ...planning.tasksHasModify];
                });
            this.$emit('onUpdateDelegation', tasks);
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
