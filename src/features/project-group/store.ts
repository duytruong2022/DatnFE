import localStorageAuthService from '@/common/authStorage';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IBodyResponse, IDropDownOption, IGetListResponse } from '@/common/interfaces';
import { projectGroupService } from './services/api.services';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
    OrderDirection,
} from '@/common/constants';
import {
    IBulkCreateProjectGroup,
    IProjectGroup,
    IProjectGroupListQueryString,
    IProjectGroupUpdateBody,
    IUserNotInProjectGroup,
} from './interfaces';
import { trimObject } from '@/common/helpers';
import { IUser } from '../auth/interfaces';
import { projectModule } from '../project/store';

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: OrderDirection.DESCENDING,
    keyword: '',
    accessModule: null,
    projectId: '',
};

export const initUserQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    accessModule: null,
    projectId: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'project-group' })
class ProjectGroupModule extends VuexModule {
    isShowGroupPopUp = false;
    isDisableSaveButton = false;
    groupListQueryString: IProjectGroupListQueryString = initQueryString;
    groupList: IProjectGroup[] = [];
    totalGroups = 0;
    isShowImportGroupFileForm = false;
    isShowImportGroupResultPopUp = false;
    importGroups: IBulkCreateProjectGroup[] = [];

    selectedGroup: IProjectGroupUpdateBody | null = null;
    projectProfileDefault: IDropDownOption = {};
    isShowAssignUserPopup = false;

    userInGroupList: IUser[] = [];
    userNotInGroupList: IUser[] = [];
    totalUserNotInGroup = 0;
    userListQueryString: IUserNotInProjectGroup = initUserQueryString;

    @Action
    async getGroupList(): Promise<IBodyResponse<IGetListResponse<IProjectGroup>>> {
        this.groupListQueryString.accessModule =
            localStorageAuthService.getSelectedAccessModule();
        this.groupListQueryString.projectId = projectModule.selectedProjectId;

        const response = (await projectGroupService.getList({
            ...this.groupListQueryString,
        })) as IBodyResponse<IGetListResponse<IProjectGroup>>;

        if (response.success) {
            this.MUTATE_GROUP_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_GROUPS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_GROUP_LIST([]);
            this.MUTATE_TOTAL_GROUPS(0);
        }
        return response;
    }

    @Action
    async getUserInGroupList() {
        const response = (await projectGroupService.getAllUsersInGroup(
            this.selectedGroup?._id as string,
        )) as IBodyResponse<IGetListResponse<IUser>>;
        if (response.success) {
            this.MUTATE_USER_IN_GROUP_LIST(response?.data?.items);
        } else {
            this.MUTATE_USER_IN_GROUP_LIST([]);
        }
    }

    @Action
    async getUserNotInGroupList() {
        const response = (await projectGroupService.getAllUsersNotInGroup(
            this.selectedGroup?._id as string,
            {
                ...this.userListQueryString,
                projectId: projectModule.selectedProjectId,
                accessModule: localStorageAuthService.getSelectedAccessModule(),
            },
        )) as IBodyResponse<IGetListResponse<IUser>>;
        if (response.success) {
            this.MUTATE_USER_NOT_IN_GROUP_LIST(response?.data?.items);
            this.MUTATE_TOTAL_USER_NOT_IN_GROUP(response?.data?.totalItems);
        } else {
            this.MUTATE_USER_NOT_IN_GROUP_LIST([]);
            this.MUTATE_TOTAL_USER_NOT_IN_GROUP(0);
        }
    }

    @Action
    setIsShowGroupForm(value: boolean) {
        this.MUTATE_IS_SHOW_GROUP_POP_UP(value);
    }

    @Action
    setIsDisableSaveButton(value: boolean) {
        this.MUTATE_IS_DISABLE_SAVE_BUTTON(value);
    }

    @Action
    setGroupListQueryString(query: IProjectGroupListQueryString) {
        this.MUTATE_GROUP_LIST_QUERY_STRING(query);
    }

    @Action
    setUserListQueryString(query: IUserNotInProjectGroup) {
        this.MUTATE_USER_NOT_IN_PROJECT_GROUP(query);
    }

    @Action
    resetUserListQueryString() {
        this.MUTATE_USER_NOT_IN_PROJECT_GROUP({ ...initUserQueryString });
    }

    @Action
    setSelectedGroup(projectGroup: IProjectGroupUpdateBody | null) {
        this.MUTATE_SELECTED_GROUP(projectGroup);
    }

    @Action
    setProjectProfileDefault(securityProfileDefault: IDropDownOption) {
        this.MUTATE_PROJECT_PROFILE_DEFAULT(securityProfileDefault);
    }

    @Action
    setIsShowImportGroupFileForm(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_GROUP_FILE_FORM(value);
    }

    @Action
    setImportGroups(importGroups: IBulkCreateProjectGroup[]) {
        trimObject(importGroups);
        this.MUTATE_IMPORT_GROUPS(importGroups);
    }

    @Action
    setIsShowImportGroupResultPopup(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_GROUP_RESULT_POP_UP(value);
    }

    @Action
    setIsShowAssignUserPopup(value: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_USER_POPUP(value);
    }

    @Mutation
    MUTATE_GROUP_LIST(groups: IProjectGroup[]) {
        this.groupList = groups;
    }

    @Mutation
    MUTATE_TOTAL_GROUPS(totalGroups: number) {
        this.totalGroups = totalGroups;
    }

    @Mutation
    MUTATE_IS_SHOW_GROUP_POP_UP(value: boolean) {
        this.isShowGroupPopUp = value;
    }

    @Mutation
    MUTATE_IS_DISABLE_SAVE_BUTTON(value: boolean) {
        this.isDisableSaveButton = value;
    }

    @Mutation
    MUTATE_GROUP_LIST_QUERY_STRING(query: IProjectGroupListQueryString) {
        this.groupListQueryString = {
            ...this.groupListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_USER_NOT_IN_PROJECT_GROUP(query: IUserNotInProjectGroup) {
        this.userListQueryString = {
            ...this.userListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_SELECTED_GROUP(projectGroup: IProjectGroupUpdateBody | null) {
        this.selectedGroup = projectGroup;
    }

    @Mutation
    MUTATE_PROJECT_PROFILE_DEFAULT(projectProfileDefaultDefault: IDropDownOption) {
        this.projectProfileDefault = projectProfileDefaultDefault;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_GROUP_FILE_FORM(value: boolean) {
        this.isShowImportGroupFileForm = value;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_GROUP_RESULT_POP_UP(value: boolean) {
        this.isShowImportGroupResultPopUp = value;
    }

    @Mutation
    MUTATE_IMPORT_GROUPS(importGroups: IBulkCreateProjectGroup[]) {
        this.importGroups = importGroups.map((importGroup, index) => {
            return {
                ...importGroup,
                index,
            };
        });
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGN_USER_POPUP(value: boolean) {
        this.isShowAssignUserPopup = value;
    }

    @Mutation
    MUTATE_USER_IN_GROUP_LIST(value: IUser[]) {
        this.userInGroupList = value;
    }

    @Mutation
    MUTATE_USER_NOT_IN_GROUP_LIST(value: IUser[]) {
        this.userNotInGroupList = value;
    }

    @Mutation
    MUTATE_TOTAL_USER_NOT_IN_GROUP(totalusers: number) {
        this.totalUserNotInGroup = totalusers;
    }
}

export const projectGroupModule = getModule(ProjectGroupModule);
