<template>
    <div class="activity-code">
        <div class="activity-code-name col-10">
            <FolderOpenedIcon class="project-icon" />
            {{ activityCodeTree?.name }}
        </div>
        <div
            v-if="!isAssignLayout"
            class="col-2 d-flex justify-content-end align-content-center"
        >
            <PlusIcon class="action-icon" @click="onClickAddButton(null)" />
            <EditIcon class="action-icon" @click="onClickEditButton(null)" />
            <DeleteIcon class="action-icon" @click="onClickDeleteButton(null)" />
        </div>
    </div>
    <el-tree
        v-if="dataTree.length && show"
        class="activity-values"
        lazy
        check-strictly
        :load="activityCodeData"
        :props="activityCodeTreeProps"
        node-key="id"
        default-expand-all
    >
        <template #default="{ node }">
            <div
                class="activity-code-value-name"
                :style="{ width: `calc(33.33% - ${12 * node?.level}px - 12px)` }"
            >
                <DocumentIcon class="standard-icon" />
                <span>{{ node?.data?.label }}</span>
            </div>
            <div class="activity-code-value-description">
                <span>{{ node?.data?.description }}</span>
            </div>
            <div class="activity-code-value-color">
                <div
                    :style="{
                        background: node?.data?.color,
                        width: '20px',
                        height: '20px',
                        marginLeft: '5px',
                    }"
                ></div>
            </div>
            <div
                class="activity-code-value-action d-flex justify-content-end align-content-center"
            >
                <div
                    v-if="isAssignLayout"
                    :class="{
                        isSelected: node?.data?.value === activityCodeValueIdSelected,
                    }"
                >
                    <SelectIcon
                        class="action-icon"
                        @click="onClickSelectButton(node?.data?.value)"
                    />
                </div>
                <div v-else class="d-flex justify-content-end align-content-center">
                    <PlusIcon
                        class="action-icon"
                        @click="onClickAddButton(node?.data?.value)"
                    />
                    <EditIcon
                        class="action-icon"
                        @click="onClickEditButton(node?.data?.value)"
                    />
                    <DeleteIcon
                        class="action-icon"
                        @click="onClickDeleteButton(node?.data?.value)"
                    />
                </div>
            </div>
        </template>
    </el-tree>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { IActivityCodeListItem } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import {
    FolderOpened as FolderOpenedIcon,
    Document as DocumentIcon,
    Delete as DeleteIcon,
    Plus as PlusIcon,
    Edit as EditIcon,
    Select as SelectIcon,
} from '@element-plus/icons-vue';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import i18n from '@/plugins/vue-i18n';
import { projectPlanningModule } from '../../store';
import { projectPlanningService } from '../../services/planning.service';

interface IActivityCodeTreeData {
    // _id
    value: string;
    label: string;
    isLeaf: boolean;
    description: string | null;
    color: string;
}

@Options({
    components: {
        DocumentIcon,
        FolderOpenedIcon,
        DeleteIcon,
        PlusIcon,
        EditIcon,
        SelectIcon,
    },
})
export default class ActivityCodeTree extends mixins(Planning4DMixin) {
    @Prop({ default: null }) readonly activityCodeTree!: IActivityCodeListItem | null;
    @Prop({ default: false }) readonly isAssignLayout!: boolean;

    // setup for reloading
    show = true;
    // set up for assign activity code
    activityCodeValueIdSelected = '';

    activityCodeTreeProps = {
        children: 'children',
        label: 'label',
    };

    // need reload after delete node in tree (because using lazy tree)
    reload() {
        this.show = false;
        this.$nextTick(() => {
            this.show = true;
        });
    }

    get dataTree() {
        return this.activityCodeTree?.activityCodeValues || [];
    }

    activityCodeData(
        node:
            | {
                  isLeaf: boolean;
                  level: number;
                  data: IActivityCodeTreeData;
              }
            | undefined,
        resolve: any,
    ): void {
        if (node?.isLeaf) {
            return resolve([]);
        }
        if (node?.level === 0) {
            return resolve(
                this.dataTree
                    .filter((activityCodeValue) => {
                        return activityCodeValue.parentId === null;
                    })
                    .map((activityCodeValue) => ({
                        value: activityCodeValue._id,
                        label: activityCodeValue.name,
                        description: activityCodeValue.description,
                        color: activityCodeValue.colorCode,
                        isLeaf:
                            this.dataTree.findIndex(
                                (item) => item.parentId === activityCodeValue._id,
                            ) === -1,
                    })),
            );
        }

        resolve(
            this.dataTree
                .filter((activityCodeValue) => {
                    return activityCodeValue.parentId === node?.data?.value;
                })
                .map((activityCodeValue) => ({
                    value: activityCodeValue._id,
                    label: activityCodeValue.name,
                    description: activityCodeValue.description,
                    color: activityCodeValue.colorCode,
                    isLeaf:
                        this.dataTree.findIndex(
                            (item) => item.parentId === activityCodeValue._id,
                        ) === -1,
                })),
        );
    }

