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
                    :label="$t('user.userList.ldapUsername')"
                    prop="ldapUsername"
                    min-width="210"
                    sortable
                >
                    <template #default="scope">
                        {{ scope.row.ldapUsername }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.country')" min-width="200">
                    <template #default="scope">
                        {{ scope.row.country?.name }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.company')" min-width="200">
                    <template #default="scope">
                        {{ scope.row.company }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.moduleName')" width="270">
                    <template #default="scope">
                        <ul class="access-modules">
                            <li
                                v-for="accessModule in scope.row.accessModules"
                                :key="accessModule"
                            >
                                {{ $t(`app.accessModule.${accessModule?.module}`) }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('user.filterForm.registrationFrom.label')"
                    min-width="170"
                >
                    <template #default="scope">
                        {{
                            scope.row?.registrationFrom?.length &&
                            $t(
                                `user.filterForm.registrationFrom.${scope.row.registrationFrom}`,
                            )
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.createdAt')" min-width="200">
                    <template #default="scope">
                        {{ parseDateTime(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.approvedAt')" min-width="200">
                    <template #default="scope">
                        {{
                            scope.row.approvedAt
                                ? parseDateTime(scope.row.approvedAt)
                                : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.approvedBy')" min-width="200">
                    <template #default="scope">
                        <span v-if="scope.row.approved">
                            {{
                                `${scope.row.approved?.firstName || ''} ${
                                    scope.row.approved?.lastName || ''
                                }`
                            }}
                        </span>
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
                    width="160"
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
} from '@element-plus/icons-vue';
import { initQueryString, userModule } from '../store';
import { UserTableMixin } from '../mixins/UserTableMixins';
@Options({ components: { UserIcon, DeleteIcon, EditIcon, LockIcon } })
export default class UserTablePlatform extends mixins(UserTableMixin) {
    created() {
        userModule.setUserListQueryString({
            ...initQueryString,
            projectId: '',
        });
        userModule.getUserList();
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
.access-modules {
    padding-left: 1rem !important;
    margin-bottom: 0px !important;
    li {
        margin: 10px 0px;
    }
}
</style>
