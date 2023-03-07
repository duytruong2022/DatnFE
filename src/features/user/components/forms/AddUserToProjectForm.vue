<template>
    <div class="add-user-to-project-popup-wrapper">
        <el-dialog
            width="60%"
            v-model="isShowAddUserToProjectForm"
            @closed="closePopup"
            @open="openPopup"
            custom-class="add-user-to-project-popup"
        >
            <template #title>
                <h3>{{ $t('user.addUser.title') }}</h3>
            </template>
            <div class="row header-assign">
                <div class="col-12"></div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="user-list-header">
                        <div class="user-list-title">
                            {{ $t('user.addUser.userList') }}
                        </div>
                    </div>
                    <hr class="horizontal-line" />

                    <div class="user-in-project-list" v-if="assignedUserList.length > 0">
                        <div v-for="user in assignedUserList" :key="user._id">
                            <div class="user-in-project">
                                <div class="row">
                                    <div class="email-user col-6">
                                        {{ `${user.email || ''}` }}
                                    </div>
                                    <div class="constellation-groups col-5">
                                        <ul
                                            v-for="assignedConstellationGroup in user.assignedConstellationGroup"
                                            :key="assignedConstellationGroup"
                                            class="groups"
                                        >
                                            <li>
                                                {{ assignedConstellationGroup?.name }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="col-1">
                                        <el-tooltip
                                            class="action"
                                            effect="dark"
                                            :content="$t('user.addUser.button.delete')"
                                            placement="top"
                                            v-if="canRemoveUser(user)"
                                        >
                                            <el-button
                                                size="mini"
                                                @click="removeUserFromProject(user)"
                                            >
                                                <DeleteIcon class="action-icon" />
                                            </el-button>
                                        </el-tooltip>
                                    </div>
                                </div>
                            </div>
                            <hr class="horizontal-line" />
                        </div>
                    </div>
                    <BaseEmptyData v-else />
                </div>
                <div class="col-md-6">
                    <div class="user-list-header">
                        <div class="user-list-title">
                            {{ $t('user.addUser.addNewUser') }}
                        </div>
                        <BaseInputText
                            class="text-search"
                            v-model:value="keyword"
                            :placeholder="$t('user.filterForm.keyword.placeholder')"
                        />
                    </div>
                    <hr class="horizontal-line" />

                    <div
                        class="user-not-in-project-list"
                        v-if="unassignedUserList.length > 0"
                    >
                        <div
                            v-for="user in unassignedUserList"
                            :key="user._id"
                            @click="addUserToProject(user)"
                            class="user-item"
                        >
                            <div class="user-not-in-project">
                                <div class="email-user">
                                    {{ `${user.email || ''}` }}
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
                            :total="totalUnassignedUser"
                            v-model:currentPage="page"
                            popper-class="pagination-select"
                            v-if="totalUnassignedUser > LIMIT_PER_PAGE"
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
import { IUser } from '@/features/user/interfaces';
import { mixins, Options } from 'vue-class-component';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { userService } from '@/features/user/services/api.services';
import debounce from 'lodash/debounce';
import { Watch } from 'vue-property-decorator';
import { initQueryString, userModule } from '../../store';
import { UtilMixins } from '@/mixins/utilMixins';
import {
    DEFAULT_FIRST_PAGE,
    LIMIT_FOR_DROPDOWN,
    LIMIT_PER_PAGE,
} from '@/common/constants';
import { projectModule } from '@/features/project/store';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { UpdateProjectUserAction } from '../../constant';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
@Options({
    components: { DeleteIcon },
})
export default class AssignUserToProjectPopup extends mixins(UtilMixins) {
    unassignedUserList: IUser[] = [];
    totalUnassignedUser = 0;
    assignedUserList: IUser[] = [];
    totalAssignedUser = 0;
    LIMIT_PER_PAGE = LIMIT_PER_PAGE;
    page = DEFAULT_FIRST_PAGE;
    keyword = '';

    canRemoveUser(user: IUser) {
        if (projectModule.selectedProjectId) {
            return user.assignedProjectIds?.includes(projectModule.selectedProjectId);
        } else {
            return false;
        }
    }

    async getUnassignedUserList() {
        const response = await userService.getUserNotInProject({
            page: this.page,
            keyword: this.keyword,
            projectId: projectModule.selectedProjectId,
        });
        if (response.success) {
            this.unassignedUserList = response.data.items;
            this.totalUnassignedUser = response.data.totalItems;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    async getAssignedUserList() {
        const queryString = {
            ...initQueryString,
            projectId: projectModule.selectedProjectId,
            limit: LIMIT_FOR_DROPDOWN,
        };
        const response = (await userService.getList(queryString)) as IBodyResponse<
            IGetListResponse<IUser>
        >;
        if (response.success) {
            this.assignedUserList = response?.data?.items;
            this.totalAssignedUser = response?.data?.totalItems;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    debounceFilter = debounce(
        async () => {
            this.page = 1;
            this.handlePaginate(this.page);
            this.getUnassignedUserList();
        },
        500,
        { trailing: true },
    );

    get isShowAddUserToProjectForm(): boolean {
        return userModule.isShowAddUserToProjectForm;
    }

    set isShowAddUserToProjectForm(isShowAddUserToProjectForm: boolean) {
        userModule.setIsShowAddUserToProjectForm(isShowAddUserToProjectForm);
    }

    handlePaginate(pageNumber: number): void {
        this.page = pageNumber;
        this.getUnassignedUserList();
    }

    async openPopup(): Promise<void> {
        this.keyword = '';
        this.page = 1;
        this.getUnassignedUserList();
        this.getAssignedUserList();
    }

    async closePopup(): Promise<void> {
        userModule.setIsShowAddUserToProjectForm(false);
        this.keyword = '';
        this.page = 1;
        const loading = ElLoading.service({ target: '.user-table-wrapper' });
        userModule.setUserListQueryString({
            ...initQueryString,
            projectId: projectModule.selectedProjectId,
        });
        await userModule.getUserList();
        loading.close();
    }

    async addUserToProject(user: IUser): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('user.addUser.confirmAdd.message', {
                email: user.email,
            }) as string,
            i18n.global.t('user.addUser.confirmAdd.title') as string,
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-popup',
            });
            const response = await userService.updateUserProjectIds(user._id, {
                projectId: projectModule.selectedProjectId || '',
                action: UpdateProjectUserAction.ASSIGN_PROJECT,
            });
            if (response.success) {
                await Promise.all([
                    this.getUnassignedUserList(),
                    this.getAssignedUserList(),
                ]);
            } else {
                await showErrorNotificationFunction(response.message as string);
            }
            loading.close();
        }
    }

    async removeUserFromProject(user: IUser): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('user.addUser.confirmRemove.message', {
                email: user.email,
            }) as string,
            i18n.global.t('user.addUser.confirmRemove.title') as string,
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-popup',
            });
            const response = await userService.updateUserProjectIds(user._id, {
                projectId: projectModule.selectedProjectId || '',
                action: UpdateProjectUserAction.REMOVE_PROJECT,
            });
            if (response.success) {
                await Promise.all([
                    this.getUnassignedUserList(),
                    this.getAssignedUserList(),
                ]);
            } else {
                await showErrorNotificationFunction(response.message as string);
            }
            loading.close();
        }
    }

    @Watch('keyword')
    async setFilterNode() {
        if (userModule.isShowAddUserToProjectForm) {
            if (!this.keyword) {
                this.page = 1;
                this.handlePaginate(this.page);
                this.getUnassignedUserList();
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
.user-item:hover {
    background-color: rgb(237 237 237);
}
.user-list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    .user-list-title {
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

.user-in-project-list {
    overflow: auto;
    height: 350px;
    color: #1835ff;
    font-size: 14px;
    font-weight: 600;
    overflow-x: hidden;
    .user-in-project {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        padding: 3px 10px 5px 10px !important;
    }
}

.user-not-in-project-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .user-not-in-project {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 3px 10px 5px 10px !important;

        cursor: pointer;
        .email-user {
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
:deep(.user-in-project .el-button) {
    border: none !important;
    color: red;
}
:deep(.user-in-project .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
.add-user-to-project-popup-wrapper {
    :deep(.el-dialog__body) {
        max-height: 100% !important;
        padding-top: 0px !important;
    }
}
.horizontal-line {
    margin: 0px !important;
}
.row {
    width: 100%;
    align-items: center;
}
.groups {
    margin-bottom: 0px;
    padding: 4px 16px;
}
</style>
