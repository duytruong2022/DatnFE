import { DimensionType } from './../3D-viewer/constant';
import { ExportFormat2D, ExportFormat3D } from './../../common/constants';
export enum TaskType {
    STANDARD = 'standard',
    RESOURCE_DEPENDENT = 'resource_dependent',
    START_MILESTONE = 'start_milestone',
    FINISH_MILESTONE = 'finish_milestone',
    MILESTONE = 'milestone',
    LEVEL_EFFORT = 'level_effort',
    WBS_SUMMARY = 'wbs_summary',
    // for displaying, not store in backend
    PROJECT = 'project',
}

export enum GanttTaskType {
    STANDARD = 'standard',
    PROJECT = 'project',
}

export enum LinkType {
    START_TO_START = 'start_to_start',
    START_TO_FINISH = 'start_to_finish',
    FINISH_TO_START = 'finish_to_start',
    FINISH_TO_FINISH = 'finish_to_finish',
}

export enum PlanningStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PLANNED = 'planned',
}

export enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    FINISHED = 'finished',
}

export enum TaskConstraint {
    // As Soon As Possible
    ASAP = 'asap',
    // As Late As Possible
    ALAP = 'alap',
    // Start No Earlier Than
    SNET = 'snet',
    // Start No Later Than
    SNLT = 'snlt',
    // Finish No Earlier Than
    FNET = 'fnet',
    // Finish No Later Than
    FNLT = 'fnlt',
    // Must Start On
    MSO = 'mso',
    // Must Finish On
    MFO = 'mfo',
}

export enum TaskDuration {
    STANDARD = 'standard',
    RESOURCE_UNITS_DEPENDENT = 'resource_units_dependent',
    PHYSICAL_QUANTITY_DEPENDENT = 'physical_quantity_dependent',
}

export enum TaskPercentageCompletion {
    PHYSICAL_COMPLETE = 'physical_complete',
    DURATION_COMPLETE = 'duration_complete',
    MANUAL_COMPLETE = 'manual_complete',
}

export enum TaskPhysicalQuantityUnit {
    BAG = 'bag',
    BOX = 'box',
    BUCKET = 'bucket',
    BUNDLE = 'bundle',
    CRANE = 'crane',
    CARTON = 'carton',
    CUBIC_FEET = 'cubic_feet',
    CUBIC_METRE = 'cubic_METRE',
    CUBIC_YARD = 'cubic_yard',
    DOZEN = 'dozen',
    FEET = 'feet',
    GRAMME = 'gramme',
    HOUR = 'hour',
    ITEM = 'item',
    KILO = 'kilo',
    LENGTH = 'length',
    LITRE = 'litre',
    METRE = 'metre',
    MILLIMETRE = 'millimetre',
    PACK = 'pack',
    PAIR = 'pair',
    PERSON = 'person',
    POUND = 'pound',
    SACHET = 'sachet',
    SET = 'set',
    SHEET = 'sheet',
    SQ_FOOT = 'sq_foot',
    SQ_METRE = 'sq_metre',
    SQ_YARD = 'sq_yard',
    TON = 'ton',
}

export enum PlanningOrderBy {
    NAME = 'name',
    CREATED_AT = 'createdAt',
}

export enum ResourceType {
    EQUIPMENT = 'equipment',
    HUMAN_RESOURCE = 'human_resource',
    MATERIAL = 'material',
    LOCATION = 'location',
}

export const ResourceTypeOptions = [
    {
        label: `planning.resource.resourceType.${ResourceType.EQUIPMENT}`,
        value: ResourceType.EQUIPMENT,
    },
    {
        label: `planning.resource.resourceType.${ResourceType.HUMAN_RESOURCE}`,
        value: ResourceType.HUMAN_RESOURCE,
    },
    {
        label: `planning.resource.resourceType.${ResourceType.MATERIAL}`,
        value: ResourceType.MATERIAL,
    },
    {
        label: `planning.resource.resourceType.${ResourceType.LOCATION}`,
        value: ResourceType.LOCATION,
    },
];

