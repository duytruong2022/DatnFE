export const INPUT_TEXT_MAX_LENGTH = 255;
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 64;
export const ARRAY_MAX_LENGTH = 10000;

export enum PageName {
    LOGIN_PAGE = 'LoginPage',
    PROFILE_VIEW_PAGE = 'ProfileViewPage',
    NOT_FOUND_PAGE = 'NotFoundPage',
    PROJECT_MAP_PAGE = 'ProjectMapPage',
    FORBIDDEN_PAGE = 'ForbiddenPage',
    CONSTELLATION_GROUP_LIST_PAGE = 'ConstellationGroupListPage',
    '3D_VIEWER_GROUP_LIST_PAGE' = '3DViewerGroupListPage',
    SECURITY_PROFILE_LIST_PAGE = 'SecurityProfileListPage',
    REGISTER_PAGE = 'RegisterPage',
    USER_LIST_PAGE = 'UserListPage',
    NOTIFICATION_LIST_PAGE = 'NotificationListPage',
    PROJECT_PROFILE_LIST_PAGE = 'ProjectProfileListPage',
    VIEWER_3D_PAGE = '3DViewerPage',
    ACCESS_LOG_LIST_PAGE = 'AccessLogListPage',
    ACTIVE_USER_PAGE = 'ActiveUserPage',
    ACTIVE_NEW_PASWORD_PAGE = 'ActiveNewPasswordPage',
    PROJECT_LIST_PAGE = 'ProjectListPage',
    PROJECT_DETAIL_PAGE = 'ProjectDetailPage',
    '4D_ANALYZER_PAGE' = '4DAnalyzerPage',
    PBS_PAGE = 'PbsPage',
    '3D_PAGE' = '3DPage',
    PLANNING_4D_PAGE = '4DPlanningPage',
    PROJECT_GROUP_LIST_PAGE = 'ProjectGroupListPage',
    '3D_VIEWER_PROFILE_PAGE' = '3DViewerProfilePage',
    ABS_PAGE = 'AbsPage',
    SUPPORT_REQUEST_LIST_PAGE = 'SupportRequestListPage',
    REPOSITORY_PAGE = 'RepositoryPage',
    PROJECT_LOG_HISTORY_LIST_PAGE = 'ProjectLogHistoryListPage',
    PROJECT_LOG_TRANSACTION_LIST_PAGE = 'ProjectLogTransactionListPage',
    PROJECT_LOG_SERVER_PAGE = 'ProjectLogServerPage',
    PROJECT_LOG_REPORT_PAGE = 'ProjectLogReportPage',
    CALENDAR_PAGE = 'CalendarPage',
    CALENDAR_CONFIG_PAGE = 'CalendarConfigPage',
    PROJECT_NOTIFICATION_PAGE = 'ProjectNotificationPage',
}

export enum SUPPORT_LANGUAGE {
    FR = 'fr',
    EN = 'en',
}

export enum THEME_MODE {
    BLUE_MODE = 'blue-mode-theme',
    GREEN_MODE = 'green-mode-theme',
}

export const DEFAULT_LANGUAGE = SUPPORT_LANGUAGE.EN;

export enum HttpStatus {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    GROUP_HAS_CHILDREN = 410,
    GROUP_MAX_LEVEL = 411,
    GROUP_MAX_QUANTITY = 412,
    AWS_ERROR = 413,
    FAILED_DEPENDENCY = 424,
    ITEM_NOT_FOUND = 444,
    ITEM_ALREADY_EXIST = 445,
    ITEM_INVALID = 446,
    ITEM_IS_USING = 447,
    USER_HAVE_NOT_PERMISSION = 448,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
    NETWORK_ERROR = 512,
}

export enum DATE_TIME_FORMAT {
    YYYY_MM_DD_HYPHEN = 'YYYY-MM-DD',
    DD_MM_YYYY_DASH = 'DD/MM/YYYY',
    hh_mm_L_COLON = 'h:mm L',
    DD_MM_YY_DASH = 'DD/MM/YYYY',
    hh_mm = 'hh:mm',
    DD = 'DD',
    DAY_NAME_MONTH_STRING = 'dddd (DD-MM)',
    YYYY = 'YYYY',
    YYYY_MM_HYPHEN = 'YYYY-MM',
    HH_MM_SS_COLON = 'HH:mm:ss',
    HH_MM_COLON = 'HH:mm',
    YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON = 'YYYY-MM-DD HH:mm:ss',
    YYYY_MM_DD_HYPHEN_HH_MM_COLON = 'YYYY-MM-DD HH:mm',
    DD_MM_YYYY_SLASH = 'DD/MM/YYYY',
    MM_DD_YYYY_SLASH_HH_MM_SS_COLON = 'MM/DD/YYYY HH:mm:ss',
    MM_DD_YYYY_SLASH_HH_MM_COLON = 'MM/DD/YYYY HH:mm',
    MM_DD_YYYY_SLASH = 'MM/DD/YYYY',
}

