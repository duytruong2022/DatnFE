import { ICommonGetListQuery } from '@/common/interfaces';
import {
    AppearanceOptions,
    AppearanceType,
    AssignToExistingResourceOption,
    CurrencyType,
    GanttColumn,
    GrowthSimulation,
    LinkType,
    MilestoneLinkTo,
    MilestoneType,
    PlanningOrderBy,
    PlanningStatus,
    ResourceType,
    SearchTaskOption,
    TaskConstraint,
    TaskDuration,
    TaskDurationFormat,
    TaskFieldDataType,
    TaskPercentageCompletion,
    TaskPhysicalQuantityUnit,
    TaskStatus,
    TaskType,
} from './constants';

export interface IProjectTask {
    _id: string;
    ganttId: string;
    name: string;
    parentId: string | null;
    parentGanttId: string | null;
    planningId: string;
    delegatedTo: null | string;
    taskType: TaskType;
    status: TaskStatus;
    createdAt: Date;
    code: string;
    start: Date;
    actualStart: Date | null;
    plannedStart: Date | null;
    baselineStart: Date | null;
    finish: Date;
    actualFinish: Date | null;
    plannedFinish: Date | null;
    baselineFinish: Date | null;
    primaryConstraints: TaskConstraint | null;
    primaryConstraintDate: Date | null;
    expectedFinish: Date | null;
    durationType: TaskDuration;
    originalDuration: number | null;
    actualDuration: number | null;
    remainingDuration: number | null;
    plannedDuration: number | null;
    percentageCompletion: TaskPercentageCompletion;
    manualComplete: number;
    physicalQuantityUnit: TaskPhysicalQuantityUnit;
    physicalQuantity: number;
    actualPhysicalQuantity: number;
    rules: number;
    isMilestoneFolder?: boolean;
    isStaticMilestone?: boolean;
    milestoneType?: MilestoneType;
    milestoneLinkTo?: MilestoneLinkTo;
    isTopDownFolder: boolean;
    resourceIds: string[];
    resourceGroupIds: string[];
    appearanceProfileId: string;
    activityCodeValueId: string | null;
    additionalFields: Record<string, string | number | boolean | Date>;
    clonedFromTaskId?: string;
    inheritedFromTaskId?: string;
    linkedTaskId?: string;
    linkedLinkId?: string;
    calendarId?: string;
    isSynthesizedToOtherTask?: boolean;
    canEdit?: boolean;
    color?: string;
}

export interface IUpdateTaskResponse {
    updatedTasksFlow: IProjectTask[];
    updatedTask: IProjectTask;
    currentTask: IProjectTask;
    updatedMilestones: IProjectTask[];
}
export interface ITaskLink {
    _id: string;
    source: string;
    target: string;
    createdAt: Date;
    type: LinkType;
    lag: number;
}

export interface ICreateLinkResponse {
    link: ITaskLink;
}

export interface IBulkCreateLinkResponse {
    taskLinks: ITaskLink[];
}
export interface ICreateTaskFieldBody {
    name: string;
    dataType: TaskFieldDataType;
    projectId: string;
    path: string;
}

export interface IUpdateTaskFieldBody {
    name: string;
    projectId: string;
    path: string;
}

export interface IAdditionalTaskField extends ICreateTaskFieldBody {
    _id: string;
}
export interface ITimeBlock {
    startTime: string;
    endTime: string;
}
export interface IProjectCalendarConfig {
    date: string;
    dayType: {
        timeBlocks: ITimeBlock[];
    };
}

export interface IProjectCalendar {
    _id: string;
    name: string;
    isDefaultCalendar: boolean;
    configs: IProjectCalendarConfig[];
}

export interface IPlanning {
    _id: string;
    status: PlanningStatus;
    planningId: string;
    name: string;
    planningFilePath: string;
    additionalTaskFields: IAdditionalTaskField[];
    taskLinks: ITaskLink[];
    tasks: IProjectTask[];
    projectId: string;
    taskIds: string[];
    createdAt: Date;
    isTemplate?: boolean;
    synthesizedFromPlanningIds?: string[];
    clonedFromPlanningIds?: string[];
    appliedBaselineId?: string;
    isSynthesized?: boolean;
    taskIdPrefix: string;
    taskIdSuffix: number;
    taskIdIncrement: number;
    currency: CurrencyType;
    durationType: TaskDuration;
    durationFormat: TaskDurationFormat;
    defaultDuration: number;
    activityType: TaskType;
    percentageCompletion: TaskPercentageCompletion;
    projectStart: Date;
    dataDate: Date;
    defaultCalendar: string;
    autoScheduling: boolean;
    p6Id?: string;
    fileId?: string;
    filePath?: string;
    forceEnableTopdown?: boolean;
    forceEnableBottomup?: boolean;
    disableTopdownAndBottomup?: boolean;
    delegatedFromPlanningId?: string;
    calendars?: IProjectCalendar[];
}

