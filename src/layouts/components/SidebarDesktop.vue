<template>
    <el-menu
        v-if="sidebars.length"
        :default-openeds="activeHighlightMenu"
        :collapse="!openSidebar"
        :unique-opened="true"
        :collapse-transition="true"
    >
        <template
            :key="['d', sidebarIndex].join('-')"
            v-for="(sidebar, sidebarIndex) in sidebars"
        >
            <el-menu-item
                :index="['d', sidebarIndex, Date.now()].join('-')"
                :class="{
                    'active-menu': isActiveMenu(sidebar),
                    'collapsed-menu-item': openSidebar,
                }"
                v-if="!sidebar.children && sidebar?.onClick && hasPermission(sidebar)"
                @click="sidebar.onClick"
            >
                <div class="wrap-icon">
                    <component
                        :is="sidebar.iconComponent"
                        class="module-icon"
                        v-if="sidebar.iconComponent"
                    />
                    <img :src="sidebar.iconLink" v-else class="module-icon" />
                </div>
                <template #title>
                    <span class="menu-title">{{ $t(sidebar.name) }}</span>
                </template>
            </el-menu-item>
            <router-link
                :to="sidebar.to"
                v-else-if="!sidebar.children && sidebar.to && hasPermission(sidebar)"
            >
                <el-menu-item
                    :index="['d', sidebarIndex, Date.now()].join('-')"
                    :class="{
                        'active-menu': isActiveMenu(sidebar),
                        'collapsed-menu-item': openSidebar,
                    }"
                >
                    <div class="wrap-icon">
                        <component
                            :is="sidebar.iconComponent"
                            class="module-icon"
                            v-if="sidebar.iconComponent"
                        />
                        <img :src="sidebar.iconLink" v-else class="module-icon" />
                    </div>
                    <template #title>
                        <span class="menu-title">{{ $t(sidebar.name) }}</span>
                        <el-tag v-if="sidebar?.badge && sidebar?.badge() > 0">{{
                            sidebar.badge()
                        }}</el-tag>
                    </template>
                </el-menu-item>
            </router-link>
            <el-sub-menu
                v-if="sidebar.children && hasPermission(sidebar)"
                :index="['d', sidebarIndex].join('-')"
                :class="{
                    'active-parent-menu': isActiveParentMenu(sidebar),
                    'collapsed-menu-item': openSidebar,
                }"
            >
                <template #title>
                    <div class="wrap-icon">
                        <component
                            :is="sidebar.iconComponent"
                            class="module-icon"
                            v-if="sidebar.iconComponent"
                        />
                        <img :src="sidebar.iconLink" v-else class="module-icon" />
                    </div>
                    <span class="menu-title">{{ $t(sidebar.name) }}</span>
                </template>
                <el-menu-item-group>
                    <router-link
                        :key="itemIndex"
                        v-for="(item, itemIndex) in sidebar.children"
                        :to="item.to"
                    >
                        <el-menu-item
                            :index="['d', sidebarIndex, itemIndex].join('-')"
                            v-if="hasPermission(item)"
                            class="child-menu-item"
                            :class="isActiveSubMenu(item)"
                        >
                            <div class="dot-active">.</div>
                            <li>{{ $t(item.name) }}</li>
                        </el-menu-item>
                    </router-link>
                </el-menu-item-group>
            </el-sub-menu>
        </template>
    </el-menu>
</template>
<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { ISidebar } from '@/common/interfaces';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    User as UserIcon,
    House as HouseIcon,
    Clock as ClockIcon,
    Calendar as CalenderIcon,
    Monitor as MonitorIcon,
    Service as ServiceIcon,
    Printer as PrinterIcon,
    Key as KeyIcon,
    Setting as SettingIcon,
    QuestionFilled as QuestionIcon,
} from '@element-plus/icons-vue';
import { appModule } from '@/plugins/vuex/appModule';
import {
    hasPermissionToAccessRouteInConstellation,
    hasPermissionToAccessRouteInProject,
} from '@/common/helpers';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { AccessModules } from '@/common/constants';
import { authModule } from '@/features/auth/store';
import { projectModule } from '@/features/project/store';
import { commonModule } from '@/features/common/common.store';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import localStorageAuthService from '@/common/authStorage';

