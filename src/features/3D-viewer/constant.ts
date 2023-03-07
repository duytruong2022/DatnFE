export const WEBVIEWER3D_URL = process.env.VUE_APP_WEBVIEWER3D_URL;

export enum Viewer3DActions {
    UPLOAD_FROM_LOCAL = 'uploadFromLocal',
    IMPORT_FROM_LOCAL = 'importFromLocal',
    CREATE_ZONE = 'createZone',
    CREATE_4D_BOX = 'create4dBox',
    OPEN_FROM_REPOSITORY = 'openFromRepository',
    IMPORT_FROM_REPOSITORY = 'importFromRepository',
    EXPORT = 'exportFile',
    SAVE = 'saveFile',
    SAVE_AS = 'saveAsFile',
}

export enum DimensionType {
    '2D' = '2D',
    '3D' = '3D',
}

export enum DialogType {
    SAVE = 'SAVE',
    IMPORT = 'IMPORT',
    OPEN = 'OPEN',
}

export enum ImportSource {
    ABS = 'abs',
    REPOSITORY = 'repository',
}

export const minutesPerHour = 60;