export enum ResourceOtherUnitType {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

export enum ResourceMaterialUnitType {
    BAG = 'bag',
    BOX = 'box',
    BUCKET = 'bucket',
    BUNDLE = 'bundle',
    CRANE = 'crane',
    CARTON = 'carton',
    CUBIC_FEET = 'cubic_feet',
    CUBIC_METRE = 'cubic_METRE',
    CUBIC_YARD = 'cubic_yard',
    DOZEN = 'dozen',
    FEET = 'feet',
    GRAMME = 'gramme',
    HOUR = 'hour',
    ITEM = 'item',
    KILO = 'kilo',
    LENGTH = 'length',
    LITRE = 'litre',
    METRE = 'metre',
    MILLIMETRE = 'millimetre',
    PACK = 'pack',
    PAIR = 'pair',
    PERSON = 'person',
    POUND = 'pound',
    SACHET = 'sachet',
    SET = 'set',
    SHEET = 'sheet',
    SQ_FOOT = 'sq_foot',
    SQ_METRE = 'sq_metre',
    SQ_YARD = 'sq_yard',
    TON = 'ton',
}

export enum BaselinePosition {
    TOP = 'top',
    BOTTOM = 'bottom',
    AROUND = 'around',
}

export const PositionBaselineOptions = [
    {
        label: `planning.baseline.position.${BaselinePosition.TOP}`,
        value: BaselinePosition.TOP,
    },
    {
        label: `planning.baseline.position.${BaselinePosition.BOTTOM}`,
        value: BaselinePosition.BOTTOM,
    },
    {
        label: `planning.baseline.position.${BaselinePosition.AROUND}`,
        value: BaselinePosition.AROUND,
    },
];

export const ExportFormat3DOptions = Object.keys(ExportFormat3D).map((key) => {
    return {
        label: key,
        value: ExportFormat3D[key as keyof typeof ExportFormat3D],
    };
});

export const ExportFormat2DOptions = Object.keys(ExportFormat2D).map((key) => {
    return {
        label: key,
        value: ExportFormat2D[key as keyof typeof ExportFormat2D],
    };
});

export const ExportFileType = Object.keys(DimensionType).map((key) => {
    return {
        label: key,
        value: DimensionType[key as keyof typeof DimensionType],
    };
});

export const ConstraintTypeMapping = {
    [TaskType.STANDARD]: Object.values(TaskConstraint),
    [TaskType.PROJECT]: [],
    [TaskType.MILESTONE]: [],
    [TaskType.START_MILESTONE]: [
        TaskConstraint.ASAP,
        TaskConstraint.ALAP,
        TaskConstraint.SNET,
        TaskConstraint.SNLT,
        TaskConstraint.MSO,
    ],
    [TaskType.FINISH_MILESTONE]: [
        TaskConstraint.ASAP,
        TaskConstraint.ALAP,
        TaskConstraint.FNET,
        TaskConstraint.FNLT,
        TaskConstraint.MFO,
    ],
    [TaskType.RESOURCE_DEPENDENT]: Object.values(TaskConstraint),
    [TaskType.LEVEL_EFFORT]: [],
    [TaskType.WBS_SUMMARY]: [],
    [TaskType.MILESTONE]: [],
};

export enum MilestoneType {
    TOP_DOWN = 'topDown',
    BOTTOM_UP = 'bottomUp',
    TOP_DOWN_DELEGATE_IM = 'topDownDelegateIM',
    TOP_DOWN_DELEGATE_FL = 'topDownDelegateFL',
    TOP_DOWN_DELEGATE_CF = 'topDownDelegateCF',
    BOTTOM_UP_DELEGATE_IM = 'bottomUpDelegateIM',
    BOTTOM_UP_DELEGATE_FL = 'bottomUpDelegateFL',
    BOTTOM_UP_DELEGATE_CF = 'bottomUpDelegateCF',
}

export enum TaskFieldDataType {
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    STRING = 'string',
    DATE_TIME = 'date_time',
}

export enum DelegateOptions {
    NEW_PLANNING = 'newPlanning',
    EXIST_PLANNING = 'existPlanning',
}

export const PreserveTaskFields = [
    'Activity ID',
    'Activity status',
    'Activity name',
    'Calendar name',
    'Start',
    'Actual start',
    'Finish',
    'Actual finish',
    'Rules',
    'All columns',
];

export enum AppearanceType {
    INSTALL = 'install',
    MAINTAIN = 'maintain',
    REMOVE = 'remove',
    TEMPORARY = 'temporary',
}

export enum GrowthSimulation {
    BOTTOM_TOP = 'bottom_top',
    TOP_BOTTOM = 'top_bottom',
    LEFT_RIGHT = 'left_right',
    RIGHT_LEFT = 'right_left',
    FRONT_BACK = 'front_back',
    BACK_FRONT = 'back_front',
}

export const AppearanceTypeOptions = [
    {
        label: `planning.appearanceProfile.appearanceType.${AppearanceType.INSTALL}`,
        value: AppearanceType.INSTALL,
    },
    {
        label: `planning.appearanceProfile.appearanceType.${AppearanceType.MAINTAIN}`,
        value: AppearanceType.MAINTAIN,
    },
    {
        label: `planning.appearanceProfile.appearanceType.${AppearanceType.REMOVE}`,
        value: AppearanceType.REMOVE,
    },
    {
        label: `planning.appearanceProfile.appearanceType.${AppearanceType.TEMPORARY}`,
        value: AppearanceType.TEMPORARY,
    },
];

export const GrowthSimulationOptions = [
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.BOTTOM_TOP}`,
        value: GrowthSimulation.BOTTOM_TOP,
    },
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.TOP_BOTTOM}`,
        value: GrowthSimulation.TOP_BOTTOM,
    },
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.LEFT_RIGHT}`,
        value: GrowthSimulation.LEFT_RIGHT,
    },
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.RIGHT_LEFT}`,
        value: GrowthSimulation.RIGHT_LEFT,
    },
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.FRONT_BACK}`,
        value: GrowthSimulation.FRONT_BACK,
    },
    {
        label: `planning.appearanceProfile.growthSimulation.${GrowthSimulation.BACK_FRONT}`,
        value: GrowthSimulation.BACK_FRONT,
    },
];

export enum DragDropEventType {
    PREV = 'prev',
    INNER = 'inner',
    NEXT = 'next',
}

export const GanttZoomLevel = ['day', 'week', 'month', 'quarter', 'year'];

export const DefaultDurationTask = {
    projectTask: 1,
    milestoneTask: 0,
    regularTask: 5,
};

export enum CurrencyType {
    DOLLAR = 'dollar',
    EURO = 'euro',
}

export enum TaskDurationFormat {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

export enum DefaultNameTask {
    CONTENT = 'Content',
    NEW_TASK = 'New task',
}

export enum MilestoneLinkTo {
    START = 'start',
    FINISH = 'finish',
}

export enum ImportResourceOption {
    SKIP = 'skip',
    CREATE = 'create',
    UPDATE = 'update',
}
export enum XML_TYPE {
    MSP = 'mps',
    P6 = 'p6',
}

export enum ProjectFieldName {
    NAME = 'name',
    P6_ID = 'p6Id',
    DATA_DATE = 'dataDate',
}

export const convertImportXmlProjects = [
    {
        name: ProjectFieldName.NAME,
        [XML_TYPE.MSP]: 'Name',
        [XML_TYPE.P6]: 'Name',
    },
    {
        name: ProjectFieldName.P6_ID,
        [XML_TYPE.MSP]: 'customId',
        [XML_TYPE.P6]: 'Id',
    },
    {
        name: ProjectFieldName.DATA_DATE,
        [XML_TYPE.MSP]: 'DataDate',
        [XML_TYPE.P6]: 'DataDate',
    },
];

export enum TaskFieldName {
    NAME = 'name',
    FINISH = 'finish',
    START = 'start',
    ACTUAL_DURATION = 'actualDuration',
    ACTUAL_FINISH = 'actualFinish',
    ACTUAL_START = 'actualStart',
    DURATION = 'duration',
    P6_ID = 'p6Id',
    PARENT_ID = 'parentId',
}

export const convertImportXmlTasks = [
    {
        name: TaskFieldName.NAME,
        [XML_TYPE.P6]: 'text',
    },
    {
        name: TaskFieldName.FINISH,
        [XML_TYPE.P6]: 'Finish',
    },
    {
        name: TaskFieldName.START,
        [XML_TYPE.P6]: 'Start',
    },
    {
        name: TaskFieldName.ACTUAL_DURATION,
        [XML_TYPE.P6]: 'ActualDuration',
    },
    {
        name: TaskFieldName.ACTUAL_FINISH,
        [XML_TYPE.P6]: 'ActualFinish',
    },
    {
        name: TaskFieldName.ACTUAL_START,
        [XML_TYPE.P6]: 'ActualStart',
    },
    {
        name: TaskFieldName.DURATION,
        [XML_TYPE.P6]: 'Duration',
    },
    {
        name: TaskFieldName.P6_ID,
        [XML_TYPE.P6]: 'id',
    },
    {
        name: TaskFieldName.PARENT_ID,
        [XML_TYPE.P6]: 'parent',
    },
];

export enum ResourceFieldName {
    NAME = 'name',
    P6_ID = 'p6Id',
    TYPE = 'type',
}

export const convertImportXmlResources = [
    {
        name: ResourceFieldName.NAME,
        [XML_TYPE.P6]: 'name',
    },
    {
        name: ResourceFieldName.P6_ID,
        [XML_TYPE.P6]: 'id',
    },
    {
        name: ResourceFieldName.TYPE,
        [XML_TYPE.P6]: 'type',
    },
];

export enum LinkFieldName {
    SOURCE = 'source',
    TARGET = 'target',
    TYPE = 'type',
}

export const convertImportXmlLinks = [
    {
        name: LinkFieldName.SOURCE,
        [XML_TYPE.MSP]: 'source',
        [XML_TYPE.P6]: 'source',
    },
    {
        name: LinkFieldName.TARGET,
        [XML_TYPE.MSP]: 'target',
        [XML_TYPE.P6]: 'target',
    },
    {
        name: LinkFieldName.TYPE,
        [XML_TYPE.MSP]: 'type',
        [XML_TYPE.P6]: 'type',
    },
];

export const convertLinkType = [
    LinkType.FINISH_TO_START,
    LinkType.START_TO_START,
    LinkType.FINISH_TO_FINISH,
    LinkType.START_TO_FINISH,
];

export const convertResourceTypes = [
    {
        type: ResourceType.EQUIPMENT,
        [XML_TYPE.P6]: 'cost',
    },
    {
        type: ResourceType.HUMAN_RESOURCE,
        [XML_TYPE.P6]: 'work',
    },
    {
        type: ResourceType.MATERIAL,
        [XML_TYPE.P6]: 'material',
    },
];

export enum ImportOption {
    UNDER_SELECTED_TASK = 'under_selected_task',
    END_OF_PROJECT = 'end_of_project',
    REPLACE_PLANNING = 'replace_planning',
}

export enum ImportObjectOption {
    IMPORT = 'import',
    SKIP = 'skip',
}

export const ImportObjectOptions = [
    {
        label: 'import',
        value: ImportObjectOption.IMPORT,
    },
    {
        label: 'skip',
        value: ImportObjectOption.SKIP,
    },
];

export enum ExportObjectList {
    TASKS = 'tasks',
    LINKS = 'links',
    CALENDARS = 'calendars',
    RESOURCES = 'resources',
    RESOURCE_ASSIGNMENTS = 'resource_assignments',
    USER_FIELDS = 'user_fields',
    USER_FIELD_VALUES = 'user_field_values',
    ACTIVITY_CODES = 'activity_codes',
    ACTIVITY_CODE_ASSIGNMENTS = 'activity_code_assignments',
}

export enum LinkDependency {
    PREDECESSOR = 'predecessor',
    SUCCESSOR = 'successor',
}

export const AppearnceColorOptions = [
    {
        label: 'Original Color',
        value: 'Original',
    },
    {
        label: 'Custom Color',
        value: 'Custom',
    },
];
export const AppearanceTransparencyOptions = [
    {
        label: 'Original Transparency',
        value: 'Original',
    },
    {
        label: 'Custom Transparency',
        value: 'Custom',
    },
];
export enum AppearanceOptions {
    CUSTOM = 'Custom',
    ORIGINAL = 'Original',
}
export const FullTimeCalendarId = 'fulltime';

export enum AssignToExistingResourceOption {
    ASSIGN_TO_RESOURCE_WITHOUT_BULDING_TREE = 'assignToResourceWithoutBuildingTree',
    ASSIGN_TO_RESOURCE_UNDERNEATH_WITHOUT_BULDING_TREE = 'assignToResourceUnderneathWithoutBuildingTree',
    ASSIGN_TO_RESOURCE_BUILD_TREE = 'assignToResourceUnderneathBuildTree',
}

export const defaultWorkTimeBlocks = ['9:00-18:00'];

export enum TaskPopupTab {
    UPDATE_TASK = 'updateTask',
    ASSIGN_RESOURCE = 'assignResource',
    ASSIGN_RESOURCE_GROUP = 'assignResourceGroup',
}

export enum SearchTaskOption {
    EXACT = 'exact',
    APPROPRIATE = 'appropriate',
}

export enum GanttColumn {
    NAME = 'name',
    PARENT_ID = 'parentId',
    PARENT_NAME = 'parentName',
    STATUS = 'status',
    TYPE = 'type',
    START = 'start',
    PLANNED_START = 'plannedStart',
    ACTUAL_START = 'actualStart',
    EARLY_START = 'earlyStart',
    LATE_START = 'lateStart',
    BL_START = 'blStart',
    FINISH = 'finish',
    ACTUAL_FINISH = 'actualFinish',
    EARLY_FINISH = 'earlyFinish',
    LATE_FINISH = 'lateFinish',
    PLANNED_FINISH = 'plannedFinish',
    BL_FINISH = 'blFinish',
    PR_CONSTRAINT = 'prConstraint',
    PR_CONSTRAINT_DATE = 'prConstraintDate',
    EXPECTED_FINISH = 'expectedFinish',
    DURATION_TYPE = 'durationType',
    AT_COMPLETE_DURATION = 'atCompleteDuration',
    BL_DURATION = 'blDuration',
    VBL_DURATION = 'VBLDuration',
    VBL_FINISH_DATE = 'VBLFinishDate',
    VBL_START_DATE = 'VBLStartDate',
    FREE_FLOAT = 'freeFloat',
    TOTAL_FLOAT = 'totalFloat',
    CRITICAL = 'critical',
    PERCENT_COMPLETE_TYPE = 'percentCompleteType',
    PHYSICAL_PERCENTAGE = 'physicalPercentage',
    DURATION_PERCENTAGE = 'durationPercentage',
    MANUAL_PERCENTAGE = 'manualPercentage',
    PHYSICAL_UNIT = 'physicalUnit',
    REMAIN_PHYSICAL_QUANTITY = 'remainPhysicalQuantity',
    RESOURCE_3D = 'resouce3D',
    RESOURCE_GROUP = 'resourceGroup',
    ACTIVITY_CODE = 'activityCode',
    ACTIVITY_CODE_VALUE = 'activityCodeValue',
    CALENDAR_NAME = 'calendarName',
    ORIGINAL_DURATION = 'originalDuration',
    ACTUAL_DURATION = 'actualDuration',
    REMAINING_DURATION = 'remainingDuration',
    PLANNED_DURATION = 'plannedDuration',
    PHYSICAL_QUANTITY = 'physicalQuantity',
    ACTUAL_PHYSICAL_QUANTITY = 'actualPhysicalQuantity',
    RULES = 'rules',
    APPEARANCE_PROFILE = 'appearanceProfile',
}
