import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IGetListProfileQueryString, IProfile } from './interfaces';
import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_FOR_DROPDOWN,
} from '@/common/constants';
import { viewer3dProfileService, projectProfileService } from './services/api.service';
import { authModule } from '../auth/store';

export const initProfileQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_FOR_DROPDOWN,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    projectId: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'profile' })
class ProfileModule extends VuexModule {
    selectedProfile: null | IProfile = null;
    profileList: IProfile[] = [];
    totalProfiles = 0;
    profileListQueryString: IGetListProfileQueryString = {
        ...initProfileQueryString,
    };

    @Action
    setSelectedProfile(value: IProfile | null) {
        this.MUTATE_SELECTED_PROFILE(value);
    }

    @Action
    async getProfile(_id: string) {
        let apiService;
        if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
            apiService = projectProfileService;
        } else {
            apiService = viewer3dProfileService;
        }
        const response = await apiService.getProfileById(_id);
        if (response.success) {
            this.MUTATE_SELECTED_PROFILE(response.data);
        }

        return response;
    }

    @Action
    setProfileList(value: IProfile[]) {
        this.MUTATE_PROFILE_LIST(value);
    }

    @Action
    async getProfileList() {
        let apiService;
        if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
            apiService = projectProfileService;
        } else {
            apiService = viewer3dProfileService;
        }
        const response = await apiService.getProfileList(this.profileListQueryString);
        if (response.success) {
            this.MUTATE_PROFILE_LIST(response.data.items);
            this.MUTATE_TOTAL_PROFILES(response.data.totalItems);
        }

        return response;
    }

    @Action
    setTotalProfiles(value: number) {
        this.MUTATE_TOTAL_PROFILES(value);
    }

    @Action
    setProfileListQueryString(value: IGetListProfileQueryString) {
        this.MUTATE_PROFILE_LIST_QUERY_STRING(value);
    }

    @Mutation
    MUTATE_SELECTED_PROFILE(value: IProfile | null) {
        this.selectedProfile = value;
    }

    @Mutation
    MUTATE_PROFILE_LIST(value: IProfile[]) {
        this.profileList = value;
    }

    @Mutation
    MUTATE_TOTAL_PROFILES(value: number) {
        this.totalProfiles = value;
    }

    @Mutation
    MUTATE_PROFILE_LIST_QUERY_STRING(value: IGetListProfileQueryString) {
        this.profileListQueryString = {
            ...this.profileListQueryString,
            ...value,
        };
    }
}

export const profileModule = getModule(ProfileModule);
