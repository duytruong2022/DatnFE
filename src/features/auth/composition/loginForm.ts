import { sessionStorageAuthService } from './../../../common/authStorage';
import {
    AccessModules,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    Regex,
} from './../../../common/constants';
import { useField, useForm } from 'vee-validate';

import { ElLoading } from 'element-plus';
import { PageName } from '@/common/constants';
import router from '@/plugins/vue-router';
import { INPUT_TEXT_MAX_LENGTH, FORM_VALIDATION } from '@/common/constants';
import yup from '@/plugins/yup';
import { authService } from '../services/api.services';
import localStorageAuthService from '@/common/authStorage';
import {
    checkHasActiveModule,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { useI18n } from 'vue-i18n';
import i18n from '@/plugins/vue-i18n';
import { IBodyResponse } from '@/common/interfaces';
import { IConstellationSecurityPermissions } from '../interfaces';
import { authModule } from '../store';

const validateLoginFormSchema = yup.object({
    email: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .matches(FORM_VALIDATION.email)
        .required()
        .trim()
        .label('email'),
    password: yup
        .string()
        .matches(Regex.PASSWORD, 'common.error.password')
        .trim()
        .required()
        .trim()
        .min(PASSWORD_MIN_LENGTH)
        .max(PASSWORD_MAX_LENGTH)
        .label('password'),
});

export function setupLoginForm() {
    const { t } = useI18n();
    const initValues = {
        email: '',
        password: '',
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateLoginFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.login-form',
        });
        values.email = values.email?.trim().toLowerCase();

        const preLoginReponse = await authService.preLogin(values);
        if (!preLoginReponse.success) {
            showErrorNotificationFunction(preLoginReponse.message);
            loading.close();
            return;
        }
        if (preLoginReponse.data.isBeingLoggedIn) {
            const isConfirm = await showConfirmPopUpFunction(
                i18n.global.t('login.message.logoutOtherDevice.confirmAsk'),
                i18n.global.t('login.message.logoutOtherDevice.title') as string,
                {
                    confirmButtonText: i18n.global.t('app.buttons.yes'),
                    cancelButtonText: i18n.global.t('app.buttons.no'),
                },
            );
            if (!isConfirm) {
                loading.close();
                return;
            }
        }
        const response = await authService.login(values);
        if (response.success) {
            if (
                checkHasActiveModule(
                    response.data?.profile.accessModules,
                    response.data?.profile?.status,
                )
            ) {
                localStorageAuthService.setUser(response.data?.profile);

                sessionStorageAuthService.setAccessToken(
                    response.data?.accessToken.token,
                );
                sessionStorageAuthService.setRefreshToken(
                    response.data?.refreshToken.token,
                );
                sessionStorageAuthService.setAccessTokenExpiredAt(
                    response.data?.accessToken.expiresIn,
                );
                sessionStorageAuthService.setRefreshTokenExpiredAt(
                    response.data?.refreshToken.expiresIn,
                );

                localStorageAuthService.addLoginedUser({
                    user: response.data?.profile,
                });

                authModule.setAccessModuleOptions(
                    localStorageAuthService.getUser().accessModules,
                );

                if (
                    authModule.accessModuleOptions[0].value ===
                    AccessModules.SPACIALYTIC_CONSTELLATION
                ) {
                    const response =
                        (await authService.getConstellationSecurityPermissions()) as IBodyResponse<IConstellationSecurityPermissions>;
                    if (response.success) {
                        localStorageAuthService.setPermissions(
                            response.data?.constellationSecurityPermissions ?? [],
                        );
                    }
                }

                router.push({
                    name: PageName.PROFILE_VIEW_PAGE,
                });
                loading.close();
            } else {
                showErrorNotificationFunction(t('common.error.accessModuleError'));
                loading.close();
            }
        } else {
            showErrorNotificationFunction(response.message as string);
            loading.close();
        }
    });
    const { value: email } = useField('email');
    const { value: password } = useField('password');

    return {
        errors,
        email,
        password,
        validate,
        onSubmit,
        resetForm,
    };
}
