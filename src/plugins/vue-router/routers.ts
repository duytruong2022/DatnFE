import userRouters from '@/features/user/routers';
import authRouters from '@/features/auth/routers';
import projectRouters from '@/features/project/routers';
import groupRouters from '@/features/group/routers';
import securityProfileRouters from '@/features/security-profile/routers';
import notificationRouters from '@/features/notification/routers';
import profileRouter from '@/features/3D-viewer-profile/routers';
import viewer3dRouters from '@/features/3D-viewer/routers';
import accessLogRouters from '@/features/access-log/routers';
import pbsGroupRouters from '@/features/pbs-group/routers';
import absRouter from '@/features/abs/routers';
import projectGroupRouters from '@/features/project-group/routers';
import planningRouters from '@/features/4D-planning/routers';
import supportRequestRouters from '@/features/support-request/routers';
import repositoryRouters from '@/features/repository/routers';
import projectLogRouters from '@/features/project-log/routers';
import calendarRouter from '@/features/calendar/routers';

export const routers = [
    ...userRouters,
    ...authRouters,
    ...securityProfileRouters,
    ...projectRouters,
    ...groupRouters,
    ...notificationRouters,
    ...profileRouter,
    ...viewer3dRouters,
    ...accessLogRouters,
    ...pbsGroupRouters,
    ...absRouter,
    ...projectGroupRouters,
    ...planningRouters,
    ...supportRequestRouters,
    ...repositoryRouters,
    ...projectLogRouters,
    ...calendarRouter,
];
