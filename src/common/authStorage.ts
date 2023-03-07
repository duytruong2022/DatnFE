import { SecurityPermissions } from './../features/security-profile/constants';
import { IPbsPermission, IPlanningPermission, IUser } from '@/features/auth/interfaces';
import { AccessModules, DEFAULT_LANGUAGE, SUPPORT_LANGUAGE } from './constants';
import { isStringify } from './helpers';
import { ILoginedUser } from './interfaces';
import { storage } from './localStorage';
import { authSessionStorage } from './sessionStorage';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';

const BUFFER_TIME = 60 * 1000; // 60s

export const enum AUTH_SERVICE_KEY {
    ACCESS_TOKEN = 'ACCESS_TOKEN',
    REFRESH_TOKEN = 'REFRESH_TOKEN',
    USER = 'USER',
    LANGUAGE = 'LANGUAGE',
    SELECTED_ACCESS_MODULE = 'SELECTED_ACCESS_MODULE',
    ACCESS_TOKEN_EXPIRED_AT = 'ACCESS_TOKEN_EXPIRED_AT',
    REFRESH_TOKEN_EXPIRED_AT = 'REFRESH_TOKEN_EXPIRED_AT',
    ACCESS_LOG_ID = 'ACCESS_LOG_ID',
    LOGINED_USERS = 'LOGINED_USERS',
    SELECTED_PROJECT_ID = 'SELECTED_PROJECT_ID',
    PERMISSIONS = 'PERMISSIONS',
    PROJECT_SECURITY_PERMISSIONS = 'PROJECT_SECURITY_PERMISSIONS',
    PBS_GROUP_PERMISSIONS = 'PBS_GROUP_PERMISSIONS',
    PLANNING_PERMISSIONS = 'PLANNING_PERMISSIONS',
    SELECTED_PROJECT_ADMIN_ID = 'SELECTED_PROJECT_ADMIN_ID',
}
class LocalStorageAuthService {
    // LANGUAGE
    setLanguage(value: SUPPORT_LANGUAGE): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.LANGUAGE, value);
    }
    getLanguage(): SUPPORT_LANGUAGE {
        return (storage.getLocalStorage(AUTH_SERVICE_KEY.LANGUAGE) ||
            DEFAULT_LANGUAGE) as SUPPORT_LANGUAGE;
    }

    // SELECTED_ACCESS_MODULE
    setSelectedAccessModule(value: AccessModules | null) {
        storage.setLocalStorage(AUTH_SERVICE_KEY.SELECTED_ACCESS_MODULE, value || '');
    }
    getSelectedAccessModule(): AccessModules {
        return storage.getLocalStorage(
            AUTH_SERVICE_KEY.SELECTED_ACCESS_MODULE || null,
        ) as AccessModules;
    }
    resetSelectedAccessModule(): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.SELECTED_ACCESS_MODULE, '');
    }

    // PERMISSIONS
    setPermissions(permissions: SecurityPermissions[]): void {
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.PERMISSIONS,
            JSON.stringify(permissions),
        );
    }
    getPermissions(): SecurityPermissions[] {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.PERMISSIONS).length
            ? JSON.parse(storage.getLocalStorage(AUTH_SERVICE_KEY.PERMISSIONS))
            : [];
    }
    resetPermissions(): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.PERMISSIONS, '');
    }

    // PROJECT SECURITY PERMISSIONS
    setProjectSecurityPermissions(permissions: ProjectSecurityPermissions[]): void {
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.PROJECT_SECURITY_PERMISSIONS,
            JSON.stringify(permissions),
        );
    }
    getProjectSecurityPermissions(): ProjectSecurityPermissions[] {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.PROJECT_SECURITY_PERMISSIONS)
            .length
            ? JSON.parse(
                  storage.getLocalStorage(AUTH_SERVICE_KEY.PROJECT_SECURITY_PERMISSIONS),
              )
            : [];
    }
    resetProjectSecurityPermissions(): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.PROJECT_SECURITY_PERMISSIONS, '');
    }

    // PROJECT PBS PERMISSIONS
    setPbsGroupPermissions(pbsGroupPermissions: IPbsPermission[]): void {
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.PBS_GROUP_PERMISSIONS,
            JSON.stringify(pbsGroupPermissions),
        );
    }
    getPbsGroupPermissions(): IPbsPermission[] {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.PBS_GROUP_PERMISSIONS).length
            ? JSON.parse(storage.getLocalStorage(AUTH_SERVICE_KEY.PBS_GROUP_PERMISSIONS))
            : [];
    }

    // PROJECT PLANNING PERMISSIONS
    setPlanningPermissions(planningPermissions: IPlanningPermission): void {
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.PLANNING_PERMISSIONS,
            JSON.stringify(planningPermissions),
        );
    }
    getPlanningPermissions(): IPlanningPermission {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.PLANNING_PERMISSIONS).length
            ? JSON.parse(storage.getLocalStorage(AUTH_SERVICE_KEY.PLANNING_PERMISSIONS))
            : [];
    }

    // LOGIN USER
    setUser(user: null | IUser): void {
        if (!user) {
            storage.setLocalStorage(AUTH_SERVICE_KEY.USER, '');
        }
        if (!isStringify(user)) {
            return;
        }
        storage.setLocalStorage(AUTH_SERVICE_KEY.USER, JSON.stringify(user));
    }
    getUser(): IUser {
        return storage.getObjectFromKey(AUTH_SERVICE_KEY.USER) as IUser;
    }
    getSelectedProjectId(): string {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.SELECTED_PROJECT_ID) as string;
    }
    setSelectedProjectId(selectedProjectId: string) {
        storage.setLocalStorage(AUTH_SERVICE_KEY.SELECTED_PROJECT_ID, selectedProjectId);
    }

    // ACCESS_LOG_ID
    setAccessLogId(accessLogId: string): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.ACCESS_LOG_ID, accessLogId);
    }
    getAccessLogId(): string {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.ACCESS_LOG_ID);
    }
    resetAccessLogId(): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.ACCESS_LOG_ID, '');
    }

    // SELECTED_PROJECT_ADMIN_ID
    setProjectAdminId(id: string): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.SELECTED_PROJECT_ADMIN_ID, id);
    }
    getProjectAdminId(): string {
        return storage.getLocalStorage(AUTH_SERVICE_KEY.SELECTED_PROJECT_ADMIN_ID) || '';
    }
    resetProjectAdminId(): void {
        storage.setLocalStorage(AUTH_SERVICE_KEY.SELECTED_PROJECT_ADMIN_ID, '');
    }

    // LOGINED USERs
    getLoginedUsers(): ILoginedUser[] {
        return storage.getObjectFromKey(AUTH_SERVICE_KEY.LOGINED_USERS) as ILoginedUser[];
    }

    addLoginedUser(loginedUser: ILoginedUser): void {
        let loginedUsers = this.getLoginedUsers();
        if (loginedUsers.length) {
            const loginedUserIndex = loginedUsers.findIndex(
                (user) => user.user.email === loginedUser.user.email,
            );
            if (loginedUserIndex !== -1) {
                loginedUsers[loginedUserIndex] = loginedUser;
            } else {
                loginedUsers.push(loginedUser);
            }
        } else {
            loginedUsers = [loginedUser];
        }
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.LOGINED_USERS,
            JSON.stringify(loginedUsers),
        );
    }

    removeLoginedUser(loginedUser: ILoginedUser): void {
        const loginedUsers = this.getLoginedUsers();
        if (loginedUsers.length) {
            const loginedUserIndex = loginedUsers.findIndex(
                (user) => user.user.email === loginedUser.user.email,
            );
            if (loginedUserIndex !== -1) {
                loginedUsers.splice(loginedUserIndex, loginedUserIndex + 1);
            }
        }
        storage.setLocalStorage(
            AUTH_SERVICE_KEY.LOGINED_USERS,
            JSON.stringify(loginedUsers),
        );
    }

    resetAll(): void {
        this.resetSelectedAccessModule();
        this.resetAccessLogId();
        this.resetPermissions();
        this.resetProjectSecurityPermissions();
        this.resetProjectAdminId();
        this.setSelectedProjectId('');
        this.setUser(null);
    }
}

