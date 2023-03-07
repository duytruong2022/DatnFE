<template>
    <div class="pbs-group-tree">
        <div class="pbs-group-title">
            <div class="title">{{ $t('pbsGroup.title.pbsGroup') }}</div>
            <el-tooltip
                effect="dark"
                :content="$t('pbsGroup.button.create')"
                placement="top"
                v-if="canCreatePBSStructure"
            >
                <el-button size="mini" @click.stop="onClickAddPbsGroupButton">
                    <CirclePlusFilledIcon class="action-icon" />
                </el-button>
            </el-tooltip>
        </div>
        <hr class="horizontal-line" />
        <BaseInputText
            v-model:value="keyword"
            :placeholder="$t('user.filterForm.keyword.placeholder')"
        />
        <el-tree
            :data="pbsGroupTree"
            node-key="_id"
            ref="pbsGroupTree"
            :filter-node-method="filterNode"
            class="pbs-tree"
        >
            <template #default="{ node }">
                <div class="custom-tree-node" @click="onClickDirectory(node)">
                    <el-dropdown trigger="contextmenu">
                        <span class="el-dropdown-link">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="$t('pbsGroup.tooltip')"
                                :show-after="100"
                                placement="top-start"
                            >
                                <div class="directory">
                                    {{ node?.data?.label }}
                                </div>
                            </el-tooltip>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-if="
                                        (node?.data?.level < maxPbsGroupLevel ||
                                            !node?.data?.level) &&
                                        canCreatePBSStructure
                                    "
                                    @click.stop="onClickAddSubPbsGroupButton(node?.data)"
                                    >{{ $t('pbsGroup.button.create') }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    @click.stop="
                                        onClickEditPbsGroupButton(node?.data?._id)
                                    "
                                    >{{ $t('pbsGroup.button.edit') }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="!node?.childNodes?.length"
                                    @click.stop="
                                        onClickDeletePbsGroupButton(node?.data?._id)
                                    "
                                    >{{ $t('pbsGroup.button.delete') }}</el-dropdown-item
                                >
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </template>
        </el-tree>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { pbsGroupModule } from '../store';
import {
    FolderAdd as FolderAddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CirclePlusFilled as CirclePlusFilledIcon,
} from '@element-plus/icons-vue';
import type Node from 'element-plus/es/components/tree/src/model/node';
import { ITreeNode, StructureTree } from '@/common/interfaces';
import {
    hasPermissionToAccessRouteInProject,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { pbsGroupService } from '../services/pbsGroup.service';
import { HttpStatus } from '@/common/constants';
import { Watch } from 'vue-property-decorator';
import debounce from 'lodash/debounce';
import { IPbsGroup } from '../interfaces';
import { MAX_PBS_GROUP_LEVEL } from '../constant';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';

@Options({
    components: { FolderAddIcon, DeleteIcon, EditIcon, CirclePlusFilledIcon },
})
export default class PbsTree extends mixins(UtilMixins) {
    get canCreatePBSStructure(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_CREATE_PBS_STRUCTURE,
        ]);
    }
    keyword = '';

    maxPbsGroupLevel = MAX_PBS_GROUP_LEVEL;

    debounceFilter = debounce(
        async () => {
            await pbsGroupModule.getPbsTree();
            pbsGroupModule.setIsChangePbsGroupTree(true);
        },
        500,
        { trailing: true },
    );

    get treeRef() {
        return this.$refs.pbsGroupTree as StructureTree;
    }

    get pbsGroupTree(): ITreeNode[] {
        return pbsGroupModule.pbsTree;
    }

    get isChangePbsGroupTree() {
        return pbsGroupModule.isChangePbsGroupTree;
    }

    async onClickDirectory(pbsGroup: Node) {
        pbsGroupModule.getSelectedPbsGroup(pbsGroup.data._id);
    }

    onClickAddPbsGroupButton() {
        pbsGroupModule.setIsCreatePbsGRoup(true);
        pbsGroupModule.setIsShowPbsGroupForm(true);
    }

    onClickAddSubPbsGroupButton(pbsGroup: IPbsGroup) {
        pbsGroupModule.setSelectedParentPbs(pbsGroup);
        pbsGroupModule.setIsCreatePbsGRoup(true);
        pbsGroupModule.setIsShowPbsGroupForm(true);
    }

    onClickEditPbsGroupButton(id: string) {
        pbsGroupModule.getSelectedPbsGroup(id);
        pbsGroupModule.setIsShowPbsGroupForm(true);
    }

    async onClickDeletePbsGroupButton(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('pbsGroup.message.confirmDeletePbsGroup') as string,
            i18n.global.t('pbsGroup.title.deletePbsGroup') as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            const response = await pbsGroupService.delete(id);
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('pbsGroup.message.deletePbsGroupSuccess') as string,
                );
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await pbsGroupModule.getPbsTree();
                loading.close();
                pbsGroupModule.setIsChangePbsGroupTree(true);
                if (pbsGroupModule.selectedPbsGroup?._id === id) {
                    pbsGroupModule.setSelectedPbsGroup(null);
                }
            } else {
                showErrorNotificationFunction(response.message as string);
                if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await pbsGroupModule.getPbsTree();
                    loading.close();
                    pbsGroupModule.setIsChangePbsGroupTree(true);
                }
            }
            this.treeRef.setCurrentKey(
                pbsGroupModule.selectedPbsGroup?._id as string,
                true,
            );
        }
    }

    @Watch('isChangePbsGroupTree')
    setCurrentKey() {
        if (this.isChangePbsGroupTree) {
            this.treeRef.setCurrentKey(
                pbsGroupModule.selectedPbsGroup?._id as string,
                true,
            );
            this.treeRef.filter(this.keyword);
            pbsGroupModule.setIsChangePbsGroupTree(false);
        }
    }

    filterNode(keyword: string, data: ITreeNode) {
        if (!keyword) return true;
        return data.label.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
    }

    @Watch('keyword')
    async setFilterNode() {
        if (!this.keyword) {
            await pbsGroupModule.getPbsTree();
            pbsGroupModule.setIsChangePbsGroupTree(true);
        }
        this.debounceFilter();
    }
}
</script>

<style lang="scss" scoped>
.pbs-group-title {
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
    .title {
        font-size: 16px;
        font-weight: 650;
    }
}
.action-icon {
    height: 1em;
    width: 1em;
}
.pbs-group-tree {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 15px;
}
.custom-tree-node {
    background-color: #ffffff;
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: -webkit-fill-available;
}
.action-icon {
    height: 16px;
    width: 16px;
}
.create {
    color: #409eff;
}
.edit {
    color: #e6a23c;
}
.delete {
    color: #f56c6c;
}
:deep(.el-button) {
    border: none !important;
    width: 16px !important;
    margin-left: 0px;
}
:deep(.el-button:hover) {
    opacity: 0.6;
}
:deep(.el-tree-node__content) {
    background-color: #ffffff !important;
}
:deep(.el-tree-node) {
    width: fit-content;
    min-width: calc((25vw - 115px));
}
.directory {
    white-space: nowrap;
    width: 75px;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 16px;
}
.pbs-tree {
    overflow-y: auto;
    height: calc(100vh - 300px);
}
</style>
