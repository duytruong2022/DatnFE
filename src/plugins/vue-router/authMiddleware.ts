import { sessionStorageAuthService } from './../../common/authStorage';
import localStorageAuthService from '@/common/authStorage';
import { AccessModules, PageName, UserRoles } from '@/common/constants';
import {
    getUserRoles,
    hasPermissionToAccessRouteInConstellation,
    hasPermissionToAccessRouteInProject,
} from '@/common/helpers';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';
import { SecurityPermissions } from '@/features/security-profile/constants';
import intersection from 'lodash/intersection';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export default async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
): Promise<void> => {
    const isPublic = to?.meta?.public || false;
    const onlyWhenLoggedOut = to?.meta?.onlyWhenLoggedOut || false;
    const loggedIn = !!sessionStorageAuthService.getAccessToken();
    const refreshToken = sessionStorageAuthService.getRefreshToken();
    const refreshTokenExpiredAt = sessionStorageAuthService.getRefreshTokenExpiredAt();

    if (isPublic) {
        // Do not allow user to visit entry page if they are logged in
        if (loggedIn && onlyWhenLoggedOut) {
            return next('/');
        }
        return next();
    }
    if (!isPublic && !loggedIn) {
        return next({
            path: '/login',
            query: { redirect: to.fullPath }, // Store the full path to redirect the user to after login
        });
    }
    if (
        !refreshToken ||
        !refreshTokenExpiredAt ||
        refreshTokenExpiredAt <= new Date().getTime()
    ) {
        localStorageAuthService.resetAll();
        return next({
            path: '/login',
            query: { redirect: to.path },
        });
    }
    if (loggedIn) {
        const profile = localStorageAuthService.getUser();
        if (profile?.needToChangePassword && to.path !== '/profile') {
            return next({
                name: PageName.PROFILE_VIEW_PAGE,
            });
        }

        if (localStorageAuthService.getSelectedProjectId()) {
            const requiredPermissions =
                (to?.meta?.requiredPermissions as ProjectSecurityPermissions[]) || [];
            if (hasPermissionToAccessRouteInProject(requiredPermissions)) return next();
        } else {
            if (
                localStorageAuthService.getSelectedAccessModule() ===
                    AccessModules.SPACIALYTIC_PLATFORM &&
                getUserRoles(AccessModules.SPACIALYTIC_PLATFORM).includes(UserRoles.ADMIN)
            ) {
                return next();
            }
            const requiredPermissions =
                (to?.meta?.requiredPermissions as SecurityPermissions[]) || [];

            if (
                to?.meta?.required3DViewerRoles &&
                (!requiredPermissions.length ||
                    localStorageAuthService.getSelectedAccessModule() ===
                        AccessModules.SPACIALYTIC_3DWEBVIEWER)
            ) {
                const user3DViewerRoles = getUserRoles(
                    AccessModules.SPACIALYTIC_3DWEBVIEWER,
                );
                if (
                    !intersection(
                        user3DViewerRoles,
                        to?.meta?.required3DViewerRoles as UserRoles[],
                    ).length
                ) {
                    return next({ path: '/403' });
                }
                return next();
            } else if (hasPermissionToAccessRouteInConstellation(requiredPermissions))
                return next();
        }

        return next({ path: '/403' });
    }

    return next();
};
