<template>
    <div class="notification-page">
        <FilterForm />
        <NotificationTabs />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import NotificationTabs from '../components/NotificationTabs.vue';
import { initQueryString, notificationModule } from '../store';
import { AccessModules } from '@/common/constants';
import { authModule } from '@/features/auth/store';
import { Watch } from 'vue-property-decorator';
import { ElLoading } from 'element-plus';
import { userModule } from '@/features/user/store';
import FilterForm from '../components/FilterForm.vue';
import { projectModule } from '@/features/project/store';
import { NotificationStatus } from '../constants';
@Options({
    components: { NotificationTabs, FilterForm },
})
export default class NotificationPage extends mixins(UtilMixins) {
    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    async initData() {
        notificationModule.setSelectedNotificationTab(NotificationStatus.PENDING);
        notificationModule.setNotificationListQueryString({
            ...initQueryString,
            accessModules: authModule.selectedAccessModule
                ? [authModule.selectedAccessModule]
                : undefined,
        });
        await Promise.all([
            notificationModule.getNotificationList(),
            userModule.getCountryList(),
            projectModule.getProjectList(),
        ]);
    }

    async created() {
        this.initData();
    }

    @Watch('selectedAccessModule')
    async onChangeSelectedAccessModule(selectedAccessModule: AccessModules) {
        notificationModule.setSelectedNotificationTab(NotificationStatus.PENDING);
        notificationModule.setNotificationListQueryString({
            accessModules: [selectedAccessModule],
        });
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await notificationModule.getNotificationList();
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
.notification-page {
    padding: 0 24px 24px 24px;
}
</style>
