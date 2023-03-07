import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { ISecurityProfile, ISecurityProfileQueryList } from './interface';
import { LIMIT_PER_PAGE, OrderDirection } from '@/common/constants';
import { SecurityProfileOrderBy } from './constants';

export const initSecurityProfileQuery: ISecurityProfileQueryList = {
    keyword: '',
    orderBy: SecurityProfileOrderBy.CREATED_AT,
    orderDirection: OrderDirection.DESCENDING,
    page: 1,
    limit: LIMIT_PER_PAGE,
};
@Module({ dynamic: true, namespaced: true, store, name: 'security-profile' })
class SecurityProfileModule extends VuexModule {
    securityProfileList: ISecurityProfile[] = [];
    totalItems = 0;
    securityProfile: ISecurityProfile | null = null;
    isOpenSecurityProfileForm = false;
    queryList: ISecurityProfileQueryList = initSecurityProfileQuery;
    @Action
    setSecurityProfileList(value: ISecurityProfile[]) {
        this.MUTATE_SECURITY_PROFILE_LIST(value);
    }
    @Action
    setTotalItems(value: number) {
        this.MUTATE_TOTAL_ITEMS(value);
    }
    @Action
    setIsOpenSecurityProfileForm(value: boolean) {
        this.MUTATE_IS_OPEN_SECURITY_PROFILE_FORM(value);
    }

    @Mutation
    MUTATE_SECURITY_PROFILE_LIST(value: ISecurityProfile[]) {
        this.securityProfileList = value;
    }

    @Action
    setSecurityProfile(value: ISecurityProfile | null) {
        this.MUTATE_SECURITY_PROFILE(value);
    }

    @Action
    setQueryList(value: ISecurityProfileQueryList) {
        this.MUTATE_QUERY_LIST(value);
    }

    @Action
    resetSecurityProfileListQueryString() {
        this.MUTATE_QUERY_LIST({ ...initSecurityProfileQuery });
    }

    @Mutation
    MUTATE_SECURITY_PROFILE(value: ISecurityProfile | null) {
        this.securityProfile = value;
    }

    @Mutation
    MUTATE_IS_OPEN_SECURITY_PROFILE_FORM(value: boolean) {
        this.isOpenSecurityProfileForm = value;
    }

    @Mutation
    MUTATE_QUERY_LIST(value: ISecurityProfileQueryList) {
        this.queryList = value;
    }

    @Mutation
    MUTATE_TOTAL_ITEMS(value: number) {
        this.totalItems = value;
    }
}

export const securityProfileModule = getModule(SecurityProfileModule);
