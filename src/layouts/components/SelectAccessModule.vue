<template>
    <div class="select-access"></div>
    <BaseSingleSelect
        v-model:value="selectedAccessModule"
        :options="accessModuleOptions"
        @change="changeAccessModule"
        :filterable="true"
        :isDisabled="isShowProjectMenu"
        :clearable="false"
    />
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import { AccessModules, PageName, THEME_MODE, UserRoles } from '@/common/constants';
import { getUserRoles, isAdmin, parseLanguageSelectOptions } from '@/common/helpers';
import { IBodyResponse, IDropDownOption, ISidebar } from '@/common/interfaces';
import {
    IConstellationSecurityPermissions,
    IUserAccessModule,
} from '@/features/auth/interfaces';
import { authModule } from '@/features/auth/store';
import { accessLogModule } from '@/features/access-log/store';
import { UtilMixins } from '@/mixins/utilMixins';
import { appModule } from '@/plugins/vuex/appModule';
import { mixins, Watch } from 'vue-property-decorator';
import { sidebarPlatform } from '@/layouts/sidebar/sidebarPlatform';
import { sidebarsConstellation } from '@/layouts/sidebar/sidebarConstellation';
import {
    sidebars3DViewerAdmin,
    sidebars3DViewerUser,
} from '@/layouts/sidebar/sidebar3DViewer';
import router from '@/plugins/vue-router';
import { projectModule } from '@/features/project/store';
import { sidebarProject } from '../sidebar/sidebarProject';
import { notificationModule } from '@/features/notification/store';
import { authService } from '@/features/auth/services/api.services';
import { ElLoading } from 'element-plus';

export default class SelectAccessModule extends mixins(UtilMixins) {
    get isModuleAdmin(): boolean {
        return isAdmin(
            authModule.selectedAccessModule || AccessModules.SPACIALYTIC_PLATFORM,
        );
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    set selectedAccessModule(accessModule: AccessModules | null) {
        if (accessModule !== localStorageAuthService.getSelectedAccessModule()) {
            authModule.setSelectedAccessModule(accessModule);
            accessLogModule.updateAccessLogModule(
                localStorageAuthService.getAccessLogId(),
            );
            localStorageAuthService.setSelectedAccessModule(accessModule);
            accessLogModule.createAccessLogModule({ module: accessModule });
        }
    }

    get accessModuleOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(authModule.accessModuleOptions);
    }

    get isShowProjectMenu(): boolean {
        return (
            !!projectModule.selectedProjectId &&
            !projectModule.isShowProjectForm &&
            this.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION
        );
    }

    created(): void {
        authModule.setAccessModuleOptions(
            localStorageAuthService.getUser().accessModules,
        );
        if (!localStorageAuthService.getSelectedAccessModule()) {
            localStorageAuthService.setSelectedAccessModule(
                AccessModules.SPACIALYTIC_CONSTELLATION,
            );
        }
        accessLogModule.createAccessLogModule({
            module: localStorageAuthService.getSelectedAccessModule(),
        });
        const accessModule = localStorageAuthService.getSelectedAccessModule();
        authModule.setSelectedAccessModule(accessModule);
        this.changeSidebarRelativeAccessModule(accessModule);

        const selectedProjectId = localStorageAuthService.getSelectedProjectId();
        if (selectedProjectId?.length) {
            projectModule.setSelectedProjectId(selectedProjectId);
        }

        if (
            localStorageAuthService.getSelectedAccessModule() ===
            AccessModules.SPACIALYTIC_CONSTELLATION
        ) {
            this.loadConstellationPermissions();
        }
    }

    async loadConstellationPermissions() {
        const loading = ElLoading.service({
            target: '.content',
        });
        const response =
            (await authService.getConstellationSecurityPermissions()) as IBodyResponse<IConstellationSecurityPermissions>;
        if (response.success) {
            localStorageAuthService.setPermissions(
                response.data?.constellationSecurityPermissions ?? [],
            );
        }
        loading.close();
    }

    async changeAccessModule(accessModule: AccessModules | null): Promise<void> {
        if (accessModule !== AccessModules.SPACIALYTIC_CONSTELLATION) {
            localStorageAuthService;
        }
        switch (accessModule) {
            case AccessModules.SPACIALYTIC_PLATFORM:
                router.push({
                    name: PageName.USER_LIST_PAGE, // TODO: change homepage module later
                });
                break;
            case AccessModules.SPACIALYTIC_CONSTELLATION: {
                await this.loadConstellationPermissions();
                router.push({
                    name: PageName.PROJECT_MAP_PAGE, // TODO: change homepage module later
                });

                break;
            }
            case AccessModules.SPACIALYTIC_3DWEBVIEWER: {
                router.push({
                    name: PageName.REPOSITORY_PAGE, // TODO: change homepage module later
                });
                break;
            }
        }
        this.changeSidebarRelativeAccessModule(accessModule);
    }

    changeSidebarRelativeAccessModule(accessModule: AccessModules | null): void {
        const accessModules = localStorageAuthService.getUser()?.accessModules;
        switch (accessModule) {
            case AccessModules.SPACIALYTIC_PLATFORM:
                appModule.changeThemeMode(THEME_MODE.BLUE_MODE);
                if (
                    this.checkHasActiveModule(
                        accessModules,
                        accessModule,
                        UserRoles.ADMIN,
                    )
                ) {
                    appModule.changeSidebar(sidebarPlatform);
                } else {
                    appModule.changeSidebar([]);
                }

                break;
            case AccessModules.SPACIALYTIC_CONSTELLATION:
                appModule.changeThemeMode(THEME_MODE.BLUE_MODE);
                appModule.changeSidebar(sidebarsConstellation);
                break;
            case AccessModules.SPACIALYTIC_3DWEBVIEWER: {
                appModule.changeThemeMode(THEME_MODE.GREEN_MODE);
                let sidebars: ISidebar[] = [];
                const viewer3DRoles = getUserRoles(AccessModules.SPACIALYTIC_3DWEBVIEWER);
                if (viewer3DRoles.includes(UserRoles.ADMIN)) {
                    sidebars = sidebars.concat(sidebars3DViewerAdmin);
                }
                if (viewer3DRoles.includes(UserRoles.NORMAL_USER)) {
                    sidebars = sidebars.concat(sidebars3DViewerUser);
                }
                appModule.changeSidebar(sidebars);
                break;
            }
        }
    }

    checkHasActiveModule(
        accessModules: IUserAccessModule[] | undefined,
        module: AccessModules,
        role: UserRoles,
    ): boolean {
        return (accessModules || []).some(
            (accessModule) =>
                accessModule.module == module && accessModule.roles.includes(role),
        );
    }

    @Watch('isShowProjectMenu')
    onChangeIsShowProjectMenu(isShowProjectMenu: boolean) {
        if (isShowProjectMenu) {
            appModule.changeSidebar(sidebarProject);

            if (!router.currentRoute.value?.meta?.isViewProject) {
                router.push({
                    name: PageName.PROJECT_DETAIL_PAGE,
                    params: {
                        projectId: projectModule.selectedProjectId,
                    },
                });
            }
        } else {
            this.changeSidebarRelativeAccessModule(
                AccessModules.SPACIALYTIC_CONSTELLATION,
            );
        }
    }

    @Watch('selectedAccessModule')
    onChangeSelectedAccessModule(selectedAccessModule: AccessModules) {
        if (this.isModuleAdmin) {
            notificationModule.getPendingNotificationCount([selectedAccessModule]);
        }
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
.select-access {
    min-width: 240px;
}
</style>
