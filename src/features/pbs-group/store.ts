import { AccessModules, LIMIT_FOR_DROPDOWN } from '@/common/constants';
import { IBodyResponse, IGetListResponse, ITreeNode } from '@/common/interfaces';
import { commonService } from '@/common/services/common.service';
import store from '@/plugins/vuex';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { IGroup } from '../group/interfaces';
import { projectModule } from '../project/store';
import { IUser } from '../user/interfaces';
import { IPbsGroup, IPbsGroupQueryString } from './interfaces';
import { pbsGroupService } from './services/pbsGroup.service';

export const initQueryString = {
    limit: LIMIT_FOR_DROPDOWN,
    projectId: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'pbs-group' })
class PbsGroupModule extends VuexModule {
    pbsTree: ITreeNode[] = [];
    pbsGroupQueryString: IPbsGroupQueryString = initQueryString;
    isShowPbsGroupForm = false;
    selectedParentPbsGroup: IPbsGroup | null = null;
    selectedPbsGroup: IPbsGroup | null = null;
    isDisableSaveButton = false;
    isCreatePbsGroup = false;
    isShowAddUserForm = false;
    isShowAddGroupForm = false;
    userList: IUser[] = [];
    isChangePbsGroupTree = false;
    projectGroupList: IGroup[] = [];

    @Action
    async getPbsTree() {
        const response = (await pbsGroupService.getList({
            ...this.pbsGroupQueryString,
        })) as IBodyResponse<IGetListResponse<ITreeNode>>;
        if (response.success) {
            this.MUTATE_PBS_TREE(response?.data?.items);
        } else {
            this.MUTATE_PBS_TREE([]);
        }
    }

    @Action
    setPbsGroupQueryString(query: IPbsGroupQueryString) {
        this.MUTATE_PBS_GROUP_QUERY_STRING(query);
    }

    @Action
    setIsShowPbsGroupForm(value: boolean) {
        this.MUTATE_IS_SHOW_PBS_GROUP_FORM(value);
    }

    @Action
    setSelectedParentPbs(pbsGroup: IPbsGroup | null) {
        this.MUTATE_SELECTED_PARENT_PBS_GROUP(pbsGroup);
    }

    @Action
    async getSelectedPbsGroup(id: string) {
        const pbsGroupDetail = (await pbsGroupService.getDetail(
            id,
        )) as IBodyResponse<IPbsGroup>;
        if (pbsGroupDetail.success) {
            this.MUTATE_SELECTED_PBS_GROUP(pbsGroupDetail.data);
        } else {
            this.MUTATE_SELECTED_PBS_GROUP(null);
        }
    }

    @Action
    setSelectedPbsGroup(pbsGroup: IPbsGroup | null) {
        this.MUTATE_SELECTED_PBS_GROUP(pbsGroup);
    }

    @Action
    setIsDisableSaveButton(value: boolean) {
        this.MUTATE_IS_DISABLE_SAVE_BUTTON(value);
    }

    @Action
    setIsCreatePbsGRoup(value: boolean) {
        this.MUTATE_IS_CREATE_PBS_GROUP(value);
    }

    @Action
    async getUserList() {
        const response = await commonService.getUserList({
            accessModules: [AccessModules.SPACIALYTIC_CONSTELLATION],
            projectId: projectModule.selectedProjectId || '',
        });
        if (response.success) {
            this.MUTATE_USER_LIST(response.data?.items || []);
        } else {
            this.MUTATE_USER_LIST([]);
        }
    }

    @Action
    async getProjectGroupList() {
        const response = (await commonService.getProjectGroupList({
            projectId: projectModule.selectedProjectId as string,
        })) as unknown as IBodyResponse<IGetListResponse<IGroup>>;
        if (response.success) {
            this.MUTATE_PROJECT_GROUP_LIST(response.data?.items || []);
        } else {
            this.MUTATE_PROJECT_GROUP_LIST([]);
        }
    }

    @Action
    setIsShowAddUserForm(value: boolean) {
        this.MUTATE_IS_SHOW_ADD_USER_FORM(value);
    }

    @Action
    setIsShowAddGroupForm(value: boolean) {
        this.MUTATE_IS_SHOW_ADD_GROUP_FORM(value);
    }

    @Action
    setIsChangePbsGroupTree(value: boolean) {
        this.MUTATE_IS_CHANGE_PBS_GROUP_TREE(value);
    }

    @Mutation
    MUTATE_PBS_TREE(pbsTree: ITreeNode[]) {
        this.pbsTree = pbsTree;
    }

    @Mutation
    MUTATE_PBS_GROUP_QUERY_STRING(query: IPbsGroupQueryString) {
        this.pbsGroupQueryString = {
            ...this.pbsGroupQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_IS_SHOW_PBS_GROUP_FORM(value: boolean) {
        this.isShowPbsGroupForm = value;
    }

    @Mutation
    MUTATE_SELECTED_PARENT_PBS_GROUP(pbsGroup: IPbsGroup | null) {
        this.selectedParentPbsGroup = pbsGroup;
    }

    @Mutation
    MUTATE_SELECTED_PBS_GROUP(pbsGroup: IPbsGroup | null) {
        this.selectedPbsGroup = pbsGroup;
    }

    @Mutation
    MUTATE_IS_DISABLE_SAVE_BUTTON(value: boolean) {
        this.isDisableSaveButton = value;
    }

    @Mutation
    MUTATE_IS_CREATE_PBS_GROUP(value: boolean) {
        this.isCreatePbsGroup = value;
    }

    @Mutation
    MUTATE_USER_LIST(users: IUser[]) {
        this.userList = users;
    }

    @Mutation
    MUTATE_IS_SHOW_ADD_USER_FORM(value: boolean) {
        this.isShowAddUserForm = value;
    }

    @Mutation
    MUTATE_IS_SHOW_ADD_GROUP_FORM(value: boolean) {
        this.isShowAddGroupForm = value;
    }

    @Mutation
    MUTATE_IS_CHANGE_PBS_GROUP_TREE(value: boolean) {
        this.isChangePbsGroupTree = value;
    }

    @Mutation
    MUTATE_PROJECT_GROUP_LIST(groups: IGroup[]) {
        this.projectGroupList = groups;
    }
}

export const pbsGroupModule = getModule(PbsGroupModule);
