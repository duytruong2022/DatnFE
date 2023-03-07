<template>
    <div class="access-log-table-wrapper">
        <BaseTableLayout
            :data="accessLogList"
            :isHighlightCurrentRow="true"
            @sort-change="onSortChange"
            :totalItems="totalItems"
            v-model:selectedPage="selectedPage"
            @handlePaginate="handlePaginate"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('accessLog.accessLogList.email')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.email || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.username')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.ldapUsername || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.country')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.country?.name || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.city')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.city || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.module')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row.module
                                ? $t(`app.accessModule.${scope.row.module}`)
                                : ''
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.company')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.company || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.phone')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.userAccess?.phone || '-' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.loginAt')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row.loginAt
                                ? parseDateTime(
                                      scope.row.loginAt,
                                      DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_COLON,
                                  )
                                : '-'
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.logoutAt')"
                    width="250"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row.logoutAt
                                ? parseDateTime(
                                      scope.row.logoutAt,
                                      DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_COLON,
                                  )
                                : '-'
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('accessLog.accessLogList.duration')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{
                            scope.row.logoutAt
                                ? calculateDuration(scope.row.loginAt, scope.row.logoutAt)
                                : '-'
                        }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { DEFAULT_FIRST_PAGE, OrderDirection } from '@/common/constants';
import { IELColumnSort } from '@/common/interfaces';
import { ElLoading } from 'element-plus';
import { accessLogModule } from '../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import moment from 'moment';

export default class AccessLogTable extends mixins(UtilMixins) {
    get accessLogList() {
        return accessLogModule.accessLogList;
    }

    get totalItems(): number {
        return accessLogModule.totalAccessLogs;
    }

    get selectedPage(): number {
        return accessLogModule.accessLogListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    async onSortChange(column: IELColumnSort): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        accessLogModule.setAccessLogListQueryString({
            orderBy: column?.prop,
            orderDirection:
                column.order === OrderDirection.ASCENDING
                    ? OrderDirection.DESCENDING
                    : OrderDirection.ASCENDING,
        });
        await accessLogModule.getAccessLogList();
        loading.close();
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        accessLogModule.setAccessLogListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await accessLogModule.getAccessLogList();
        loading.close();
    }

    calculateDuration(loginAt: string, logoutAt: string): string {
        const date1 = moment(loginAt);
        const date2 = moment(logoutAt);
        const diff = date2.diff(date1, 'seconds');
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const hours_s = hours < 10 ? `0${hours}` : `${hours}`;
        const minutes_s = minutes < 10 ? `0${minutes}` : `${minutes}`;
        return `${hours_s}:${minutes_s}`;
    }
}
</script>

<style scoped lang="scss">
.access-log-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;
}
.action-icon {
    height: 1em;
    width: 1em;
}
</style>
