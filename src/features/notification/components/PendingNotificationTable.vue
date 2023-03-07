<template>
    <BaseTableLayout
        :data="notificationList"
        :isHighlightCurrentRow="true"
        :totalItems="totalNotifications"
        @handlePaginate="handlePaginate"
        v-model:selectedPage="selectedPage"
    >
        <template #table-columns>
            <el-table-column
                :label="$t('notification.table.fullName')"
                prop="user.fullName"
                min-width="200"
            />
            <el-table-column
                :label="$t('notification.table.email')"
                prop="user.email"
                min-width="300"
            />
            <el-table-column :label="$t('notification.table.lastAction')" min-width="120">
                <template #default="scope">
                    {{ getAction(scope.row.type) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('notification.table.projectManagerEmail')"
                min-width="300"
            >
                <template #default="scope">
                    {{ scope.row?.projectAdmin?.[0]?.email }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('notification.table.projectName')"
                min-width="150"
            >
                <template #default="scope">
                    {{ scope.row?.project?.[0]?.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('notification.table.requestedAction')"
                min-width="200"
                align="center"
            >
                <template #default="scope">
                    <el-button @click="onClickUser(scope.row)" type="small">{{
                        getRequiredAction(scope.row.type)
                    }}</el-button>
                </template>
            </el-table-column>
            <el-table-column :label="$t('notification.table.date')" min-width="200">
                <template #default="scope">
                    {{ formatNotificationDate(scope.row.createdAt) }}
                </template>
            </el-table-column>
            <el-table-column
                fixed="right"
                align="center"
                :label="$t('notification.table.action')"
                min-width="120"
            >
                <template #default="scope">
                    <div class="button-group">
                        <el-tooltip
                            effect="dark"
                            :content="$t('notification.table.reject')"
                            placement="top"
                        >
                            <el-button
                                type="danger"
                                size="mini"
                                @click="onClickReject(scope.row)"
                            >
                                {{ $t('notification.table.reject') }}
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
    <RejectNotificationForm />
    <SetPasswordForm />
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { notificationModule } from '../store';
import { NotificationTypes } from '../constants';
import RejectNotificationForm from './RejectNotificationForm.vue';
import { NotificationTableMixins } from '../mixin';
import { userModule } from '@/features/user/store';
import SetPasswordForm from '@/features/user/components/forms/SetPasswordForm.vue';
import { INotification } from '../interfaces';
@Options({
    components: { RejectNotificationForm, SetPasswordForm },
})
export default class PendingNotificationTable extends mixins(NotificationTableMixins) {
    getActionUrl(type: NotificationTypes): string {
        // TODO get active url for registering and reseting password
        switch (type) {
            case NotificationTypes.REGISTER:
                return '/user';
            case NotificationTypes.RESET_PASSWORD:
                return '/user';
            default:
                return '';
        }
    }

    onClickReject(notification: INotification) {
        notificationModule.setSelectedNotification(notification);
        notificationModule.setIsShowRejectNotificationForm(true);
    }

    onClickUser(notification: INotification) {
        notificationModule.setSelectedNotification(notification || null);
        userModule.setSelectedUser(notification.user);
        userModule.setIsShowSetPasswordForm(true);
    }
}
</script>
<style lang="scss" scoped></style>
