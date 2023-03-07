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
                <h3>{{ $t('group.assignUserPopup.title') }}</h3>
                <h5>
                    {{ $t('group.assignUserPopup.groupName', { groupName: groupName }) }}
                </h5>
            </template>
            <div class="row header-assign">
                <div class="col-12"></div>
            </div>
            <div class="row">
                <div class="col-md-5">
                    <div class="user-list-header">
                        <div class="user-list-title">
                            {{ $t('group.assignUserPopup.user') }}
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
                                        $t('group.assignUserPopup.button.tooltip.delete')
                                    "
                                    placement="top"
                                >
                                    <el-button
                                        size="mini"
                                        @click="
                                            updateGroupIds(
                                                user,
                                                UpdateGroupAction.REMOVE_USER,
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
                            {{ $t('group.assignUserPopup.newUser') }}
                        </div>
                        <BaseInputText
                            class="text-search"
                            v-model:value="textSearch"
                            :placeholder="$t('group.filterForm.keyword.placeholder')"
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
                            @click="updateGroupIds(user, UpdateGroupAction.ASSIGN_USER)"
                            class="user-item"
                        >
                            <div class="user-not-in-group">
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
import { IUser } from '@/features/user/interfaces';
import { GroupMixin } from '../../mixins/GroupMixins';
import { mixins, Options } from 'vue-class-component';
import { groupModule } from '../../store';
import { Delete as DeleteIcon } from '@element-plus/icons-vue';
import { AccessModules } from '@/common/constants';
import {
    showConfirmPopUpFunction,
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { userService } from '@/features/user/services/api.services';
import { UpdateGroupAction } from '../../constant';
import debounce from 'lodash/debounce';
import { Watch } from 'vue-property-decorator';
@Options({
    components: { DeleteIcon },
})
export default class AssignUserPopup extends mixins(GroupMixin) {
    textSearch = '';
    currentPage!: number;

    debounceFilter = debounce(
        async () => {
            groupModule.setUserListQueryString({
                keyword: this.textSearch,
            });
            this.currentPage = 1;
            this.handlePaginate(this.currentPage);
            await groupModule.getUserNotInGroupList();
        },
        500,
        { trailing: true },
    );

    get isShowAssignUserPopup(): boolean {
        return groupModule.isShowAssignUserPopup || false;
    }

    set isShowAssignUserPopup(val: boolean) {
        groupModule.setIsShowAssignUserPopup(val);
    }

    get groupName(): string {
        return groupModule.selectedGroup?.name || '';
    }

    get userInGroupList(): IUser[] {
        return groupModule.userInGroupList;
    }

    get userNotInGroupList(): IUser[] {
        return groupModule.userNotInGroupList;
    }

    get totalUserNotInGroup(): number {
        return groupModule.totalUserNotInGroup;
    }

    handlePaginate(pageNumber: number): void {
        groupModule.setUserListQueryString({
            page: pageNumber,
        });
        groupModule.getUserNotInGroupList();
    }

    async openPopup(): Promise<void> {
        groupModule.getUserInGroupList();
        groupModule.getUserNotInGroupList();
        this.textSearch = '';
        this.currentPage = 1;
    }

    async closePopup(): Promise<void> {
        groupModule.setIsShowAssignUserPopup(false);
        groupModule.setSelectedGroup(null);
        groupModule.resetUserListQueryString();
        this.textSearch = '';
        this.currentPage = 1;
    }

    async updateGroupIds(user: IUser, action: UpdateGroupAction): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t(`group.message.${action}.confirmAsk`, {
                email: `${user.email || ''}`,
            }) as string,
            i18n.global.t(`group.message.${action}.title`) as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-user-popup',
            });

            const response = await userService.updateGroupIds(user._id, {
                isConfirm: false,
                groupId: groupModule.selectedGroup?._id,
                action,
                accessModule: AccessModules.SPACIALYTIC_CONSTELLATION,
            });
            loading.close();
            if (response.success) {
                if (response.data?.isChangeProfile) {
                    loading.close();
                    const isConfirmChange = await showConfirmPopUpFunction(
                        i18n.global.t(
                            'group.message.changeSecurityProfile.confirmAsk',
                        ) as string,
                        i18n.global.t(
                            'group.message.changeSecurityProfile.title',
                        ) as string,
                        {},
                    );

                    if (isConfirmChange) {
                        const loading = ElLoading.service({
                            target: '.assign-user-popup',
                        });

                        const responseConfirm = await userService.updateGroupIds(
                            user._id,
                            {
                                isConfirm: true,
                                groupId: groupModule.selectedGroup?._id,
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

    async handleSuccess(action: UpdateGroupAction) {
        showSuccessNotificationFunction(
            i18n.global.t(`group.message.${action}.success`) as string,
        );
        await groupModule.getGroupList();
        groupModule.getUserInGroupList();
        groupModule.getUserNotInGroupList();
    }

    async handleError(message: string) {
        showErrorNotificationFunction(message);
        await groupModule.getGroupList();
        groupModule.getUserInGroupList();
        groupModule.getUserNotInGroupList();
    }

    @Watch('textSearch')
    async setFilterNode() {
        if (groupModule.isShowAssignUserPopup) {
            if (!this.textSearch) {
                groupModule.setUserListQueryString({
                    keyword: this.textSearch,
                });
                this.currentPage = 1;
                this.handlePaginate(this.currentPage);
                await groupModule.getUserNotInGroupList();
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
        padding: 3px 10px 5px 10px !important;
    }
}

.user-not-in-group-list {
    overflow: auto;
    height: 350px;
    font-size: 14px;
    font-weight: 600;
    .user-not-in-group {
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
        padding-top: 0px !important;
    }
}
.horizontal-line {
    margin: 0px !important;
}
</style>
