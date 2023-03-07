<template>
    <div class="user-table-wrapper">
        <BaseTableLayout
            :data="userList"
            :isHighlightCurrentRow="true"
            @sort-change="onSortChange"
            :totalItems="totalItems"
            @handlePaginate="handlePaginate"
            v-model:selectedPage="selectedPage"
            @row-click="onClickRow"
        >
            <template #table-columns>
                <el-table-column :label="$t('user.userList.email')" min-width="250">
                    <template #default="scope">
                        {{ scope.row.email }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.fullName')"
                    prop="fullName"
                    min-width="210"
                    sortable
                >
                    <template #default="scope">
                        {{ scope.row.fullName }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.securityProfile')"
                    min-width="200"
                    v-if="!selectedProjectId"
                >
                    <template #default="scope">
                        <ul
                            v-for="securityProfile in scope.row.securityProfiles"
                            class="profiles"
                            :key="securityProfile"
                        >
                            <li>
                                {{ securityProfile?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.projectProfile')"
                    min-width="200"
                    v-else
                >
                    <template #default="scope">
                        <ul
                            v-for="projectProfile in scope.row.projectProfiles"
                            :key="projectProfile"
                            class="profiles"
                        >
                            <li>
                                {{ projectProfile?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.projectProfileByPbs')"
                    min-width="200"
                    v-if="selectedProjectId"
                >
                    <template #default="scope">
                        <ul
                            v-for="pbsProfile in scope.row.pbsProfile"
                            :key="pbsProfile"
                            class="profiles"
                        >
                            <li>
                                {{ pbsProfile?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.accessProjectHeader')"
                    width="250"
                    v-if="!selectedProjectId"
                >
                    <template #default="scope">
                        <div v-if="!selectedProjectId && scope.row?.isAdminConstellation">
                            {{ $t('user.userList.adminModule') }}
                        </div>
                        <div
                            class="assign-to-txt"
                            @click.stop="onClickButtonAssignProject(scope.row)"
                            v-else-if="canAssignProjectToUser"
                        >
                            {{
                                $t('user.userList.accessProject', {
                                    assignedProjectCount:
                                        scope.row?.projectAssignedCount ?? 0,
                                })
                            }}
                        </div>
                        <div v-else>
                            {{
                                $t('user.userList.accessProject', {
                                    assignedProjectCount:
                                        scope.row?.projectAssignedCount ?? 0,
                                })
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.groups')"
                    min-width="200"
                    v-if="!selectedProjectId"
                >
                    <template #default="scope">
                        <ul
                            v-for="group in scope.row.constellationGroups"
                            :key="group"
                            class="groups"
                        >
                            <li>
                                {{ group?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.userList.projectGroups')"
                    min-width="200"
                    v-else
                >
                    <template #default="scope">
                        <ul
                            v-for="group in scope.row.projectGroups"
                            :key="group"
                            class="groups"
                        >
                            <li>
                                {{ group?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.createdAt')" min-width="200">
                    <template #default="scope">
                        {{
                            scope.row.createdAt ? parseDateTime(scope.row.createdAt) : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.lastLogin')" min-width="200">
                    <template #default="scope">
                        {{
                            scope.row.lastLoginAt
                                ? parseDateTime(scope.row.lastLoginAt)
                                : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.status')" min-width="200">
                    <template #default="scope">
                        {{
                            scope.row.status?.length &&
                            $t(`user.filterForm.status.${scope.row.status}`)
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    fixed="right"
                    align="center"
                    :label="$t('user.userList.action')"
                    :width="220"
                >
                    <template #default="scope">
                        <div class="button-group">
                            <el-tooltip
                                effect="dark"
                                :content="$t('user.userList.tooltip.changePassword')"
                                placement="top"
                            >
                                <el-button
                                    type="warning"
                                    size="mini"
                                    @click.stop="onClickButtonChangePassword(scope.row)"
                                >
                                    <LockIcon class="action-icon" />
                                </el-button>
                            </el-tooltip>
                            <el-tooltip
                                effect="dark"
                                :content="$t('user.userList.tooltip.delete')"
                                placement="top"
                            >
                                <el-button
                                    type="danger"
                                    size="mini"
                                    @click.stop="onClickButtonDelete(scope.row._id)"
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
import { Options, mixins } from 'vue-class-component';
import {
    User as UserIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    Phone as PhoneIcon,
    Document as DocumentIcon,
} from '@element-plus/icons-vue';
import { initQueryString, userModule } from '../store';
import { UserTableMixin } from '../mixins/UserTableMixins';
import { projectModule } from '@/features/project/store';
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { IUser } from '../interfaces';
@Options({
    components: {
        UserIcon,
        DeleteIcon,
        EditIcon,
        LockIcon,
        PhoneIcon,
        DocumentIcon,
    },
})
export default class UserTableConstellation extends mixins(UserTableMixin) {
    get canAssignProjectToUser(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.ASSIGN_USER_GROUP_TO_PROJECT,
        ]);
    }

    get selectedProjectId() {
        return projectModule.selectedProjectId;
    }

    created() {
        userModule.setUserListQueryString({
            ...initQueryString,
            projectId: this.selectedProjectId,
        });
        userModule.getUserList();
    }

    onClickButtonAssignProject(user: IUser) {
        userModule.setSelectedUser(user);
        userModule.setIsShowAssignProjectPopup(true);
    }
}
</script>

<style scoped lang="scss">
.user-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
}

.action-icon {
    height: 1em;
    width: 1em;
}
.profiles,
.groups {
    margin-bottom: 0px;
    padding: 4px 16px;
}

.assign-to-txt {
    color: rgb(46, 77, 252);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
}
</style>