export interface ICreatePlanning {
    name?: string;
    currency?: CurrencyType;
    durationType?: TaskDuration;
    durationFormat?: TaskDurationFormat;
    defaultDuration?: number;
    activityType?: TaskType;
    percentageCompletion?: TaskPercentageCompletion;
    defaultCalendar?: string;
    autoScheduling?: boolean;
}

export interface IGanttChartTask extends Omit<IProjectTask, 'taskType'> {
    taskType: TaskType;
    // type of ganttChart to display task, project or milestone
    type: TaskType;
    id: string;
    start_date: Date | string | null;
    parent: string | number;
    progress: number;
    duration?: number;
    text?: string;
    atCompletionDuration: number;
    plannedDuration: number | null;
    baselineDuration: number | null;
    varianceBLDuration: number | null;
    varianceBLFinishDate: number | null;
    varianceBLStartDate: number | null;
    physicalComplete: number | null;
    remainingPhysicalQuantity: number | null;
    durationComplete: number | null;
    // bl_start and bl_finish for display baseline bar of task only
    bl_start?: Date;
    bl_finish?: Date;
    open?: boolean;
    end_date?: Date | string | null;
    row_height?: number;
    bar_height?: number | string;
    canEdit?: boolean;
    editable?: boolean;
    rollup?: boolean;
    hede_bar?: boolean;
    baselineCurrentStart?: Date;
    baselineCurrentFinish?: Date;
    resourceIds: string[];
    resourceGroupIds: string[];
    color?: string;
    activityCode: string | null;
    activityCodeValue: string | null;
    additionalFields: Record<string, string | number | boolean | Date>;
    calendarDuration?: number;
    constraint_type?: TaskConstraint;
    constraint_date?: Date;
}

export interface IGanttChartColumn {
    hide: boolean;
    label: string;
    min_width: number;
    name: string;
    resize: boolean;
    width: number;
}

export interface IPlanningQuery {
    name: string;
    planningFilePath: string;
    projectId: string;
    path: string;
}

export interface IPlanningListQuery extends ICommonGetListQuery {
    fileIds?: string[];
    allowSynthesizedPlanning?: boolean;
    projectId?: string;
    path?: string;
}

export type ICreateProjectTaskDto = IUpdateProjectTaskDto;

export interface ICreateLinkDto {
    source: string;
    target: string;
    type: LinkType;
    lag: number;
    projectId?: string;
    path?: string;
}

export type IUpdateLinkDto = ICreateLinkDto;

export interface IBulkCreateLinkBody {
    items: ICreateLinkDto[];
    projectId: string;
    path: string;
}

export interface ILinkListGetByTaskIdResponse {
    predecessors: ILinkDetail[];
    successors: ILinkDetail[];
}

export interface IUpdateProjectTaskDto {
    name: string;
    status: TaskStatus;
    start: Date | string | null;
    actualStart: Date | string | null;
    finish: Date | string | null;
    actualFinish: Date | string | null;

    // primaryConstraints: TaskConstraint | null;
    // primaryConstraintDate: Date | string | null;
    durationType: TaskDuration;
    rules: number | null;
    parentId: string | null;

    additionalFields: Record<string, unknown>;
    calendarId?: string;
    projectId?: string;
    path?: string;
}

export interface IDelegateTaskBody {
    name: string;
    planningFilePath: string;
    taskIds: string[];
    projectId: string;
    path: string;
}

export interface IDelegateTaskToExistDelegationBody {
    taskIds: string[];
    projectId: string;
    path: string;
}

export interface IDelegateResponse {
    // includes new milestones and tasks has update "delegateTo"
    tasks: IProjectTask[];
    links: ITaskLink[];
    // for delegate to new planning
    delegation?: IPlanning;
}

export interface IBaselineTaskBody {
    name: string;
    planningId: string;
    projectId: string;
    path: string;
}

export interface IBaselineTask {
    taskId: string;
    baselineStart: Date;
    baselineFinish: Date;
}
export interface IBaselinePlanning {
    _id: string;
    name: string;
    planningId: string;
    baselineTasks: IBaselineTask[];
}

export interface IBaselinePlanningListQuery extends ICommonGetListQuery {
    planningId?: string;
}

export interface IBaselineConfigurationQuery {
    planningId: string;
}

export interface IBaselineConfigurationBody {
    display: boolean;
    color: string;
    position: string;
}

