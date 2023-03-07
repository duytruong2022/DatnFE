import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import {
    ICoordinates,
    IProject,
    IProjectListQueryString,
    IProjectNotification,
    IProjectNotificationQueryString,
    IUserProjectFieldSetting,
} from './interfaces';
import { projectService } from './services/project.service';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { initProjectFieldSetting, initQueryString, ProjectCategories } from './constants';
import { IUser } from '../user/interfaces';
import { commonService } from '@/common/services/common.service';
import { AccessModules, DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';

@Module({ dynamic: true, namespaced: true, store, name: 'project' })
class ProjectModule extends VuexModule {
    isShowProjectForm = false;
    selectedProjectId: string | null = null;
    selectedProjectIdToEdit: string | null = null;
    projectList: IProject[] = [];
    totalProjects = 0;
    selectedCoordinates: ICoordinates = {
        latitude: 0,
        longitude: 0,
    };
    selectedPostalCode = '';
    triggerExportButtonFlag = false;
    projectListQueryString: IProjectListQueryString = {
        ...initQueryString,
    };
    selectedProject: IProject = {
        name: '',
        adminId: '',
        dataDate: new Date(),
        category: ProjectCategories.INFRASTRUCTURE,
        description: '',
        postalCode: '',
        taskIdPrefix: '',
        taskIdSuffix: 0,
        taskIdIncrement: 0,
        latitude: NaN,
        longitude: NaN,
    };
    userList: IUser[] = [];
    isShowFieldSettingsFormPopup = false;
    userProjectFieldSetting: IUserProjectFieldSetting = {
        _id: null,
        userId: '',
        projectId: '',
        settings: {
            ...initProjectFieldSetting,
        },
    };
    projectNotificationList: IProjectNotification[] = [];
    projectNotificationCount = 0;
    projectNotificationListQueryString: IProjectNotificationQueryString = {
        page: DEFAULT_FIRST_PAGE,
        limit: LIMIT_PER_PAGE,
    };

    @Action
    setIsShowProjectForm(value: boolean) {
        this.MUTATE_IS_SHOW_PROJECT_FORM(value);
    }

    @Action
    setSelectedProjectId(id: string | null) {
        this.MUTATE_SELECTED_PROJECT_ID(id);
    }

    @Action
    setSelectedProjectIdToEdit(id: string | null) {
        this.MUTATE_SELECTED_PROJECT_ID_TO_EDIT(id);
    }

    @Action
    async getProjectList() {
        const response = (await projectService.getList({
            ...this.projectListQueryString,
        })) as IBodyResponse<IGetListResponse<IProject>>;
        if (response.success) {
            this.MUTATE_PROJECT_LIST(response.data?.items);
            this.setTotalProjects(response.data.totalItems);
        } else {
            this.MUTATE_PROJECT_LIST([]);
            this.setTotalProjects(0);
        }
    }

    @Action
    setSelectedCoordinates(selectedCoordinates: ICoordinates) {
        this.MUTATE_SELECTED_COORDINATES(selectedCoordinates);
    }

    @Action
    setSelectedPostalCode(selectedPostalCode: string) {
        this.MUTATE_SELECTED_POSTAL_CODE(selectedPostalCode);
    }

    @Action
    triggerExportButton() {
        this.MUTATE_TRIGGER_EXPORT_BUTTON_FLAG(!this.triggerExportButtonFlag);
    }

    @Action
    setTotalProjects(totalProjects: number) {
        this.MUTATE_TOTAL_PROJECTS(totalProjects);
    }

    @Action
    setProjectListQueryString(query: IProjectListQueryString) {
        this.MUTATE_PROJECT_LIST_QUERY_STRING(query);
    }

    @Action
    setProjectNotificationListQueryString(query: IProjectNotificationQueryString) {
        this.MUTATE_PROJECT_NOTIFICATION_LIST_QUERY_STRING(query);
    }

    @Action
    setSelectedProject(selectedProject: IProject) {
        this.MUTATE_SELECTED_PROJECT(selectedProject);
    }

    @Action
    async getUserList() {
        const response = await commonService.getUserList({
            accessModules: [AccessModules.SPACIALYTIC_CONSTELLATION],
        });
        if (response.success) {
            this.MUTATE_USER_LIST(response.data?.items || []);
        } else {
            this.MUTATE_USER_LIST([]);
        }
    }

    @Action
    setIsShowFieldSettingFormPopup(isShowFieldSettingsFormPopup: boolean) {
        this.MUTATE_IS_SHOW_FIELD_SETTING_FORM_POPUP(isShowFieldSettingsFormPopup);
    }

    @Action
    setUserProjectFieldSetting(userProjectFieldSetting: IUserProjectFieldSetting) {
        this.MUTATE_USER_PROJECT_FIELD_SETTING(userProjectFieldSetting);
    }

    @Action
    setProjectNotificationList(projectNotificationList: IProjectNotification[]) {
        this.MUTATE_PROJECT_NOTIFICATION_LIST(projectNotificationList);
    }

    @Action
    setProjectNotificationCount(projectNotificationCount: number) {
        this.MUTATE_PROJECT_NOTIFICATION_COUNT(projectNotificationCount);
    }

    @Action
    async getProjectNotificationList() {
        const response = await projectService.getProjectNotification(
            projectModule.selectedProjectId || '',
            this.projectNotificationListQueryString,
        );
        if (response.success) {
            this.setProjectNotificationList(response.data.items);
            this.setProjectNotificationCount(response.data.totalItems);
        }
        return response;
    }

    @Mutation
    MUTATE_IS_SHOW_PROJECT_FORM(value: boolean) {
        this.isShowProjectForm = value;
    }

    @Mutation
    MUTATE_SELECTED_PROJECT_ID(id: string | null) {
        this.selectedProjectId = id;
    }

    @Mutation
    MUTATE_SELECTED_PROJECT_ID_TO_EDIT(id: string | null) {
        this.selectedProjectIdToEdit = id;
    }

    @Mutation
    MUTATE_PROJECT_LIST(projectList: IProject[]) {
        this.projectList = projectList;
    }

    @Mutation
    MUTATE_SELECTED_COORDINATES(selectedCoordinates: ICoordinates) {
        this.selectedCoordinates = selectedCoordinates;
    }

    @Mutation
    MUTATE_SELECTED_POSTAL_CODE(selectedPostalCode: string) {
        this.selectedPostalCode = selectedPostalCode;
    }

    @Mutation
    MUTATE_TRIGGER_EXPORT_BUTTON_FLAG(triggerExportButtonFlag: boolean) {
        this.triggerExportButtonFlag = triggerExportButtonFlag;
    }

    @Mutation
    MUTATE_TOTAL_PROJECTS(totalProjects: number) {
        this.totalProjects = totalProjects;
    }

    @Mutation
    MUTATE_PROJECT_LIST_QUERY_STRING(query: IProjectListQueryString) {
        this.projectListQueryString = {
            ...this.projectListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_PROJECT_NOTIFICATION_LIST_QUERY_STRING(
        query: IProjectNotificationQueryString,
    ) {
        this.projectNotificationListQueryString = {
            ...this.projectNotificationListQueryString,
            ...query,
        };
    }

    @Mutation
    MUTATE_SELECTED_PROJECT(selectedProject: IProject) {
        this.selectedProject = selectedProject;
    }

    @Mutation
    MUTATE_USER_LIST(users: IUser[]) {
        this.userList = users;
    }

    @Mutation
    MUTATE_IS_SHOW_FIELD_SETTING_FORM_POPUP(isShowFieldSettingsFormPopup: boolean) {
        this.isShowFieldSettingsFormPopup = isShowFieldSettingsFormPopup;
    }

    @Mutation
    MUTATE_USER_PROJECT_FIELD_SETTING(userProjectFieldSetting: IUserProjectFieldSetting) {
        this.userProjectFieldSetting = userProjectFieldSetting;
    }

    @Mutation
    MUTATE_PROJECT_NOTIFICATION_LIST(projectNotificationList: IProjectNotification[]) {
        this.projectNotificationList = projectNotificationList;
    }

    @Mutation
    MUTATE_PROJECT_NOTIFICATION_COUNT(projectNotificationCount: number) {
        this.projectNotificationCount = projectNotificationCount;
    }
}

export const projectModule = getModule(ProjectModule);
