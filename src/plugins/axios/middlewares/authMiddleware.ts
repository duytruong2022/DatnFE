import axios, { AxiosRequestConfig } from 'axios';
import { HttpMiddleware } from './httpMiddleware';
import localStorageAuthService, {
    sessionStorageAuthService as tokenService,
} from '@/common/authStorage';
('../../../common/authStorage');
import throttle from 'lodash/throttle';
import router from '@/plugins/vue-router';
import { PageName } from '@/common/constants';
import { IBodyResponse } from '@/common/interfaces';
import { ILoginResponse } from '@/features/auth/interfaces';

export const logout = () => {
    tokenService.resetAll();
    localStorageAuthService.resetAll();
    const currentPage = router.currentRoute?.value;

    if (currentPage?.meta?.requiresAuth) {
        router.push({
            name: PageName.LOGIN_PAGE,
            query: { redirect: currentPage?.fullPath }, // Store the full path to redirect the user to after login
        });
    }
};

const sendRefreshToken = async () => {
    try {
        const response = (
            await axios.post(
                `${process.env.VUE_APP_API_URL}/auth/refresh-token`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${tokenService.getRefreshToken()}`,
                    },
                },
            )
        )?.data as IBodyResponse<ILoginResponse>;
        localStorageAuthService.setUser(response?.data?.profile);
        tokenService.setAccessToken(response?.data?.accessToken?.token);
        tokenService.setAccessTokenExpiredAt(response?.data?.accessToken?.expiresIn);
        tokenService.setRefreshToken(response?.data?.refreshToken?.token);
        tokenService.setRefreshTokenExpiredAt(response?.data?.refreshToken?.expiresIn);
        localStorageAuthService.addLoginedUser({
            user: response.data?.profile,
        });
        return response?.data;
    } catch (error) {
        logout();
    }
};

const throttled = throttle(sendRefreshToken, 10000, { trailing: false });
export default class AuthMiddleware extends HttpMiddleware {
    async onRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
        const tokenExpiredAt = tokenService.getAccessTokenExpiredAt();
        if (
            !tokenExpiredAt ||
            (tokenExpiredAt && tokenExpiredAt <= new Date().getTime())
        ) {
            // token expired, check refresh token
            const refreshToken = tokenService.getRefreshToken();
            const refreshTokenExpiredAt = +tokenService.getRefreshTokenExpiredAt();
            if (
                !refreshToken ||
                !refreshTokenExpiredAt ||
                refreshTokenExpiredAt <= new Date().getTime()
            ) {
                // refresh token expired
                logout();
            } else {
                // check refresh token ok, call refresh token api
                await throttled();
            }
        }
        // set authorization
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${tokenService.getAccessToken()}`,
        };
        return config;
    }
}
