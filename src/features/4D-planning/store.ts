import localStorageAuthService from '@/common/authStorage';
import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    LIMIT_PER_PAGE,
    OrderDirection,
} from '@/common/constants';
import { showErrorNotificationFunction } from '@/common/helpers';
import {
    IBodyResponse,
    IFolderStructureTree,
    IGetListResponse,
    IProjectFile,
    IQueryDropdownFile,
} from '@/common/interfaces';
import { commonService } from '@/common/services/common.service';
import store from '@/plugins/vuex';
import cloneDeep from 'lodash/cloneDeep';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { projectModule } from '../project/store';
import { DelegateOptions } from './constants';
import {
    IActivityCodeListItem,
    IAppearanceProfile,
    IAppearanceProfileListQuery,
    IBaselineConfiguration,
    IBaselinePlanning,
    IBaselinePlanningListQuery,
    IGanttChartTask,
    IGridSettingParams,
    IPlanning,
    IPlanningListQuery,
    IPlanningQuery,
    IProjectTask,
    IResource,
    IResourceGroup,
    IResourceListQuery,
    ITaskFieldParams,
    ITaskLink,
    IImportProject,
    IImportTask,
    IImportResource,
    IImportLink,
    ILinkDetail,
    IDelegationHasModifyResponse,
    IImportTaskCustomField,
    IPlanListQueryString,
} from './interfaces';
import { projectPlanningService } from './services/planning.service';

interface ITaskPopupParam {
    selectedTask: IGanttChartTask | null;
    selectedTaskId: string | null;
    parentOfSelectedTask: IGanttChartTask | null;
    show: boolean;
}

interface ILinkPopupParam {
    selectedTask: IGanttChartTask | null;
    show: boolean;
    isCreate?: boolean;
}

interface IDelegationPopupParam {
    show: boolean;
    tabSelected: DelegateOptions;
}

interface IGanttContextMenuParam {
    task: IGanttChartTask | null;
    link: ITaskLink | null;
    show: boolean;
    top?: number;
    left?: number;
    permissionAddLink?: boolean | null;
}

interface ILinkFormPopupParam {
    dependency: null | string;
    taskLinkToList: ILinkDetail[];
    show: boolean;
    edit?: boolean;
}

interface IActivityCodePopupParam {
    show: boolean;
    isCreate: boolean;
    activityCodeIdSelected: string;
    activityCodeValueSelected: string;
}
interface ILinkDetailFormPopupParam {
    linkSelected: ITaskLink | null;
    show: boolean;
}

interface IBaselineIdSelectedInPlanning {
    planningId: string;
    baselineId: string;
}

export const initBaselineQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: OrderDirection.DESCENDING,
    keyword: '',
    planningId: '',
};

export const initPlanQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: LIMIT_PER_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: OrderDirection.DESCENDING,
    keyword: '',
};

@Module({ dynamic: true, namespaced: true, store, name: 'project-planning' })
class ProjectPlanningModule extends VuexModule {
    initialGridSettingParams = {
        displayingStatus: {
            calendarName: false,
            status: false,
            start: false,
            actualStart: false,
            finish: false,
            actualFinish: false,
            rules: false,
        },
        open: false,
    };
    gridSettingParams: IGridSettingParams = cloneDeep(this.initialGridSettingParams);
    isShowBaselinePopup = false;
    initialDelegationPopupParam = {
        show: false,
        tabSelected: DelegateOptions.NEW_PLANNING,
    };
    delegationPopupParam = cloneDeep(this.initialDelegationPopupParam);
    baselineConfiguration: IBaselineConfiguration = {
        _id: '',
        planningId: '',
        display: true,
        color: '#FFD180',
        position: 'around',
    };
    isShowSynthesisPopup = false;
    isShowResourcePopup = false;
    isShowResourceDetailForm = false;
    isShowResourceGroupPopup = false;
    isShowResourceGroupDetailForm = false;
    ganttContextMenuParam: IGanttContextMenuParam = {
        task: null,
        link: null,
        show: false,
        top: 0,
        left: 0,
    };
    linkDetailFormPopupParam: ILinkDetailFormPopupParam = {
        linkSelected: null,
        show: false,
    };
    linkPopupParam: ILinkPopupParam = {
        selectedTask: null,
        show: false,
        isCreate: false,
    };
    linkFormPopupParam: ILinkFormPopupParam = {
        dependency: null,
        taskLinkToList: [],
        show: false,
    };
    bulkCreateLinkList: ILinkDetail[] = [];

    resourceList: IResource[] = [];
    resourceGroupList: IResourceGroup[] = [];
    planningList: IPlanning[] = [];
    planning: IPlanning | null = null;
    selectedPlannings: IPlanning[] = [];
    totalPlanning = 0;
    initialTaskPopupParams: ITaskPopupParam = {
        selectedTaskId: null,
        show: false,
        selectedTask: null,
        parentOfSelectedTask: null,
    };
    taskPopupParams: ITaskPopupParam = {
        ...this.initialTaskPopupParams,
    };
    selectedResource: IResource | null = null;
    selectedResourceGroup: IResourceGroup | null = null;
    isDisabledSaveButton = false;
    projectFileList: IProjectFile[] = [];