class SessionStorageAuthService {
    // ACCESS_TOKEN
    setAccessToken(token: string): void {
        authSessionStorage.setSessionStorage(AUTH_SERVICE_KEY.ACCESS_TOKEN, token);
    }
    getAccessToken(): string {
        return authSessionStorage.getSessionStorage(AUTH_SERVICE_KEY.ACCESS_TOKEN);
    }
    resetAccessToken(): void {
        authSessionStorage.setSessionStorage(AUTH_SERVICE_KEY.ACCESS_TOKEN, '');
    }
    // ACCESS_TOKEN_EXPIRED_AT
    getAccessTokenExpiredAt(): number {
        return +authSessionStorage.getSessionStorage(
            AUTH_SERVICE_KEY.ACCESS_TOKEN_EXPIRED_AT,
        );
    }
    setAccessTokenExpiredAt(expiredIn: number): void {
        const expiredAt = new Date().getTime() + expiredIn * 1000 - BUFFER_TIME;
        authSessionStorage.setSessionStorage(
            AUTH_SERVICE_KEY.ACCESS_TOKEN_EXPIRED_AT,
            String(expiredAt),
        );
    }
    resetAccessTokenExpiredAt(): void {
        authSessionStorage.setSessionStorage(
            AUTH_SERVICE_KEY.ACCESS_TOKEN_EXPIRED_AT,
            '',
        );
    }
    // REFRESH_TOKEN
    setRefreshToken(token: string): void {
        authSessionStorage.setSessionStorage(AUTH_SERVICE_KEY.REFRESH_TOKEN, token);
    }
    getRefreshToken(): string {
        return authSessionStorage.getSessionStorage(AUTH_SERVICE_KEY.REFRESH_TOKEN);
    }
    resetRefreshToken(): void {
        authSessionStorage.setSessionStorage(AUTH_SERVICE_KEY.REFRESH_TOKEN, '');
    }
    // REFRESH_TOKEN_EXPIRED_AT
    setRefreshTokenExpiredAt(expiredIn: number): void {
        const expiredAt = new Date().getTime() + expiredIn * 1000 - BUFFER_TIME;
        authSessionStorage.setSessionStorage(
            AUTH_SERVICE_KEY.REFRESH_TOKEN_EXPIRED_AT,
            String(expiredAt),
        );
    }
    getRefreshTokenExpiredAt(): number {
        return +authSessionStorage.getSessionStorage(
            AUTH_SERVICE_KEY.REFRESH_TOKEN_EXPIRED_AT,
        );
    }
    resetRefreshTokenExpiredAt(): void {
        authSessionStorage.setSessionStorage(
            AUTH_SERVICE_KEY.REFRESH_TOKEN_EXPIRED_AT,
            '',
        );
    }

    resetAll(): void {
        this.resetAccessToken();
        this.resetAccessTokenExpiredAt();
        this.resetRefreshToken();
        this.resetRefreshTokenExpiredAt();
    }
}

const localStorageAuthService = new LocalStorageAuthService();
export default localStorageAuthService;

export const sessionStorageAuthService = new SessionStorageAuthService();
