<template>
    <el-dialog
        width="60%"
        v-model="isShowAssignToPBSForm"
        @closed="onClosed"
        @open="onOpen"
        custom-class="assign-to-pbs"
    >
        <template #title>
            <h3>{{ $t('abs.assignToPBSForm.title') }}</h3>
        </template>
        <div class="row header-assign">
            <div class="col-12"></div>
        </div>
        <div class="row">
            <div class="col-md-5">
                <div class="pbs-list-header">
                    <div class="pbs-list-title">
                        {{ $t('abs.assignToPBSForm.assignedPbs') }}
                    </div>
                </div>
                <hr class="horizontal-line" />
                <div class="pbs-in-file-list" v-if="assignedPBSList.length > 0">
                    <div v-for="pbs in assignedPBSList" :key="pbs._id">
                        <div class="pbs-in-file">
                            <div class="pbs-name">
                                {{ `${pbs?.name || ''}` }}
                            </div>
                            <el-tooltip
                                class="action"
                                effect="dark"
                                :content="$t('abs.assignToPBSForm.button.delete')"
                                placement="top"
                            >
                                <el-button size="mini" @click="unassignFromAbs(pbs)">
                                    <DeleteIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                        </div>
                        <hr class="horizontal-line" />
                    </div>
                </div>
                <BaseEmptyData v-else />
            </div>
            <div class="col-md-7">
                <div class="pbs-list-header">
                    <div class="pbs-list-title">
                        {{ $t('abs.assignToPBSForm.assignNewPBS') }}
                    </div>
                    <BaseInputText
                        class="text-search"
                        v-model:value="keyword"
                        :placeholder="
                            $t('abs.assignToPBSForm.filterForm.keyword.placeholder')
                        "
                    />
                </div>
                <hr class="horizontal-line" />

                <el-tree
                    :data="unassignedPBSList"
                    node-key="_id"
                    ref="pbsGroupTree"
                    :filter-node-method="filterNode"
                    class="pbs-tree"
                >
                    <template #default="{ node }">
                        <div class="custom-tree-node" @click="assignToAbs(node?.data)">
                            <el-dropdown trigger="contextmenu">
                                <span class="el-dropdown-link">
                                    <div class="directory">
                                        {{ node?.data?.label }}
                                    </div>
                                </span>
                            </el-dropdown>
                        </div>
                    </template>
                </el-tree>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import { LIMIT_PER_PAGE } from '@/common/constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { IGetAssignedPBS } from '../../interfaces';
import { projectFileService } from '../../services/project-file.service';
import { absModule } from '../../store';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import { Watch } from 'vue-property-decorator';
import { projectModule } from '@/features/project/store';
import { ITreeNode, StructureTree } from '@/common/interfaces';
@Options({ components: { DeleteIcon } })
export default class AssignToPBSForm extends mixins(UtilMixins) {
    assignedPBSList: IGetAssignedPBS[] = [];
    unassignedPBSList: IGetAssignedPBS[] = [];
    totalUnassignedPBS = 0;
    LIMIT_PER_PAGE = LIMIT_PER_PAGE;
    page = 1;
    keyword = '';

    get isShowAssignToPBSForm() {
        return absModule.isShowAssignToPBSForm;
    }

    set isShowAssignToPBSForm(setIsShowAssignToPBSForm: boolean) {
        absModule.setIsShowAssignToPBSForm(setIsShowAssignToPBSForm);
    }

    get isAssignPbsToFolder() {
        return absModule.isAssignPbsToFolder;
    }

    get selectedPath() {
        return absModule.selectedFilePath;
    }

    get treeRef() {
        return this.$refs.pbsGroupTree as StructureTree;
    }

