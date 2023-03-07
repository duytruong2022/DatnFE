<template>
    <div class="assign-project-user-popup-wrapper">
        <el-dialog
            width="75%"
            v-model="isShowAssignProjectUser"
            @closed="closePopup"
            @open="openPopup"
            custom-class="assign-project-user-popup"
        >
            <template #title>
                <h3>{{ $t('user.assignProjectPopup.title') }}</h3>
                <h5>
                    {{ $t('user.assignProjectPopup.emailUser', { email: email }) }}
                </h5>
            </template>
            <div class="row header-assign">
                <div class="col-12"></div>
            </div>
            <div class="row">
                <div class="col-md-7">
                    <div class="project-list-header">
                        <div class="project-list-title">
                            {{ $t('user.assignProjectPopup.project') }}
                        </div>
                    </div>
                    <hr class="horizontal-line" />
                    <div class="project-in-user-list">
                        <ProjectAssignedUserTable />
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="project-list-header">
                        <div class="project-list-title">
                            {{ $t('user.assignProjectPopup.newProject') }}
                        </div>
                        <BaseInputText
                            class="text-search"
                            v-model:value="textSearch"
                            @keyup="onKeyup"
                            :placeholder="$t('user.filterForm.keyword.placeholder')"
                        />
                    </div>
                    <hr class="horizontal-line" />

                    <div
                        class="project-not-in-user-list"
                        v-if="projectNotAssignUserList?.length > 0"
                    >
                        <div
                            v-for="project in projectNotAssignUserList"
                            :key="project._id"
                            @click="
                                updateUserProjects(
                                    project,
                                    UpdateProjectUserAction.ASSIGN_PROJECT,
                                )
                            "
                            class="project-item"
                        >
                            <div class="project-not-in-user">
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
                            :total="totalProjectNotAssignUser"
                            v-model:currentPage="currentPage"
                            popper-class="pagination-select"
                            v-if="totalProjectNotAssignUser > LIMIT_PER_PAGE"
                            @current-change="handlePaginateProjectNotAssign"
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
import { mixins, Options } from 'vue-class-component';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import debounce from 'lodash/debounce';
import { Watch } from 'vue-property-decorator';
import { userModule } from '../../store';
import { UserTableMixin } from '../../mixins/UserTableMixins';
import { IGroup } from '@/common/interfaces';
import ProjectAssignedUserTable from './ProjectAssignedUserTable.vue';

@Options({
    components: { DeleteIcon, ProjectAssignedUserTable },
})
export default class AssignProjectPopup extends mixins(UserTableMixin) {
    textSearch = '';
    currentPage!: number;

    debounceFilter = debounce(
        async () => {
            userModule.setProjectListQueryString({
                keyword: this.textSearch,
            });
            this.currentPage = 1;
            this.handlePaginateProjectNotAssign(this.currentPage);
            await userModule.getProjectNotAssignUserList();
        },
        500,
        { trailing: true },
    );

    get isShowAssignProjectUser(): boolean {
        return userModule.isShowAssignProjectUser || false;
    }

    set isShowAssignProjectPopup(val: boolean) {
        userModule.setIsShowAssignProjectPopup(val);
    }

    get email(): string {
        return userModule.selectedUser?.email || '';
    }

    get projectAssignedUserList(): IProject[] {
        return userModule.projectAssignedUserList || [];
    }

    get projectNotAssignUserList(): IProject[] {
        return userModule.projectNotAssignUserList;
    }

    get totalProjectNotAssignUser(): number {
        return userModule.totalProjectNotAssignUser;
    }

    handlePaginateProjectNotAssign(pageNumber: number): void {
        userModule.setProjectListQueryString({
            page: pageNumber,
        });
        userModule.getProjectNotAssignUserList();
    }

    getGroupNameList(groups: IGroup[]): string {
        if (groups.length) {
            const groupNameList = groups.map((item) => item.name);
            return groupNameList.join(', ');
        }
        return '';
    }

    async openPopup(): Promise<void> {
        userModule.getProjectAssignedUserList();
        userModule.getProjectNotAssignUserList();
        this.textSearch = '';
        this.currentPage = 1;
    }

    async closePopup(): Promise<void> {
        userModule.setIsShowAssignProjectPopup(false);
        userModule.setSelectedUser(null);
        userModule.resetProjectListQueryString();
        this.textSearch = '';
        this.currentPage = 1;
        userModule.getUserList();
    }

    @Watch('textSearch')
    async setFilterNode() {
        if (userModule.isShowAssignProjectUser) {
            if (!this.textSearch) {
                userModule.setProjectListQueryString({
                    keyword: this.textSearch,
                });
                this.currentPage = 1;
                this.handlePaginateProjectNotAssign(this.currentPage);
                await userModule.getProjectNotAssignUserList();
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

.project-in-user-list {
    overflow: auto;
    height: 350px;
}

.project-not-in-user-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .project-not-in-user {
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
:deep(.project-in-user .el-button) {
    border: none !important;
    color: red;
}
:deep(.project-in-user .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
.assign-project-user-popup-wrapper {
    :deep(.el-dialog__body) {
        max-height: 100% !important;
        padding-top: 0px !important;
    }
}
.horizontal-line {
    margin: 0px 0px !important;
}
</style>