export interface IBaselineConfiguration {
    _id: string;
    planningId: string;
    display: boolean;
    color: string;
    position: string;
}

export interface ISynthesisPlanningBody {
    name: string;
    planningIds: string[];
    planningFilePath: string;
    projectId: string;
    path: string;
}

export interface IResourceWorkloadAndCapacity {
    effectiveDate: Date;
    unitPerPeriod: number | null;
    pricePerUnit: number | null;
}

export interface IResource {
    _id?: string;
    name: string;
    type: ResourceType;
    unit: string;
    planningId?: string;
    fileIds: string[];
    projectId: string;
    path?: string;
    description?: string;
    parentId?: string;
    calendar: string | null;
    workloadAndCapacity: IResourceWorkloadAndCapacity[];
    assignToExistingResourceOption?: AssignToExistingResourceOption;
    sessionToken?: string;
}

export interface IResourceGroup {
    _id?: string;
    name: string;
    resourceIds: string[];
    planningId: string;
    projectId: string;
    path: string;
    description?: string;
}

export interface IPlanningFileLocation {
    name: string;
    path: string;
}

export interface IGanttGridDisplayingStatus {
    // id?: boolean;
    // name?: boolean;
    calendarName?: boolean;
    parentId?: boolean;
    parentName?: boolean;
    status?: boolean;
    type?: boolean;
    start?: boolean;
    plannedStart?: boolean;
    actualStart?: boolean;
    earlyStart?: boolean;
    lateStart?: boolean;
    blStart?: boolean;
    finish?: boolean;
    actualFinish?: boolean;
    earlyFinish?: boolean;
    lateFinish?: boolean;
    plannedFinish?: boolean;
    blFinish?: boolean;
    prConstraint?: boolean;
    prConstraintDate?: boolean;
    expectedFinish?: boolean;
    durationType?: boolean;
    originalDuration?: boolean;
    actualDuration?: boolean;
    remainingDuration?: boolean;
    plannedDuration?: boolean;
    atCompleteDuration?: boolean;
    blDuration?: boolean;
    VBLDuration?: boolean;
    VBLFinishDate?: boolean;
    VBLStartDate?: boolean;
    freeFloat?: boolean;
    totalFloat?: boolean;
    critical?: boolean;
    percentCompleteType?: boolean;
    physicalPercentage?: boolean;
    durationPercentage?: boolean;
    manualPercentage?: boolean;
    physicalUnit?: boolean;
    physicalQuantity?: boolean;
    actualPhysicalQuantity?: boolean;
    remainPhysicalQuantity?: boolean;
    rules?: boolean;
    appearanceProfile?: boolean;
    resouce3D?: boolean;
    resourceGroup?: boolean;
    activityCode?: boolean;
    activityCodeValue?: boolean;
    name?: boolean;
}

export interface IGridSettingParams {
    open: boolean;
    displayingStatus: IGanttGridDisplayingStatus;
}

export interface IAssignResource {
    resourceIds: string[];
    taskIds: string[];
    appearanceProfileIds: string[];
    path: string;
    projectId: string;
}

export interface IAssignResourceGroup {
    resourceGroupIds: string[];
    appearanceProfileIds: string[];
    taskIds: string[];
    path: string;
    projectId: string;
}

export interface IResourceListQuery extends ICommonGetListQuery {
    planningId: string;
    path: string;
    projectId: string;
}

export enum TaskActions {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
}

export interface ITaskFieldParams {
    open: boolean;
    selectedField: IAdditionalTaskField | null;
    action: null | TaskActions;
}
export interface IGetTaskByIdsQueryString {
    taskIds: string[];
    projectId: string;
    path: string;
}

export interface IBulkUpdateTask extends IUpdateProjectTaskDto {
    taskId: string;
}

export interface IBulkUpdateTaskBody {
    items: IBulkUpdateTask[];
    projectId: string;
    path: string;
}

export interface IAppearanceProfile {
    _id?: string;
    name: string;
    type: AppearanceType;
    growthSimulation: GrowthSimulation;
    planningId: string;
    assignFileIds?: string[];
    startAppearanceProfile?: IStartAppearanceProfile;
    activeAppearanceProfile?: IActiveAppearanceProfile;
    endAppearanceProfile?: IEndAppearanceProfile;
    projectId?: string;
    path?: string;
}

export interface IUpdateAppearanceProfile extends IAppearanceProfile {
    notAssignFileIds?: string[];
}

export interface IAppearanceProfileListQuery extends ICommonGetListQuery {
    planningId: string;
}

export interface IFilePathsByFocusTimeQuery {
    sessionToken: string;
    planningId: string;
    focusTime: string;
    projectId: string;
    path: string;
}

