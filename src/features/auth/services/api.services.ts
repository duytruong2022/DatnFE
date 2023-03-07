import { ApiService } from '@/common/services/api';
import { IBodyResponse } from '@/common/interfaces';
import service from '@/plugins/axios';
import {
    IActive,
    IChangePasswordForm,
    IForgotPasswordForm,
    ILoginForm,
    ILoginLDAPForm,
    ILoginResponse,
    ILogoutBody,
    IRegisterForm,
    IUpdateProfileBody,
    IUser,
    IProjectSecurityPermissions,
    IViewer3dPermissions,
    IConstellationSecurityPermissions,
    ILogoutOtherDeviceBody,
    IPreLoginResponse,
} from '../interfaces';

class AuthApiService extends ApiService {
    login(user: ILoginForm) {
        return this.client.post<ILoginResponse, IBodyResponse<ILoginResponse>>(
            `${this.baseUrl}/login`,
            user,
        );
    }

    preLogin(user: ILoginForm) {
        return this.client.post<IPreLoginResponse, IBodyResponse<IPreLoginResponse>>(
            `${this.baseUrl}/pre-login`,
            user,
        );
    }

    loginLDAP(user: ILoginLDAPForm) {
        return this.client.post<ILoginResponse, IBodyResponse<ILoginResponse>>(
            `${this.baseUrl}/login-ldap`,
            user,
        );
    }

    preLoginLDAP(user: ILoginLDAPForm) {
        return this.client.post<IPreLoginResponse, IBodyResponse<IPreLoginResponse>>(
            `${this.baseUrl}/login-ldap`,
            user,
        );
    }

    register(user: IRegisterForm) {
        return this.client.post<ILoginResponse, IBodyResponse<ILoginResponse>>(
            `${this.baseUrl}/register`,
            user,
        );
    }

    active(data: IActive) {
        return this.client.post<ILoginResponse, IBodyResponse<ILoginResponse>>(
            `${this.baseUrl}/active-user`,
            data,
        );
    }

    activeNewPassword(data: IActive) {
        return this.client.post<ILoginResponse, IBodyResponse<ILoginResponse>>(
            `${this.baseUrl}/active-new-password`,
            data,
        );
    }

    async getProfile() {
        return await this.client.get<void, IBodyResponse<IUser>>(
            `${this.baseUrl}/profile`,
        );
    }

    async updateProfile(body: IUpdateProfileBody) {
        this.beforeUpdate(body);
        return await this.client.patch<IUpdateProfileBody, IBodyResponse<IUser>>(
            `${this.baseUrl}/profile`,
            body,
        );
    }

    logout(body: ILogoutBody) {
        return this.client.post<boolean, IBodyResponse<boolean>>(
            `${this.baseUrl}/logout`,
            body,
        );
    }

    async changePassword(data: IChangePasswordForm) {
        this.beforeCreate<IChangePasswordForm>(data);
        return await this.client.patch<IUser, IBodyResponse<IUser>>(
            `${this.baseUrl}/change-password`,
            data,
        );
    }

    async getConstellationSecurityPermissions() {
        return await this.client.get<
            IProjectSecurityPermissions,
            IBodyResponse<IConstellationSecurityPermissions>
        >(`${this.baseUrl}/constellation-security-permission`);
    }

    async getProjectSecurityPermissions(projectId: string) {
        return await this.client.get<
            IProjectSecurityPermissions,
            IBodyResponse<IProjectSecurityPermissions>
        >(`${this.baseUrl}/project/${projectId}/security-permission`);
    }

    async getviewer3dPermissions(): Promise<IBodyResponse<IViewer3dPermissions>> {
        return await this.client.get(`${this.baseUrl}/3d-viewer-permission`);
    }

    forgotPassword(body: IForgotPasswordForm) {
        return this.client.post<void, IBodyResponse<void>>(
            `${this.baseUrl}/request-reset-password`,
            body,
        );
    }

    logoutOtherDevice(body: ILogoutOtherDeviceBody) {
        return this.client.post<boolean, IBodyResponse<boolean>>(
            `${this.baseUrl}/logout-other-device`,
            body,
        );
    }
}

export const authService = new AuthApiService({ baseUrl: '/auth' }, service);