@Options({
    components: {
        UserIcon,
        HouseIcon,
        ClockIcon,
        CalenderIcon,
        MonitorIcon,
        ServiceIcon,
        PrinterIcon,
        KeyIcon,
        SettingIcon,
        QuestionIcon,
        ArrowLeftIcon,
        ArrowRightIcon,
    },
})
export default class SideBarDesktop extends Vue {
    get openSidebar(): boolean {
        return commonModule.openSidebar;
    }

    get isShowBackButton(): boolean {
        return (
            !!projectModule.selectedProjectId &&
            !projectModule.isShowProjectForm &&
            authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION
        );
    }

    get sidebars(): ISidebar[] {
        return appModule.sidebars;
    }

    get activeHighlightMenu(): string[] {
        const menuObj: Record<string, string[]> = {};
        this.sidebars.forEach((item: ISidebar, index: number) => {
            menuObj[index] = item.children
                ? item.children.map((child: ISidebar) => child.pageName || '')
                : [];
        });
        const path = this.$router.currentRoute?.value?.name as string;
        const mainMenu: string[] = [];

        Object.values(menuObj).forEach((itemSubMenu: string[], index: number) => {
            if (itemSubMenu?.includes(path)) {
                mainMenu.push(`d-${index}`);
            }
        });
        return mainMenu;
    }

    isActiveMenu(value: ISidebar): boolean {
        return this.$route.name === value.pageName;
    }

    isActiveParentMenu(items: ISidebar): boolean | undefined {
        const isActive = items?.children
            ?.map((item: ISidebar) => item.to)
            .includes(this.$route.path);
        return isActive;
    }

    isActiveSubMenu(value: ISidebar): string {
        const router = this.$router.currentRoute?.value?.name as string;
        if (value.pageName === router) return 'active-sub-menu';
        else return '';
    }

    hasPermission(item: ISidebar): boolean {
        if (
            item?.requiredPermissions?.includes(
                SecurityPermissions.ACCESS_NOTIFICATION,
            ) &&
            !hasPermissionToAccessRouteInConstellation(
                item?.requiredPermissions as SecurityPermissions[],
            )
        ) {
            return false;
        }

        const notificationPermissionIndex = item.requiredPermissions?.findIndex(
            (permission) => permission === SecurityPermissions.ACCESS_NOTIFICATION,
        );
        if (
            notificationPermissionIndex !== undefined &&
            notificationPermissionIndex !== -1
        ) {
            item.requiredPermissions?.splice(notificationPermissionIndex, 1);
        }

        if (projectModule.selectedProjectId) {
            if (
                item?.requireProjectProfile &&
                !localStorageAuthService.getProjectSecurityPermissions().length
            ) {
                return false;
            }
            if (item?.children) {
                return item?.children.some((child) =>
                    hasPermissionToAccessRouteInProject(
                        child?.requiredPermissions as ProjectSecurityPermissions[],
                    ),
                );
            } else {
                return hasPermissionToAccessRouteInProject(
                    item?.requiredPermissions as ProjectSecurityPermissions[],
                );
            }
        } else if (item?.children) {
            return item?.children.some((child) =>
                hasPermissionToAccessRouteInConstellation(
                    child?.requiredPermissions as SecurityPermissions[],
                ),
            );
        } else {
            return hasPermissionToAccessRouteInConstellation(
                item?.requiredPermissions as SecurityPermissions[],
            );
        }
    }
}
</script>
<style lang="scss" scoped>
.wrap-icon {
    width: 32px;
    height: 32px;
    padding: 8px;
    display: flex;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0.3125rem 0.625rem 0 rgb(0 0 0 / 12%);
    margin-right: 12px;
    .module-icon {
        height: 16px;
        width: 16px;
        border-radius: 8px;
    }
}

