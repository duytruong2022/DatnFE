<template>
    <div class="assign-user-popup-wrapper">
        <el-dialog
            width="60%"
            v-model="isShowAssignUserPopup"
            @closed="closePopup"
            @open="openPopup"
            custom-class="assign-user-popup"
        >
            <template #title>
                <h3 class="text-left">{{ $t('projectGroup.assignUserPopup.title') }}</h3>
                <h5>
                    {{
                        $t('projectGroup.assignUserPopup.projectGroupName', {
                            projectGroupName: projectGroupName,
                        })
                    }}
                </h5>
            </template>
            <div class="row">
                <div class="col-md-5">
                    <div class="user-list-header">
                        <div class="user-list-title">
                            {{ $t('projectGroup.assignUserPopup.user') }}
                        </div>
                    </div>
                    <hr class="horizontal-line" />
                    <div class="user-in-group-list" v-if="userInGroupList.length > 0">
                        <div v-for="user in userInGroupList" :key="user">
                            <div class="user-in-group">
                                <div class="email-user">
                                    {{ `${user.email || ''}` }}
                                </div>
                                <el-tooltip
                                    class="action"
                                    effect="dark"
                                    :content="
                                        $t(
                                            'projectGroup.assignUserPopup.button.tooltip.delete',
                                        )
                                    "
                                    placement="top"
                                >
                                    <el-button
                                        size="mini"
                                        @click="
                                            updateProjectGroupIds(
                                                user,
                                                UpdateProjectGroupAction.REMOVE_USER,
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
                    <div class="user-list-header">
                        <div class="user-list-title">
                            {{ $t('projectGroup.assignUserPopup.newUser') }}
                        </div>
                        <BaseInputText
                            class="text-search"
                            v-model:value="keyword"
                            :clearable="true"
                            @on-enter="searchUserByKeyword"
                            @clear="clearInputSearch"
                            :placeholder="
                                $t('projectGroup.filterForm.keyword.placeholder')
                            "
                        />
                    </div>
                    <hr class="horizontal-line" />

                    <div
                        class="user-not-in-group-list"
                        v-if="userNotInGroupList.length > 0"
                    >
                        <div
                            v-for="user in userNotInGroupList"
                            :key="user"
                            @click="
                                updateProjectGroupIds(
                                    user,
                                    UpdateProjectGroupAction.ASSIGN_USER,
                                )
                            "
                        >
                            <div class="user-in-group">
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
                            :total="totalUserNotInGroup"
                            v-model:currentPage="currentPage"
                            popper-class="pagination-select"
                            v-if="totalUserNotInGroup > LIMIT_PER_PAGE"
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
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import { projectGroupModule } from '../store';
import { IUser } from '@/features/auth/interfaces';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { UpdateProjectGroupAction } from '../constant';
import { ElLoading } from 'element-plus';
import { userService } from '@/features/user/services/api.services';
import { AccessModules } from '@/common/constants';
import { projectModule } from '@/features/project/store';

@Options({
    components: { DeleteIcon },
})
export default class AssignUserPopup extends mixins(UtilMixins) {
    UpdateProjectGroupAction = UpdateProjectGroupAction;
    keyword = '';
    currentPage!: number;
    get isShowAssignUserPopup(): boolean {
        return projectGroupModule.isShowAssignUserPopup || false;
    }

    get userInGroupList() {
        return projectGroupModule.userInGroupList;
    }

    get userNotInGroupList() {
        return projectGroupModule.userNotInGroupList;
    }
    get totalUserNotInGroup(): number {
        return projectGroupModule.totalUserNotInGroup;
    }
    get projectGroupName() {
        return projectGroupModule.selectedGroup?.name;
    }

    searchUserByKeyword() {
        this.keyword = this.keyword.trim();
        projectGroupModule.setUserListQueryString({
            keyword: this.keyword,
        });
        projectGroupModule.getUserNotInGroupList();
    }

    clearInputSearch() {
        this.keyword = '';
        this.searchUserByKeyword();
    }

    handlePaginate(pageNumber: number) {
        projectGroupModule.setUserListQueryString({
            page: pageNumber,
        });
        projectGroupModule.getUserNotInGroupList();
    }

    async updateProjectGroupIds(user: IUser, action: UpdateProjectGroupAction) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t(`projectGroup.message.${action}.confirmAsk`, {
                email: `${user.email || ''}`,
            }) as string,
            i18n.global.t(`projectGroup.message.${action}.title`) as string,
            {},
        );

        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-user-popup',
            });

            const response = await userService.updateProjectGroupIds(user._id, {
                isConfirm: false,
                projectId: projectModule.selectedProjectId,
                projectGroupId: projectGroupModule.selectedGroup?._id,
                action,
                accessModule: AccessModules.SPACIALYTIC_CONSTELLATION,
            });
            loading.close();
            if (response.success) {
                if (response.data?.isChangeProfile) {
                    loading.close();
                    const isConfirmChange = await showConfirmPopUpFunction(
                        i18n.global.t(
                            'projectGroup.message.changeProjectProfile.confirmAsk',
                        ) as string,
                        i18n.global.t(
                            'projectGroup.message.changeProjectProfile.title',
                        ) as string,
                        {},
                    );
                    if (isConfirmChange) {
                        const loading = ElLoading.service({
                            target: '.assign-user-popup',
                        });

                        const responseConfirm = await userService.updateProjectGroupIds(
                            user._id,
                            {
                                isConfirm: true,
                                projectId: projectModule.selectedProjectId,
                                projectGroupId: projectGroupModule.selectedGroup?._id,
                                action,
                                accessModule: AccessModules.SPACIALYTIC_CONSTELLATION,
                            },
                        );
                        if (responseConfirm.success) {
                            await this.handleSuccess(action);
                            loading.close();
                        } else {
                            await this.handleError(responseConfirm.message as string);
                            loading.close();
                        }
                    }
                } else {
                    await this.handleSuccess(action);
                    loading.close();
                }
            } else {
                await this.handleError(response.message as string);
                loading.close();
            }
        }
    }

    async handleSuccess(action: UpdateProjectGroupAction) {
        showSuccessNotificationFunction(
            i18n.global.t(`projectGroup.message.${action}.success`) as string,
        );
        await projectGroupModule.getGroupList();
        projectGroupModule.getUserInGroupList();
        projectGroupModule.getUserNotInGroupList();
    }

    async handleError(message: string) {
        showErrorNotificationFunction(message);
        await projectGroupModule.getGroupList();
        projectGroupModule.getUserInGroupList();
        projectGroupModule.getUserNotInGroupList();
    }

    closePopup() {
        projectGroupModule.setIsShowAssignUserPopup(false);
        projectGroupModule.setSelectedGroup(null);
        projectGroupModule.resetUserListQueryString();
        this.keyword = '';
        this.currentPage = 1;
    }

    openPopup() {
        projectGroupModule.getUserInGroupList();
        projectGroupModule.getUserNotInGroupList();
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
.user-list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    padding-top: 24px;
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

.user-in-group-list {
    overflow: auto;
    height: 350px;
    color: #1835ff;
    font-size: 14px;
    font-weight: 600;
    .user-in-group {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }
}

.user-not-in-group-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .user-in-group {
        width: 100%;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
:deep(.user-in-group .el-button) {
    border: none !important;
    color: red;
}
:deep(.user-in-group .el-button:hover) {
    color: red !important;
    opacity: 0.6;
}
.assign-user-popup-wrapper {
    :deep(.el-dialog__body) {
        max-height: 100% !important;
        padding-top: 4px !important;
    }
}
.horizontal-line {
    margin: 5px 0px !important;
}
</style>