    async getAssignedPBSList() {
        const loading = ElLoading.service();
        const response = await projectFileService.getAssignedPBS(
            absModule.selectedFileId,
        );
        if (response.success) {
            this.assignedPBSList = response.data;
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    async getUnassignedPBSList() {
        const loading = ElLoading.service();
        const response = await projectFileService.getUnassignedPBS(
            absModule.selectedFileId,
            {
                keyword: this.keyword,
                page: this.page,
            },
        );
        if (response.success) {
            this.unassignedPBSList = response.data.items;
            this.totalUnassignedPBS = response.data.totalItems;
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    onOpen() {
        this.page = 1;
        this.keyword = '';
        this.getAssignedPBSList();
        this.getUnassignedPBSList();
    }

    onClosed() {
        this.isShowAssignToPBSForm = false;
        absModule.setIsAssignPbsToFolder(false);
    }

    async assignToAbs(pbs: IGetAssignedPBS): Promise<void> {
        if (this.assignedPBSList?.find((assignedPBS) => assignedPBS._id === pbs._id)) {
            return;
        }

        const isConfirm = await showConfirmPopUpFunction(
            this.$t(
                `${
                    this.isAssignPbsToFolder
                        ? 'abs.assignToPBSForm.confirmAdd.messageFolder'
                        : 'abs.assignToPBSForm.confirmAdd.messageFile'
                }`,
                {
                    name: pbs.name,
                },
            ) as string,
            this.$t('abs.assignToPBSForm.confirmAdd.title') as string,
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-popup',
            });
            const response = await projectFileService.assignToPBS(
                absModule.selectedFileId,
                pbs._id,
                this.selectedPath,
                projectModule.selectedProjectId || '',
            );
            if (response.success) {
                this.page = 1;
                this.keyword = '';
                await Promise.all([
                    this.getAssignedPBSList(),
                    this.getUnassignedPBSList(),
                ]);
            } else {
                await showErrorNotificationFunction(response.message as string);
            }
            loading.close();
        }
    }

    async unassignFromAbs(pbs: IGetAssignedPBS): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            this.$t(
                `${
                    this.isAssignPbsToFolder
                        ? 'abs.assignToPBSForm.confirmRemove.messageFolder'
                        : 'abs.assignToPBSForm.confirmRemove.messageFile'
                }`,
                {
                    name: pbs.name,
                },
            ) as string,
            this.$t('abs.assignToPBSForm.confirmRemove.title') as string,
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-popup',
            });
            const response = await projectFileService.unassignToPBS(
                absModule.selectedFileId,
                pbs._id,
                this.selectedPath,
                projectModule.selectedProjectId || '',
            );
            if (response.success) {
                this.page = 1;
                this.keyword = '';
                await Promise.all([
                    this.getAssignedPBSList(),
                    this.getUnassignedPBSList(),
                ]);
            } else {
                await showErrorNotificationFunction(response.message as string);
            }
            loading.close();
        }
    }

    handlePaginate(pageNumber: number): void {
        this.page = pageNumber;
        this.getUnassignedPBSList();
    }

    filterNode(keyword: string, data: ITreeNode) {
        if (!keyword) return true;
        return data.label.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
    }

    @Watch('keyword')
    async setFilterNode(keyword: string) {
        this.treeRef.filter(keyword);
    }
}
</script>
<style lang="scss" scoped>
.header-assign {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
}
.pbs-item:hover {
    background-color: rgb(237 237 237);
}
.pbs-list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    .pbs-list-title {
        display: flex;
        align-items: center;
        color: #000;
        font-size: 16px;
        font-weight: 700;
        height: 35px !important;
    }
    :deep(.position-relative) {
        height: 35px !important;
    }
}

.pbs-in-file-list {
    overflow: auto;
    height: 350px;
    color: #1835ff;
    font-size: 14px;
    font-weight: 600;
    .pbs-in-file {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 3px 10px 5px 10px !important;
    }
}

.pbs-not-in-file-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .pbs-not-in-file {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3px 10px 5px 10px !important;

        cursor: pointer;
        .pbs-name {
            margin: 6px 0px 5px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-right: 20px;
    margin-bottom: 20px;
}

.action-icon {
    height: 16px;
    width: 16px;
}

:deep(.el-input__wrapper) {
    padding: 6px 12px !important;
    width: calc(30vh);
    .el-input__inner {
        height: 23px;
    }
}
:deep(.pbs-in-file .el-button) {
    border: none !important;
    color: red;
}
:deep(.pbs-in-file .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
.horizontal-line {
    margin: 0px !important;
}

.custom-tree-node {
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: -webkit-fill-available;
}
</style>