export const FORM_VALIDATION = {
    textMaxLength: 255,
    textAreaMaxLength: 2000,
    passwordMinLength: 6,
    phoneRegExp: /^([0-9 +-]){3,40}$/,
    nameRegExp: /^([^!@`~#$:%^*&()<>?\\/\\+|=]+?)$/,
    specialCharacters: /[~`!@#$%^&*()+={}[\];:'"<>.,/\\?-_]/g,
    email: /^(([a-zA-Z0-9 +]+)([.-]{1})?)*[a-zA-Z0-9]@([a-zA-Z0-9 -]+[.])+[a-zA-Z0-9]+$/,
    firstChildFolderRegex: /^\/[^/]*$/,
};

export enum OrderDirection {
    ASCENDING = 'ascending',
    DESCENDING = 'descending',
}

export const INTEGER_ALLOW_CODES = [
    // Character 0-9  in Numpad
    'Numpad0',
    'Numpad1',
    'Numpad2',
    'Numpad3',
    'Numpad4',
    'Numpad5',
    'Numpad6',
    'Numpad7',
    'Numpad8',
    'Numpad9',

    // Character 0-9
    'Digit0',
    'Digit1',
    'Digit2',
    'Digit3',
    'Digit4',
    'Digit5',
    'Digit6',
    'Digit7',
    'Digit8',
    'Digit9',

    // Character control
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',

    // Negative number
    'Minus',
    'NumpadSubtract',
];

export const DECIMAL_ALLOW_CODES = [
    // Character 0-9  in Numpad
    'Numpad0',
    'Numpad1',
    'Numpad2',
    'Numpad3',
    'Numpad4',
    'Numpad5',
    'Numpad6',
    'Numpad7',
    'Numpad8',
    'Numpad9',

    // Character 0-9
    'Digit0',
    'Digit1',
    'Digit2',
    'Digit3',
    'Digit4',
    'Digit5',
    'Digit6',
    'Digit7',
    'Digit8',
    'Digit9',

    // Character decimal
    'NumpadDecimal',
    'Period',

    // Character control
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',

    // Negative number
    'Minus',
    'NumpadSubtract',
];

// textarea
export const TEXTAREA_DEFAULT_ROWS = 3;
export const TEXTAREA_MAX_ROW = 10;
export const TEXTAREA_MAX_LENGTH = 2000;
export const MAX_INTEGER = 4294967295;

export enum AccessModules {
    SPACIALYTIC_PLATFORM = 'spacialytic_platform',
    SPACIALYTIC_3DWEBVIEWER = 'spacialytic_3dwebviewer',
    SPACIALYTIC_CONSTELLATION = 'spacialytic_constellation',
}

export enum UserRoles {
    ADMIN = 'admin',
    NORMAL_USER = 'normal_user',
    NONE = 'none',
}

export enum UserStatus {
    REGISTERING = 'registering',
    ACTIVE = 'active',
    // INACTIVE = 'inactive',
    REJECTED = 'rejected',
}

export const AccessModuleOptions = [
    {
        label: 'app.accessModule.spacialytic_platform',
        value: AccessModules.SPACIALYTIC_PLATFORM,
        order: 1,
    },
    {
        label: 'app.accessModule.spacialytic_constellation',
        value: AccessModules.SPACIALYTIC_CONSTELLATION,
        order: 2,
    },
    {
        label: 'app.accessModule.spacialytic_3dwebviewer',
        value: AccessModules.SPACIALYTIC_3DWEBVIEWER,
        order: 3,
    },
];

export const LanguageOptions = [
    {
        label: 'app.menuLanguage.en',
        value: SUPPORT_LANGUAGE.EN,
    },
    {
        label: 'app.menuLanguage.fr',
        value: SUPPORT_LANGUAGE.FR,
    },
];

export enum Timezones {
    'GMT+00:00' = 'GMT+00:00',
    'GMT+01:00' = 'GMT+01:00',
    'GMT+02:00' = 'GMT+02:00',
    'GMT+03:00' = 'GMT+03:00',
    'GMT+04:00' = 'GMT+04:00',
    'GMT+05:00' = 'GMT+05:00',
    'GMT+06:00' = 'GMT+06:00',
    'GMT+07:00' = 'GMT+07:00',
    'GMT+08:00' = 'GMT+08:00',
    'GMT+09:00' = 'GMT+09:00',
    'GMT+10:00' = 'GMT+10:00',
    'GMT+11:00' = 'GMT+11:00',
    'GMT+12:00' = 'GMT+12:00',
    'GMT-01:00' = 'GMT-01:00',
    'GMT-02:00' = 'GMT-02:00',
    'GMT-03:00' = 'GMT-03:00',
    'GMT-04:00' = 'GMT-04:00',
    'GMT-05:00' = 'GMT-05:00',
    'GMT-06:00' = 'GMT-06:00',
    'GMT-07:00' = 'GMT-07:00',
    'GMT-08:00' = 'GMT-08:00',
    'GMT-09:00' = 'GMT-09:00',
    'GMT-10:00' = 'GMT-10:00',
    'GMT-11:00' = 'GMT-11:00',
}

export const TimezonesOptions = [
    {
        label: 'app.timezones.GMT+00:00',
        value: Timezones['GMT+00:00'],
    },
    {
        label: 'app.timezones.GMT+01:00',
        value: Timezones['GMT+01:00'],
    },
    {
        label: 'app.timezones.GMT+02:00',
        value: Timezones['GMT+02:00'],
    },
    {
        label: 'app.timezones.GMT+03:00',
        value: Timezones['GMT+03:00'],
    },
    {
        label: 'app.timezones.GMT+04:00',
        value: Timezones['GMT+04:00'],
    },
    {
        label: 'app.timezones.GMT+05:00',
        value: Timezones['GMT+05:00'],
    },
    {
        label: 'app.timezones.GMT+06:00',
        value: Timezones['GMT+06:00'],
    },
    {
        label: 'app.timezones.GMT+07:00',
        value: Timezones['GMT+07:00'],
    },
    {
        label: 'app.timezones.GMT+08:00',
        value: Timezones['GMT+08:00'],
    },
    {
        label: 'app.timezones.GMT+09:00',
        value: Timezones['GMT+09:00'],
    },
    {
        label: 'app.timezones.GMT+10:00',
        value: Timezones['GMT+10:00'],
    },
    {
        label: 'app.timezones.GMT+11:00',
        value: Timezones['GMT+11:00'],
    },
    {
        label: 'app.timezones.GMT+12:00',
        value: Timezones['GMT+12:00'],
    },
    {
        label: 'app.timezones.GMT-01:00',
        value: Timezones['GMT-01:00'],
    },
    {
        label: 'app.timezones.GMT-02:00',
        value: Timezones['GMT-02:00'],
    },
    {
        label: 'app.timezones.GMT-03:00',
        value: Timezones['GMT-03:00'],
    },
    {
        label: 'app.timezones.GMT-04:00',
        value: Timezones['GMT-04:00'],
    },
    {
        label: 'app.timezones.GMT-05:00',
        value: Timezones['GMT-05:00'],
    },
    {
        label: 'app.timezones.GMT-06:00',
        value: Timezones['GMT-06:00'],
    },
    {
        label: 'app.timezones.GMT-07:00',
        value: Timezones['GMT-07:00'],
    },
    {
        label: 'app.timezones.GMT-08:00',
        value: Timezones['GMT-08:00'],
    },
    {
        label: 'app.timezones.GMT-09:00',
        value: Timezones['GMT-09:00'],
    },
    {
        label: 'app.timezones.GMT-10:00',
        value: Timezones['GMT-10:00'],
    },
    {
        label: 'app.timezones.GMT-11:00',
        value: Timezones['GMT-11:00'],
    },
];

export const DEFAULT_FIRST_PAGE = 1;
export const LIMIT_PER_PAGE = 10;
export const LIMIT_FOR_DROPDOWN = 1000;
export const LIMIT_FOR_EXPORT = 100;

export const DEFAULT_ORDER_BY = 'createdAt';
export const DEFAULT_ORDER_DIRECTION = OrderDirection.DESCENDING;

export const Regex = {
    URI: /^https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/,
    EMAIL: /^(([a-zA-Z0-9]+)([.]{1})?)*[a-zA-Z0-9]@([a-zA-Z0-9]+[.])+[a-zA-Z0-9]+$/,
    NUMBER: /^(?:[0-9]\d*|)$/,
    CODE: /^[a-zA-Z\-_0-9]+$/,
    PASSWORD: /^.*([a-zA-Z].*[0-9]|[0-9].*[a-zA-Z]).*$/,
    OBJECT_ID: /^[0-9a-fA-F]{24}$/,
    FOLDER_PATH: /^([a-zàâçéèêëîïôûùüÿñæœ0-9_.()-\s'])*$/i,
    FODLER_NAME: /^([a-zàâçéèêëîïôûùüÿñæœ0-9_.()-\s'])*$/i,
    FILE_NAME: /^(?!.*\.$)(?!.*\.\.)[a-zàâçéèêëîïôûùüÿñæœ0-9_.()-\s']+$/i,
    COLOR_CODE: /^#[0-9a-fA-F]{6}$/,
};

export const EXCEL_ACCEPTED_FILE_TYPES = ['xls', 'xlsx', 'csv'];
export const XML_ACCEPTED_FILE_TYPES = ['xml'];

export const MAX_FILE_SIZE_IN_BYTE = 2097152; // 2MB = 2097152B

export enum BooleanEnum {
    TRUE = 'true',
    FALSE = 'false',
}

export const SidebarWidth = {
    expand: '230px',
    collapse: '74px',
};
export const MAX_UPLOAD_FILE_SIZE_IN_BYTE = 20971520; // 20MB = 20971520

export const megaByteToByteRateInDecimal = 1000000;

export const kiloByteToByteRateInDecimal = 1000;

export const megaByteToByteRate = 1048576;

export const INTEGER_POSITIVE_MIN_VALUE = 1;
export const INTEGER_POSITIVE_MAX_VALUE = 4294967295;

export const MAX_FTP_UPLOAD_FILE_SIZE_IN_BYTE = 10240 * megaByteToByteRate;

export enum FTPDataType {
    FOLDER = 'folder',
    FILE = 'file',
}

export const rootFolderPath = '/';

export const maxFolderLevel = 8;

export enum ExportType {
    ZONE = 'zone',
    BOX4D = '4dbox',
    EXPORT = 'export',
    SAVE_AS = 'saveAs',
}

export enum ExportFormat3D {
    '3DSP' = '3DSP',
    PRC = 'PRC',
    PDFPRC = 'PDFPRC',
    STEP = 'STEP',
    IGES = 'IGES',
    PARASOLID = 'PARASOLID',
    STL = 'STL',
    U3D = 'U3D',
    ACIS = 'ACIS',
    JT = 'JT',
    VRML = 'VRML',
    VSXML = 'VSXML',
    IFC = 'IFC',
    '3MF' = '3MF',
    FBX = 'FBX',
    GLTF = 'GLTF',
    OBJ = 'OBJ',
}

export enum ExportFormat2D {
    PNG = 'PNG',
    JPG = 'JPG',
    SVG = 'SVG',
    DXF = 'DXF',
    PDF = 'PDF',
    CGM = 'CGM',
    BMP = 'BMP',
}

export enum ExportFormatExtension {
    '3DSP' = '3dsp',
    PRC = 'prc',
    PDFPRC = 'pdfprc',
    STEP = 'step',
    IGES = 'igs',
    PARASOLID = 'x_t',
    STL = 'stl',
    U3D = 'u3d',
    ACIS = 'sat',
    JT = 'jt',
    VRML = 'vrml',
    VSXML = 'vsxml',
    IFC = 'ifc',
    '3MF' = '3mf',
    FBX = 'fbx',
    GLTF = 'gltf',
    OBJ = 'obj',
    PNG = 'png',
    JPG = 'jpg',
    SVG = 'svg',
    DXF = 'dxf',
    PDF = 'pdf',
    CGM = 'cgm',
    BMP = 'bmp',
}

export const MAX_CONCURRENCY_UPLOAD_FILE = 10;

export const FILE_NAME_MAX_LENGTH = 200;

export const COLOR_CODE_LENGTH = 7;
