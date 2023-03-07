<template>
    <el-input v-model="filterName" placeholder="Filter By task name" class="col-6" />
    <div class="tree-header">
        <div class="header-name col-6">{{ $t('planning.linkForm.tree.columnName') }}</div>
        <div class="header-id col-3">{{ $t('planning.linkForm.tree.columnID') }}</div>
        <div class="header-type col-3">{{ $t('planning.linkForm.tree.columnType') }}</div>
    </div>
    <el-tree
        ref="treeRef"
        class="filter-tree"
        lazy
        show-checkbox
        :load="taskData"
        :props="taskTreeProps"
        node-key="id"
        default-expand-all
        :filter-node-method="filterTaskByName"
    >
        <template #default="{ node }">
            <div
                class="task-name"
                :style="{ width: `calc(50% - ${9 * node?.level}px - 35px)` }"
            >
                <FolderOpenedIcon
                    v-if="node?.data?.type === TaskType.WBS_SUMMARY"
                    class="project-icon"
                />
                <DocumentIcon v-else class="standard-icon" />
                <span>{{ node?.data?.label }}</span>
            </div>
            <div class="task-id">
                <span>{{ node?.data?.id }}</span>
            </div>
            <div class="task-type">
                <span>{{ $t(`planning.task.types.${node?.data?.type}`) }}</span>
            </div>
        </template>
    </el-tree>
    <el-button type="success" class="m-4" @click="onClickAddButton">
        {{ $t(`planning.linkForm.buttons.addLink`) }}
    </el-button>
</template>

<script lang="ts">
import { ElTree } from 'element-plus';
import { Options, mixins } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';
import {
    FolderOpened as FolderOpenedIcon,
    Document as DocumentIcon,
} from '@element-plus/icons-vue';
import { LinkDependency, LinkType, TaskType } from '../../constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import { ILinkDetail } from '../../interfaces';

interface Tree {
    id: number;
    label: string;
    children?: Tree[];
}

interface ITaskTreeData {
    // _id
    value: string;
    label: string;
    isLeaf: boolean;
    // id in gantt
    id: string;
    start: Date | null;
    finish: Date | null;
    type: string;
}

@Options({ components: { FolderOpenedIcon, DocumentIcon } })
export default class PlanningTaskTree extends mixins(Planning4DMixin) {
    @Prop({ default: LinkDependency.PREDECESSOR })
    readonly linkDependency!: LinkDependency;
    TaskType = TaskType;

    taskTreeProps = {
        children: 'children',
        label: 'label',
    };
    filterName = '';

    taskData(
        node:
            | {
                  isLeaf: boolean;
                  level: number;
                  data: ITaskTreeData;
              }
            | undefined,
        resolve: any,
    ): void {
        const tasks =
            projectPlanningModule.planning?.tasks?.filter((task) => {
                return (
                    !(task.milestoneType && !task.isMilestoneFolder) &&
                    task._id !== projectPlanningModule.linkPopupParam.selectedTask?._id
                );
            }) || [];
        if (node?.isLeaf) {
            return resolve([]);
        }
        if (node?.level === 0) {
            return resolve(
                tasks
                    .filter((task) => {
                        return task.parentId === null;
                    })
                    .map((task) => ({
                        value: task._id,
                        label: task.name,
                        isLeaf:
                            tasks.findIndex((item) => item.parentId === task._id) === -1,
                        id: task.ganttId,
                        start: task.start,
                        finish: task.finish,
                        type: task.taskType,
                    })),
            );
        }

        resolve(
            tasks
                .filter((task) => {
                    return (
                        task.parentId === node?.data?.value && task.milestoneType === null
                    );
                })
                .map((task) => ({
                    value: task._id,
                    label: task.name,
                    isLeaf: tasks.findIndex((item) => item.parentId === task._id) === -1,
                    id: task.ganttId,
                    start: task.start,
                    finish: task.finish,
                    type: task.taskType,
                })),
        );
    }

    resetCheckedNodes() {
        (this.$refs.treeRef as InstanceType<typeof ElTree>).setCheckedNodes([]);
    }

    filterTaskByName = (value: string, data: Tree) => {
        if (!value) return true;
        return data.label.includes(value);
    };

    onClickAddButton() {
        const nodeCheckedList = (
            this.$refs.treeRef as InstanceType<typeof ElTree>
        ).getCheckedNodes();

        const nodeCanCreateLink = nodeCheckedList.filter((node) => {
            return node.type !== TaskType.WBS_SUMMARY;
        });
        if (!nodeCanCreateLink.length) {
            showErrorNotificationFunction(
                this.$t('planning.linkForm.messages.errorSelectTasksLinkToEmpty'),
            );
        } else {
            const taskLinkToList: ILinkDetail[] = nodeCanCreateLink.map((node) => {
                return {
                    dependency: this.linkDependency,
                    taskLinkToId: node.value,
                    taskLinkToGanttId: node.id,
                    taskLinkToName: node.label,
                    taskLinkToFinish: node.finish,
                    taskLinkToStart: node.start,
                    type: LinkType.START_TO_START,
                    taskLag: 0,
                };
            });

            projectPlanningModule.setLinkFormPopupParam({
                dependency: this.linkDependency,
                taskLinkToList,
                show: true,
            });
        }
    }

    @Watch('filterName')
    handleFilterName(value: string) {
        (this.$refs.treeRef as InstanceType<typeof ElTree>).filter(value);
    }
}
</script>

<style scoped lang="scss">
.project-icon,
.standard-icon {
    width: 20px;
    margin-right: 5px;
}

.plus-icon {
    width: 16px;
}

.tree-header {
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 6px 0;
    width: 100%;
    border-top: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);
}

.task-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 30px;
}

.task-id {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 30px;
    flex: 3;
}

.task-type {
    padding-right: 30px;
    flex: 3;
}

:deep(span.el-tree-node__label) {
    display: contents;
}
</style>
