import {
    ProjectSecurityPermissionseparators,
    ProfilePermissionPrefix,
} from './../features/3D-viewer-profile/constants';
import localStorageAuthService from '@/common/authStorage';
import mapKeys from 'lodash/mapKeys';
import isPlainObject from 'lodash/isPlainObject';
import trim from 'lodash/trim';
import i18n from '@/plugins/vue-i18n';
import { ElMessageBox, ElNotification } from 'element-plus';
import { IDropDownOption, IFTPFile, ITreeOption, IViewer3DTab } from './interfaces';
import { IImportResponse, IPbsPermission } from '@/features/auth/interfaces';
import { IUserAccessModule } from '@/features/auth/interfaces';
import {
    UserStatus,
    AccessModules,
    UserRoles,
    rootFolderPath,
    FORM_VALIDATION,
} from './constants';
import { SecurityPermissions } from '@/features/security-profile/constants';
import countBy from 'lodash/countBy';
import intersection from 'lodash/intersection';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import axios from 'axios';

export function isJson(str: string): boolean {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// eslint-disable-next-line
export function trimObject(body: any): void {
    // eslint-disable-next-line
    const trimValue = (item: any) => {
        mapKeys(item, (value, key) => {
            // remove string contain only space characters
            if (typeof value === 'string') {
                item[key] = value.trim();
            }

            // iterate array
            else if (Array.isArray(value)) {
                value.forEach((subValue, index) => {
                    // remove string contain only space characters
                    if (typeof subValue === 'string' && !trim(subValue as string)) {
                        value.splice(index, 1);
                    } else if (isPlainObject(subValue)) {
                        trimValue(subValue);
                    }
                });
            } else if (isPlainObject(value)) {
                trimValue(value);
            }
        });
    };

    trimValue(body);
}

export function translateYupErrorHelper(
    yupError:
        | {
              i18nKey: string;
              params?: Record<string, string>;
          }
        | string,
): string {
    if (typeof yupError === 'string') {
        return i18n.global.t(yupError);
    }
    if (!yupError?.i18nKey) return '';
    return i18n.global.t(yupError?.i18nKey, { ...yupError?.params });
}

export function isStringify<T>(obj: T | Record<string, unknown>): boolean {
    try {
        JSON.stringify(obj);
    } catch (e) {
        return false;
    }
    return true;
}

export async function showConfirmPopUpFunction(
    message: string,
    title: string,
    options?: {
        confirmButtonText?: string | undefined;
        cancelButtonText?: string | undefined;
        confirmButtonClass?: string | undefined;
        cancelButtonClass?: string | undefined;
        distinguishCancelAndClose?: boolean | undefined;
        type?: 'success' | 'info' | 'warning' | 'error' | undefined;
        showCancelButton?: boolean | undefined;
    },
): Promise<void | 'confirm' | 'close' | 'cancel'> {
    const confirmButtonText =
        options?.confirmButtonText || (i18n.global.t('app.buttons.confirm') as string);
    const cancelButtonText =
        options?.cancelButtonText || (i18n.global.t('app.buttons.cancel') as string);
    const confirmButtonClass = options?.confirmButtonClass || 'el-button--danger';
    const cancelButtonClass = options?.cancelButtonClass || 'el-button--default';
    const distinguishCancelAndClose = options?.distinguishCancelAndClose || true;
    const type = options?.type || 'warning';
    const showCancelButton = options?.showCancelButton || true;

    const result = await ElMessageBox.confirm(
        message,
        title,
        {
            distinguishCancelAndClose,
            type,
            confirmButtonText,
            cancelButtonText,
            confirmButtonClass,
            cancelButtonClass,
            showCancelButton,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ).catch(() => {});
    return result;
}

type ElNotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export function showSuccessNotificationFunction(
    message: string,
    title?: string,
    position?: ElNotificationPosition,
): void {
    ElNotification({
        type: 'success',
        title: title || (i18n.global.t('app.notification') as string),
        message,
        position: position || 'top-right',
    });
}

export function showErrorNotificationFunction(message?: string, title?: string): void {
    ElNotification({
        type: 'error',
        title: title || (i18n.global.t('app.notification') as string),
        message,
    });
}

export function hasPermissionToAccessRouteInConstellation(
    requiredPermissions: SecurityPermissions[],
): boolean {
    if (
        !requiredPermissions?.length ||
        localStorageAuthService.getSelectedAccessModule() !==
            AccessModules.SPACIALYTIC_CONSTELLATION
    )
        return true;

    const isConstellationAdmin = localStorageAuthService
        .getUser()
        .accessModules?.some(
            (userAccessModule) =>
                userAccessModule.module === AccessModules.SPACIALYTIC_CONSTELLATION &&
                userAccessModule.roles.includes(UserRoles.ADMIN),
        );
    if (!isConstellationAdmin) {
        return (
            intersection(requiredPermissions, localStorageAuthService.getPermissions())
                .length > 0
        );
    }
    return true;
}

export function getAccessModules(role: UserRoles): AccessModules[] {
    const userAccessModules = localStorageAuthService.getUser()?.accessModules || [];
    return userAccessModules
        .filter((userAccessModule) => userAccessModule.roles.includes(role))
        .map((userAccessModule) => userAccessModule.module);
}

export function hasPermissionToAccessRouteInProject(
    requiredPermissions: ProjectSecurityPermissions[],
): boolean {
    const adminAccessModule = getAccessModules(UserRoles.ADMIN);
    if (
        !requiredPermissions?.length ||
        localStorageAuthService.getSelectedAccessModule() !==
            AccessModules.SPACIALYTIC_CONSTELLATION ||
        localStorageAuthService.getProjectAdminId() ===
            localStorageAuthService.getUser()._id ||
        adminAccessModule.includes(AccessModules.SPACIALYTIC_CONSTELLATION)
    )
        return true;

    return (
        intersection(
            requiredPermissions,
            localStorageAuthService.getProjectSecurityPermissions(),
        ).length > 0
    );
}

export function getUserRoles(accessModule: AccessModules): UserRoles[] {
    const module = localStorageAuthService
        .getUser()
        .accessModules?.find(
            (accessibleModule) => accessibleModule.module === accessModule,
        );
    return module?.roles || [];
}

export function hasConstellationPermission(
    requiredPermissions: SecurityPermissions[],
): boolean {
    if (
        !requiredPermissions?.length ||
        localStorageAuthService.getSelectedAccessModule() !==
            AccessModules.SPACIALYTIC_CONSTELLATION
    )
        return true;

    return (
        intersection(requiredPermissions, localStorageAuthService.getPermissions())
            .length > 0
    );
}

export function parseLanguageSelectOptions(
    options: IDropDownOption[] = [],
): IDropDownOption[] {
    return options.map((option: IDropDownOption) => ({
        label: i18n.global.t(`${option.label}`),
        value: option.value,
    }));
}

export const downloadFile = async (fileName: string, url: string): Promise<void> => {
    const res = await axios.get(url, {
        responseType: 'arraybuffer',
    });
    const blob = new Blob([res.data], { type: 'text' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const downloadFileFromBase64 = (fileName: string, url: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
};

// parse error retrieved from api when import data
export function parseImportErrors(
    importErrors: Record<string, IImportResponse>,
): Record<string, Record<string, string>> {
    let errors = {};
    // parse error for each attribute
    Object.keys(importErrors).forEach((key) => {
        if (!importErrors[key].isValid) {
            let currentError = {};
            importErrors[key].errors.forEach((error) => {
                currentError = {
                    ...currentError,
                    [error.column]: error.errorMessage,
                };
            });
            errors = {
                ...errors,
                [key]: currentError,
            };
        }
    });
    return errors;
}

export function checkHasActiveModule(
    accessModules: IUserAccessModule[] | undefined,
    status: UserStatus,
): boolean {
    return (accessModules || []).some(
        (accessModule) =>
            accessModule.module &&
            accessModule.roles.length &&
            status === UserStatus.ACTIVE,
    );
}

export function structure3DViewerPermissions(permissionList: string[]): IViewer3DTab[] {
    const viewer3DTabs: IViewer3DTab[] = [];
    permissionList.forEach((permission) => {
        const tabName =
            permission
                .split(ProjectSecurityPermissionseparators.TABS)[1]
                .split(ProjectSecurityPermissionseparators.GROUPS)[0] || '';
        const groupName =
            permission
                .split(ProjectSecurityPermissionseparators.GROUPS)[1]
                .split(ProjectSecurityPermissionseparators.FUNCTIONS)[0] || '';
        const funcName =
            permission.split(ProjectSecurityPermissionseparators.FUNCTIONS)[1] || '';

        const tab = viewer3DTabs.find((tab) => tab.tab === tabName);
        if (tab) {
            const group = tab.groups.find((group) => group.group === groupName);
            if (group) {
                const func = group.funcs.find((func) => func === funcName);
                if (!func) {
                    group.funcs.push(funcName);
                }
            } else {
                tab.groups.push({
                    group: groupName,
                    funcs: [funcName],
                    withoutFunctions: [],
                });
            }
        } else {
            viewer3DTabs.push({
                tab: tabName,
                groups: [
                    {
                        group: groupName,
                        funcs: [funcName],
                        withoutFunctions: [],
                    },
                ],
            });
        }
    });
    return viewer3DTabs;
}

export function transform3DViewerPermission(permissionList: string[]): string[] {
    const permissions = [...permissionList];
    for (let i = 0; i < permissions.length; i++) {
        permissions[i] = permissions[i]
            .replace(
                ProjectSecurityPermissionseparators.TABS,
                ProjectSecurityPermissionseparators.TABS_COMPACT,
            )
            .replace(
                ProjectSecurityPermissionseparators.GROUPS,
                ProjectSecurityPermissionseparators.GROUPS_COMPACT,
            )
            .replace(
                ProjectSecurityPermissionseparators.FUNCTIONS,
                ProjectSecurityPermissionseparators.FUNCTIONS_COMPACT,
            )
            .substring(ProfilePermissionPrefix.WEBVIEWER3D.length);
    }
    return permissions;
}

export function generateFullIndex(permissions: IViewer3DTab[]): string[] {
    const groupFuncNameArray = [];
    const withoutPermissions = [];
    for (let tIndex = 0; tIndex < permissions.length; tIndex += 1) {
        const tab = permissions[tIndex];
        if (
            tab.groups.length === 0 ||
            tab.groups.length ===
                tab.groups.filter(
                    (group) =>
                        group.funcs.length === 0 ||
                        group.withoutFunctions.length === group.funcs.length,
                ).length
        ) {
            withoutPermissions.push(`${ProfilePermissionPrefix.TABS}${tab.tab}`);
            continue;
        }
        for (let gIndex = 0; gIndex < (tab.groups || []).length; gIndex += 1) {
            const group = tab.groups[gIndex];
            let groupIndex = 0;
            const nameCount = countBy(groupFuncNameArray);
            groupIndex = nameCount?.[group.group] || 0;

            if (
                group.funcs.length === 0 ||
                group.withoutFunctions.length === group.funcs.length
            ) {
                withoutPermissions.push(
                    `${ProfilePermissionPrefix.TABS}${tab.tab}${
                        ProjectSecurityPermissionseparators.GROUPS
                    }${group.group}${groupIndex ? `_${groupIndex}` : ''}`,
                );
                continue;
            }

            groupFuncNameArray.push(group.group);

            for (let fIndex = 0; fIndex < (group.funcs || []).length; fIndex += 1) {
                const func = group.funcs[fIndex];
                groupFuncNameArray.push(func);
            }
            for (
                let fIndex = 0;
                fIndex < (group.withoutFunctions || []).length;
                fIndex += 1
            ) {
                let funcIndex = 0;
                const nameCount = countBy(groupFuncNameArray);
                const func = group.withoutFunctions[fIndex];
                funcIndex = nameCount?.[func] - 1;

                withoutPermissions.push(
                    `${ProfilePermissionPrefix.TABS}${tab.tab}${
                        ProjectSecurityPermissionseparators.GROUPS
                    }${group.group}${groupIndex ? `_${groupIndex}` : ''}${
                        ProjectSecurityPermissionseparators.FUNCTIONS
                    }${func}${funcIndex ? `_${funcIndex}` : ''}`,
                );
            }
        }
    }
    return withoutPermissions;
}

export function serializeObjectToURL(obj: object, prefix?: string): string {
    const str: string[] = [];
    let p: string;
    for (p in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, p)) {
            const k = prefix ? prefix + '[' + p + ']' : p,
                v = obj[p as keyof typeof obj];
            str.push(
                v !== null && typeof v === 'object'
                    ? serializeObjectToURL(v, k)
                    : encodeURIComponent(k) + '=' + encodeURIComponent(v),
            );
        }
    }
    return str.join('&');
}

export function parseLanguageTreeSelectOptions(tree: ITreeOption, i18nKey: string) {
    tree.label = i18n.global.t(`${i18nKey}.${tree.value}`);
    if (tree.children?.length) {
        tree.children.forEach((child) => {
            parseLanguageTreeSelectOptions(child, i18nKey);
        });
    }
    return tree;
}

export function isAdmin(moduleName: AccessModules): boolean {
    return getAccessModules(UserRoles.ADMIN).includes(moduleName);
}

export function generateRandomColor(numColor: number): string[] {
    const randomColors = [];
    for (let index = 2; index < numColor; index++) {
        randomColors.push(
            `#${Math.floor(
                ((index * index) / Math.pow(10, Math.ceil(Math.log10(index * index)))) *
                    16777215,
            ).toString(16)}`,
        );
    }
    return randomColors;
}

export function getParentFolderByPath(path: string, folders: IFTPFile[]) {
    if (FORM_VALIDATION.firstChildFolderRegex.test(path)) {
        return folders.find((folder) => folder.path === rootFolderPath);
    }

    const parentFolders = path.split('/');

    const parentPath = parentFolders.slice(0, parentFolders.length - 1).join('/');

    return folders.find((folder) => folder.path === parentPath);
}

export function getPbsGroupPermissionsForFolder(
    folders: IFTPFile[],
    pbsGroupPermissions: IPbsPermission[],
    path: string,
): ProjectSecurityPermissions[] {
    const adminAccessModule = getAccessModules(UserRoles.ADMIN);
    if (
        localStorageAuthService.getProjectAdminId() ===
            localStorageAuthService.getUser()?._id ||
        adminAccessModule?.includes(AccessModules.SPACIALYTIC_CONSTELLATION)
    ) {
        return Object.values(ProjectSecurityPermissions);
    }

    const folder = folders.find((folder) => folder.path === path);
    if (!folder) {
        return localStorageAuthService.getProjectSecurityPermissions();
    }

    const userPbsGroupPermissions = pbsGroupPermissions.filter((pbsPermission) =>
        folder.assignedPBSIds?.includes(pbsPermission.pbsGroupId),
    );

    if (
        userPbsGroupPermissions.some(
            (userPbsGroupPermission) => userPbsGroupPermission?.permissions?.length,
        )
    ) {
        return userPbsGroupPermissions.flatMap(
            (userPbsGroupPermission) => userPbsGroupPermission.permissions || [],
        );
    }

    if (folder.path === rootFolderPath) {
        return localStorageAuthService.getProjectSecurityPermissions();
    }

    return getPbsGroupPermissionsForFolder(
        folders,
        pbsGroupPermissions,
        getParentFolderByPath(folder.path || '', folders)?.path || '',
    );
}

export function getPbsGroupPermissionsForFile(
    folders: IFTPFile[],
    files: IFTPFile[],
    pbsGroupPermissions: IPbsPermission[],
    fileId: string,
): ProjectSecurityPermissions[] {
    const adminAccessModule = getAccessModules(UserRoles.ADMIN);
    if (
        localStorageAuthService.getProjectAdminId() ===
            localStorageAuthService.getUser()?._id ||
        adminAccessModule?.includes(AccessModules.SPACIALYTIC_CONSTELLATION)
    ) {
        return Object.values(ProjectSecurityPermissions);
    }

    const file = files.find((file) => file._id === fileId);
    if (!file) {
        return localStorageAuthService.getProjectSecurityPermissions();
    }

    const userPbsGroupPermissions = pbsGroupPermissions.filter((pbsPermission) =>
        file.assignedPBSIds?.includes(pbsPermission.pbsGroupId),
    );

    if (
        userPbsGroupPermissions.some(
            (userPbsGroupPermission) => userPbsGroupPermission?.permissions?.length,
        )
    ) {
        return userPbsGroupPermissions.flatMap(
            (userPbsGroupPermission) => userPbsGroupPermission.permissions || [],
        );
    }

    return getPbsGroupPermissionsForFolder(
        folders,
        pbsGroupPermissions,
        getParentFolderByPath(file.path || '', folders)?.path || '',
    );
}
