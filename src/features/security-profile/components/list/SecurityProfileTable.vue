<template>
    <BaseTableLayout
        :data="securityProfileList"
        @row-click="onClickRow"
        @sort-change="handleSort"
        v-model:selectedPage="selectedPage"
        :totalItems="totalItems"
        @handlePaginate="onPaginate"
    >
        <template #table-columns>
            <el-table-column
                prop="name"
                :label="$t('securityProfile.table.labels.name')"
                sortable
            />
            <el-table-column
                prop="description"
                :label="$t('securityProfile.table.labels.description')"
            />
            <el-table-column
                :label="$t('securityProfile.table.labels.isDefaultSelect')"
                #default="scope"
                header-align="center"
                sortable
                prop="isDefaultSelect"
                width="200"
            >
                <div :style="{ textAlign: 'center' }">
                    <el-icon
                        v-if="scope.row.isDefaultSelect"
                        color="#41e35d"
                        class="no-inherit"
                        size="15px"
                        ><Check
                    /></el-icon>
                </div>
            </el-table-column>
            <el-table-column
                :label="$t('securityProfile.table.labels.action')"
                #default="scope"
                width="150"
                fixed="right"
                align="center"
            >
                <el-button
                    type="danger"
                    @click="(e) => handleDeleteClick(e, scope.row?._id)"
                    >{{ $t('securityProfile.form.button.delete') }}</el-button
                >
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { securityProfileModule } from '../../store';
import { ISecurityProfile } from '../../interface';
import { Check } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { securityProfileService } from '../../services/api.service';
import { IELColumnSort } from '@/common/interfaces';
import { SecurityProfileOrderBy } from '../../constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { DEFAULT_FIRST_PAGE } from '@/common/constants';

@Options({ components: { Check } })
export default class SecurityProfileTable extends Vue {
    get securityProfileList() {
        return securityProfileModule.securityProfileList;
    }

    get totalItems(): number {
        return securityProfileModule.totalItems;
    }

    get selectedPage(): number {
        return securityProfileModule.queryList?.page || DEFAULT_FIRST_PAGE;
    }

    async getList() {
        const loading = ElLoading.service({});
        const response = await securityProfileService.getSecurityProfileList(
            securityProfileModule.queryList,
        );
        if (response.success) {
            securityProfileModule.setSecurityProfileList(response.data.items);
            securityProfileModule.setTotalItems(response.data.totalItems);
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    onPaginate(page: number) {
        securityProfileModule.setQueryList({
            ...securityProfileModule.queryList,
            page,
        });
        this.getList();
    }

    onClickRow(row: ISecurityProfile) {
        securityProfileModule.setSecurityProfile(row);
        securityProfileModule.setIsOpenSecurityProfileForm(true);
    }

    handleSort(column: IELColumnSort) {
        securityProfileModule.setQueryList({
            ...securityProfileModule.queryList,
            orderDirection: column.order,
            orderBy: column.prop as SecurityProfileOrderBy,
        });
        this.getList();
    }

    async handleDeleteClick(e: Event, _id: string) {
        e.preventDefault();
        e.stopPropagation();
        const action = await showConfirmPopUpFunction(
            this.$t('securityProfile.form.confirm.delete'),
            this.$t('securityProfile.form.confirm.title'),
            {
                type: 'warning',
                confirmButtonText: this.$t('securityProfile.form.confirm.ok'),
                cancelButtonText: this.$t('securityProfile.form.confirm.cancel'),
            },
        );
        if (action === 'confirm') {
            this.onDelete(_id);
        }
    }

    async onDelete(_id: string) {
        const loading = ElLoading.service({});
        const deleteResponse = await securityProfileService.deleteSecurityProfile(_id);
        if (deleteResponse.success) {
            showSuccessNotificationFunction(this.$t('securityProfile.delete.success'));
        } else {
            showErrorNotificationFunction(deleteResponse.message);
        }
        securityProfileModule.resetSecurityProfileListQueryString();

        const responseList = await securityProfileService.getSecurityProfileList(
            securityProfileModule.queryList,
        );
        if (responseList.success) {
            securityProfileModule.setSecurityProfileList(responseList.data.items);
            securityProfileModule.setTotalItems(responseList.data.totalItems);
            securityProfileModule.setIsOpenSecurityProfileForm(false);
        } else {
            showErrorNotificationFunction(responseList.message);
        }
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
:deep(.el-table__body-wrapper) {
    cursor: pointer;
}

:deep(.el-table .cell) {
    word-break: unset;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
