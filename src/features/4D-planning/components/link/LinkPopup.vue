<template>
    <el-dialog
        :title="
            isCreateLink
                ? $t('planning.linkForm.title.createLink')
                : $t('planning.linkForm.title.currentLinks')
        "
        v-model="open"
        @close="handleClose"
        @open="handleOpen"
        width="80%"
        destroy-on-close
    >
        <div v-if="isCreateLink" class="d-flex flex-column">
            <div class="tree-task row">
                <el-tabs v-model="dependencySelected">
                    <el-tab-pane
                        :label="$t('planning.linkForm.dependency.predecessor')"
                        :name="LinkDependency.PREDECESSOR"
                    >
                        <PlanningTaskTree
                            :ref="LinkDependency.PREDECESSOR"
                            :linkDependency="LinkDependency.PREDECESSOR"
                        />
                    </el-tab-pane>
                    <el-tab-pane
                        :label="$t('planning.linkForm.dependency.successor')"
                        :name="LinkDependency.SUCCESSOR"
                    >
                        <PlanningTaskTree
                            :ref="LinkDependency.SUCCESSOR"
                            :linkDependency="LinkDependency.SUCCESSOR"
                        />
                    </el-tab-pane>
                </el-tabs>
            </div>
            <LinkList
                :title="$t('planning.linkForm.title.candidateLinks')"
                :linkList="linkList"
            >
                <template #action>
                    <el-table-column fixed="right" width="175">
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="edit"
                                @click="onClickEdit(scope.row)"
                                >{{ $t('planning.buttons.edit') }}</el-button
                            >
                            <el-button
                                size="small"
                                type="danger"
                                @click="onClickDelete(scope.row)"
                                >{{ $t('planning.buttons.delete') }}</el-button
                            >
                        </template>
                    </el-table-column>
                </template>
            </LinkList>

            <LinkList
                :title="$t('planning.linkForm.title.currentLinks')"
                :linkList="currentLinkList"
            />
        </div>

        <div v-else>
            <LinkList :linkList="currentLinkList" />
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="onSubmit" v-if="isCreateLink">{{
                    $t('planning.folderForm.buttons.submit')
                }}</el-button>
                <el-button @click="onCancel">{{
                    $t('planning.folderForm.buttons.cancel')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
    <LinkForm @added-links="handleAfterAddLinksToLinkList" />
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import { mixins, Options } from 'vue-class-component';
import { LinkDependency } from '../../constants';
import { ICreateLinkDto, ILinkDetail } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';
import LinkForm from './LinkForm.vue';
import LinkList from './LinkList.vue';
import PlanningTaskTree from './PlanningTaskTree.vue';

@Options({
    components: {
        PlanningTaskTree,
        LinkForm,
        LinkList,
        DeleteIcon,
    },
})
export default class LinkPopup extends mixins(Planning4DMixin) {
    LinkDependency = LinkDependency;
    dependencySelected: LinkDependency = LinkDependency.PREDECESSOR;
    currentLinkList: ILinkDetail[] = [];

    get open() {
        return projectPlanningModule.linkPopupParam.show;
    }

    get linkList() {
        return projectPlanningModule.bulkCreateLinkList;
    }

    get isCreateLink() {
        return projectPlanningModule.linkPopupParam.isCreate;
    }

    async handleOpen() {
        const planningId = projectPlanningModule.planningId;
        const taskId = projectPlanningModule.linkPopupParam.selectedTask?._id;

        if (!planningId || !taskId) {
            return;
        }
        const loading = ElLoading.service({});
        const linkListResponse = await projectPlanningService.getLinkListByTaskId(
            planningId,
            taskId,
        );
        loading.close();
        if (linkListResponse.success) {
            this.currentLinkList = [
                ...linkListResponse.data.predecessors,
                ...linkListResponse.data.successors,
            ];
        }
    }

    onClickDelete(linkDetail: ILinkDetail) {
        const linkNeedCreateList = cloneDeep(projectPlanningModule.bulkCreateLinkList);
        const newList = linkNeedCreateList.filter((link) => {
            return (
                link.taskLinkToGanttId !== linkDetail.taskLinkToGanttId ||
                link.dependency !== linkDetail.dependency
            );
        });
        projectPlanningModule.setBulkCreateLinkList(newList);
    }

    onClickEdit(linkDetail: ILinkDetail) {
        projectPlanningModule.setLinkFormPopupParam({
            dependency: linkDetail.dependency,
            taskLinkToList: [linkDetail],
            show: true,
            edit: true,
        });
    }

    handleClose() {
        projectPlanningModule.setLinkPopupParam({
            selectedTask: null,
            show: false,
            isCreate: false,
        });
        projectPlanningModule.setLinkFormPopupParam({
            dependency: null,
            taskLinkToList: [],
            show: false,
        });
        projectPlanningModule.setBulkCreateLinkList([]);
    }

    async onSubmit() {
        const planningId = projectPlanningModule.planningId;
        const bulkCreateLinkList = projectPlanningModule.bulkCreateLinkList;
        if (!bulkCreateLinkList.length) {
            showErrorNotificationFunction(
                this.$t('planning.linkForm.messages.errorLinkListToCreateEmpty'),
            );
            return;
        }
        const linkList: ICreateLinkDto[] = bulkCreateLinkList?.map((link) => {
            let source = '';
            let target = '';
            if (link.dependency === LinkDependency.PREDECESSOR) {
                source = link.taskLinkToId;
                target = projectPlanningModule.linkPopupParam.selectedTask?._id || '';
            } else {
                target = link.taskLinkToId;
                source = projectPlanningModule.linkPopupParam.selectedTask?._id || '';
            }

            return {
                source,
                target,
                type: link.type,
                lag: link.taskLag,
            };
        });

        const loading = ElLoading.service({});
        const response = await projectPlanningService.bulkCreateLink(planningId, {
            items: linkList,
            path: localStorageAuthService.getPlanningPermissions().path || '',
            projectId: projectModule.selectedProjectId || '',
        });

        loading.close();
        if (response.success) {
            this.$emit('add-new-links', response.data);
            showSuccessNotificationFunction(
                this.$t('planning.linkForm.messages.success'),
            );
        } else {
            showErrorNotificationFunction(response.message as string);
        }
        this.handleClose();
    }

    onCancel() {
        this.handleClose();
    }

    handleAfterAddLinksToLinkList(dependency: LinkDependency) {
        (this.$refs[dependency] as PlanningTaskTree).resetCheckedNodes();
    }
}
</script>

<style scoped lang="scss">
.tree-task {
    flex: 7;
}

.link-list {
    margin-top: 20px;
    flex: 5;
    overflow: auto;
}

.delete-icon {
    width: 16px;
}
</style>