.sidebar-inner {
    display: flex;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;
    height: calc(97vh - 98px);
    transition: all 0.2s ease-in-out 0s;
    /* width */
    &::-webkit-scrollbar {
        width: 10px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: rgb(180, 179, 179);
        border-radius: 10px;
    }
    .el-menu {
        border: none;
        padding-top: 10px;
        height: 100%;
        background-color: unset;

        a {
            color: #212121;
            text-decoration: none;
            display: block;
            &:not(:last-child) {
                margin-bottom: 5px;
            }
        }
        li {
            &:not(:last-child) {
                margin-bottom: 5px;
            }
            a {
                margin-bottom: 0;
            }
        }
        .el-sub-menu {
            text-align: left;
            margin-right: 6px;
        }
        .el-menu-item,
        .el-sub-menu {
            a {
                padding-left: 25px;
            }
            &.active-menu {
                color: #344767 !important;
                background-color: unset;
                font-weight: 600;
                border-radius: 0.5rem;
                padding: 10px 5px;
                .wrap-icon {
                    background-color: var(--el-color-primary);
                    .module-icon {
                        filter: invert(1);
                    }
                }
            }
            &.active-parent-menu {
                :deep(.el-sub-menu__title) {
                    color: #344767;
                    background-color: #fff !important;
                    font-weight: 600;
                    box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
                    border-radius: 0.5rem;
                    padding: 10px 5px;
                }
                .wrap-icon {
                    background-color: var(--el-color-primary);
                    .module-icon {
                        filter: invert(1);
                    }
                }
            }
            &:hover {
                background-color: unset;
            }
        }

        .el-menu-item,
        .el-sub-menu__title {
            text-align: left;
            line-height: 40px;
            margin: 0px 6px;
            i {
                font-size: 22px;
                padding-right: 10px;
                color: #212121;
            }
        }
        &.el-menu--collapse {
            padding-top: 10px;
            display: flex;
            flex-direction: column;
            flex: 1;
            width: 100%;
            :deep(.el-menu-item) * {
                text-align: center;
            }
        }
        ul {
            .el-menu-item {
                padding-left: 15px !important;
                margin-left: 1px;
            }
        }
        :deep(.el-sub-menu__icon-arrow) {
            transform: rotate(-90deg);
        }
        :deep(.is-opened .el-sub-menu__icon-arrow) {
            transform: rotate(0);
        }
        @media only screen and (max-width: 991.98px) {
            background-color: #fff;
            box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
        }
    }
}

.active-sub-menu.child-menu-item {
    color: rgb(58, 65, 111) !important;
    font-weight: 600;
    li::marker {
        content: '';
    }
    .dot-active {
        font-size: 60px;
        margin-bottom: 40px;
        margin-left: -19px;
        margin-right: 19px;
    }
}

.el-popper {
    .el-menu {
        .el-menu-item {
            height: 40px;
            line-height: 40px;
            &.active-menu {
                color: #212121;
                background-color: #e6f6ff;
            }
            &:hover {
                color: #212121;
                background-color: #ededed;
            }
            &:not(:last-child) {
                margin-bottom: 5px;
            }
            li::marker {
                content: '';
            }
            .dot-active {
                display: none;
            }
        }
        .el-menu-item-group {
            a {
                text-decoration: unset;
            }
            :deep(.el-menu-item-group__title) {
                display: none !important;
            }
        }
    }
}

.child-menu-item {
    height: 35px !important;
    color: rgba(58, 65, 111, 0.5) !important;
    .dot-active {
        font-size: 50px;
        margin-bottom: 30px;
        margin-left: -17px;
        margin-right: 21px;
    }
}

.el-menu-item {
    padding-left: 15px !important;
}
.el-sub-menu {
    padding-left: 5px !important;
    :deep(.el-sub-menu__title) {
        padding-left: 15px !important;
        margin-left: 1px;
        &:hover {
            background-color: unset !important;
        }
    }
}

:deep(.el-menu--inline) {
    background-color: unset !important;
}

:deep(.el-drawer__body) {
    margin-top: 84px;
    overflow-y: auto;
    overflow-x: hidden;
}

:deep(.el-menu-item .el-menu-tooltip__trigger) {
    padding-left: 15px;
}
.collapsed-menu-item {
    align-items: center;
    :deep(.el-tooltip__trigger) {
        display: flex !important;
        align-items: center;
        justify-items: center;
    }
    .module-icon {
        margin: 0 !important;
        padding: 0 !important;
    }
}
.el-tag {
    margin-left: 5px;
}
</style>
