<template>
    <BaseTableLayout
        :data="notificationList"
        :isHighlightCurrentRow="true"
        :totalItems="totalNotifications"
        @handlePaginate="handlePaginate"
        v-model:selectedPage="selectedPage"
    >
        <template #table-columns>
            <el-table-column :label="$t('projectNotification.table.label.fullName')">
                <template #default="scope">
                    {{ scope.row?.user?.firstName }}
                    {{ scope.row?.user?.lastName }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('projectNotification.table.label.action')">
                <template #default="scope">
                    {{ $t(`projectNotification.table.action.${scope.row.type}`) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('projectNotification.table.label.target')"
                prop="target"
            />
            <el-table-column :label="$t('projectNotification.table.label.date')">
                <template #default="scope">
                    {{ formatNotificationDate(scope.row.createdAt) }}
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import moment from 'moment';
import { DATE_TIME_FORMAT, DEFAULT_FIRST_PAGE } from '@/common/constants';
import { projectModule } from '../store';
import { ElLoading } from 'element-plus';
import { showErrorNotificationFunction } from '@/common/helpers';
export default class NotificationTable extends mixins(UtilMixins) {
    get notificationList() {
        return projectModule.projectNotificationList;
    }
    get totalNotifications() {
        return projectModule.projectNotificationCount;
    }
    get selectedPage() {
        return (
            projectModule.projectNotificationListQueryString.page || DEFAULT_FIRST_PAGE
        );
    }
    set selectedPage(page: number) {
        projectModule.setProjectNotificationListQueryString({ page });
    }
    formatNotificationDate(date: string) {
        return moment(date).format(DATE_TIME_FORMAT.MM_DD_YYYY_SLASH_HH_MM_COLON);
    }
    async handlePaginate(): Promise<void> {
        this.fetchData();
    }
    async fetchData() {
        const loading = ElLoading.service({
            target: '.content',
        });
        const response = await projectModule.getProjectNotificationList();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
            return;
        }
        loading.close();
    }
}
</script>
<style lang="scss" scoped></style>
