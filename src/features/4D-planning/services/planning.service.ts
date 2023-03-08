import { ApiService } from '@/common/services/api';
import {
    IBodyResponse,
    ICommonGetListQuery,
    IFolderStructureTree,
    IGetListResponse,
} from '@/common/interfaces';
import service from '@/plugins/axios';
import {
    IAssignActivityCodeValue,
    IAdditionalTaskField,
    IAppearanceProfile,
    IAppearanceProfileListQuery,
    IAssignResource,
    IBaselinePlanning,
    IBaselinePlanningListQuery,
    IBaselineTaskBody,
    ICreateLinkDto,
    ICreateLinkResponse,
    ICreateProjectTaskDto,
    ICreateTaskFieldBody,
    IDelegateTaskBody,
    IFilePathsByFocusTimeQuery,
    IGetTaskByIdsQueryString,
    IPlanning,
    IPlanningListQuery,
    IPlanningQuery,
    IProjectTask,
    IResource,
    IResourceGroup,
    ISynthesisPlanningBody,
    ITaskLink,
    IUpdateAppearanceProfile,
    IUpdateLinkDto,
    IUpdateProjectTaskDto,
    ITopDownResponse,
    IBaselineConfigurationQuery,
    IBaselineConfiguration,
    IBaselineConfigurationBody,
    IPlanningGetListQuery,
    IExportPlanningQuery,
    IPlanningByPathNameQuery,
    IResourceIdQueryString,
    ICreatePlanning,
    IUpdateTaskFieldBody,
    ITaskUpdateDelegation,
    ITaskUpdateOriginalPlanning,
    IBulkUpdateTaskBody,
    IResourceListQuery,
    IImportXML,
    IExportPlanningToPrimaveraP6,
    IMilestoneUpdateOriginalPlanning,
    IBulkCreateLinkBody,
    IBulkCreateLinkResponse,
    IAssignResourceGroup,
    IActivityCode,
    IActivityCodeListItem,
    IActivityCodeValueItem,
    IDelegateTaskToExistDelegationBody,
    IDelegateResponse,
    IDelegationHasModifyResponse,
    ILinkListGetByTaskIdResponse,
    IUpdateTaskName,
} from '../interfaces';
import localStorageAuthService from '@/common/authStorage';
import { projectPlanningModule } from '../store';

