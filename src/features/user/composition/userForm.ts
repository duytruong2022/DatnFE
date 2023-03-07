import {
    AccessModules,
    DEFAULT_FIRST_PAGE,
    HttpStatus,
    SUPPORT_LANGUAGE,
    Timezones,
    UserRoles,
} from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import { IUser } from '../interfaces';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { userFormSchema } from '../constant';
import { userService } from '../services/api.services';
import { userModule } from '../store';
import { authModule } from '@/features/auth/store';
import { projectModule } from '@/features/project/store';
import localStorageAuthService from '@/common/authStorage';

export const initUser = {
    firstName: '',
    lastName: '',
    ldapUsername: '',
    email: '',
    countryId: '',
    language: SUPPORT_LANGUAGE.EN,
    city: '',
    jobTitle: '',
    phoneNumber: '',
    company: '',
    address: '',
    timezone: Timezones['GMT+00:00'],
    groupIds: [],
    securityProfileIds: [],
    projectProfileIds: [],
    viewer3dProfileIds: [],
};

export const setupUserForm = () => {
    const { t } = useI18n();
    const isCreate = computed(() => !userModule.selectedUser?._id);
    const { handleSubmit, errors, validate, resetForm, setErrors } = useForm({
        initialValues: initUser,
        validationSchema: userFormSchema,
    });

    const onSubmit = handleSubmit(async (user) => {
        const accessModules = [];
        if (
            userModule.specialistic3DWebviewRoles.length &&
            userModule.specialistic3DWebviewRoles[0] !== UserRoles.NONE
        ) {
            accessModules.push({
                module: AccessModules.SPACIALYTIC_3DWEBVIEWER,
                roles: userModule.specialistic3DWebviewRoles,
            });
        }
        if (userModule.specialisticConstellationRole !== UserRoles.NONE) {
            accessModules.push({
                module: AccessModules.SPACIALYTIC_CONSTELLATION,
                roles: [userModule.specialisticConstellationRole],
            });
        }
        if (userModule.specialisticPlatformRole !== UserRoles.NONE) {
            accessModules.push({
                module: AccessModules.SPACIALYTIC_PLATFORM,
                roles: [userModule.specialisticPlatformRole],
            });
        }
        if (
            authModule.selectedAccessModule !== AccessModules.SPACIALYTIC_PLATFORM &&
            isCreate.value
        ) {
            accessModules.push({
                module: authModule.selectedAccessModule,
                roles: [UserRoles.NORMAL_USER],
            });
        }
        let response;
        const userId = userModule.selectedUser?._id;
        const userBody = {
            firstName: user.firstName?.trim(),
            lastName: user.lastName?.trim(),
            email: user.email?.trim(),
            countryId: user.countryId,
            language: user.language,
            city: user.city?.trim(),
            jobTitle: user.jobTitle?.trim(),
            phoneNumber: user.phoneNumber?.trim(),
            company: user.company?.trim(),
            address: user.address?.trim(),
            timezone: user.timezone?.trim() as Timezones,
            accessModules,
        };
        const loading = ElLoading.service({
            target: '.user-form',
        });
        if (!isCreate.value) {
            if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
                response = await userService.update(userId as string, userBody);
            } else if (
                authModule.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER
            ) {
                response = await userService.update(userId as string, {
                    ...userBody,
                    viewer3dProfileIds: user.viewer3dProfileIds,
                    viewer3dGroupIds: user.groupIds,
                });
            } else if (
                authModule.selectedAccessModule ===
                    AccessModules.SPACIALYTIC_CONSTELLATION &&
                !projectModule.selectedProjectId
            ) {
                response = await userService.update(userId as string, {
                    ...userBody,
                    securityProfileIds: user.securityProfileIds,
                    constellationGroupIds: user.groupIds,
                });
            } else {
                response = await userService.updateProjectUser(
                    userId as string,
                    projectModule.selectedProjectId as string,
                    {
                        ...userBody,
                        projectProfileIds: user.projectProfileIds,
                        projectGroupIds: user.groupIds,
                    },
                );
            }
        } else {
            if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_PLATFORM) {
                response = await userService.create(userBody);
            } else if (
                authModule.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER
            ) {
                response = await userService.create({
                    ...userBody,
                    viewer3dProfileIds: user.viewer3dProfileIds,
                    viewer3dGroupIds: user.groupIds,
                });
            } else if (
                authModule.selectedAccessModule ===
                    AccessModules.SPACIALYTIC_CONSTELLATION &&
                !projectModule.selectedProjectId
            ) {
                response = await userService.create({
                    ...userBody,
                    securityProfileIds: user.securityProfileIds,
                    constellationGroupIds: user.groupIds,
                });
            } else {
                response = await userService.create({
                    ...userBody,
                    projectProfileIds: user.projectProfileIds,
                    projectGroupIds: user.groupIds,
                    projectId: projectModule.selectedProjectId,
                });
            }
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('userForm.message.updateSuccess')
                    : t('userForm.message.createSuccess'),
            );
            userModule.setIsShowUserForm(false);
            userModule.setUserListQueryString({ page: DEFAULT_FIRST_PAGE });
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await userModule.getUserList();
            await userModule.getCompanyList();
            if (localStorageAuthService.getUser()?._id === userModule.selectedUser?._id) {
                await authModule.getProfile();
            }
            loading.close();
            userModule.setSelectedUser(null);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                userModule.setIsShowUserForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await userModule.getUserList();
                await userModule.getCompanyList();
                loading.close();
            }
            showErrorNotificationFunction(response.message);
        }
    });
    const { value: firstName } = useField('firstName');
    const { value: lastName } = useField('lastName');
    const { value: ldapUsername } = useField('ldapUsername');
    const { value: email } = useField('email');
    const { value: countryId } = useField('countryId');
    const { value: language } = useField('language');
    const { value: city } = useField('city');
    const { value: jobTitle } = useField('jobTitle');
    const { value: phoneNumber } = useField('phoneNumber');
    const { value: company } = useField('company');
    const { value: address } = useField('address');
    const { value: timezone } = useField('timezone');
    const { value: groupIds } = useField('groupIds');
    const { value: securityProfileIds } = useField('securityProfileIds');
    const { value: projectProfileIds } = useField('projectProfileIds');
    const { value: viewer3dProfileIds } = useField('viewer3dProfileIds');

    const openUserForm = async () => {
        setErrors({});
        if (!isCreate.value) {
            const loading = ElLoading.service({
                target: '.user-form',
            });
            const userDetail = (await userService.getDetail(
                userModule.selectedUser?._id as string,
            )) as IBodyResponse<IUser>;
            loading.close();
            const selectedUser = {
                firstName: userDetail.data?.firstName,
                lastName: userDetail.data?.lastName,
                ldapUsername: userDetail.data?.ldapUsername || '',
                email: userDetail.data?.email,
                countryId: userDetail.data?.countryId,
                language: userDetail.data?.language,
                city: userDetail.data?.city,
                jobTitle: userDetail.data?.jobTitle,
                phoneNumber: userDetail.data?.phoneNumber,
                company: userDetail.data?.company,
                timezone: userDetail.data?.timezone,
                address: userDetail.data?.address,
                securityProfileIds: userDetail.data?.securityProfileIds as never,
                projectProfileIds: [],
                viewer3dProfileIds: userDetail.data?.viewer3dProfileIds as never,
                groupIds: [],
                accessModules: userDetail.data?.accessModules,
            };
            if (
                authModule.selectedAccessModule === AccessModules.SPACIALYTIC_3DWEBVIEWER
            ) {
                Object.assign(selectedUser, {
                    ...selectedUser,
                    groupIds: userDetail.data?.viewer3dGroupIds,
                });
            } else if (
                authModule.selectedAccessModule ===
                    AccessModules.SPACIALYTIC_CONSTELLATION &&
                !projectModule.selectedProjectId
            ) {
                Object.assign(selectedUser, {
                    ...selectedUser,
                    groupIds: userDetail.data?.constellationGroupIds,
                });
            } else if (
                authModule.selectedAccessModule ===
                    AccessModules.SPACIALYTIC_CONSTELLATION &&
                projectModule.selectedProjectId
            ) {
                const project = userDetail.data?.projects?.find(
                    (project) => project.projectId === projectModule.selectedProjectId,
                );

                Object.assign(selectedUser, {
                    ...selectedUser,
                    groupIds: project?.projectGroupIds,
                    projectProfileIds: project?.projectProfileIds,
                });
            }
            resetForm({
                values: {
                    ...selectedUser,
                },
            });
            userModule.setSpecialistic3DWebviewRoles(
                userDetail.data?.accessModules?.find((accessModule) => {
                    return accessModule.module === AccessModules.SPACIALYTIC_3DWEBVIEWER;
                })?.roles || [UserRoles.NONE],
            );
            userModule.setSpecialisticPlatformRole(
                userDetail.data?.accessModules?.find((accessModule) => {
                    return accessModule.module === AccessModules.SPACIALYTIC_PLATFORM;
                })?.roles[0] || UserRoles.NONE,
            );
            userModule.setSpecialisticConstellationRole(
                userDetail.data?.accessModules?.find((accessModule) => {
                    return (
                        accessModule.module === AccessModules.SPACIALYTIC_CONSTELLATION
                    );
                })?.roles[0] || UserRoles.NONE,
            );
        } else {
            resetForm({
                values: {
                    ...initUser,
                    projectProfileIds: (userModule.projectProfileDefault?._id
                        ? [userModule.projectProfileDefault?._id]
                        : []) as never[],
                    securityProfileIds: (userModule.securityProfileDefault?._id
                        ? [userModule.securityProfileDefault?._id]
                        : []) as never[],
                    viewer3dProfileIds: (userModule.viewer3dProfileDefault?._id
                        ? [userModule.viewer3dProfileDefault?._id]
                        : []) as never[],
                },
            });
            userModule.setSpecialistic3DWebviewRoles([]);
            userModule.setSpecialisticPlatformRole(UserRoles.NONE);
            userModule.setSpecialisticConstellationRole(UserRoles.NONE);
        }
    };

    return {
        errors,
        onSubmit,
        openUserForm,
        resetForm,
        validate,
        firstName,
        lastName,
        ldapUsername,
        email,
        countryId,
        language,
        city,
        jobTitle,
        phoneNumber,
        company,
        address,
        timezone,
        groupIds,
        securityProfileIds,
        projectProfileIds,
        viewer3dProfileIds,
        isCreate,
    };
};