export interface IActivityCodeListItem {
    _id: string;
    name: string;
    maxLength: number;
    projectId?: string;
    activityCodeValues: IActivityCodeValueItem[] | [];
}

export interface IActivityCodeValueItem {
    _id?: string;
    name: string;
    description: string;
    colorCode: string;
    activityCodeId: string;
    parentId: string | null;
    projectId?: string;
    path?: string;
}

export interface IActivityCode {
    name: string;
    maxLength: number;
    projectId?: string;
    path?: string;
}

export interface IActivityCodeColumns {
    activityCode: string | null;
    activityCodeValue: string | null;
    activityCodeValueColor?: string;
}

export interface IPlanningGetListQuery extends ICommonGetListQuery {
    projectId: string;
    path: string;
}

export interface IAssignActivityCodeValue {
    taskIds: string[];
    activityCodeValueId: string | null;
    projectId: string;
}

export interface ITopDownResponse {
    taskToBeInsertedInThisPlanning: IProjectTask[];
}

export interface ITaskUpdateDelegation {
    _id: string;
    name: string;
    ganttId: string;
    planningId: string;
    startModified: Date | string;
    finishModified: Date | string;
}

export interface IMilestoneUpdateOriginalPlanning {
    _id: string;
    // task linked in synthesis planning
    milestoneLinkTo: MilestoneLinkTo | null;
    linkedLinkId: string;
    linkedTaskId: string;
    startModified: Date | string | null;
    finishModified: Date | string | null;
}

export type ITaskUpdateOriginalPlanning = ITaskUpdateDelegation;

export interface IDelegationHasModifyResponse extends IPlanning {
    tasksHasModify: IProjectTask[];
}

export interface IExportPlanningQuery {
    projectId: string;
    name: string;
    planningFilePath: string;
    socketClientId: string;
}

export interface IPlanningByPathNameQuery {
    projectId: string;
    name: string;
    planningFilePath: string;
    path: string;
}

export interface IResourceIdQueryString {
    resourceId: string;
    projectId: string;
    path: string;
}

export interface ITaskDragUpdate {
    originalDuration: number | null;
    actualDuration: number | null;
    remainingDuration: number | null;
    plannedDuration: number | null;
    finish: Date | string | null;
    actualFinish: Date | string | null;
    plannedFinish: Date | string | null;
    start: Date | string | null;
    actualStart: Date | string | null;
    plannedStart: Date | string | null;
}

export interface IExportPlanningToPrimaveraP6 {
    projectId: string;
    planningId: string;
    planningName: string;
    selectedObjects: string[];
    fileName: string;
    savePath: string;
}

export interface IImportProject {
    name?: string;
    dataDate?: string;
    p6Id?: string;
}

export interface IImportTask {
    name?: string;
    finish?: string;
    start?: string;
    actualDuration?: string;
    actualFinish?: string;
    actualStart?: string;
    duration?: string;
    p6Id?: string;
    parentId?: string;
}

export interface IImportTaskCustomField {
    p6Id: string;
    milestoneType?: string;
    color?: string;
    primaryConstraints?: string;
    primaryConstraintDate?: string;
}

export interface IImportResource {
    name?: string;
    type?: string;
    p6Id?: string;
}

export interface IImportLink {
    source?: string;
    target?: string;
    type?: string;
}

export interface IImportXML {
    project: IImportProject;
    parentTaskId: string;
    isSynthesized: boolean;
    isReplacePlanning: boolean;
    tasks?: IImportTask[];
    links?: IImportLink[];
    resources?: IImportResource[];
}

export interface ILinkDetail {
    dependency: string;
    taskLinkToId: string;
    taskLinkToGanttId: string;
    taskLinkToName: string;
    taskLinkToStart: Date | null;
    taskLinkToFinish: Date | null;
    type: LinkType;
    taskLag: number;
}

export interface IStartAppearanceProfile {
    colorType: AppearanceOptions;
    colorValue: string;
    transparencyType: AppearanceOptions;
    transparencyValue: number;
}
export interface IEndAppearanceProfile {
    colorType: AppearanceOptions;
    colorValue: string;
    transparencyType: AppearanceOptions;
    transparencyValue: number;
}

export interface IActiveAppearanceProfile {
    colorType: AppearanceOptions;
    colorValue: string;
    transparencyType: AppearanceOptions;
    transparencyStartValue: number;
    transparencyInterpolation: boolean;
    transparencyEndValue: number;
}

export interface ISearchTask {
    searchValue: string;
    searchColumn: GanttColumn;
    searchType: SearchTaskOption;
}
export interface IUpdateTaskName {
    name: string;
}

export interface IPlanListQueryString extends ICommonGetListQuery {
    keyword?: string;
}
