import { ISidebar } from '@/common/interfaces';
import { SUPPORT_LANGUAGE } from './../../common/constants';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import localStorageAuthService from '@/common/authStorage';

@Module({
    name: 'app',
    stateFactory: true,
    dynamic: true,
    namespaced: true,
    store,
})
class AppModule extends VuexModule {
    isShowMobileSidebar = false;
    selectedLanguage = localStorageAuthService.getLanguage();
    themeMode = '';
    sidebars: ISidebar[] = [];

    @Action
    changeThemeMode(mode: string): void {
        this.SET_THEME_MODE(mode);
    }

    @Action
    changeSidebar(sidebars: ISidebar[]): void {
        this.SET_SIDEBAR(sidebars);
    }

    @Action
    resetSidebar(): void {
        this.SET_SIDEBAR([]);
    }

    @Action
    toggleMobileSidebar(): void {
        this.SET_IS_SHOW_MOBILE_SIDEBAR(!this.isShowMobileSidebar);
    }

    @Action
    setLanguage(lang: SUPPORT_LANGUAGE): void {
        this.SET_LANGUAGE(lang);
    }

    @Mutation
    SET_THEME_MODE(mode: string): void {
        this.themeMode = mode;
    }

    @Mutation
    SET_SIDEBAR(sidebars: ISidebar[]): void {
        this.sidebars = sidebars;
    }

    @Mutation
    SET_IS_SHOW_MOBILE_SIDEBAR(value: boolean): void {
        this.isShowMobileSidebar = value;
    }

    @Mutation
    SET_LANGUAGE(lang: SUPPORT_LANGUAGE): void {
        this.selectedLanguage = lang;
    }
}

export const appModule = getModule(AppModule);
