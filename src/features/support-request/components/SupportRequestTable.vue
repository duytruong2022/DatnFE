<template>
    <div class="support-request-table-wrapper">
        <BaseTableLayout
            v-model:selectedPage="selectedPage"
            :data="supportRequestList"
            :isHighlightCurrentRow="true"
            :totalItems="totalItems"
            @sort-change="onSortChange"
            @handlePaginate="handlePaginate"
            @row-click="onClickRowSupportRequest"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('supportRequest.table.email')"
                    prop="email"
                    sortable
                    min-width="250"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.email }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.firstName')"
                    min-width="150"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.firstName }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.lastName')"
                    min-width="150"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.lastName }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.category')"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{
                                $t(`supportRequest.list.category.${scope.row?.category}`)
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.priority')"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{
                                $t(`supportRequest.list.priority.${scope.row?.priority}`)
                            }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.version')"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.version }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.fileAttachment')"
                    width="180"
                >
                    <template #default="scope">
                        <div class="one-line-display" v-if="scope.row?.file?.path">
                            <a
                                class="click-here"
                                target="_blank"
                                rel="noopener noreferrer"
                                :href="scope.row?.file?.path"
                                @click.stop=""
                                ><u>{{ $t('supportRequest.button.linkFile') }}</u></a
                            >
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.object')"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.object }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.reference')"
                    min-width="200"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.reference }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('supportRequest.table.detail')"
                    min-width="300"
                >
                    <template #default="scope">
                        <div class="one-line-display">
                            {{ scope.row?.detail }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    fixed="right"
                    align="center"
                    width="200"
                    :label="$t('projectGroup.groupList.action')"
                >
                    <template #default="scope">
                        <div class="button-group" v-if="canDelete(scope.row.createdBy)">
                            <el-tooltip
                                effect="dark"
                                :content="$t('supportRequest.button.delete')"
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
import { AccessModules, DEFAULT_FIRST_PAGE } from '@/common/constants';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { ISupportRequest, ISupportRequestUpdateBody } from '../interface';
import { supportRequestModule } from '../store';
import { Delete as DeleteIcon, Edit as EditIcon } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { IELColumnSort } from '@/common/interfaces';
import { setupSupportRequestDelete } from '../composition/supportRequestList';
import localStorageAuthService from '@/common/authStorage';
import { isAdmin } from '@/common/helpers';

@Options({
    components: {
        DeleteIcon,
        EditIcon,
    },
})
export default class SupportRequestTable extends mixins(UtilMixins) {
    deleteAction = setup(() => setupSupportRequestDelete());
    get selectedPage(): number {
        return supportRequestModule.supportRequestQueryList?.page || DEFAULT_FIRST_PAGE;
    }

    get totalItems(): number {
        return supportRequestModule.totalItems;
    }

    get supportRequestList(): ISupportRequest[] {
        return supportRequestModule.supportRequestList;
    }

    canDelete(id: string): boolean {
        if (
            localStorageAuthService.getSelectedAccessModule() !==
            AccessModules.SPACIALYTIC_CONSTELLATION
        ) {
            return true;
        }

        if (isAdmin(AccessModules.SPACIALYTIC_CONSTELLATION)) {
            return true;
        }
        return localStorageAuthService.getUser()._id === id;
    }

    async onSortChange(column: IELColumnSort) {
        const loading = ElLoading.service({
            target: '.content',
        });
        supportRequestModule.setQueryList({
            orderBy: column?.prop,
            orderDirection: column.order,
        });
        await supportRequestModule.getSupportRequestList();
        loading.close();
    }

    async handlePaginate(selectedPage: number) {
        supportRequestModule.setQueryList({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await supportRequestModule.getSupportRequestList();
        loading.close();
    }

    onClickButtonDelete(id: string) {
        this.deleteAction.deleteSupportRequest(id);
    }

    onClickRowSupportRequest(supportRequest: ISupportRequestUpdateBody) {
        supportRequestModule.setSelectedSupportRequest(supportRequest);
        supportRequestModule.setIsShowSupportRequestDetail(true);
    }
}
</script>
<style lang="scss" scoped>
.support-request-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;
    margin-bottom: 30px;
}
.action-icon {
    height: 16px;
    width: 16px;
}
.support-request-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}
.one-line-display {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
