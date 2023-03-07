<template>
    <div class="assign-project-popup-wrapper">
        <el-dialog
            width="60%"
            v-model="isShowAssignProjectPopup"
            @closed="closePopup"
            @open="openPopup"
            custom-class="assign-project-popup"
        >
            <template #title>
                <h3>{{ $t('group.assignProjectPopup.title') }}</h3>
                <h5>
                    {{
                        $t('group.assignProjectPopup.groupName', { groupName: groupName })
                    }}
                </h5>
            </template>
            <div class="row header-assign">
                <div class="col-12"></div>
            </div>
            <div class="row">
                <div class="col-md-5">
                    <div class="project-list-header">
                        <div class="project-list-title">
                            {{ $t('group.assignProjectPopup.project') }}
                        </div>
                    </div>
                    <hr class="horizontal-line" />

                    <div
                        class="project-in-group-list"
                        v-if="projectInGroupList.length > 0"
                    >
                        <div v-for="project in projectInGroupList" :key="project">
                            <div class="project-in-group">
                                <div class="full-name">
                                    {{ `${project.name ? project.name : ''} ` }}
                                </div>
                                <el-tooltip
                                    class="action"
                                    effect="dark"
                                    :content="
                                        $t('group.assignProjectPopup.tooltip.delete')
                                    "
                                    placement="top"
                                >
                                    <el-button
                                        size="mini"
                                        @click="
                                            updateGroupIds(
                                                project,
                                                UpdateGroupAction.REMOVE_PROJECT,
                                            )
                                        "
                                    >
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
                    <div class="project-list-header">
                        <div class="project-list-title">
                            {{ $t('group.assignProjectPopup.newProject') }}
                        </div>
                        <BaseInputText
                            class="text-search"
                            v-model:value="textSearch"
                            @keyup="onKeyup"
                            :placeholder="$t('group.filterForm.keyword.placeholder')"
                        />
                    </div>
                    <hr class="horizontal-line" />

                    <div
                        class="project-not-in-group-list"
                        v-if="projectNotInGroupList.length > 0"
                    >
                        <div
                            v-for="project in projectNotInGroupList"
                            :key="project"
                            @click="
                                updateGroupIds(project, UpdateGroupAction.ASSIGN_PROJECT)
                            "
                            class="project-item"
                        >
                            <div class="project-not-in-group">
                                <div>
                                    <div class="full-name">
                                        {{ `${project.name ? project.name : ''} ` }}
                                    </div>
                                </div>
                            </div>
                            <hr class="horizontal-line" />
                        </div>
                    </div>
                    <BaseEmptyData v-else />
                    <div class="block pagination-container">
                        <el-pagination
                            :hide-on-single-page="false"
                            layout="prev, pager, next"
                            :page-size="LIMIT_PER_PAGE"
                            :total="totalProjectNotInGroup"
                            v-model:currentPage="currentPage"
                            popper-class="pagination-select"
                            v-if="totalProjectNotInGroup > LIMIT_PER_PAGE"
                            @current-change="handlePaginate"
                        >
                        </el-pagination>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { IProject } from '@/features/project/interfaces';
import { GroupMixin } from '../../mixins/GroupMixins';
import { mixins, Options } from 'vue-class-component';
import { groupModule } from '../../store';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import {
    showConfirmPopUpFunction,
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { UpdateGroupAction } from '../../constant';
import { groupService } from '../../services/api.services';
import debounce from 'lodash/debounce';
import { Watch } from 'vue-property-decorator';
@Options({
    components: { DeleteIcon },
})
export default class AssignProjectPopup extends mixins(GroupMixin) {
    textSearch = '';
    currentPage!: number;

    debounceFilter = debounce(
        async () => {
            groupModule.setProjectListQueryString({
                keyword: this.textSearch,
            });
            this.currentPage = 1;
            this.handlePaginate(this.currentPage);
            await groupModule.getProjectNotInGroupList();
        },
        500,
        { trailing: true },
    );

    get isShowAssignProjectPopup(): boolean {
        return groupModule.isShowAssignProjectPopup || false;
    }

    set isShowAssignProjectPopup(val: boolean) {
        groupModule.setIsShowAssignProjectPopup(val);
    }

    get groupName(): string {
        return groupModule.selectedGroup?.name || '';
    }

    get projectInGroupList(): IProject[] {
        return groupModule.selectedGroup?.projects || [];
    }

    get projectNotInGroupList(): IProject[] {
        return groupModule.projectNotInGroupList;
    }

    get totalProjectNotInGroup(): number {
        return groupModule.totalProjectNotInGroup;
    }

    handlePaginate(pageNumber: number): void {
        groupModule.setProjectListQueryString({
            page: pageNumber,
        });
        groupModule.getProjectNotInGroupList();
    }

    async openPopup(): Promise<void> {
        groupModule.getProjectNotInGroupList();
        this.textSearch = '';
        this.currentPage = 1;
    }

    async closePopup(): Promise<void> {
        groupModule.setIsShowAssignProjectPopup(false);
        groupModule.setSelectedGroup(null);
        groupModule.resetProjectListQueryString();
        this.textSearch = '';
        this.currentPage = 1;
    }

    async updateGroupIds(project: IProject, action: UpdateGroupAction): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t(`group.message.${action}.confirmAsk`, {
                projectName: `${project.name ? project.name : ''}`,
            }) as string,
            i18n.global.t(`group.message.${action}.title`) as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-popup',
            });

            const response = await groupService.updateGroupProjectIds(
                groupModule.selectedGroup?._id as string,
                {
                    projectId: project._id as string,
                    action,
                },
            );
            loading.close();
            if (response.success) {
                await this.handleSuccess(action);
                loading.close();
            } else {
                await this.handleError(response.message as string);
                loading.close();
            }
        }
    }

    async handleSuccess(action: UpdateGroupAction) {
        showSuccessNotificationFunction(
            i18n.global.t(`group.message.${action}.success`) as string,
        );
        const group = await groupModule.getGroupList();
        const groupSelected = group.data.items.find(
            (item) => item._id === groupModule.selectedGroup?._id,
        );
        if (groupSelected) {
            groupModule.setSelectedGroup(groupSelected);
        }
        groupModule.getProjectNotInGroupList();
    }

    async handleError(message: string) {
        showErrorNotificationFunction(message);
        await groupModule.getGroupList();
        groupModule.getProjectNotInGroupList();
    }

    @Watch('textSearch')
    async setFilterNode() {
        if (groupModule.isShowAssignProjectPopup) {
            if (!this.textSearch) {
                groupModule.setProjectListQueryString({
                    keyword: this.textSearch,
                });
                this.currentPage = 1;
                this.handlePaginate(this.currentPage);
                await groupModule.getProjectNotInGroupList();
            }
            this.debounceFilter();
        }
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
.project-item:hover {
    background-color: rgb(237 237 237);
}
.project-list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    .project-list-title {
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

.project-in-group-list {
    overflow: auto;
    height: 350px;
    color: #1835ff;
    font-size: 14px;
    font-weight: 600;
    .project-in-group {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 3px 10px 5px 10px !important;
    }
}

.project-not-in-group-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .project-not-in-group {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3px 10px 5px 10px !important;
        cursor: pointer;
        .full-name {
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
:deep(.project-in-group .el-button) {
    border: none !important;
    color: red;
}
:deep(.project-in-group .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
.assign-project-popup-wrapper {
    :deep(.el-dialog__body) {
        max-height: 100% !important;
        padding-top: 0px !important;
    }
}
.horizontal-line {
    margin: 0px 0px !important;
}
</style>
