<template>
    <div class="folder-tree">
        <el-tree
            ref="folderTree"
            class="abs-tree"
            :data="folderStructure"
            node-key="path"
            @node-click="onClickFolder"
            :default-expanded-keys="['/']"
            default-expand-all
            :expand-on-click-node="false"
            @node-drop="onFolderDrop"
            :allow-drop="checkCanDrop"
            draggable
        >
            <template #default="{ node }">
                <div class="folder">
                    <el-dropdown trigger="contextmenu">
                        <span class="el-dropdown-link">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="$t('abs.folderForm.tooltip')"
                                :show-after="100"
                                placement="top-start"
                            >
                                <span class="folder-name">
                                    <FolderOpenedIcon
                                        v-if="isFolderOpened(node.id)"
                                        class="icon"
                                    />
                                    <FolderClosedIcon class="icon" v-else />
                                    <span>{{ node?.data?.name }}</span>
                                </span>
                            </el-tooltip>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    @click.stop="onClickUpload(node?.data?.path)"
                                    >{{
                                        $t('abs.folderForm.button.upload')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="
                                        node?.data?.level < maxFolderLevel &&
                                        canCreateABSStructure(node?.data?.path || '')
                                    "
                                    @click.stop="
                                        onClickCreateFolder(
                                            node?.data?.path,
                                            node?.data?.name,
                                        )
                                    "
                                    >{{
                                        $t('abs.folderForm.button.create')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="node?.data?.path !== rootFolderPath"
                                    @click.stop="
                                        onClickEditFolder(
                                            node?.data?.path,
                                            node?.data?.name,
                                        )
                                    "
                                    >{{
                                        $t('abs.folderForm.button.edit')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="
                                        !node?.childNodes?.length &&
                                        node?.data?.path !== rootFolderPath &&
                                        canDeleteABSStructure(node?.data?.path || '')
                                    "
                                    @click.stop="onClickDeleteFolder(node?.data?.path)"
                                    >{{
                                        $t('abs.folderForm.button.delete')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="canAssignToPbs(node?.data?.path || '')"
                                    @click.stop="
                                        onClickAssignToPbs(node?.data?.path || '')
                                    "
                                    >{{
                                        $t('abs.folderForm.button.assignPbs')
                                    }}</el-dropdown-item
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
import { FolderStructureTree, IFolderStructureTree } from '@/common/interfaces';
import { absModule } from '../store';
import { projectModule } from '@/features/project/store';
import { ElLoading } from 'element-plus';
import { TreeKey } from 'element-plus/es/components/tree/src/tree.type';
import { Watch } from 'vue-property-decorator';
import {
    FolderAdd as FolderAddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    CirclePlusFilled as CirclePlusFilledIcon,
    Folder as FolderClosedIcon,
    FolderOpened as FolderOpenedIcon,
    Upload as UploadIcon,
} from '@element-plus/icons-vue';
import {
    getPbsGroupPermissionsForFolder,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { absService } from '../services/abs.service';
import { FTPDataType, maxFolderLevel, rootFolderPath } from '@/common/constants';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import Node from 'element-plus/es/components/tree/src/model/node';
import { DragDropEventType } from '@/features/4D-planning/constants';
import { rootFolderIndex } from '../constants';
import localStorageAuthService from '@/common/authStorage';
import { projectFileService } from '../services/project-file.service';
@Options({
    components: {
        FolderClosedIcon,
        FolderOpenedIcon,
        FolderAddIcon,
        DeleteIcon,
        EditIcon,
        CirclePlusFilledIcon,
        UploadIcon,
    },
})
export default class FolderStructure extends mixins(UtilMixins) {
    maxFolderLevel = maxFolderLevel;
    openedFolderIds: number[] = [rootFolderIndex];
    rootFolderPath = rootFolderPath;

    get recentOpenedFolderKey(): TreeKey {
        return absModule.recentOpenedFolderKey;
    }

    get currentPath(): string {
        return absModule.currentPath;
    }

    get folderStructure(): IFolderStructureTree[] {
        return absModule.folderStructure;
    }

    get treeRef() {
        return this.$refs.folderTree as FolderStructureTree;
    }

    get projectFolderAssignPbs() {
        return absModule.projectFolderAssignPbs;
    }

    get pbsGroupPermissions() {
        return localStorageAuthService.getPbsGroupPermissions();
    }

    canCreateABSStructure(path: string): boolean {
        return getPbsGroupPermissionsForFolder(
            this.projectFolderAssignPbs,
            this.pbsGroupPermissions,
            path,
        ).includes(ProjectSecurityPermissions.GENERAL_CREATE_ABS_STRUCTURE);
    }

    canDeleteABSStructure(path: string): boolean {
        return getPbsGroupPermissionsForFolder(
            this.projectFolderAssignPbs,
            this.pbsGroupPermissions,
            path,
        ).includes(ProjectSecurityPermissions.GENERAL_DELETE_IN_ABS);
    }

    isFolderOpened(folderId: number) {
        return this.openedFolderIds.includes(folderId);
    }

    async onClickFolder(folder: IFolderStructureTree) {
        absModule.setCurrentPath(folder.path);
        absModule.setRecentOpenedFolderKey(folder.path);
    }

    async onClickCreateFolder(path: string, folderName: string) {
        absModule.setParentFolderName(folderName);
        absModule.setSelectedFolderName('');
        absModule.setCurrentPath(path);
        absModule.setIsShowCreateFolderForm(true);
    }

    async onClickUpload(path: string) {
        absModule.setCurrentPath(path);
        absModule.setIsShowUploadFormPopup(true);
    }

    async onClickEditFolder(path: string, folderName: string) {
        absModule.setSelectedFolderName(folderName);
        absModule.setCurrentPath(path);
        absModule.setIsShowCreateFolderForm(true);
    }

    async onClickDeleteFolder(path: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('abs.folderForm.delete.confirm.message'),
            this.$t('abs.folderForm.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const response = await absService.deleteFolderAndFile({
                path,
                type: FTPDataType.FOLDER,
                projectId: projectModule.selectedProjectId || '',
            });
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(this.$t('abs.folderForm.success.delete'));
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                absModule.setCurrentPath('/');
                await Promise.all([
                    absModule.getFolderStructure(projectModule.selectedProjectId || ''),
                    absModule.getFolderFiles({
                        projectId: projectModule.selectedProjectId || '',
                        path: absModule.currentPath,
                    }),
                ]);
                loading.close();
            } else if (!response.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
        }
    }

    async onFolderDrop(draggedNode: Node, draggedToNode: Node) {
        const loading = ElLoading.service({ target: '.folder-tree' });
        const response = await absService.moveContent({
            projectId: projectModule.selectedProjectId || '',
            source: draggedNode.data.path,
            destination: draggedToNode.data.path,
        });
        if (response.success) {
            await absModule.getFolderStructure(projectModule.selectedProjectId || '');
            showSuccessNotificationFunction(this.$t('abs.folderForm.success.move'));
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    checkCanDrop(
        draggedNode: Node,
        draggedToNode: Node,
        type: DragDropEventType,
    ): boolean {
        if (
            type !== DragDropEventType.INNER &&
            draggedToNode.data.path === rootFolderPath
        ) {
            return false;
        }
        return true;
    }

    canAssignToPbs(path: string) {
        return getPbsGroupPermissionsForFolder(
            this.projectFolderAssignPbs,
            this.pbsGroupPermissions,
            path,
        )?.includes(ProjectSecurityPermissions.GENERAL_ASSIGN_PBS_TO_ABS);
    }

    async onClickAssignToPbs(path: string) {
        const response = await projectFileService.getFolderByPath({
            path,
            projectId: projectModule.selectedProjectId || '',
        });
        if (response.success) {
            absModule.setSelectedFileId(response.data?._id);
            absModule.setIsShowAssignToPBSForm(true);
            absModule.setIsAssignPbsToFolder(true);
            absModule.setSelectedFilePath(path);
        }
    }

    @Watch('recentOpenedFolderKey')
    onChangeRecentOpenedFolderKey(recentOpenedFolderKey: TreeKey) {
        if (recentOpenedFolderKey.toString()?.length) {
            this.treeRef.setCurrentKey(recentOpenedFolderKey);
            const folder = this.treeRef.getNode(recentOpenedFolderKey);
            if (folder) {
                if (absModule.currentPath === recentOpenedFolderKey) {
                    this.openedFolderIds = [folder.id];
                }
                let processingFolder = folder;
                while (processingFolder?.parent?.data?.name) {
                    this.openedFolderIds.push(processingFolder.parent.id);
                    processingFolder = processingFolder.parent;
                }
            }
        }
    }

    @Watch('currentPath')
    async onChangeCurrentPath(currentPath: string) {
        if (currentPath.length) {
            this.treeRef.setCurrentKey(currentPath);
            const folder = this.treeRef.getNode(currentPath);
            if (folder) {
                this.openedFolderIds = [folder.id];
                let processingFolder = folder;
                while (processingFolder?.parent?.data?.name) {
                    this.openedFolderIds.push(processingFolder.parent.id);
                    processingFolder = processingFolder.parent;
                }

                const loading = ElLoading.service({ target: '.file-table' });
                await absModule.getFolderFiles({
                    projectId: projectModule.selectedProjectId || '',
                    path: absModule.currentPath,
                });
                loading.close();
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.folder {
    display: flex;
    justify-content: space-between;
    width: 100%;
    span {
        display: flex;
        align-items: center;
        gap: 5px;
    }
}
.icon {
    width: 18px;
}
:deep(.el-tree-node__content) {
    width: 100%;
}
.folder-tree {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 5px;
    height: calc(100vh - 135px);
}
.action-icon {
    width: 16px;
}

:deep(.el-tree-node) {
    width: fit-content;
    min-width: calc((25vw - 115px));
}
.abs-tree {
    overflow-y: hidden;
    height: 100%;
}

.folder-name {
    span {
        display: inline-block;
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 15px;
        min-height: 16px;
    }
}
</style>
