<template>
    <BaseTableLayout
        :data="selectedPbsGroup?.groups || []"
        :isHighlightCurrentRow="true"
        :totalItems="selectedPbsGroup?.groups?.length || 0"
        @handlePaginate="handlePaginate"
        v-model:selectedPage="selectedPage"
        :isShowPagination="false"
    >
        <template #table-columns>
            <el-table-column :label="$t('pbsGroup.label.groupName')" min-width="150">
                <template #default="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('pbsGroup.label.projectProfile')"
                prop="fullName"
                min-width="150"
            >
                <template #default="scope">
                    {{ scope.row.projectProfile?.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('pbsGroup.label.description')"
                prop="ldapGroupname"
                min-width="310"
            >
                <template #default="scope">
                    {{ scope.row.description }}
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
@Options({
    components: { DeleteIcon, CirclePlusFilledIcon },
})
export default class ProjectGroupTable extends mixins(UtilMixins) {
    get canRemoveUserFromPBS(): boolean {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_REMOVE_USER_FROM_PBS,
        ]);
    }

    get selectedPbsGroup() {
        return pbsGroupModule.selectedPbsGroup;
    }

    async onClickButtonDelete(id: string) {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t('pbsGroup.message.confirmRemoveGroup') as string,
            i18n.global.t('pbsGroup.title.removeGroup') as string,
            {},
        );
        if (isConfirm) {
            await pbsGroupModule.getSelectedPbsGroup(
                this.selectedPbsGroup?._id as string,
            );
            const groupIdIndex = pbsGroupModule.selectedPbsGroup?.groupIds?.findIndex(
                (groupId) => groupId === id,
            ) as number;

            if (groupIdIndex === -1) {
                showErrorNotificationFunction(
                    i18n.global.t('pbsGroup.message.groupNotExit') as string,
                );
            } else {
                const groupIds = cloneDeep(pbsGroupModule.selectedPbsGroup?.groupIds);
                groupIds?.splice(groupIdIndex, groupIdIndex + 1);
                const response = await pbsGroupService.update(
                    pbsGroupModule.selectedPbsGroup?._id as string,
                    {
                        groupIds,
                    },
                );

                if (response.success) {
                    showSuccessNotificationFunction(
                        this.$t('pbsGroup.message.removeGroupSuccess'),
                    );
                    // pbsGroupModule.setIsShowAddGroupForm(false);
                    const loading = ElLoading.service({
                        target: '.main-wrapper',
                    });
                    await pbsGroupModule.getSelectedPbsGroup(
                        pbsGroupModule.selectedPbsGroup?._id as string,
                    );
                    loading.close();
                } else {
                    if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                        // pbsGroupModule.setIsShowAddGroupForm(false);
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
}
</script>

<style scoped lang="scss">
.group-table-header {
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
</style>
