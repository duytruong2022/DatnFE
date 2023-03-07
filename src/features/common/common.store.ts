import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { showErrorNotificationFunction } from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { ICountry } from '@/common/interfaces';
import { commonService } from '@/common/services/common.service';

@Module({ dynamic: true, namespaced: true, store, name: 'common' })
class CommonModule extends VuexModule {
    countryList: ICountry[] = [];
    openSidebar = true;
    customBreadcrumb: string | null = null;

    @Action
    async getCountry(showError = true) {
        const response = await commonService.getCountryList();
        if (response.success) {
            this.setCountry(response.data.items);
        } else if (!response.isRequestError && showError) {
            showErrorNotificationFunction(
                response.message,
                i18n.global.t('app.notification'),
            );
        }
        return response;
    }

    @Action
    setCountry(value: ICountry[]) {
        this.MUTATE_COUNTRY(value);
    }

    @Action
    setOpenSidebar(value: boolean) {
        this.MUTATE_OPEN_SIDEBAR(value);
    }

    @Action
    setCustomBreadcrumb(customBreadcrumb: string | null) {
        this.MUTATE_CUSTOM_BREADCRUMB(customBreadcrumb);
    }

    @Mutation
    MUTATE_COUNTRY(value: ICountry[]) {
        this.countryList = value;
    }

    @Mutation
    MUTATE_OPEN_SIDEBAR(value: boolean) {
        this.openSidebar = value;
    }

    @Mutation
    MUTATE_CUSTOM_BREADCRUMB(customBreadcrumb: string | null) {
        this.customBreadcrumb = customBreadcrumb;
    }
}

export const commonModule = getModule(CommonModule);
