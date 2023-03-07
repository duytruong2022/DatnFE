import { IUser, IUserListQueryString } from '../user/interfaces';
import localStorageAuthService from '@/common/authStorage';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import { IBodyResponse, IDropDownOption, IGetListResponse } from '@/common/interfaces';
import { groupService } from './services/api.services';
import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
    LIMIT_PER_PAGE,
    OrderDirection,
} from '@/common/constants';
import {
    IBulkCreateGroup,
    IGroup,
    IGroupListQueryString,
    IGroupUpdateBody,
} from './interfaces';
import { trimObject } from '@/common/helpers';
import { IProject, IProjectListQueryString } from '../project/interfaces';

export const initGroupQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: OrderDirection.DESCENDING,
    keyword: '',
    profileIds: [],
    accessModule: AccessModules.SPACIALYTIC_CONSTELLATION,
};

export const initUserQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
    excludeGroupIds: [],
};

export const initProjectQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: '',
};
@Module({ dynamic: true, namespaced: true, store, name: 'group' })
class GroupModule extends VuexModule {
    groupList: IGroup[] = [];
    totalGroups = 0;
    isShowGroupPopUp = false;
    isDisableSaveButton = false;
    groupListQueryString: IGroupListQueryString = initGroupQueryString;

    selectedGroup: IGroupUpdateBody | null = null;
    securityProfileDefault: IDropDownOption = {};
    isShowImportGroupFileForm = false;
    importGroups: IBulkCreateGroup[] = [];

    isShowImportGroupResultPopUp = false;

    isShowAssignUserPopup = false;
    userInGroupList: IUser[] = [];
    userNotInGroupList: IUser[] = [];
    userListQueryString: IUserListQueryString = initUserQueryString;
    totalUserNotInGroup = 0;

    isShowAssignProjectPopup = false;
    projectNotInGroupList: IProject[] = [];
    projectListQueryString: IProjectListQueryString = initProjectQueryString;
    totalProjectNotInGroup = 0;

    projectList: IProject[] = [];
    @Action
    async getGroupList(): Promise<IBodyResponse<IGetListResponse<IGroup>>> {
        this.groupListQueryString.accessModule =
            localStorageAuthService.getSelectedAccessModule();
        const response = (await groupService.getList({
            ...this.groupListQueryString,
        })) as IBodyResponse<IGetListResponse<IGroup>>;
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
        const response = (await groupService.getAllUsersInGroup(
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
        const response = (await groupService.getUserListNotInGroup(
            this.selectedGroup?._id as string,
            {
                ...this.userListQueryString,
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
    async getProjectNotInGroupList() {
        const response = (await groupService.getProjectListNotInGroup(
            this.selectedGroup?._id as string,
            {
                ...this.projectListQueryString,
            },
        )) as IBodyResponse<IGetListResponse<IProject>>;
        if (response.success) {
            this.MUTATE_PROJECT_NOT_IN_GROUP_LIST(response?.data?.items);
            this.MUTATE_TOTAL_PROJECT_NOT_IN_GROUP(response?.data?.totalItems);
        } else {
            this.MUTATE_PROJECT_NOT_IN_GROUP_LIST([]);
            this.MUTATE_TOTAL_PROJECT_NOT_IN_GROUP(0);
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
    setGroupListQueryString(query: IGroupListQueryString) {
        this.MUTATE_GROUP_LIST_QUERY_STRING(query);
    }

    @Action
    setUserListQueryString(query: IUserListQueryString) {
        this.MUTATE_USER_LIST_QUERY_STRING(query);
    }

    @Action
    setProjectListQueryString(query: IProjectListQueryString) {
        this.MUTATE_PROJECT_LIST_QUERY_STRING(query);
    }

    @Action
    resetUserListQueryString() {
        this.MUTATE_USER_LIST_QUERY_STRING({ ...initUserQueryString });
    }

    @Action
    resetProjectListQueryString() {
        this.MUTATE_PROJECT_LIST_QUERY_STRING({ ...initProjectQueryString });
    }

    @Action
    setSelectedGroup(group: IGroupUpdateBody | null) {
        this.MUTATE_SELECTED_GROUP(group);
    }

    @Action
    setSecurityProfileDefault(securityProfileDefault: IDropDownOption) {
        this.MUTATE_SECURITY_PROFILE_DEFAULT(securityProfileDefault);
    }

    @Action
    setIsShowImportGroupFileForm(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_GROUP_FILE_FORM(value);
    }

    @Action
    setImportGroups(importGroups: IBulkCreateGroup[]) {
        trimObject(importGroups);
        this.MUTATE_IMPORT_GROUPS(importGroups);
    }

    @Action
    setIsShowImportGroupResultPopup(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_GROUP_RESULT_POP_UP(value);
    }

    @Action
    setIsShowAssignUserPopup(value: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_USER_POP_UP(value);
    }

    @Action
    setIsShowAssignProjectPopup(value: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_PROJECT_POP_UP(value);
    }

    @Action
    setTotalUserNotInGroup(value: number) {
        this.MUTATE_TOTAL_USER_NOT_IN_GROUP(value);
    }

    @Mutation
    MUTATE_GROUP_LIST(groups: IGroup[]) {
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
    MUTATE_TOTAL_USER_NOT_IN_GROUP(value: number) {
        this.totalUserNotInGroup = value;
    }

    @Mutation
    MUTATE_TOTAL_PROJECT_NOT_IN_GROUP(value: number) {
        this.totalProjectNotInGroup = value;
    }

    @Mutation
    MUTATE_GROUP_LIST_QUERY_STRING(query: IGroupListQueryString) {
        this.groupListQueryString = {
            ...this.groupListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_USER_LIST_QUERY_STRING(query: IUserListQueryString) {
        this.userListQueryString = {
            ...this.userListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_PROJECT_LIST_QUERY_STRING(query: IProjectListQueryString) {
        this.projectListQueryString = {
            ...this.projectListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_SELECTED_GROUP(group: IGroupUpdateBody | null) {
        this.selectedGroup = group;
    }

    @Mutation
    MUTATE_SECURITY_PROFILE_DEFAULT(securityProfileDefault: IDropDownOption) {
        this.securityProfileDefault = securityProfileDefault;
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
    MUTATE_IS_SHOW_ASSIGN_USER_POP_UP(value: boolean) {
        this.isShowAssignUserPopup = value;
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGN_PROJECT_POP_UP(value: boolean) {
        this.isShowAssignProjectPopup = value;
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
    MUTATE_PROJECT_NOT_IN_GROUP_LIST(value: IProject[]) {
        this.projectNotInGroupList = value;
    }

    @Mutation
    MUTATE_IMPORT_GROUPS(importGroups: IBulkCreateGroup[]) {
        this.importGroups = importGroups.map((importGroup, index) => {
            return {
                ...importGroup,
                index,
            };
        });
    }

    @Mutation
    MUTATE_PROJECT_LIST(value: IProject[]) {
        this.projectList = value;
    }
}

export const groupModule = getModule(GroupModule);
