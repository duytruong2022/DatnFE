<template>
    <div class="row">
        <div class="col-md-10">
            <BaseInputText
                v-model:value="filterForm.keyword"
                :isClearable="true"
                :label="$t('user.filterForm.keyword.label')"
                :placeholder="$t('user.filterForm.keyword.placeholder')"
                @on-enter="onClickButtonSearch"
                @clear="onClearInputSearch"
            />
        </div>
        <div class="col-md-2">
            <div class="button-import-ldap">
                <el-button
                    type="primary"
                    size="mini"
                    :disabled="totalLdapUsers == 0"
                    @click="onClickImportLdapUser"
                >
                    {{ $t('ldapConfigForm.button.import') }}
                </el-button>
            </div>
        </div>
    </div>

    <div class="table-layout">
        <el-table
            header-row-class-name="table-header"
            :data="ldapUsers"
            :style="style"
            :border="false"
            :stripe="false"
            :max-height="680"
            @selection-change="handleSelectionChange"
            fit
            v-if="totalLdapUsers > 0"
        >
            <el-table-column type="selection" width="55" />
            <el-table-column
                :label="$t('ldapConfigForm.ldapUserList.email')"
                min-width="170"
                property="email"
            />
            <el-table-column
                :label="$t('ldapConfigForm.ldapUserList.username')"
                min-width="170"
                property="ldapUsername"
            />
        </el-table>
        <BaseEmptyData v-else />
        <div class="block pagination-container" v-if="totalPages > 1">
            <el-pagination
                :hide-on-single-page="false"
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="totalLdapUsers"
                v-model:currentPage="currentPage"
                popper-class="pagination-select"
                @current-change="handlePaginate"
            >
            </el-pagination>
        </div>
    </div>
</template>

<script lang="ts">
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import { ICommonGetListQuery } from '@/common/interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import i18n from '@/plugins/vue-i18n';
import { mixins } from 'vue-class-component';
import { ILdapUser } from '../interfaces';
import { userModule } from '../store';

export default class UserLdapTable extends mixins(UtilMixins) {
    pageSize = LIMIT_PER_PAGE;
    currentPage!: number;
    ldapCountryId = '';
    filterForm = {
        keyword: '',
    };
    get ldapUsers() {
        return userModule.ldapUserList;
    }

    get totalLdapUsers(): number {
        return userModule.totalLdapUsers;
    }

    get selectedPage(): number {
        return userModule.userLdapListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    get totalPages() {
        return Math.ceil(this.totalLdapUsers / this.pageSize);
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        userModule.setUserLdapListQueryString({
            page: selectedPage,
        });
        await userModule.getLdapUserList();
    }

    async onClickImportLdapUser() {
        if (userModule.selectedLdapUserList.length > 0) {
            const response = await userModule.importUserLDAP();
            if (response.success) {
                await userModule.getUserList();
            }
            userModule.setIsShowLdapUserForm(false);
        } else {
            showErrorNotificationFunction(i18n.global.t('user.selectOneLdapUser'));
        }
    }

    handleSelectionChange(users: ILdapUser[]) {
        userModule.selectLdapUsers(users);
    }

    async onClickButtonSearch(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: ICommonGetListQuery = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
        };
        userModule.setUserLdapListQueryString(query);

        await userModule.getLdapUserList();
    }

    async onClearInputSearch() {
        await this.onClickButtonSearch();
    }
}
</script>

<style scoped lang="scss">
.button-action {
    display: flex;
    justify-content: center;
    margin-left: auto;
}
.table-layout {
    align-items: center;
    min-height: 100%;
    overflow: hidden;
    margin-bottom: 16px;
    /* width */
    &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: rgb(180, 179, 179);
        border-radius: 10px;
    }
    .el-table__body {
        width: 100% !important;
    }
}
.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-right: 20px;
    margin-bottom: 20px;
}
.button-import-ldap {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 2px;
}

:deep(.column-input-ldap) {
    .cell {
        padding-right: 2px !important;
    }
}
</style>