    onClickAddButton(id: string | null) {
        if (!id) {
            // click from activity code
            projectPlanningModule.setActivityCodePopupParam({
                show: true,
                isCreate: true,
                activityCodeIdSelected: this.activityCodeTree?._id || '',
                activityCodeValueSelected: '',
            });
        } else {
            // click form activity code value
            projectPlanningModule.setActivityCodePopupParam({
                show: true,
                isCreate: true,
                activityCodeIdSelected: this.activityCodeTree?._id || '',
                activityCodeValueSelected: id,
            });
        }
        this.$emit('add-activity-code-value');
    }

    onClickEditButton(id: string | null) {
        if (!id) {
            // click from activity code
            projectPlanningModule.setActivityCodePopupParam({
                show: true,
                isCreate: false,
                activityCodeIdSelected: this.activityCodeTree?._id || '',
                activityCodeValueSelected: '',
            });
            this.$emit('edit-activity-code');
        } else {
            // click form activity code value
            projectPlanningModule.setActivityCodePopupParam({
                show: true,
                isCreate: false,
                activityCodeIdSelected: this.activityCodeTree?._id || '',
                activityCodeValueSelected: id,
            });
            this.$emit('edit-activity-code-value');
        }
    }

    async onClickDeleteButton(id: string | null) {
        if (!id) {
            // click from activity code
            const confirm = await showConfirmPopUpFunction(
                this.$t('planning.activityCode.message.confirmDeleteActivityCode'),
                this.$t('planning.activityCode.title.deleteActivityCode'),
            );

            if (confirm) {
                const loading = ElLoading.service({ target: '.el-drawer__body' });
                const response = await projectPlanningService.deleteActivityCode(
                    this.activityCodeTree?._id as string,
                );

                loading.close();
                if (response.success) {
                    showSuccessNotificationFunction(
                        i18n.global.t(
                            'planning.activityCode.message.deleteActivityCodeSuccess',
                        ) as string,
                    );
                    const loading = ElLoading.service({ target: '.el-drawer__body' });
                    await projectPlanningModule.getActivityCodeList();
                    loading.close();
                } else {
                    showErrorNotificationFunction(response.message as string);
                }
                this.reload();
                this.$emit('delete-activity-code');
            }
        } else {
            // click form activity code value
            const confirm = await showConfirmPopUpFunction(
                this.$t('planning.activityCode.message.confirmDeleteActivityCodeValue'),
                this.$t('planning.activityCode.title.deleteActivityCodeValue'),
            );

            if (confirm) {
                const loading = ElLoading.service({ target: '.el-drawer__body' });
                const response = await projectPlanningService.deleteActivityCodeValue(id);

                loading.close();
                if (response.success) {
                    showSuccessNotificationFunction(
                        i18n.global.t(
                            'planning.activityCode.message.deleteActivityCodeValueSuccess',
                        ) as string,
                    );
                    const loading = ElLoading.service({ target: '.el-drawer__body' });
                    await projectPlanningModule.getActivityCodeList();
                    loading.close();
                } else {
                    showErrorNotificationFunction(response.message as string);
                }
                this.reload();
                this.$emit('delete-activity-code-value');
            }
        }
    }

    async onClickSelectButton(id: string) {
        const response = await projectPlanningService.assignActivityCodeValue({
            taskIds: projectPlanningModule.selectedTaskIdList,
            activityCodeValueId: id,
            projectId: projectPlanningModule.planning?.projectId || '',
        });
        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('planning.activityCode.message.assignSuccess') as string,
            );
            this.activityCodeValueIdSelected = id;
            this.$emit('assign-activity-code-value');
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }
}
</script>

<style lang="scss" scoped>
.activity-code-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.activity-code {
    display: flex;
    line-height: 30px;
    margin: 4px 0;
    &:hover {
        background: #eee;
    }

    .action-icon {
        margin: 5px;
    }
}

.action-icon,
.project-icon,
.standard-icon {
    width: 20px;
    margin: 0 5px;
    &:hover {
        background: #ddd;
    }
}

.isSelected {
    color: green;
}
.action-icon {
    cursor: pointer;
}

.activity-code-value-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 16px;
}

.activity-code-value-description {
    flex: 4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 16px;
}

.activity-code-value-color {
    flex: 2;
}

.activity-code-value-action {
    flex: 2;
}

:deep(span.el-tree-node__label) {
    display: contents;
}
</style>
