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
                                :content="$t('repository.folderForm.tooltip')"
                                :show-after="100"
                                placement="top-start"
                            >
                                <span class="folder-name">
                                    <FolderOpenedIcon
                                        v-if="isFolderOpened(node.data?.path)"
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
                                        $t('repository.folderForm.button.upload')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="node?.data?.level < maxFolderLevel"
                                    @click.stop="
                                        onClickCreateFolder(
                                            node?.data?.path,
                                            node?.data?.name,
                                        )
                                    "
                                    >{{
                                        $t('repository.folderForm.button.create')
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
                                        $t('repository.folderForm.button.edit')
                                    }}</el-dropdown-item
                                >
                                <el-dropdown-item
                                    v-if="
                                        !node?.childNodes?.length &&
                                        node?.data?.path !== rootFolderPath
                                    "
                                    @click.stop="onClickDeleteFolder(node?.data?.path)"
                                    >{{
                                        $t('repository.folderForm.button.delete')
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
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { repositoryModule } from '../store';
import { FolderStructureTree, IFolderStructureTree } from '@/common/interfaces';
import { repositoryService } from '../services/api.service';
import { FTPDataType, maxFolderLevel, rootFolderPath } from '@/common/constants';
import Node from 'element-plus/es/components/tree/src/model/node';
import { DragDropEventType } from '@/features/4D-planning/constants';

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
    openedFolderPaths: string[] = [rootFolderPath];
    rootFolderPath = rootFolderPath;

    get recentOpenedFolderKey(): TreeKey {
        return repositoryModule.recentOpenedFolderKey;
    }

    get currentPath(): string {
        return repositoryModule.currentPath;
    }

    get folderStructure(): IFolderStructureTree[] {
        return repositoryModule.folderStructure;
    }

    get treeRef() {
        return this.$refs.folderTree as FolderStructureTree;
    }

    mounted() {
        this.treeRef.setCurrentKey(this.recentOpenedFolderKey);
        const folder = this.treeRef.getNode(this.recentOpenedFolderKey);
        if (folder) {
            if (this.currentPath === this.recentOpenedFolderKey) {
                this.openedFolderPaths = [folder.data?.path];
            }
            let processingFolder = folder;
            while (processingFolder?.parent?.data?.name) {
                this.openedFolderPaths.push(processingFolder.parent.data.path);
                processingFolder = processingFolder.parent;
            }
        }
    }

    isFolderOpened(folderPath: string) {
        return this.openedFolderPaths.includes(folderPath);
    }

    async onClickFolder(folder: IFolderStructureTree) {
        repositoryModule.setCurrentPath(folder.path);
        repositoryModule.setRecentOpenedFolderKey(folder.path);
    }

    async onClickCreateFolder(path: string, name: string) {
        repositoryModule.setParentFolderName(name);
        repositoryModule.setSelectedFolderName('');
        repositoryModule.setCurrentPath(path);
        repositoryModule.setIsShowCreateFolderForm(true);
    }

    async onClickUpload(path: string) {
        repositoryModule.setCurrentPath(path);
        repositoryModule.setIsShowUploadFormPopup(true);
    }

    async onClickEditFolder(path: string, folderName: string) {
        repositoryModule.setSelectedFolderName(folderName);
        repositoryModule.setCurrentPath(path);
        repositoryModule.setIsShowCreateFolderForm(true);
    }

    async onClickDeleteFolder(path: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('repository.folderForm.delete.confirm.message'),
            this.$t('repository.folderForm.delete.confirm.title'),
        );
        if (confirm) {
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            const response = await repositoryService.deleteFolderAndFile({
                path,
                type: FTPDataType.FOLDER,
                projectId: projectModule.selectedProjectId || '',
            });
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('repository.folderForm.success.delete'),
                );
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                repositoryModule.setCurrentPath('/');
                await Promise.all([
                    repositoryModule.getFolderStructure(),
                    repositoryModule.getFolderFiles({
                        projectId: projectModule.selectedProjectId || '',
                        path: repositoryModule.currentPath,
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
        const response = await repositoryService.moveContent(
            draggedNode.data.path,
            draggedToNode.data.path,
        );
        if (response.success) {
            await repositoryModule.getFolderStructure();
            showSuccessNotificationFunction(
                this.$t('repository.folderForm.success.move'),
            );
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

    @Watch('recentOpenedFolderKey')
    onChangeRecentOpenedFolderKey(recentOpenedFolderKey: TreeKey) {
        this.treeRef.setCurrentKey(recentOpenedFolderKey);
        const folder = this.treeRef.getNode(recentOpenedFolderKey);
        if (folder) {
            if (repositoryModule.currentPath === recentOpenedFolderKey) {
                this.openedFolderPaths = [folder.data?.path];
            }
            let processingFolder = folder;
            while (processingFolder?.parent?.data?.name) {
                this.openedFolderPaths.push(processingFolder.parent.data.path);
                processingFolder = processingFolder.parent;
            }
        }
    }

    @Watch('currentPath')
    async onChangeCurrentPath(currentPath: string) {
        this.treeRef.setCurrentKey(currentPath);
        const folder = this.treeRef.getNode(currentPath);
        if (folder) {
            this.openedFolderPaths = [folder.data?.path];
            let processingFolder = folder;
            while (processingFolder?.parent?.data?.name) {
                this.openedFolderPaths.push(processingFolder.parent.data.path);
                processingFolder = processingFolder.parent;
            }

            const loading = ElLoading.service({ target: '.file-table' });
            await repositoryModule.getFolderFiles({
                projectId: projectModule.selectedProjectId || '',
                path: repositoryModule.currentPath,
            });
            loading.close();
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
    }
}
</style>
