<template>
    <header class="header">
        <div class="base-header">
            <!-- toggle sidebar btn -->
            <div class="header-left">
                <div class="toggle_btn" @click="toggleSidebar">
                    <img src="@/assets/icons/ic-menu-expand.svg" style="width: 30px" />
                </div>
                <!-- Breadcrumb -->
                <div class="breadcrumb">
                    <Breadcrumb />
                </div>
            </div>
            <div class="header-right">
                <!-- Language Menu -->
                <div class="nav-item" v-show="false">
                    <SelectAccessModule />
                </div>
                <!-- Language Menu -->
                <div class="nav-item dropdown has-arrow flag-nav">
                    <MenuLanguage />
                </div>
                <div v-if="isModuleAdmin">
                    <el-badge
                        @click="onClickNotificationIcon"
                        :value="pendingNotificationCount"
                        class="item"
                        :hidden="pendingNotificationCount === 0"
                    >
                        <BellIcon class="icon" />
                    </el-badge>
                </div>
                <!-- Account Menu -->
                <div class="nav-item dropdown has-arrow main-drop">
                    <MenuAccount />
                </div>
            </div>
        </div>
    </header>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import MenuAccount from './MenuAccount.vue';
import MenuLanguage from './MenuLanguage.vue';
import Breadcrumb from './Breadcrumb.vue';
import SelectAccessModule from './SelectAccessModule.vue';
import { BellFilled as BellIcon } from '@element-plus/icons-vue';
import { notificationModule } from '@/features/notification/store';
import router from '@/plugins/vue-router';
import { AccessModules, PageName } from '@/common/constants';
import { NotificationStatus } from '@/features/notification/constants';
import { commonModule } from '@/features/common/common.store';
import { isAdmin } from '@/common/helpers';
import { authModule } from '@/features/auth/store';

@Options({
    components: {
        MenuAccount,
        MenuLanguage,
        Breadcrumb,
        SelectAccessModule,
        BellIcon,
    },
})
export default class Header extends Vue {
    get openSidebar(): boolean {
        return commonModule.openSidebar;
    }

    get isModuleAdmin(): boolean {
        return isAdmin(
            authModule.selectedAccessModule || AccessModules.SPACIALYTIC_PLATFORM,
        );
    }

    get pendingNotificationCount(): number {
        return notificationModule.pendingNotificationCount;
    }

    toggleSidebar(): void {
        commonModule.setOpenSidebar(!this.openSidebar);
    }

    onClickNotificationIcon() {
        notificationModule.setSelectedNotificationTab(NotificationStatus.PENDING);
        router.push({
            name: PageName.NOTIFICATION_LIST_PAGE,
        });
    }
}
</script>
<style scoped lang="scss">
.header {
    width: 100%;
    margin-right: 25px;
    margin-left: 25px;
    padding: 8px 0px;
    .base-header {
        align-items: center;
        justify-content: space-between;
        display: flex;
        .header-left {
            display: flex;
            align-items: center;
            .toggle_btn {
                color: #212121;
                cursor: pointer;
            }
        }
        .header-right {
            display: flex;
            align-items: center;
        }
    }
}
.form-group {
    margin-bottom: 0px !important;
}
.icon {
    width: 16px;
    cursor: pointer;
}
:deep(.validation-error) {
    display: none;
}

.back-button {
    display: flex;
}
:deep(.breadcrumb) {
    margin: 0 0 0 8px;
}
</style>
