export enum ProjectLogModules {
    USER = 'USER',
    PROJECT = 'PROJECT',
    PROJECT_PROFILE = 'PROJECT_PROFILE',
    PBS_GROUP = 'PBS_GROUP',
    PROJECT_GROUP = 'PROJECT_GROUP',
    GROUP = 'GROUP',
}

export enum ProjectLogActions {
    CREATE_PROJECT = 'CREATE_PROJECT',
    UPDATE_PROJECT = 'UPDATE_PROJECT',
    DELETE_PROJECT = 'DELETE_PROJECT',
    CREATE_PROJECT_GROUP = 'CREATE_PROJECT_GROUP',
    UPDATE_PROJECT_GROUP = 'UPDATE_PROJECT_GROUP',
    DELETE_PROJECT_GROUP = 'DELETE_PROJECT_GROUP',
    CREATE_PROJECT_PROFILE = 'CREATE_PROJECT_PROFILE',
    UPDATE_PROJECT_PROFILE = 'UPDATE_PROJECT_PROFILE',
    DELETE_PROJECT_PROFILE = 'DELETE_PROJECT_PROFILE',
    CREATE_USER = 'CREATE_USER',
    UPDATE_USER = 'UPDATE_USER',
    ASSIGN_TO_PROJECT_USER = 'ASSIGN_TO_PROJECT_USER',
    REMOVE_FROM_PROJECT_USER = 'REMOVE_FROM_PROJECT_USER',
    ASSIGN_TO_PROJECT_GROUP = 'ASSIGN_TO_PROJECT_GROUP',
    REMOVE_FROM_PROJECT_GROUP = 'REMOVE_FROM_PROJECT_GROUP',
}

export const projectAttributes = ['name', 'category', 'description', 'place', 'admin'];

export const projectProfileAttributes = ['name', 'isDefaultSelect'];

export const projectGroupAttributes = ['name', 'projectProfile'];

export const userAttributes = ['email', 'ldapUsername', 'company', 'country'];

export const groupAttributes = ['name', 'constellationProfile'];

export const PLACE = 'place';
export const COORDINATES = 'coordinatesDetails';

export const ProjectLogTransactionActionOptions = [
    {
        label: 'projectLog.action.CREATE_PROJECT_GROUP',
        value: ProjectLogActions.CREATE_PROJECT_GROUP,
    },
    {
        label: 'projectLog.action.UPDATE_PROJECT_GROUP',
        value: ProjectLogActions.UPDATE_PROJECT_GROUP,
    },
    {
        label: 'projectLog.action.DELETE_PROJECT_GROUP',
        value: ProjectLogActions.DELETE_PROJECT_GROUP,
    },
    {
        label: 'projectLog.action.CREATE_PROJECT_PROFILE',
        value: ProjectLogActions.CREATE_PROJECT_PROFILE,
    },
    {
        label: 'projectLog.action.UPDATE_PROJECT_PROFILE',
        value: ProjectLogActions.UPDATE_PROJECT_PROFILE,
    },
    {
        label: 'projectLog.action.DELETE_PROJECT_PROFILE',
        value: ProjectLogActions.DELETE_PROJECT_PROFILE,
    },
    {
        label: 'projectLog.action.CREATE_USER',
        value: ProjectLogActions.CREATE_USER,
    },
    {
        label: 'projectLog.action.UPDATE_USER',
        value: ProjectLogActions.UPDATE_USER,
    },
    {
        label: 'projectLog.action.ASSIGN_TO_PROJECT_USER',
        value: ProjectLogActions.ASSIGN_TO_PROJECT_USER,
    },
    {
        label: 'projectLog.action.REMOVE_FROM_PROJECT_USER',
        value: ProjectLogActions.REMOVE_FROM_PROJECT_USER,
    },
    {
        label: 'projectLog.action.ASSIGN_TO_PROJECT_GROUP',
        value: ProjectLogActions.ASSIGN_TO_PROJECT_GROUP,
    },
    {
        label: 'projectLog.action.REMOVE_FROM_PROJECT_GROUP',
        value: ProjectLogActions.REMOVE_FROM_PROJECT_GROUP,
    },
];

export const ProjectLogHistoryActionOptions = [
    {
        label: 'projectLog.action.CREATE_PROJECT',
        value: ProjectLogActions.CREATE_PROJECT,
    },
    {
        label: 'projectLog.action.UPDATE_PROJECT',
        value: ProjectLogActions.UPDATE_PROJECT,
    },
    {
        label: 'projectLog.action.DELETE_PROJECT',
        value: ProjectLogActions.DELETE_PROJECT,
    },
];

export enum ProjectLogType {
    PROJECT_LOG_HISTORY = 'projectLogHistory',
    PROJECT_LOG_TRANSACTION = 'projectLogTransaction',
}

export const Months = [
    {
        value: 1,
        label: 'app.month.january',
    },
    {
        value: 2,
        label: 'app.month.february',
    },
    {
        value: 3,
        label: 'app.month.march',
    },
    {
        value: 4,
        label: 'app.month.april',
    },
    {
        value: 5,
        label: 'app.month.may',
    },
    {
        value: 6,
        label: 'app.month.june',
    },
    {
        value: 7,
        label: 'app.month.july',
    },
    {
        value: 8,
        label: 'app.month.august',
    },
    {
        value: 9,
        label: 'app.month.september',
    },
    {
        value: 10,
        label: 'app.month.october',
    },
    {
        value: 11,
        label: 'app.month.november',
    },
    {
        value: 12,
        label: 'app.month.december',
    },
];

export enum DateRangeTypes {
    DAY = 'day',
    MONTH = 'month',
    WEEK = 'week',
    YEAR = 'year',
}

export const DateRangeTypeOptions = [
    {
        value: DateRangeTypes.DAY,
        label: 'projectLog.dateRangeType.day',
    },
    {
        value: DateRangeTypes.MONTH,
        label: 'projectLog.dateRangeType.month',
    },
];

export const DateRangeTypeForUserInCompanyOptions = [
    {
        value: DateRangeTypes.WEEK,
        label: 'projectLog.dateRangeType.week',
    },
    {
        value: DateRangeTypes.MONTH,
        label: 'projectLog.dateRangeType.month',
    },
    {
        value: DateRangeTypes.YEAR,
        label: 'projectLog.dateRangeType.year',
    },
];

export const DAY_PER_MONTH = 31;

export const WEEK_PER_YEAR = 52;

export const MAX_COMPANY_COUNT = 1000;

export enum LogServerType {
    INSTANCE_LOG = 'INSTANCE_LOG',
    SERVER_LOG = 'SERVER_LOG',
    LICENSE_LOG = 'LICENSE_LOG',
}

export const LogServerTypeOptions = [
    {
        label: `projectLog.logServer.logServerType.${LogServerType.INSTANCE_LOG}`,
        value: LogServerType.INSTANCE_LOG,
    },
    {
        label: `projectLog.logServer.logServerType.${LogServerType.SERVER_LOG}`,
        value: LogServerType.SERVER_LOG,
    },
    {
        label: `projectLog.logServer.logServerType.${LogServerType.LICENSE_LOG}`,
        value: LogServerType.LICENSE_LOG,
    },
];
