<template>
    <div class="menu-account">
        <el-dropdown trigger="click">
            <a href="#" class="nav-link">
                <div class="d-flex align-items-center">
                    <span class="user-img">
                        <Avatar :imageUrl="imageUrl" :height="25" :width="25" />
                        <span class="status online" />
                    </span>
                    <span class="user-name">{{ profile?.email }}</span>
                </div>
            </a>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="onClickProfileButton">
                        {{ $t('app.menuAccount.myProfile') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="onClickLogoutButton">
                        {{ $t('app.menuAccount.logout') }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-property-decorator';
import { Options } from 'vue-class-component';
import Avatar from '@/components/base/Avatar.vue';
import { PageName } from '@/common/constants';
import router from '@/plugins/vue-router';
import localStorageAuthService, { sessionStorageAuthService } from '@/common/authStorage';
import { authService } from '@/features/auth/services/api.services';
import { ElLoading } from 'element-plus';
import { IUser } from '@/features/auth/interfaces';
import { authModule } from '@/features/auth/store';
import { projectModule } from '@/features/project/store';
@Options({
    components: {
        Avatar,
    },
})
export default class MenuAccount extends mixins(UtilMixins) {
    get profile(): IUser | null {
        return authModule.profile;
    }
    get imageUrl(): string {
        return require('@/assets/icons/avatar-default.png');
    }

    onClickProfileButton(): void {
        router.push({
            name: PageName.PROFILE_VIEW_PAGE,
        });
    }

    async onClickLogoutButton(): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        await authService.logout({
            accessLogId: localStorageAuthService.getAccessLogId(),
            refreshToken: sessionStorageAuthService.getRefreshToken(),
        });
        loading.close();
        projectModule.setSelectedProjectId(null);
        localStorageAuthService.resetAll();
        sessionStorageAuthService.resetAll();
        router.push({
            name: PageName.LOGIN_PAGE,
        });
    }
}
</script>

<style lang="scss" scoped>
.el-dropdown-menu {
    padding: 0 !important;
}
.menu-account {
    background-color: transparent;
    padding: 0 2px;
    height: 100%;
    display: flex;
    align-items: center;
    .user-img {
        display: inline-block;
        position: relative;
        .status {
            border: 2px solid #fff;
            bottom: 0;
            height: 10px;
            margin: 0;
            position: absolute;
            right: 0;
            width: 10px;
            border-radius: 50%;
            display: inline-block;
            &.online {
                background-color: #55ce63;
            }
        }
    }
    .user-name {
        line-height: initial;
        color: #344767;
        font-weight: 600;
        margin-left: 5px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        @media only screen and (max-width: 991.98px) {
            display: none;
        }
    }
    .nav-link {
        display: flex;
        align-items: center;
        &:hover {
            background-color: unset;
        }
    }
}
</style>
