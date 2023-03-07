<template>
    <el-tabs type="card" v-model="selectedTab" :before-leave="onChangeTab">
        <el-tab-pane
            :label="$t('notification.tab.pending')"
            :name="NotificationStatus.PENDING"
        >
            <PendingNotificationTable />
        </el-tab-pane>
        <el-tab-pane
            :label="$t('notification.tab.approved')"
            :name="NotificationStatus.APPROVED"
        >
            <ApprovedNotificationTable />
        </el-tab-pane>
        <el-tab-pane
            :label="$t('notification.tab.rejected')"
            :name="NotificationStatus.REJECTED"
        >
            <RejectedNotificationTable />
        </el-tab-pane>
    </el-tabs>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { NotificationStatus } from '../constants';
import PendingNotificationTable from './PendingNotificationTable.vue';
import { notificationModule } from '../store';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import ApprovedNotificationTable from './ApprovedNotificationTable.vue';
import RejectedNotificationTable from './RejectedNotificationTable.vue';
import { Watch } from 'vue-property-decorator';
import { ElLoading } from 'element-plus';
@Options({
    components: {
        PendingNotificationTable,
        ApprovedNotificationTable,
        RejectedNotificationTable,
    },
})
export default class NotificationTabs extends mixins(UtilMixins) {
    NotificationStatus = NotificationStatus;

    get selectedTab(): NotificationStatus {
        return notificationModule.selectedNotificationTab;
    }

    set selectedTab(tab: NotificationStatus) {
        notificationModule.setSelectedNotificationTab(tab);
    }

    @Watch('selectedTab')
    async onChangeSelectedTab(tabName: NotificationStatus) {
        notificationModule.setNotificationListQueryString({
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            status: tabName,
            keyword: notificationModule.notificationListQueryString.keyword,
            projectId: notificationModule.notificationListQueryString.projectId,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await notificationModule.getNotificationList();
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
:deep(.el-tabs__content) {
    background-color: #ffffff;
    border-radius: 15px;
    padding: 30px 25px !important;
}
</style>