class ProjectPlanningService extends ApiService {
    async createPlanning(projectId: string, data: ICreatePlanning) {
        this.beforeCreate<ICreatePlanning>(data);
        return await this.client.post<IPlanning, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${projectId}`,
            { ...data },
        );
    }

    async getPlanning(id: string) {
        return await this.client.get<IPlanningQuery, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${id}`,
        );
    }

    async getPlanningInformation(planningId: string) {
        return await this.client.get<void, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${planningId}/planning-info`,
        );
    }

    async getPlanningList(projectId: string, query: IPlanningListQuery) {
        return await this.client.get<
            IPlanningListQuery,
            IBodyResponse<IGetListResponse<IPlanning>>
        >(`${this.baseUrl}/${projectId}/list`, {
            params: {
                ...query,
            },
        });
    }

    async getTopDownFileList(planningId: string, query: IPlanningListQuery) {
        return await this.client.get<
            IPlanningListQuery,
            IBodyResponse<IGetListResponse<IPlanning>>
        >(`${this.baseUrl}/${planningId}/top-down-file-list`, {
            params: {
                ...query,
            },
        });
    }

    async getBottomUpFileList(planningId: string, query: IPlanningListQuery) {
        return await this.client.get<
            IPlanningListQuery,
            IBodyResponse<IGetListResponse<IPlanning>>
        >(`${this.baseUrl}/${planningId}/bottom-up-file-list`, {
            params: {
                ...query,
            },
        });
    }

    async getRootTaskHasPermissionCreateChild(planningId: string) {
        return await this.client.get<void, IBodyResponse<IProjectTask[]>>(
            `${this.baseUrl}/${planningId}/task-by-permission-create-child`,
        );
    }

    async createTask(planningId: string, data: ICreateProjectTaskDto) {
        this.beforeCreate<ICreateProjectTaskDto>(data);
        return await this.client.post<IProjectTask, IBodyResponse<IProjectTask>>(
            `${this.baseUrl}/${planningId}/task`,
            { ...data },
        );
    }

    async updateTask(id: string, data: IUpdateProjectTaskDto) {
        this.beforeUpdate<IUpdateProjectTaskDto>(data);
        return await this.client.patch<IProjectTask, IBodyResponse<IProjectTask>>(
            `${this.baseUrl}/task/${id}`,
            { ...data },
        );
    }

    async updateTaskName(id: string, data: IUpdateTaskName) {
        this.beforeUpdate<IUpdateTaskName>(data);
        return await this.client.patch<IProjectTask, IBodyResponse<IProjectTask>>(
            `${this.baseUrl}/task/${id}/rename`,
            { ...data },
        );
    }

    async deleteTask(id: string) {
        return await this.client.delete<
            { _ids: string[] },
            IBodyResponse<{ _ids: string[] }>
        >(`${`${this.baseUrl}/task`}/${id}`);
    }

    async getTask(id: string) {
        return await this.client.get<{ _ids: string }, IBodyResponse<IProjectTask>>(
            `${`${this.baseUrl}/task`}/${id}`,
        );
    }

    async createLink(planningId: string, data: ICreateLinkDto) {
        this.beforeCreate<ICreateLinkDto>(data);
        return await this.client.post<
            ICreateLinkResponse,
            IBodyResponse<ICreateLinkResponse>
        >(`${this.baseUrl}/${planningId}/link`, { ...data });
    }

    async getLinkListByTaskId(planningId: string, taskId: string) {
        return await this.client.get<void, IBodyResponse<ILinkListGetByTaskIdResponse>>(
            `${this.baseUrl}/${planningId}/${taskId}/link`,
        );
    }

    async bulkCreateLink(planningId: string, data: IBulkCreateLinkBody) {
        this.beforeCreate<IBulkCreateLinkBody>(data);
        return await this.client.post<
            IBulkCreateLinkResponse,
            IBodyResponse<IBulkCreateLinkResponse>
        >(`${this.baseUrl}/${planningId}/link/bulk-create`, { ...data });
    }

    async updateLink(id: string, data: IUpdateLinkDto) {
        const planningId = projectPlanningModule.planningId;
        this.beforeUpdate<IUpdateLinkDto>(data);
        return await this.client.patch<ITaskLink, IBodyResponse<ITaskLink>>(
            `${this.baseUrl}/${planningId}/link/${id}`,
            { ...data },
        );
    }

    async deleteLink(planningId: string, id: string) {
        return await this.client.delete<
            { _id: string },
            IBodyResponse<{ _ids: string; deletedMilestoneIds: string[] }>
        >(`${this.baseUrl}/${planningId}/link/${id}`);
    }

    // create a new delegation and delegate tasks to this delegation
    async delegateTask(projectId: string, body: IDelegateTaskBody) {
        return await this.client.post<
            IDelegateTaskBody,
            IBodyResponse<IDelegateResponse>
        >(`${this.baseUrl}/${projectId}/delegate`, {
            ...body,
        });
    }

    // delegate tasks to exist delegation
    async delegateTaskToExistDelegation(
        delegationId: string,
        body: IDelegateTaskToExistDelegationBody,
    ) {
        return await this.client.post<
            IDelegateTaskToExistDelegationBody,
            IBodyResponse<IDelegateResponse>
        >(`${this.baseUrl}/${delegationId}/task/delegate/bulk-create`, {
            ...body,
        });
    }

    async resetBaseline(planningId: string) {
        return await this.client.post<string, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/reset-baseline`,
            { planningId },
        );
    }

    async applyBaseline(planningId: string, baselineId: string) {
        return await this.client.post<string, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${planningId}/apply-baseline`,
            { baselineId },
        );
    }

    async createTaskBaseline(data: IBaselineTaskBody) {
        return await this.client.post<IBaselineTaskBody, IBodyResponse<boolean>>(
            `/baseline-planning`,
            { ...data },
        );
    }

    async getBaselineList(query: IBaselinePlanningListQuery) {
        return await this.client.get<
            void,
            IBodyResponse<IGetListResponse<IBaselinePlanning>>
        >(`/baseline-planning`, {
            params: { ...query },
        });
    }

    async getBaselineDetail(id: string) {
        return await this.client.get<void, IBodyResponse<IBaselinePlanning>>(
            `/baseline-planning/${id}`,
        );
    }

    async updateBaseline(id: string, data: IBaselineTaskBody) {
        return await this.client.patch<void, IBodyResponse<IBaselinePlanning>>(
            `/baseline-planning/${id}`,
            { ...data },
        );
    }

    async deleteBaseline(id: string) {
        return await this.client.delete<void, IBodyResponse<boolean>>(
            `/baseline-planning/${id}`,
        );
    }

    async getBaselineConfiguration(query: IBaselineConfigurationQuery) {
        return await this.client.get<void, IBodyResponse<IBaselineConfiguration>>(
            `/baseline-configuration`,
            {
                params: { ...query },
            },
        );
    }

    async updateBaselineConfiguration(id: string, body: IBaselineConfigurationBody) {
        return await this.client.patch<void, IBodyResponse<IBaselineConfiguration>>(
            `/baseline-configuration/${id}`,
            {
                ...body,
            },
        );
    }

    async synthesis(projectId: string, body: ISynthesisPlanningBody) {
        return await this.client.post<ISynthesisPlanningBody, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${projectId}/synthesis`,
            {
                ...body,
            },
        );
    }

    async getResourceDetail(id: string) {
        return await this.client.get<IBodyResponse<IResource>, IBodyResponse<IResource>>(
            `${this.baseUrl}/resource/${id}`,
        );
    }

    async getResourceTree(query: IResourceListQuery) {
        return await this.client.get<
            ICommonGetListQuery,
            IBodyResponse<IFolderStructureTree[]>
        >(`${this.baseUrl}/resource`, {
            params: {
                ...query,
            },
        });
    }

    async getResourceList(query: IResourceListQuery) {
        return await this.client.get<
            ICommonGetListQuery,
            IBodyResponse<IGetListResponse<IResource>>
        >(`${this.baseUrl}/resource/list`, {
            params: {
                ...query,
            },
        });
    }

    async createResource(data: IResource) {
        this.beforeCreate<IResource>(data);
        return await this.client.post<IResource, IBodyResponse<IResource>>(
            `${this.baseUrl}/resource`,
            { ...data },
        );
    }

    async updateResource(id: string, data: IResource) {
        this.beforeUpdate<IResource>(data);
        return await this.client.patch<IResource, IBodyResponse<IResource>>(
            `${this.baseUrl}/resource/${id}`,
            { ...data },
        );
    }

    async deleteResource(id: string) {
        return await this.client.delete<void, IBodyResponse<boolean>>(
            `${this.baseUrl}/resource/${id}`,
        );
    }

    async getResourceGroupDetail(id: string) {
        return await this.client.get<
            IBodyResponse<IResourceGroup>,
            IBodyResponse<IResourceGroup>
        >(`${this.baseUrl}/resource-group/${id}`);
    }

    async getResourceGroupList(query: IResourceListQuery) {
        return await this.client.get<
            ICommonGetListQuery,
            IBodyResponse<IGetListResponse<IResourceGroup>>
        >(`${this.baseUrl}/resource-group`, {
            params: {
                ...query,
            },
        });
    }

    async createResourceGroup(data: IResourceGroup) {
        this.beforeCreate<IResourceGroup>(data);
        return await this.client.post<IResourceGroup, IBodyResponse<IResourceGroup>>(
            `${this.baseUrl}/resource-group`,
            { ...data },
        );
    }

    async updateResourceGroup(id: string, data: IResourceGroup) {
        this.beforeUpdate<IResourceGroup>(data);
        return await this.client.patch<IResourceGroup, IBodyResponse<IResourceGroup>>(
            `${this.baseUrl}/resource-group/${id}`,
            { ...data },
        );
    }

    async deleteResourceGroup(id: string) {
        return await this.client.delete<void, IBodyResponse<boolean>>(
            `${this.baseUrl}/resource-group/${id}`,
        );
    }

    async assignResource(data: IAssignResource) {
        this.beforeCreate<IAssignResource>(data);
        return await this.client.post<IAssignResource, IBodyResponse<IProjectTask[]>>(
            `${this.baseUrl}/assign-resource`,
            { ...data },
        );
    }

    async unassignResource(data: IAssignResource) {
        this.beforeCreate<IAssignResource>(data);
        return await this.client.post<IAssignResource, IBodyResponse<IProjectTask[]>>(
            `${this.baseUrl}/unassign-resource`,
            { ...data },
        );
    }

    async assignResourceGroup(data: IAssignResourceGroup) {
        this.beforeCreate<IAssignResourceGroup>(data);
        return await this.client.post<
            IAssignResourceGroup,
            IBodyResponse<IProjectTask[]>
        >(`${this.baseUrl}/assign-resource-group`, { ...data });
    }

    async unassignResourceGroup(data: IAssignResourceGroup) {
        this.beforeCreate<IAssignResourceGroup>(data);
        return await this.client.post<
            IAssignResourceGroup,
            IBodyResponse<IProjectTask[]>
        >(`${this.baseUrl}/unassign-resource-group`, { ...data });
    }

    async topDown(
        planningId: string,
        taskIds: string[],
        planningIds: string[],
        projectId: string,
        path: string,
        linkIds: string[],
    ) {
        return await this.client.post<
            ISynthesisPlanningBody,
            IBodyResponse<ITopDownResponse>
        >(`${this.baseUrl}/${planningId}/top-down`, {
            taskIds,
            planningIds,
            projectId,
            path,
            linkIds,
        });
    }

    async bottomUp(
        planningId: string,
        taskIds: string[],
        planningIds: string[],
        projectId: string,
        path: string,
        linkIds: string[],
    ) {
        return await this.client.post<
            ISynthesisPlanningBody,
            IBodyResponse<ITopDownResponse>
        >(`${this.baseUrl}/${planningId}/bottom-up`, {
            taskIds,
            planningIds,
            projectId,
            path,
            linkIds,
        });
    }

    async deletePlanning(_id: string) {
        return await this.client.delete<void, IBodyResponse<{ _id: string }>>(
            `${this.baseUrl}/${_id}`,
        );
    }

    async updatePlanning(_id: string, body: ICreatePlanning) {
        return await this.client.patch<ICreatePlanning, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/${_id}`,
            body,
        );
    }

    async getAdditionalTaskField(
        planningId: string,
        fieldId: string,
        path: string,
        projectId: string,
    ) {
        return await this.client.get<void, IBodyResponse<IAdditionalTaskField>>(
            `${this.baseUrl}/${planningId}/task-field/${fieldId}`,
            {
                params: {
                    path,
                    projectId,
                },
            },
        );
    }

    async createAdditionalTaskField(planningId: string, body: ICreateTaskFieldBody) {
        this.beforeCreate<ICreateTaskFieldBody>(body);
        return await this.client.post<
            ICreateTaskFieldBody,
            IBodyResponse<IAdditionalTaskField>,
            ICreateTaskFieldBody
        >(`${this.baseUrl}/${planningId}/task-field`, body);
    }

    async updateAdditionalTaskField(
        planningId: string,
        fieldId: string,
        body: IUpdateTaskFieldBody,
    ) {
        this.beforeUpdate<IUpdateTaskFieldBody>(body);
        return await this.client.patch<
            IAdditionalTaskField,
            IBodyResponse<IAdditionalTaskField>,
            IUpdateTaskFieldBody
        >(`${this.baseUrl}/${planningId}/task-field/${fieldId}`, body);
    }

    async deleteAdditionalTaskField(planningId: string, fieldId: string) {
        return await this.client.delete<
            void,
            IBodyResponse<{ _id: string }>,
            { _id: string }
        >(`${this.baseUrl}/${planningId}/task-field/${fieldId}`);
    }
    async getFilePathsByTaskIds(query: IGetTaskByIdsQueryString) {
        return await this.client.get<
            IGetTaskByIdsQueryString,
            IBodyResponse<IGetListResponse<string>>
        >(`${this.baseUrl}/files-by-taskIds`, {
            params: {
                ...query,
            },
        });
    }

    async getFilePathByFocusTime(query: IFilePathsByFocusTimeQuery) {
        return await this.client.get<
            IFilePathsByFocusTimeQuery,
            IBodyResponse<IGetListResponse<string>>
        >(`${this.baseUrl}/files-by-focus-time`, {
            params: {
                ...query,
            },
        });
    }

    async getAppearanceProfileList(query: IAppearanceProfileListQuery) {
        return await this.client.get<
            IAppearanceProfileListQuery,
            IBodyResponse<IGetListResponse<IAppearanceProfile>>
        >(`${this.baseUrl}/appearance-profile`, {
            params: {
                ...query,
            },
        });
    }

    async getAppearanceProfileDetail(id: string) {
        return await this.client.get<
            IBodyResponse<IAppearanceProfile>,
            IBodyResponse<IAppearanceProfile>
        >(`${this.baseUrl}/appearance-profile/${id}`);
    }

    async createAppearanceProfile(data: IAppearanceProfile) {
        this.beforeCreate<IAppearanceProfile>(data);
        return await this.client.post<
            IAppearanceProfile,
            IBodyResponse<IAppearanceProfile>
        >(`${this.baseUrl}/appearance-profile`, { ...data });
    }

    async updateAppearanceProfile(id: string, data: IUpdateAppearanceProfile) {
        this.beforeUpdate<IAppearanceProfile>(data);
        return await this.client.patch<
            IAppearanceProfile,
            IBodyResponse<IAppearanceProfile>
        >(`${this.baseUrl}/appearance-profile/${id}`, { ...data });
    }

    async deleteAppearanceProfile(id: string) {
        return await this.client.delete<void, IBodyResponse<boolean>>(
            `${this.baseUrl}/appearance-profile/${id}`,
        );
    }

    async getActivityCodeList() {
        const projectId = localStorageAuthService.getSelectedProjectId();
        const path = localStorageAuthService.getPlanningPermissions().path || '';
        return await this.client.get<void, IBodyResponse<IActivityCodeListItem[]>>(
            `/activity-code`,
            {
                params: { projectId, path },
            },
        );
    }

    async getActivityCodeValue(id: string) {
        const projectId = localStorageAuthService.getSelectedProjectId();
        return await this.client.get<void, IBodyResponse<IActivityCodeValueItem>>(
            `/activity-code/value/${id}`,
            {
                params: { projectId },
            },
        );
    }

    async createActivityCodeValue(data: IActivityCodeValueItem) {
        this.beforeCreate<IActivityCodeValueItem>(data);
        return await this.client.post<
            IActivityCodeValueItem,
            IBodyResponse<IActivityCodeValueItem>
        >(`/activity-code/value`, data);
    }

    async updateActivityCodeValue(id: string, data: IActivityCodeValueItem) {
        this.beforeUpdate<IActivityCodeValueItem>(data);
        return await this.client.patch<
            IActivityCode,
            IBodyResponse<IActivityCodeValueItem>
        >(`/activity-code/value/${id}`, data);
    }

    async deleteActivityCodeValue(id: string) {
        return await this.client.delete<void, IBodyResponse<boolean>>(
            `/activity-code/value/${id}`,
        );
    }

    async assignActivityCodeValue(data: IAssignActivityCodeValue) {
        this.beforeCreate<IAssignActivityCodeValue>(data);
        return await this.client.post<
            IAssignActivityCodeValue,
            IBodyResponse<IProjectTask[]>
        >(`/activity-code/assign`, data);
    }

    async getActivityCode(id: string) {
        const projectId = localStorageAuthService.getSelectedProjectId();
        return await this.client.get<void, IBodyResponse<IActivityCode>>(
            `/activity-code/${id}`,
            {
                params: { projectId },
            },
        );
    }

    async createActivityCode(data: IActivityCode) {
        this.beforeCreate<IActivityCode>(data);
        return await this.client.post<IActivityCode, IBodyResponse<IActivityCode>>(
            `/activity-code/`,
            data,
        );
    }

    async updateActivityCode(id: string, data: IActivityCode) {
        this.beforeUpdate<IActivityCode>(data);
        return await this.client.patch<IActivityCode, IBodyResponse<IActivityCode>>(
            `/activity-code/${id}`,
            data,
        );
    }

    async deleteActivityCode(id: string) {
        return await this.client.delete<void, IBodyResponse<{ _id: string }>>(
            `/activity-code/${id}`,
        );
    }

    async exportPlanning(query: IExportPlanningQuery) {
        return await this.client.get<IExportPlanningQuery, IBodyResponse>(
            `${this.baseUrl}/export-planning`,
            {
                params: { ...query },
            },
        );
    }

    async getPlanningByPathAndName(query: IPlanningByPathNameQuery) {
        return await this.client.get<IPlanningByPathNameQuery, IBodyResponse<IPlanning>>(
            `${this.baseUrl}/planning-by-path-name`,
            {
                params: { ...query },
            },
        );
    }

    async getTaskNameByResourceId(query: IResourceIdQueryString) {
        return await this.client.get<IResourceIdQueryString, IBodyResponse<string[]>>(
            `${this.baseUrl}/task-name-by-resourceId`,
            {
                params: { ...query },
            },
        );
    }

    async getDelegatePlanningListHasModifyFromOriginal(planningId: string) {
        return await this.client.get<void, IBodyResponse<IDelegationHasModifyResponse[]>>(
            `${this.baseUrl}/${planningId}/delegation`,
        );
    }

    async updateDelegation(
        tasks: ITaskUpdateDelegation[],
        planningId: string,
        projectId: string,
        path: string,
    ) {
        return await this.client.patch<void, IBodyResponse>(
            `${this.baseUrl}/${planningId}/delegation`,
            {
                tasks,
                path,
                projectId,
            },
        );
    }

    async updateOriginalPlanning(
        tasks: ITaskUpdateOriginalPlanning[],
        milestones: IMilestoneUpdateOriginalPlanning[],
        planningId: string,
        projectId: string,
        path: string,
    ) {
        return await this.client.patch<void, IBodyResponse>(
            `${this.baseUrl}/${planningId}/original-planning`,
            {
                tasks,
                milestones,
                path,
                projectId,
            },
        );
    }
    async cancelDelegation(taskId: string) {
        return await this.client.post<
            void,
            IBodyResponse<{ updatedTaskId: string; deletedMilestoneIds: string[] }>
        >(`${this.baseUrl}/cancel-delegation/${taskId}`);
    }

    async bulkUpdateTasks(body: IBulkUpdateTaskBody) {
        return await this.client.patch<
            IBulkUpdateTaskBody,
            IBodyResponse<IProjectTask[]>
        >(`${this.baseUrl}/task/bulk-update`, {
            ...body,
        });
    }

    async importXML(data: IImportXML, planningId: string) {
        return await this.client.post<void, IBodyResponse>(
            `${this.baseUrl}/${planningId}/import-xml`,
            {
                ...data,
            },
        );
    }

    async exportPlanningToPrimaveraP6(id: string, body: IExportPlanningToPrimaveraP6) {
        return await this.client.post<IExportPlanningToPrimaveraP6, IBodyResponse>(
            `${this.baseUrl}/${id}/export/primavera`,
            body,
        );
    }

    async setFileByFocusTime(data: IFilePathsByFocusTimeQuery) {
        return await this.client.post<void, IBodyResponse<IGetListResponse<string>>>(
            `${this.baseUrl}/set-task-with-focus-time`,
            {
                ...data,
            },
        );
    }
}

export const projectPlanningService = new ProjectPlanningService(
    { baseUrl: '/planning' },
    service,
);
