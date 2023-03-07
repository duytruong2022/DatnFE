<template>
    <div class="group-table-wrapper">
        <BaseTableLayout
            :data="groupList"
            :isHighlightCurrentRow="true"
            @sort-change="onSortChange"
            v-model:selectedPage="selectedPage"
            :totalItems="totalItems"
            @handlePaginate="handlePaginate"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('group.groupList.name')"
                    prop="name"
                    sortable
                    width="200"
                >
                    <template #default="scope">
                        {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('group.groupList.assignToUserHeader')"
                    width="200"
                >
                    <template #default="scope">
                        <div
                            v-if="canAssignUserAndGroupToProject"
                            @click="getUserList(scope.row)"
                            class="assign-to-txt"
                        >
                            {{
                                $t('group.groupList.assignToUser', {
                                    assignedUserCount: scope.row?.assignedUserCount || 0,
                                })
                            }}
                        </div>
                        <div v-else>
                            {{
                                $t('group.groupList.assignToUser', {
                                    assignedUserCount: scope.row?.assignedUserCount || 0,
                                })
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('group.groupList.assignToProjectHeader')"
                    width="200"
                    v-if="canAssignProjectToGroup"
                >
                    <template #default="scope">
                        <div
                            class="assign-to-txt"
                            @click="getProjectList(scope.row)"
                            v-if="canAssignUserAndGroupToProject"
                        >
                            {{
                                $t('group.groupList.assignToProject', {
                                    assignedProjectCount: scope.row?.projects.length || 0,
                                })
                            }}
                        </div>
                        <div v-else>
                            {{
                                $t('group.groupList.assignToProject', {
                                    assignedProjectCount: scope.row?.projects.length || 0,
                                })
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="
                        $t(`group.groupList.profile.${currentAccessModule}.tableHeader`)
                    "
                    align="center"
                    width="380"
                >
                    <template #default="scope">
                        <div
                            v-if="
                                currentAccessModule ===
                                AccessModules.SPACIALYTIC_CONSTELLATION
                            "
                        >
                            <SelectProfileGroup
                                v-if="canAssignSecurityProfileToUserAndGroup"
                                :groupId="scope.row._id"
                                :options="profileOptions"
                                :placeholder="
                                    $t(
                                        `group.groupList.profile.${currentAccessModule}.placeholder`,
                                    )
                                "
                                v-model:value="scope.row.securityProfileId"
                            />
                            <div v-else>
                                {{ getProfileName(scope.row.securityProfileId) }}
                            </div>
                        </div>
                        <SelectProfileGroup
                            v-else
                            :groupId="scope.row._id"
                            :options="profileOptions"
                            :placeholder="
                                $t(
                                    `group.groupList.profile.${currentAccessModule}.placeholder`,
                                )
                            "
                            v-model:value="scope.row.viewer3dProfileId"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('group.groupList.description')"
                    min-width="300"
                >
                    <template #default="scope">
                        {{ scope.row?.description }}
                    </template>
                </el-table-column>
                <el-table-column
                    fixed="right"
                    align="center"
                    width="200"
                    :label="$t('group.groupList.action')"
                >
                    <template #default="scope">
                        <div class="button-group">
                            <el-tooltip
                                effect="dark"
                                :content="$t('group.groupList.tooltip.edit')"
                                placement="top"
                            >
                                <el-button
                                    type="warning"
                                    size="mini"
                                    @click="onClickButtonEdit(scope.row)"
                                >
                                    <EditIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                            <el-tooltip
                                effect="dark"
                                :content="$t('group.groupList.tooltip.delete')"
                                placement="top"
                            >
                                <el-button
                                    type="danger"
                                    size="mini"
                                    @click="onClickButtonDelete(scope.row._id)"
                                >
                                    <DeleteIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { Options, setup, mixins } from 'vue-class-component';
import { IGroupUpdateBody } from '../../interfaces';
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    ArrowDownBold as ArrowDownBoldIcon,
} from '@element-plus/icons-vue';
import { groupModule } from '../../store';
import { setupDelete } from '../../composition/groupList';
import { AccessModules, DEFAULT_FIRST_PAGE, OrderDirection } from '@/common/constants';
import { IELColumnSort } from '@/common/interfaces';
import { ElLoading } from 'element-plus';
import localStorageAuthService from '@/common/authStorage';
import { GroupMixin } from '../../mixins/GroupMixins';
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import SelectProfileGroup from './SelectProfileGroup.vue';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { authModule } from '@/features/auth/store';

@Options({
    components: {
        DeleteIcon,
        EditIcon,
        LockIcon,
        ArrowDownBoldIcon,
        SelectProfileGroup,
    },
})
export default class GroupTable extends mixins(GroupMixin) {
    deleteAction = setup(() => setupDelete());
    get groupList() {
        return groupModule.groupList;
    }

    get totalItems(): number {
        return groupModule.totalGroups;
    }

    get selectedPage(): number {
        return groupModule.groupListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    get currentAccessModule(): AccessModules {
        return localStorageAuthService.getSelectedAccessModule();
    }

    get canAssignUserAndGroupToProject(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.ASSIGN_USER_GROUP_TO_PROJECT,
        ]);
    }

    get canAssignSecurityProfileToUserAndGroup(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.ASSIGN_SECURITY_PROFILE,
        ]);
    }

    get canAssignProjectToGroup(): boolean {
        if (authModule.selectedAccessModule !== AccessModules.SPACIALYTIC_CONSTELLATION) {
            return false;
        }
        return true;
    }

    async onClickButtonEdit(updateGroup: IGroupUpdateBody): Promise<void> {
        groupModule.setSelectedGroup(updateGroup);
        groupModule.setIsShowGroupForm(true);
    }

    async onClickButtonDelete(id: string): Promise<void> {
        await this.deleteAction.deleteGroup(id);
    }

    async onSortChange(column: IELColumnSort): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        groupModule.setGroupListQueryString({
            orderBy: column?.prop,
            orderDirection:
                column.order === OrderDirection.ASCENDING
                    ? OrderDirection.DESCENDING
                    : OrderDirection.ASCENDING,
        });
        await groupModule.getGroupList();
        loading.close();
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        groupModule.setGroupListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await groupModule.getGroupList();
        loading.close();
    }

    getUserList(group: IGroupUpdateBody) {
        groupModule.setSelectedGroup(group);
        groupModule.setIsShowAssignUserPopup(true);
    }

    async initData() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getProfileList();
        loading.close();
    }

    async created() {
        this.initData();
    }

    getProjectList(group: IGroupUpdateBody) {
        groupModule.setSelectedGroup(group);
        groupModule.setIsShowAssignProjectPopup(true);
    }
}
</script>

<style scoped lang="scss">
.group-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;

    :deep(.el-table__body tr.hover-row > td.el-table__cell) {
        background-color: #ffffff;
        cursor: auto;
    }
}
.action-icon {
    height: 1em;
    width: 1em;
}

.icon-arrow {
    height: 12px;
    width: 12px;
}

.assign-to-txt {
    color: rgb(46, 77, 252);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
}
.change-profile-dropdown {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
</style>
