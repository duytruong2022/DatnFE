import {
    DEFAULT_FIRST_PAGE,
    DEFAULT_ORDER_BY,
    DEFAULT_ORDER_DIRECTION,
} from '@/common/constants';
import { IProject } from './interfaces';

export const DEFAULT_PROJECT_MAP_COORDINATES = {
    latitude: 48.858093,
    longitude: 2.294694,
};
export const LATITUDE_MIN_VALUE = -90;
export const LATITUDE_MAX_VALUE = 90;
export const LONGITUDE_MIN_VALUE = -180;
export const LONGITUDE_MAX_VALUE = 180;
export const DEFAULT_EXPORTED_MAP_NAME = 'projects.png';
export const MAP_LAYER_URL = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const DEFAULT_COUNTRY_CODE = 'vn';

export enum ProjectCategories {
    BUILDINGS_AND_FACILITIES = 'buildingsAndFacilities',
    COMMUNICATIONS = 'communications',
    INFRASTRUCTURE = 'infrastructure',
    MANUFACTURING = 'manufacturing',
    MAPPING_AND_SURVEYING = 'mappingAndSurveying',
    MINING = 'mining',
    OIL_AND_GAS = 'oilAndGas',
    POWER_GENERATION = 'powerGeneration',
    WATER_AND_WASTEWATER = 'waterAndWastewater',
}

export const initialProject: IProject = {
    _id: '',
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

export const ProjectCategoryOptions = [
    {
        label: 'project.categories.buildingsAndFacilities',
        value: ProjectCategories.BUILDINGS_AND_FACILITIES,
    },
    {
        label: 'project.categories.communications',
        value: ProjectCategories.COMMUNICATIONS,
    },
    {
        label: 'project.categories.infrastructure',
        value: ProjectCategories.INFRASTRUCTURE,
    },
    {
        label: 'project.categories.manufacturing',
        value: ProjectCategories.MANUFACTURING,
    },
    {
        label: 'project.categories.mappingAndSurveying',
        value: ProjectCategories.MAPPING_AND_SURVEYING,
    },
    {
        label: 'project.categories.mining',
        value: ProjectCategories.MINING,
    },
    {
        label: 'project.categories.oilAndGas',
        value: ProjectCategories.OIL_AND_GAS,
    },
    {
        label: 'project.categories.powerGeneration',
        value: ProjectCategories.POWER_GENERATION,
    },
    {
        label: 'project.categories.waterAndWastewater',
        value: ProjectCategories.WATER_AND_WASTEWATER,
    },
];

export const DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE = 12;

export const initQueryString = {
    page: DEFAULT_FIRST_PAGE,
    limit: DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE,
    orderBy: DEFAULT_ORDER_BY,
    orderDirection: DEFAULT_ORDER_DIRECTION,
    keyword: undefined,
    category: undefined,
    createdBy: undefined,
    createdAt: undefined,
};

export const RANDOM_COORDINATES_RANGE = {
    min: 0.01,
    max: 0.1,
};

export enum DashboardTab {
    MAIN = 'main',
    TASK = 'task',
    RESOURCE = 'resource',
}

export enum DashboardField {
    CATEGORY = 'category',
    DESCRIPTION = 'description',
    POSTAL_CODE = 'postalCode',
    ADDRESS = 'address',
    COORDINATES = 'coordinates',
    PROJECT_ADMIN = 'projectAdmin',
    TIME = 'time',
}

export const initProjectFieldSetting = {
    category: true,
    description: true,
    postalCode: true,
    address: true,
    coordinates: true,
    projectAdmin: true,
    time: true,
};
export enum ProjectNotificationType {
    RESET_BASELINE = 'resetBaseline',
    APPLY_BASELINE = 'applyBaseline',
    CREATE_TASK_FIELD = 'createTaskField',
    UPDATE_TASK_FIELD = 'updateTaskField',
    DELETE_TASK_FIELD = 'deleteTaskField',
    UPDATE_PLANNING = 'updatePlanning',
    DELETE_PLANNING = 'deletePlanning',
    CREATE_RESOURCE = 'createResource',
    CREATE_RESOURCE_GROUP = 'createResourceGroup',
    ASSIGN_RESOURCE = 'assignResource',
    DELETE_APPEARANCE_PROFILE = 'deleteAppearanceProfile',
    UPDATE_APPEARANCE_PROFILE = 'updateAppearanceProfile',
    CREATE_APPEARANCE_PROFILE = 'createAppearanceProfile',
    DELETE_RESOURCE_GROUP = 'deleteResourceGroup',
    UPDATE_RESOURCE_GROUP = 'updateResourceGroup',
    UPDATE_RESOURCE = 'updateResource',
    DELETE_RESOURCE = 'deleteResource',
    CREATE_BASELINE = 'createBaseline',
    UPDATE_BASELINE = 'updateBaseline',
    DELETE_BASELINE = 'deleteBaseline',
    UPDATE_BASELINE_CONFIGURATION = 'updateBaselineConfiguration',
    CREATE_ACTIVITY_CODE = 'createActivityCode',
    UPDATE_ACTIVITY_CODE = 'updateActivityCode',
    DELETE_ACTIVITY_CODE = 'deleteActivityCode',
    ASSIGN_ACTIVITY_CODE = 'assignActivityCode',

    DELEGATE = 'delegate',
    SYNTHESIS = 'synthesis',
    CREATE_TASK = 'createTask',
    CREATE_LINK = 'createLink',
    DELETE_LINK = 'deleteLink',
    UPDATE_LINK = 'updateLink',
    UPDATE_TASK = 'updateTask',
    DELETE_TASK = 'deleteTask',
    TOP_DOWN = 'topDown',
    BOTTOM_UP = 'bottomUp',
}
