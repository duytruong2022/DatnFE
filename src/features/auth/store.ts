import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IUser, IUserAccessModule } from './interfaces';
import { authService } from './services/api.services';
import { showErrorNotificationFunction } from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { IDropDownOption, IDropDownOrderOption } from '@/common/interfaces';
import { AccessModuleOptions, AccessModules } from '@/common/constants';
import { commonService } from '@/common/services/common.service';

@Module({ dynamic: true, namespaced: true, store, name: 'auth' })
class AuthModule extends VuexModule {
    profile: IUser | null = null;
    accessModuleOptions: IDropDownOption[] = [];
    selectedAccessModule: AccessModules | null = null;

    isShowLoginLdapFormPopUp = false;
    isShowChangePasswordForm = false;
    isShowForgotPasswordFormPopUp = false;
    companyList: string[] = [];

    @Action
    async setAccessModuleOptions(userAccessModules: IUserAccessModule[] | undefined) {
        let userAccessModuleOptions: IDropDownOrderOption[] = [];
        if (userAccessModules) {
            userAccessModules.forEach((userAccessModule) => {
                const accessModules = AccessModuleOptions.filter((accessModule) => {
                    return accessModule.value === userAccessModule.module;
                });
                userAccessModuleOptions = userAccessModuleOptions.concat(accessModules);
            });
            userAccessModuleOptions.sort((a, b) => (a.order > b.order ? 1 : -1));
            this.MUTATE_ACCESS_MODULE_OPTIONS(userAccessModuleOptions);
        }
    }

    @Action
    setSelectedAccessModule(selectedAccessModule: AccessModules | null) {
        this.MUTATE_SELECTED_ACCESS_MODULE(selectedAccessModule);
    }

    @Action
    async getProfile(showError = true) {
        const response = await authService.getProfile();
        if (response.success) {
            this.setProfile(response.data);
        } else if (!response.isRequestError && showError) {
            showErrorNotificationFunction(
                response.message,
                i18n.global.t('app.notification'),
            );
        }
        return response;
    }

    @Action
    async getCompanyList() {
        const response = await commonService.getCompanyList({
            accessModules: [
                AccessModules.SPACIALYTIC_PLATFORM,
                AccessModules.SPACIALYTIC_CONSTELLATION,
                AccessModules.SPACIALYTIC_3DWEBVIEWER,
            ],
        });
        if (response.success) {
            this.MUTATE_COMPANY_LIST(response.data?.items || []);
        } else {
            this.MUTATE_COMPANY_LIST([]);
        }
    }

    @Action
    setProfile(value: IUser | null) {
        this.MUTATE_PROFILE(value);
    }

    @Action
    setIsShowLoginLdapFormPopUp(value: boolean) {
        this.MUTATE_IS_SHOW_LOGIN_LDAP_FORM_POP_UP(value);
    }

    @Action
    setIsShowForgotPasswordFormPopUp(value: boolean) {
        this.MUTATE_IS_SHOW_FORGOT_PASSWORD_FORM_POP_UP(value);
    }

    @Action
    setIsShowChangePasswordForm(isShow: boolean) {
        this.MUTATE_IS_SHOW_CHANGE_PASSWORD_FORM(isShow);
    }

    @Mutation
    MUTATE_PROFILE(value: IUser | null) {
        this.profile = value;
    }

    @Mutation
    MUTATE_SELECTED_ACCESS_MODULE(selectedAccessModule: AccessModules | null) {
        this.selectedAccessModule = selectedAccessModule;
    }

    @Mutation
    MUTATE_ACCESS_MODULE_OPTIONS(accessModuleOptions: IDropDownOption[]) {
        this.accessModuleOptions = accessModuleOptions;
    }

    @Mutation
    MUTATE_IS_SHOW_LOGIN_LDAP_FORM_POP_UP(value: boolean) {
        this.isShowLoginLdapFormPopUp = value;
    }

    @Mutation
    MUTATE_IS_SHOW_FORGOT_PASSWORD_FORM_POP_UP(value: boolean) {
        this.isShowForgotPasswordFormPopUp = value;
    }

    @Mutation
    MUTATE_IS_SHOW_CHANGE_PASSWORD_FORM(isShow: boolean) {
        this.isShowChangePasswordForm = isShow;
    }

    @Mutation
    MUTATE_COMPANY_LIST(companies: string[]) {
        this.companyList = companies;
    }
}

export const authModule = getModule(AuthModule);
