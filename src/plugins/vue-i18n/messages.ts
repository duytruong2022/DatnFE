import { common as commonEn } from '../../common/locale/en/common.en';
import { app as appEn } from '../../common/locale/en/app.en';
import { yupEn } from '../yup/locale/en';
import { fields as yupFieldsEn } from '../yup/locale/fields.en';
import { errors as errorsEn } from '@/features/errors/locale/en/errors.en';
import { login as loginEn } from '@/features/auth/locale/en/login.en';
import { register as registerEn } from '@/features/auth/locale/en/register.en';
import { forgotPassword as forgotPasswordEn } from '@/features/auth/locale/en/forgotPassword.en';
import { profile as profileEn } from '@/features/auth/locale/en/profile.en';
import { project as projectEn } from '@/features/project/locale/en/project.en';
import { group as groupEn } from '@/features/group/locale/en/group.en';
import securityProfileEn from '@/features/security-profile/locale/en/list.en';
import { user as userEn } from '@/features/user/locale/en/user.en';
import { userForm as userFormEn } from '@/features/user/locale/en/userForm.en';
import { notification as notificationEn } from '@/features/notification/locale/en/notification.en';
import { viewer3d as viewer3dEn } from '@/features/3D-viewer/locale/en/viewer3d.en';
import { accessLog as accessLogEn } from '@/features/access-log/locale/en/accessLog.en';
import { setPasswordForm as setPasswordFormEn } from '@/features/user/locale/en/setPasswordForm.en';
import { changePasswordForm as changePasswordFormEn } from '@/features/auth/locale/en/changePasswordForm.en';
import { projectList as projectListEn } from '@/features/project/locale/en/projectList.en';
import { projectNotification as projectNotificationEn } from '@/features/project/locale/en/projectNotification.en';
import planningEn from '@/features/4D-planning/locale/en/planning.en';
import { projectGroup as projectGroupEn } from '@/features/project-group/locale/en/project-group.en';
import viewer3dProfileEn from '@/features/3D-viewer-profile/locale/en/index.en';
import { ldapConfigForm as ldapConfigFormEn } from '@/features/user/locale/en/ldapConfigForm.en';
import { supportRequest as supportRequestEn } from '@/features/support-request/locale/en/supportRequest.en';
import { projectLog as projectLogEn } from '@/features/project-log/locale/en/projectLog.en';
import repositoryEn from '@/features/repository/locale/en/index.en';
import calendarEn from '@/features/calendar/locale/en/index.en';
import fileFormEn from '@/features/repository/locale/en/fileForm.en';

import { common as commonFr } from '../../common/locale/fr/common.fr';
import { app as appFr } from '../../common/locale/fr/app.fr';
import { yupFr } from '../yup/locale/fr';
import { fields as yupFieldsFr } from '../yup/locale/fields.fr';
import { errors as errorsFr } from '@/features/errors/locale/fr/errors.fr';
import { login as loginFr } from '@/features/auth/locale/fr/login.fr';
import { register as registerFr } from '@/features/auth/locale/fr/register.fr';
import { forgotPassword as forgotPasswordFr } from '@/features/auth/locale/fr/forgotPassword.fr';
import { profile as profileFr } from '@/features/auth/locale/fr/profile.fr';
import { project as projectFr } from '@/features/project/locale/fr/project.fr';
import { group as groupFr } from '@/features/group/locale/fr/group.fr';
import securityProfileFr from '@/features/security-profile/locale/fr/list.fr';
import { user as userFr } from '@/features/user/locale/fr/user.fr';
import { userForm as userFormFr } from '@/features/user/locale/fr/userForm.fr';
import { notification as notificationFr } from '@/features/notification/locale/fr/notification.fr';
import { viewer3d as viewer3dFr } from '@/features/3D-viewer/locale/fr/viewer3d.fr';
import { accessLog as accessLogFr } from '@/features/access-log/locale/fr/accessLog.fr';
import { setPasswordForm as setPasswordFormFr } from '@/features/user/locale/fr/setPasswordForm.fr';
import { changePasswordForm as changePasswordFormFr } from '@/features/auth/locale/fr/changePasswordForm.fr';
import { projectList as projectListFr } from '@/features/project/locale/fr/projectList.fr';
import { projectNotification as projectNotificationFr } from '@/features/project/locale/fr/projectNotification.fr';
import planningFr from '@/features/4D-planning/locale/fr/planning.fr';
import viewer3dProfileFr from '@/features/3D-viewer-profile/locale/fr/index.fr';
import { projectGroup as projectGroupFr } from '@/features/project-group/locale/fr/project-group.fr';
import { ldapConfigForm as ldapConfigFormFr } from '@/features/user/locale/fr/ldapConfigForm.fr';
import { supportRequest as supportRequestFr } from '@/features/support-request/locale/fr/supportRequest.fr';
import { projectLog as projectLogFr } from '@/features/project-log/locale/fr/projectLog.fr';
import repositoryFr from '@/features/repository/locale/fr/index.fr';
import calendarFr from '@/features/calendar/locale/fr/index.fr';
import fileFormFr from '@/features/repository/locale/fr/fileForm.fr';

const messages = {
    en: {
        app: appEn,
        common: commonEn,
        yup: yupEn,
        yupFields: yupFieldsEn,
        errors: errorsEn,
        login: loginEn,
        register: registerEn,
        forgotPassword: forgotPasswordEn,
        profile: profileEn,
        project: projectEn,
        group: groupEn,
        securityProfile: securityProfileEn,
        user: userEn,
        userForm: userFormEn,
        notification: notificationEn,
        viewer3d: viewer3dEn,
        accessLog: accessLogEn,
        setPasswordForm: setPasswordFormEn,
        changePasswordForm: changePasswordFormEn,
        projectList: projectListEn,
        planning: planningEn,
        projectGroup: projectGroupEn,
        ['3dViewerProfile']: viewer3dProfileEn,
        ldapConfigForm: ldapConfigFormEn,
        supportRequest: supportRequestEn,
        repository: repositoryEn,
        projectLog: projectLogEn,
        calendar: calendarEn,
        projectNotification: projectNotificationEn,
        fileForm: fileFormEn,
    },
    fr: {
        app: appFr,
        common: commonFr,
        yup: yupFr,
        yupFields: yupFieldsFr,
        errors: errorsFr,
        login: loginFr,
        register: registerFr,
        forgotPassword: forgotPasswordFr,
        profile: profileFr,
        project: projectFr,
        group: groupFr,
        securityProfile: securityProfileFr,
        user: userFr,
        userForm: userFormFr,
        notification: notificationFr,
        viewer3d: viewer3dFr,
        accessLog: accessLogFr,
        setPasswordForm: setPasswordFormFr,
        changePasswordForm: changePasswordFormFr,
        projectList: projectListFr,
        planning: planningFr,
        projectGroup: projectGroupFr,
        ['3dViewerProfile']: viewer3dProfileFr,
        ldapConfigForm: ldapConfigFormFr,
        supportRequest: supportRequestFr,
        repository: repositoryFr,
        projectLog: projectLogFr,
        calendar: calendarFr,
        projectNotification: projectNotificationFr,
        fileForm: fileFormFr,
    },
};

export default messages;
