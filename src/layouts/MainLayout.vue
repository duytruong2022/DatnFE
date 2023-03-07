<template>
    <div class="main-wrapper" :class="themeMode">
        <el-container>
            <el-aside :width="sidebarWidth"><Sidebar /></el-aside>
            <el-container>
                <el-header><Header /></el-header>
                <el-main
                    ><!-- Page Wrapper -->
                    <div
                        class="page-wrapper"
                        :style="{
                            overflow: 'hidden',
                        }"
                    >
                        <!-- Page Content -->
                        <router-view v-slot="{ Component }">
                            <component :is="Component" />
                        </router-view>
                        <!-- /Page Content -->
                    </div>
                    <!-- /Page Wrapper --></el-main
                >
            </el-container>
        </el-container>
    </div>
</template>

<script lang="ts">
import localStorageAuthService, { sessionStorageAuthService } from '@/common/authStorage';
import { SidebarWidth } from '@/common/constants';
import { authService } from '@/features/auth/services/api.services';
import { authModule } from '@/features/auth/store';
import { commonModule } from '@/features/common/common.store';
import { appModule } from '@/plugins/vuex/appModule';
import { Options, Vue } from 'vue-class-component';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';

@Options({
    components: { Header, Sidebar },
})
export default class MainLayout extends Vue {
    get sidebarWidth(): string {
        if (this.openSidebar) {
            return SidebarWidth.expand;
        }
        return SidebarWidth.collapse;
    }

    get openSidebar(): boolean {
        return commonModule.openSidebar;
    }

    get themeMode() {
        return appModule.themeMode;
    }

    get accessLogId(): string {
        return localStorageAuthService.getAccessLogId();
    }

    async created() {
        await authModule.getProfile();
        // window.addEventListener('beforeunload', this.handleBeforeUnloadWindow);
    }

    handleBeforeUnloadWindow() {
        authService.logout({
            accessLogId: localStorageAuthService.getAccessLogId(),
            refreshToken: sessionStorageAuthService.getRefreshToken(),
        });
    }
}
</script>

<style lang="scss" scoped>
.el-aside {
    transition: width 0.5s;
    margin: 10px;
}
.el-container {
    height: 100%;
    .el-header {
        height: 95px;
        padding: 0px;
        display: flex;
        align-items: center;
    }
    .el-main {
        padding: 0px;
    }
}

.main-wrapper {
    height: 100vh;
    background-color: #f8f9fa;
}
.page-wrapper {
    left: 0;
    position: relative;
    transition: all 0.2s ease-in-out;
    height: fit-content;
    @media only screen and (max-width: 991.98px) {
        margin-left: 0;
    }
}
</style>