    baselineIdSelected = '';
    baselineListQueryString: IBaselinePlanningListQuery = initBaselineQueryString;
    baselineList: IBaselinePlanning[] = [];
    totalBaselineItems = 0;
    selectedTaskIds: string[] = [];
    planningId = '';
    baselineIdsSelected: IBaselineIdSelectedInPlanning[] = [];
    totalBaselineSelected = 0;
    selectedBaselineIdToUpdate: string | null = null;
    isShowAssignResourceForm = false;
    isShowAssignResourceGroupForm = false;
    updatedTasks: IProjectTask[] = [];
    hasTaskDeleted = false;
    latestCreatedLink: ITaskLink | null = null;
    editedTaskIds: string[] = [];
    selectedTaskIdList: string[] = [];
    taskFieldsParams: ITaskFieldParams = {
        open: false,
        action: null,
        selectedField: null,
    };
    needReload3DViewer = false;
    isShowAppearanceProfilePopup = false;
    isShowAppearanceProfileDetailForm = false;
    appearanceProfileList: IAppearanceProfile[] = [];
    selectedAppearanceProfile: IAppearanceProfile | null = null;
    isShowTopDownFormPopup = false;
    selectedActivityCodeId = '';
    selectedActivityCodeFolderId = '';
    isShowBottomUpFormPopup = false;
    isMovingFocusTime = false;
    taskLayerId = '';
    assignedTaskNames: string[] = [];
    isShowAssignedTaskNamesPopup = false;
    isShowPlanningPopup = false;
    isDisableButtonAdd = false;
    isShowExportPlanningPopup = false;
    delegationHasModify: IDelegationHasModifyResponse[] = [];
    isShowImportXmlFileForm = false;
    createdLink = false;
    importTasks: IImportTask[] = [];
    importTaskCustomFields: IImportTaskCustomField[] = [];
    importLinks: IImportLink[] = [];
    importResources: IImportResource[] = [];
    importTaskIds: string[] = [];
    importProject: IImportProject = {};
    isShowImportXmlDetail = false;
    rootTaskHasPermissionCreateChild: IProjectTask[] = [];
    resourceTree: IFolderStructureTree[] = [
        {
            name: '',
            children: [],
            path: '/',
            level: 0,
        },
    ];
    selectedResourceNodeId = '';
    isShowImportResourcePopup = false;
    extendPermission: string[] = ['T_CUSTOM_FILE_G__CUSTOM_EXPORT_F_SAVE_FILE'];
    isShowSaveAsPopup = false;

    activityCodePopupParam: IActivityCodePopupParam = {
        show: false,
        isCreate: false,
        activityCodeIdSelected: '',
        activityCodeValueSelected: '',
    };
    isShowAssignActivityCodePopup = false;
    activityCodeList: IActivityCodeListItem[] = [];

    editedLinkIds: string[] = [];
    isShowRenameTaskFormPopup = false;
    selectedTaskId = '';
    selectedFilePaths: string[] = [];
    planListQueryString: IPlanListQueryString = initPlanQueryString;

    @Action
    async getActivityCodeList() {
        const response = await projectPlanningService.getActivityCodeList();
        if (response.success) {
            this.MUTATE_SET_ACTIVITY_CODE_LIST(response.data);
        }
        return response;
    }

    @Mutation
    MUTATE_SET_ACTIVITY_CODE_LIST(value: IActivityCodeListItem[]) {
        this.activityCodeList = value;
    }
    @Action
    setActivityCodePopupParam(value: IActivityCodePopupParam) {
        this.MUTATE_SET_ACTIVITY_CODE_POPUP_PARAM(value);
    }

    @Mutation
    MUTATE_SET_ACTIVITY_CODE_POPUP_PARAM(value: IActivityCodePopupParam) {
        this.activityCodePopupParam = value;
    }

    @Action
    setIsShowAssignActivityCodePopup(value: boolean) {
        this.MUTATE_SET_IS_SHOW_ASSIGN_ACTIVITY_CODE__POPUP(value);
    }

    @Mutation
    MUTATE_SET_IS_SHOW_ASSIGN_ACTIVITY_CODE__POPUP(value: boolean) {
        this.isShowAssignActivityCodePopup = value;
    }

    @Action
    async getRootTaskHasPermissionCreateChild() {
        const response = await projectPlanningService.getRootTaskHasPermissionCreateChild(
            this.planningId,
        );
        if (response.success) {
            this.MUTATE_ROOT_TASK_HAS_PERMISSION_CREATE_TASK(response.data);
        }
        return response;
    }

    @Action
    async getDelegatePlanningListHasModifyFromOriginal() {
        const response =
            await projectPlanningService.getDelegatePlanningListHasModifyFromOriginal(
                this.planningId,
            );

        if (response.success) {
            this.MUTATE_DELEGATE_PLANNING_HAS_MODIFY(response?.data || []);
        }
        return response;
    }

