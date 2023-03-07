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
                <el-table-column
                    :label="$t('user.userList.viewer3dProfile')"
                    min-width="200"
                >
                    <template #default="scope">
                        <ul
                            v-for="viewer3dProfile in scope.row.viewer3dProfiles"
                            :key="viewer3dProfile"
                            class="profiles"
                        >
                            <li>
                                {{ viewer3dProfile?.name }}
                            </li>
                        </ul>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('user.userList.groups')" min-width="200">
                    <template #default="scope">
                        <ul
                            v-for="group in scope.row.viewer3dGroups"
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
                    width="220"
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
                                :content="$t('user.userList.tooltip.contact')"
                                placement="top"
                            >
                                <el-button
                                    type="success"
                                    size="mini"
                                    @click.stop="onClickButtonContact(scope.row)"
                                >
                                    <PhoneIcon class="action-icon" />
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
@Options({
    components: { UserIcon, DeleteIcon, EditIcon, LockIcon, PhoneIcon, DocumentIcon },
})
export default class UserTable3DWebview extends mixins(UserTableMixin) {
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

.profiles,
.groups {
    margin-bottom: 0px;
    padding: 4px 16px;
}
</style>
