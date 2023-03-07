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
            <el-table-column :label="$t('notification.table.updatedBy')" min-width="150">
                <template #default="scope">
                    {{ scope.row?.updatedByUser?.[0]?.firstName }}
                    {{ scope.row?.updatedByUser?.[0]?.lastName }}
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
                min-width="200"
            >
                <template #default="scope">
                    {{ scope.row?.project?.[0]?.name }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('notification.table.requestedAction')"
                min-width="200"
            >
                <template #default="scope"
                    >{{ getRequiredAction(scope.row.type) }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('notification.table.date')" min-width="200">
                <template #default="scope">
                    {{ formatNotificationDate(scope.row.createdAt) }}
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
    <UserForm />
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { NotificationTableMixins } from '../mixin';
import UserForm from '@/features/user/components/UserForm.vue';
@Options({
    components: { UserForm },
})
export default class ApprovedNotificationTable extends mixins(NotificationTableMixins) {}
</script>
<style lang="scss" scoped></style>