    @Action
    async getBaselineConfiguration() {
        const response = (await projectPlanningService.getBaselineConfiguration({
            planningId: this.planningId,
        })) as IBodyResponse<IBaselineConfiguration>;

        if (response.success) {
            this.MUTATE_BASELINE_CONFIGURATION(response?.data || []);
        }
        return response;
    }

    @Action
    async getBaselineList(): Promise<IBodyResponse<IGetListResponse<IBaselinePlanning>>> {
        this.baselineListQueryString.planningId = this.planning?._id || '';

        const response = (await projectPlanningService.getBaselineList({
            ...this.baselineListQueryString,
        })) as IBodyResponse<IGetListResponse<IBaselinePlanning>>;

        if (response.success) {
            this.MUTATE_BASELINE_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_BASELINE(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_BASELINE_LIST([]);
            this.MUTATE_TOTAL_BASELINE(0);
        }
        return response;
    }

    @Action
    async getPlanning(id: string) {
        const response = await projectPlanningService.getPlanning(id);

        if (response.success) {
            this.setPlanning(response.data);

            const baselineIdSelected = this.baselineIdsSelected.find((item) => {
                return item.planningId === response.data._id;
            })?.baselineId;
            if (baselineIdSelected) {
                this.MUTATE_BASELINE_PLANNING_SELECTED(baselineIdSelected);
            }
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        return response;
    }

    @Action
    async getPlanningList(data: { projectId: string; query: IPlanningListQuery }) {
        const response = await projectPlanningService.getPlanningList(data.projectId, {
            ...data.query,
        });

        if (response.success) {
            this.MUTATE_PLANNING_LIST(response.data.items);
            this.MUTATE_TOTAL_PLANNING(response.data.totalItems);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        return response;
    }

    @Action
    async getSynthesizedFromFileList(planningId: string, query: IPlanningListQuery) {
        const response = await projectPlanningService.getTopDownFileList(planningId, {
            ...query,
        });

        if (response.success) {
            this.MUTATE_PLANNING_LIST(response.data.items);
            this.MUTATE_TOTAL_PLANNING(response.data.totalItems);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        return response;
    }

    @Action
    async getDeligatedFromFileList(planningId: string, query: IPlanningListQuery) {
        const response = await projectPlanningService.getBottomUpFileList(planningId, {
            ...query,
        });

        if (response.success) {
            this.MUTATE_PLANNING_LIST(response.data.items);
            this.MUTATE_TOTAL_PLANNING(response.data.totalItems);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        return response;
    }

    @Action
    async getOriginalPlanning(planningId: string) {
        const response = await projectPlanningService.getPlanningInformation(planningId);

        if (response.success) {
            this.MUTATE_PLANNING_LIST([response.data]);
            this.MUTATE_TOTAL_PLANNING(1);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        return response;
    }

    @Action
    async getResourceTree(query: IResourceListQuery) {
        const response = await projectPlanningService.getResourceTree(query);
        if (response.success) {
            this.setResourceTree(response.data);
        } else {
            this.MUTATE_RESOURCE_TREE([
                {
                    name: '',
                    children: [],
                    path: '/',
                    level: 0,
                },
            ]);
        }
    }

    @Action
    async getResourceList(query: IResourceListQuery) {
        const response = await projectPlanningService.getResourceList(query);
        if (response.success) {
            this.MUTATE_RESOURCE_LIST(response.data.items);
        } else {
            this.MUTATE_RESOURCE_LIST([]);
        }
    }

    @Action
    async getProjectFileList(query: IQueryDropdownFile) {
        const response = await commonService.getProjectFileList(query);

        if (response.success) {
            this.MUTATE_PROJECT_FILE_LIST(response.data.items);
        } else {
            this.MUTATE_PROJECT_FILE_LIST([]);
        }
    }

    @Action
    async getAppearanceProfileList(query: IAppearanceProfileListQuery) {
        const response = await projectPlanningService.getAppearanceProfileList(query);

        if (response.success) {
            this.MUTATE_APPEARANCE_PROFILE__LIST(response.data.items || []);
        } else {
            this.MUTATE_APPEARANCE_PROFILE__LIST([]);
        }
    }

    @Action
    setBaselineConfiguration(value: IBaselineConfiguration) {
        this.MUTATE_BASELINE_CONFIGURATION(value);
    }

    @Action
    async getResourceGroupList(query: IResourceListQuery) {
        const response = await projectPlanningService.getResourceGroupList(query);

        if (response.success) {
            this.MUTATE_RESOURCE_GROUP_LIST(response.data.items);
        } else {
            this.MUTATE_RESOURCE_GROUP_LIST([]);
        }
    }

    @Action
    setDelegatePopupParam(value: IDelegationPopupParam) {
        this.MUTATE_DELEGATE_POPUP_PARAM(value);
    }

    @Action
    setIsShowBaselinePopup(value: boolean) {
        this.MUTATE_IS_SHOW_BASELINE_POPUP(value);
    }

    @Action
    setIsShowSynthesisPopup(value: boolean) {
        this.MUTATE_IS_SHOW_SYNTHESIS_POPUP(value);
    }

    @Action
    setSelectedTaskIdList(value: string[]) {
        this.MUTATE_SELECTED_TASK_ID_LIST(value);
    }

    @Action
    setGridSettingsParams(value: Partial<IGridSettingParams>) {
        this.MUTATE_GRID_SETTING_PARAMS({
            ...this.gridSettingParams,
            ...value,
        });
    }

    @Action
    setPlanningList(value: IPlanning[]) {
        this.MUTATE_PLANNING_LIST(value);
    }

    @Action
    setTaskPopupParams(value: Partial<ITaskPopupParam>) {
        this.MUTATE_TASK_POPUP_PARAMS({
            ...this.taskPopupParams,
            ...value,
        });
    }

    @Action
    setPlanning(value: IPlanning | null) {
        this.MUTATE_PLANNING(value);
    }

    @Action
    setBaselinePlanningSelected(baselineId: string) {
        this.MUTATE_BASELINE_PLANNING_SELECTED(baselineId);

        const index = this.baselineIdsSelected.findIndex((baselineIdSelected) => {
            return baselineIdSelected.planningId === this.planningId;
        });
        if (index === -1) {
            this.MUTATE_BASELINE_IDS_SELECTED(
                this.baselineIdsSelected.concat({
                    planningId: this.planningId,
                    baselineId: baselineId,
                }),
            );
            this.MUTATE_TOTAL_BASELINE_SELECTED(this.totalBaselineSelected + 1);
        } else {
            const baselineIdsSelected = this.baselineIdsSelected;
            baselineIdsSelected.splice(index, 1);
            this.MUTATE_BASELINE_IDS_SELECTED(
                baselineIdsSelected.concat({
                    planningId: this.planningId,
                    baselineId: baselineId,
                }),
            );
        }
    }

    @Action
    setBaselineListQueryString(query: IBaselinePlanningListQuery) {
        this.MUTATE_BASELINE_LIST_QUERY_STRING(query);
    }

    @Action
    resetBaselineList() {
        this.MUTATE_BASELINE_LIST([]);
        this.MUTATE_TOTAL_BASELINE(0);
    }

    @Action
    setSelectedPlannings(value: IPlanning[]) {
        this.MUTATE_SELECTED_PLANNINGS(value);
    }

    @Action
    resetStore() {
        this.MUTATE_DELEGATE_POPUP_PARAM({ ...this.initialDelegationPopupParam });
        this.MUTATE_IS_SHOW_SYNTHESIS_POPUP(false);
        this.MUTATE_PLANNING(null);
        this.MUTATE_TASK_POPUP_PARAMS({ ...this.initialTaskPopupParams });
        this.MUTATE_BASELINE_LIST_QUERY_STRING(initBaselineQueryString);
        this.MUTATE_SELECTED_PLANNINGS([]);
        this.MUTATE_SELECTED_RESOURCE(null);
        this.MUTATE_SELECTED_RESOURCE_GROUP(null);
        this.MUTATE_IS_DISABLE_SAVE_BUTTON(false);
        this.MUTATE_SELECTED_TASK_IDS([]);
        this.MUTATE_PLANNING_ID('');
        this.MUTATE_SELECTED_BASELINE_ID_TO_UPDATE(null);
        this.MUTATE_UPDATED_TASKS([]);
        this.MUTATE_HAS_TASK_DELETED(false);
        this.MUTATE_LATEST_CREATED_LINK(null);
        this.MUTATE_EDITED_TASK_IDS([]);
        this.MUTATE_SELECTED_TASK_ID_LIST([]);
        this.MUTATE_IS_DISABLE_BUTTON_ADD(false);
    }

    @Action
    setIsShowResourcePopup(value: boolean) {
        this.MUTATE_IS_SHOW_RESOURCES_POP_UP(value);
    }

    @Action
    setIsShowResourceDetailForm(value: boolean) {
        this.MUTATE_IS_SHOW_RESOURCES_DETAIL_FORM(value);
    }

    @Action
    setSelectedResource(resource: IResource | null) {
        this.MUTATE_SELECTED_RESOURCE(resource);
    }

    @Action
    setIsShowResourceGroupPopup(value: boolean) {
        this.MUTATE_IS_SHOW_RESOURCES_GROUP_POP_UP(value);
    }

    @Action
    setIsShowResourceGroupDetailForm(value: boolean) {
        this.MUTATE_IS_SHOW_RESOURCES_GROUP_DETAIL_FORM(value);
    }

    @Action
    setSelectedResourceGroup(resourceGroup: IResourceGroup | null) {
        this.MUTATE_SELECTED_RESOURCE_GROUP(resourceGroup);
    }

    @Action
    setIsDisableSaveButton(value: boolean) {
        this.MUTATE_IS_DISABLE_SAVE_BUTTON(value);
    }

    @Action
    setSelectedTaskIds(selectedTaskIds: string[]) {
        this.MUTATE_SELECTED_TASK_IDS(selectedTaskIds);
    }

    @Action
    setPlanningId(planningId: string) {
        this.MUTATE_PLANNING_ID(planningId);
    }

    @Action
    setSelectedBaslineIdToUpdate(value: string | null) {
        this.MUTATE_SELECTED_BASELINE_ID_TO_UPDATE(value);
    }

    @Action
    setIsShowAssignResourceForm(value: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_RESOURCE_FORM(value);
    }

    @Action
    setUpdatedTasks(tasks: IProjectTask[]) {
        this.MUTATE_UPDATED_TASKS(tasks);
    }

    @Action
    setHasTaskDeleted(value: boolean) {
        this.MUTATE_HAS_TASK_DELETED(value);
    }

    @Action
    setTaskFieldParams(value: Partial<ITaskFieldParams>) {
        this.MUTATE_TASK_FIELD_PARAMS({
            ...this.taskFieldsParams,
            ...value,
        });
    }

    @Action
    setEditedTaskIds(editedTaskIds: string[]) {
        this.MUTATE_EDITED_TASK_IDS(editedTaskIds);
    }

    @Action
    setNeedReload3DViewer(needReload3DViewer: boolean) {
        this.MUTATE_NEED_RELOAD_3D_VIEWER(needReload3DViewer);
    }

    @Action
    setIsShowAppearanceProfilePopup(value: boolean) {
        this.MUTATE_IS_SHOW_APPEARANCE_PROFILE_POPUP(value);
    }

    @Action
    setIsShowAppearanceProfileDetailForm(value: boolean) {
        this.MUTATE_IS_SHOW_APPEARANCE_PROFILE_DETAIL_FORM(value);
    }

    @Action
    setSelectedAppearanceProfile(appearanceProfile: IAppearanceProfile | null) {
        this.MUTATE_SELECTED_APPEARANCE_PROFILE(appearanceProfile);
    }

    @Action
    setIsShowTopDownFormPopup(isShowTopDownFormPopup: boolean) {
        this.MUTATE_IS_SHOW_TOP_DOWN_FORM_POPUP(isShowTopDownFormPopup);
    }

    @Action
    setSelectedActivityCodeId(activityCodeId: string) {
        this.MUTATE_SELECTED_ACTIVITY_CODE_ID(activityCodeId);
    }

    @Action
    setSelectedActivityCodeFolderId(activityCodeFolderId: string) {
        this.MUTATE_SELECTED_ACTIVITY_CODE_FOLDER_ID(activityCodeFolderId);
    }

    @Action
    setIsShowBottomUpFormPopup(isShowBottomUpFormPopup: boolean) {
        this.MUTATE_IS_SHOW_BOTTOM_UP_FORM_POPUP(isShowBottomUpFormPopup);
    }

    @Action
    setIsMovingFocusTime(isMovingFocusTime: boolean) {
        this.MUTATE_IS_MOVING_FOCUS_TIME(isMovingFocusTime);
    }

    @Action
    setTaskLayerId(value: string) {
        this.MUTATE_TASK_LAYER_ID(value);
    }

    @Action
    setAssignedTaskNames(assignedTaskNames: string[]) {
        this.MUTATE_ASSIGNED_TASK_NAMES(assignedTaskNames);
    }

    @Action
    setIsShowAssignedTaskNamesPopup(isShow: boolean) {
        this.MUTATE_IS_SHOW_ASSIGNED_TASK_NAMES_POPUP(isShow);
    }

    @Action
    setIsShowPlanningPopup(value: boolean) {
        this.MUTATE_IS_SHOW_PLANNING_POPUP(value);
    }

    @Action
    setIsDisableButtonAdd(value: boolean) {
        this.MUTATE_IS_DISABLE_BUTTON_ADD(value);
    }

    @Action
    setIsShowXmlFileForm(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_XML_FILE_FORM(value);
    }

    @Action
    setCreatedLink(createdLink: boolean) {
        this.MUTATE_CREATED_LINK(createdLink);
    }

    @Action
    setResourceTree(resourceTree: IFolderStructureTree[]) {
        this.MUTATE_RESOURCE_TREE(resourceTree);
    }

    @Action
    setSelectedResourceNodeId(selectedResourceNodeId: string) {
        this.MUTATE_SELECTED_RESOURCE_NODE_ID(selectedResourceNodeId);
    }

    @Action
    setIsShowImportResourcePopup(isShowImportResourcePopup: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_RESOURCE_POPUP(isShowImportResourcePopup);
    }

    @Action
    setIsShowExportPlanningPopup(value: boolean) {
        this.MUTATE_IS_SHOW_EXPORT_PLANNING_POPUP(value);
    }

    @Action
    setImportTasks(importTasks: IImportTask[]) {
        this.MUTATE_IMPORT_TASKS(importTasks);
    }

    @Action
    setImportTaskCustomFields(importTaskCustomFields: IImportTaskCustomField[]) {
        this.MUTATE_IMPORT_TASK_CUSTOM_FIELDS(importTaskCustomFields);
    }

    @Action
    setImportLinks(importLinks: IImportLink[]) {
        this.MUTATE_IMPORT_LINKS(importLinks);
    }

    @Action
    setImportResources(importResources: IImportResource[]) {
        this.MUTATE_IMPORT_RESOURCES(importResources);
    }

    @Action
    setImportTaskIds(importTaskIds: string[]) {
        this.MUTATE_IMPORT_TASK_IDS(importTaskIds);
    }

    @Action
    setImportProject(importProject: IImportProject) {
        this.MUTATE_IMPORT_PROJECT(importProject);
    }

    @Action
    setIsShowImportXmlDetail(value: boolean) {
        this.MUTATE_IS_SHOW_IMPORT_XML_DETAIL(value);
    }

    @Action
    setGanttContextMenuParam(value: IGanttContextMenuParam) {
        this.MUTATE_SET_GANTT_CONTEXT_MENU_PARAM(value);
    }

    @Action
    setLinkPopupParam(value: ILinkPopupParam) {
        this.MUTATE_SET_LINK_POPUP_PARAM(value);
    }

    @Action
    setLinkFormPopupParam(value: ILinkFormPopupParam) {
        this.MUTATE_SET_LINK_FORM_POPUP_PARAM(value);
    }

    @Action
    setBulkCreateLinkList(value: ILinkDetail[]) {
        this.MUTATE_SET_BULK_CREATE_LINK_LIST(value);
    }

    @Action
    setIsShowSaveAsPopup(isShowSaveAsPopup: boolean) {
        this.MUTATE_IS_SHOW_SAVE_AS_POPUP(isShowSaveAsPopup);
    }

    @Action
    setIsShowAssignResourceGroupForm(isShowAssignResourceGroupForm: boolean) {
        this.MUTATE_IS_SHOW_ASSIGN_RESOURCE_GROUP_FORM(isShowAssignResourceGroupForm);
    }
    @Action
    setLinkDetailPopupFormParam(value: ILinkDetailFormPopupParam) {
        this.MUTATE_SET_LINK_DETAIL_POPUP_FORM_PARAM(value);
    }

    @Action
    setEditedLinkIds(value: string[]) {
        this.MUTATE_EDITED_LINK_IDS(value);
    }

    @Action
    setIsShowRenameTaskFormPopup(value: boolean) {
        this.MUTATE_IS_SHOW_RENAME_TASK_FORM_POPUP(value);
    }

    @Action
    setSelectedTaskId(value: string) {
        this.MUTATE_SELECTED_TASK_ID(value);
    }

    @Action
    setGroupListQueryString(query: IPlanListQueryString) {
        this.MUTATE_PLAN_LIST_QUERY_STRING(query);
    }

    @Action
    getGroupListQueryString() {
        return this.planListQueryString;
    }

    @Mutation
    MUTATE_PLAN_LIST_QUERY_STRING(query: IPlanListQueryString) {
        this.planListQueryString = {
            ...this.planListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_DELEGATE_PLANNING_HAS_MODIFY(value: IDelegationHasModifyResponse[]) {
        this.delegationHasModify = value;
    }

    @Mutation
    MUTATE_DELEGATE_POPUP_PARAM(value: IDelegationPopupParam) {
        this.delegationPopupParam = value;
    }

    @Mutation
    MUTATE_BASELINE_CONFIGURATION(value: IBaselineConfiguration) {
        this.baselineConfiguration = value;
    }

    @Mutation
    MUTATE_IS_SHOW_BASELINE_POPUP(value: boolean) {
        this.isShowBaselinePopup = value;
    }

    @Mutation
    MUTATE_IS_SHOW_SYNTHESIS_POPUP(value: boolean) {
        this.isShowSynthesisPopup = value;
    }

    @Mutation
    MUTATE_GRID_SETTING_PARAMS(value: IGridSettingParams) {
        this.gridSettingParams = value;
    }

    @Mutation
    MUTATE_PLANNING(value: IPlanning | null) {
        this.planning = value;
    }

    @Mutation
    MUTATE_PLANNING_LIST(value: IPlanning[]) {
        this.planningList = value;
    }

    @Mutation
    MUTATE_TOTAL_PLANNING(value: number) {
        this.totalPlanning = value;
    }

    @Mutation
    MUTATE_TASK_POPUP_PARAMS(value: ITaskPopupParam) {
        this.taskPopupParams = value;
    }

    @Mutation
    MUTATE_BASELINE_PLANNING_SELECTED(value: string) {
        this.baselineIdSelected = value;
    }

    @Mutation
    MUTATE_BASELINE_LIST_QUERY_STRING(query: IBaselinePlanningListQuery) {
        this.baselineListQueryString = {
            ...this.baselineListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_TOTAL_BASELINE(total: number) {
        this.totalBaselineItems = total;
    }

    @Mutation
    MUTATE_BASELINE_LIST(baselines: IBaselinePlanning[]) {
        this.baselineList = baselines;
    }

    @Mutation
    MUTATE_BASELINE_IDS_SELECTED(value: IBaselineIdSelectedInPlanning[]) {
        this.baselineIdsSelected = value;
    }

    @Mutation
    MUTATE_TOTAL_BASELINE_SELECTED(value: number) {
        this.totalBaselineSelected = value;
    }

    @Mutation
    MUTATE_SELECTED_PLANNINGS(value: IPlanning[]) {
        this.selectedPlannings = value;
    }

    @Mutation
    MUTATE_RESOURCE_LIST(value: IResource[]) {
        this.resourceList = value;
    }

    @Mutation
    MUTATE_IS_SHOW_RESOURCES_POP_UP(value: boolean) {
        this.isShowResourcePopup = value;
    }

    @Mutation
    MUTATE_IS_SHOW_RESOURCES_DETAIL_FORM(value: boolean) {
        this.isShowResourceDetailForm = value;
    }

    @Mutation
    MUTATE_SELECTED_RESOURCE(resource: IResource | null) {
        this.selectedResource = resource;
    }

    @Mutation
    MUTATE_RESOURCE_GROUP_LIST(resourceGroups: IResourceGroup[]) {
        this.resourceGroupList = resourceGroups;
    }

    @Mutation
    MUTATE_IS_SHOW_RESOURCES_GROUP_POP_UP(value: boolean) {
        this.isShowResourceGroupPopup = value;
    }

    @Mutation
    MUTATE_IS_SHOW_RESOURCES_GROUP_DETAIL_FORM(value: boolean) {
        this.isShowResourceGroupDetailForm = value;
    }

    @Mutation
    MUTATE_SELECTED_RESOURCE_GROUP(resourceGroup: IResourceGroup | null) {
        this.selectedResourceGroup = resourceGroup;
    }

    @Mutation
    MUTATE_IS_DISABLE_SAVE_BUTTON(value: boolean) {
        this.isDisabledSaveButton = value;
    }

    @Mutation
    MUTATE_PROJECT_FILE_LIST(files: IProjectFile[]) {
        this.projectFileList = files;
    }

    @Mutation
    MUTATE_SELECTED_TASK_IDS(selectedTaskIds: string[]) {
        this.selectedTaskIds = selectedTaskIds;
    }

    @Mutation
    MUTATE_PLANNING_ID(planningId: string) {
        this.planningId = planningId;
    }

    @Mutation
    MUTATE_SELECTED_BASELINE_ID_TO_UPDATE(value: string | null) {
        this.selectedBaselineIdToUpdate = value;
    }

    @Mutation
    MUTATE_TASK_LAYER_ID(value: string) {
        this.taskLayerId = value;
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGN_RESOURCE_FORM(isShow: boolean) {
        this.isShowAssignResourceForm = isShow;
    }

    @Mutation
    MUTATE_UPDATED_TASKS(tasks: IProjectTask[]) {
        this.updatedTasks = tasks;
    }

    @Mutation
    MUTATE_HAS_TASK_DELETED(value: boolean) {
        this.hasTaskDeleted = value;
    }

    @Mutation
    MUTATE_LATEST_CREATED_LINK(value: ITaskLink | null) {
        this.latestCreatedLink = value;
    }

    @Mutation
    MUTATE_EDITED_TASK_IDS(editedTaskIds: string[]) {
        this.editedTaskIds = editedTaskIds;
    }

    @Mutation
    MUTATE_SELECTED_TASK_ID_LIST(value: string[]) {
        this.selectedTaskIdList = value;
    }

    @Mutation
    MUTATE_TASK_FIELD_PARAMS(value: ITaskFieldParams) {
        this.taskFieldsParams = value;
    }

    @Mutation
    MUTATE_NEED_RELOAD_3D_VIEWER(needReload3DViewer: boolean) {
        this.needReload3DViewer = needReload3DViewer;
    }

    @Mutation
    MUTATE_IS_SHOW_APPEARANCE_PROFILE_POPUP(value: boolean) {
        this.isShowAppearanceProfilePopup = value;
    }

    @Mutation
    MUTATE_IS_SHOW_APPEARANCE_PROFILE_DETAIL_FORM(value: boolean) {
        this.isShowAppearanceProfileDetailForm = value;
    }

    @Mutation
    MUTATE_APPEARANCE_PROFILE__LIST(value: IAppearanceProfile[]) {
        this.appearanceProfileList = value;
    }

    @Mutation
    MUTATE_SELECTED_APPEARANCE_PROFILE(appearanceProfile: IAppearanceProfile | null) {
        this.selectedAppearanceProfile = appearanceProfile;
    }

    @Mutation
    MUTATE_IS_SHOW_TOP_DOWN_FORM_POPUP(isShowTopDownFormPopup: boolean) {
        this.isShowTopDownFormPopup = isShowTopDownFormPopup;
    }

    @Mutation
    MUTATE_SELECTED_ACTIVITY_CODE_ID(value: string) {
        this.selectedActivityCodeId = value;
    }

    @Mutation
    MUTATE_SELECTED_ACTIVITY_CODE_FOLDER_ID(value: string) {
        this.selectedActivityCodeFolderId = value;
    }

    @Mutation
    MUTATE_IS_SHOW_BOTTOM_UP_FORM_POPUP(isShowBottomUpFormPopup: boolean) {
        this.isShowBottomUpFormPopup = isShowBottomUpFormPopup;
    }

    @Mutation
    MUTATE_IS_MOVING_FOCUS_TIME(isMovingFocusTime: boolean) {
        this.isMovingFocusTime = isMovingFocusTime;
    }

    @Mutation
    MUTATE_ASSIGNED_TASK_NAMES(assignedTaskNames: string[]) {
        this.assignedTaskNames = assignedTaskNames;
    }

    @Mutation
    MUTATE_IS_SHOW_ASSIGNED_TASK_NAMES_POPUP(isShow: boolean) {
        this.isShowAssignedTaskNamesPopup = isShow;
    }

    @Mutation
    MUTATE_IS_SHOW_PLANNING_POPUP(value: boolean) {
        this.isShowPlanningPopup = value;
    }

    @Mutation
    MUTATE_IS_DISABLE_BUTTON_ADD(value: boolean) {
        this.isDisableButtonAdd = value;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_XML_FILE_FORM(isShow: boolean) {
        this.isShowImportXmlFileForm = isShow;
    }

    @Mutation
    MUTATE_CREATED_LINK(createdLink: boolean) {
        this.createdLink = createdLink;
    }

    @Mutation
    MUTATE_IS_SHOW_EXPORT_PLANNING_POPUP(value: boolean) {
        this.isShowExportPlanningPopup = value;
    }

    @Mutation
    MUTATE_IMPORT_TASKS(importTasks: IImportTask[]) {
        this.importTasks = importTasks;
    }

    @Mutation
    MUTATE_IMPORT_TASK_CUSTOM_FIELDS(importTaskCustomFields: IImportTaskCustomField[]) {
        this.importTaskCustomFields = importTaskCustomFields;
    }

    @Mutation
    MUTATE_IMPORT_LINKS(importLinks: IImportLink[]) {
        this.importLinks = importLinks;
    }

    @Mutation
    MUTATE_IMPORT_RESOURCES(importResources: IImportResource[]) {
        this.importResources = importResources;
    }

    @Mutation
    MUTATE_IMPORT_TASK_IDS(importTaskIds: string[]) {
        this.importTaskIds = importTaskIds;
    }

    @Mutation
    MUTATE_IMPORT_PROJECT(importProject: IImportProject) {
        this.importProject = importProject;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_XML_DETAIL(value: boolean) {
        this.isShowImportXmlDetail = value;
    }

    @Mutation
    MUTATE_ROOT_TASK_HAS_PERMISSION_CREATE_TASK(tasks: IProjectTask[]) {
        this.rootTaskHasPermissionCreateChild = tasks;
    }

    @Mutation
    MUTATE_RESOURCE_TREE(resourceTree: IFolderStructureTree[]) {
        this.resourceTree = resourceTree;
    }

    @Mutation
    MUTATE_SELECTED_RESOURCE_NODE_ID(selectedResourceNodeId: string) {
        this.selectedResourceNodeId = selectedResourceNodeId;
    }

    @Mutation
    MUTATE_IS_SHOW_IMPORT_RESOURCE_POPUP(isShowImportResourcePopup: boolean) {
        this.isShowImportResourcePopup = isShowImportResourcePopup;
    }

    @Mutation
    MUTATE_SET_GANTT_CONTEXT_MENU_PARAM(value: IGanttContextMenuParam) {
        this.ganttContextMenuParam = value;
    }

    @Mutation
    MUTATE_SET_LINK_POPUP_PARAM(value: ILinkPopupParam) {
        this.linkPopupParam = value;
    }

    @Mutation
    MUTATE_SET_LINK_FORM_POPUP_PARAM(value: ILinkFormPopupParam) {
        this.linkFormPopupParam = value;
    }

    @Mutation
    MUTATE_SET_BULK_CREATE_LINK_LIST(value: ILinkDetail[]) {
        this.bulkCreateLinkList = value;
    }

    @Mutation
    MUTATE_IS_SHOW_SAVE_AS_POPUP(isShowSaveAsPopup: boolean) {
        this.isShowSaveAsPopup = isShowSaveAsPopup;
    }
    @Mutation
    MUTATE_IS_SHOW_ASSIGN_RESOURCE_GROUP_FORM(isShowAssignResourceGroupForm: boolean) {
        this.isShowAssignResourceGroupForm = isShowAssignResourceGroupForm;
    }

    @Mutation
    MUTATE_SET_LINK_DETAIL_POPUP_FORM_PARAM(value: ILinkDetailFormPopupParam) {
        this.linkDetailFormPopupParam = value;
    }

    @Mutation
    MUTATE_EDITED_LINK_IDS(value: string[]) {
        this.editedLinkIds = value;
    }

    @Mutation
    MUTATE_IS_SHOW_RENAME_TASK_FORM_POPUP(value: boolean) {
        this.isShowRenameTaskFormPopup = value;
    }

    @Mutation
    MUTATE_SELECTED_TASK_ID(value: string) {
        this.selectedTaskId = value;
    }

    @Mutation
    MUTATE_SELECTED_FILE_PATHS(paths: string[]) {
        this.selectedFilePaths = paths;
    }
}

export const projectPlanningModule = getModule(ProjectPlanningModule);
