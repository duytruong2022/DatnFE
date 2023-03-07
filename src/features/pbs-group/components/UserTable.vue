<template>
    <BaseTableLayout
        :data="selectedPbsGroup?.users || []"
        :isHighlightCurrentRow="true"
        :totalItems="selectedPbsGroup?.users?.length || 0"
        @handlePaginate="handlePaginate"
        v-model:selectedPage="selectedPage"
        :isShowPagination="false"
    >
        <template #table-columns>
            <el-table-column :label="$t('pbsGroup.label.email')" min-width="250">
                <template #default="scope">
                    {{ scope.row.email }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('pbsGroup.label.fullName')"
                prop="fullName"
                min-width="210"
            >
                <template #default="scope">
                    {{
                        `${scope.row.firstName || ''} 
                            ${scope.row.lastName || ''}`
                    }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('pbsGroup.label.ldapUsername')"
                prop="ldapUsername"
                min-width="210"
            >
                <template #default="scope">
                    {{ scope.row.ldapUsername }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('pbsGroup.label.projectProfileByPbs')"
                min-width="300"
            >
                <template #default="scope">
                    <BaseMultipleSelect
                        v-model:value="scope.row.projectProfileIds"
                        :options="projectProfileOptions"
                        :placeholder="$t('pbsGroup.placeholder.profile')"
                        @change="
                            changeProfile(scope.row._id, scope.row.projectProfileIds)
                        "
                        :is-required="true"
                        :filterable="true"
                    />
                </template>
            </el-table-column>
            <el-table-column
                fixed="right"
                align="center"
                :label="$t('pbsGroup.label.action')"
                width="100"
            >
                <template #default="scope">
                    <div class="button-group">
                        <el-tooltip
                            effect="dark"
                            :content="$t('pbsGroup.button.delete')"
                            placement="top"
                        >
                            <el-button
                                type="danger"
                                size="mini"
                                @click.stop="onClickButtonDelete(scope.row._id)"
                                v-if="canRemoveUserFromPBS"
                            >
                                <DeleteIcon class="action-icon" />
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import {
    Delete as DeleteIcon,
    CirclePlusFilled as CirclePlusFilledIcon,
} from '@element-plus/icons-vue';
import { UtilMixins } from '@/mixins/utilMixins';
import { pbsGroupModule } from '../store';
import {
    hasPermissionToAccessRouteInProject,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { HttpStatus } from '@/common/constants';
import cloneDeep from 'lodash/cloneDeep';
import { pbsGroupService } from '../services/pbsGroup.service';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { IBodyResponse, IDropDownOption, IGetListResponse } from '@/common/interfaces';
import { IProfile } from '@/features/3D-viewer-profile/interfaces';
import { projectModule } from '@/features/project/store';
import { commonService } from '@/common/services/common.service';
import { userService } from '@/features/user/services/api.services';
@Options({
    components: { DeleteIcon, CirclePlusFilledIcon },
})
export default class UserTable extends mixins(UtilMixins) {
    projectProfileList: IProfile[] = [];
    get canRemoveUserFromPBS(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_REMOVE_USER_FROM_PBS,
        ]);
    }

    get selectedPbsGroup() {
        return pbsGroupModule.selectedPbsGroup;
    }

    get projectProfileOptions(): IDropDownOption[] {
        return this.projectProfileList.map((projectProfile) => ({
            label: projectProfile.name,
            value: projectProfile._id,
        }));
    }

    created() {
        this.getProjectProfileList();
    }

    async onClickButtonDelete(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('pbsGroup.message.confirmRemoveUser') as string,
            i18n.global.t('pbsGroup.title.removeUser') as string,
            {},
        );
        if (isConfirm) {
            await pbsGroupModule.getSelectedPbsGroup(
                this.selectedPbsGroup?._id as string,
            );
            const userIdIndex = pbsGroupModule.selectedPbsGroup?.userIds?.findIndex(
                (userId) => userId === id,
            ) as number;

            if (userIdIndex === -1) {
                showErrorNotificationFunction(
                    i18n.global.t('pbsGroup.message.userNotExit') as string,
                );
            } else {
                const userIds = cloneDeep(pbsGroupModule.selectedPbsGroup?.userIds);
                userIds?.splice(userIdIndex, userIdIndex + 1);
                const response = await pbsGroupService.update(
                    pbsGroupModule.selectedPbsGroup?._id as string,
                    {
                        userIds,
                    },
                );

                if (response.success) {
                    showSuccessNotificationFunction(
                        this.$t('pbsGroup.message.removeUserSuccess'),
                    );
                    pbsGroupModule.setIsShowAddUserForm(false);
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await pbsGroupModule.getSelectedPbsGroup(
                        pbsGroupModule.selectedPbsGroup?._id as string,
                    );
                    loading.close();
                } else {
                    if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                        pbsGroupModule.setIsShowAddUserForm(false);
                        const loading = ElLoading.service({
                            target: '.main-wrapper',
                        });
                        await pbsGroupModule.getPbsTree();
                        loading.close();
                        pbsGroupModule.setIsChangePbsGroupTree(true);
                    }
                    showErrorNotificationFunction(response.message);
                }
            }
        }
    }

    async getProjectProfileList() {
        const response = (await commonService.getProjectProfileList(
            projectModule.selectedProjectId,
        )) as unknown as IBodyResponse<IGetListResponse<IProfile>>;
        if (response.success) {
            this.projectProfileList = response.data?.items || [];
        }
    }

    async changeProfile(id: string, projectProfileIds: string[]): Promise<void> {
        const loading = ElLoading.service({
            target: '.main-wrapper',
        });
        const response = await userService.updatePbsProfileUser(
            id,
            projectModule.selectedProjectId || '',
            {
                projectProfileIds,
                pbsGroupId: pbsGroupModule.selectedPbsGroup?._id || '',
            },
        );
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('pbsGroup.message.updateUserSuccess') as string,
            );
            await pbsGroupModule.getSelectedPbsGroup(
                pbsGroupModule.selectedPbsGroup?._id || '',
            );
        } else {
            showErrorNotificationFunction(response.message as string);
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                await pbsGroupModule.getSelectedPbsGroup(
                    pbsGroupModule.selectedPbsGroup?._id || '',
                );
            }
        }
    }
}
</script>

<style scoped lang="scss">
.user-table-header {
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}
.action-icon {
    height: 1em;
    width: 1em;
}
.profiles {
    margin-bottom: 0px;
    padding: 4px 16px;
}
:deep(.form-group) {
    margin-top: 5px;
    margin-bottom: 0px;
}
</style>
