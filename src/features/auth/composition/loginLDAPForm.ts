import { sessionStorageAuthService } from './../../../common/authStorage';
import { authModule } from './../store';
import { useField, useForm } from 'vee-validate';

import { ElLoading } from 'element-plus';
import { PageName } from '@/common/constants';
import router from '@/plugins/vue-router';
import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';
import { authService } from '../services/api.services';
import localStorageAuthService from '@/common/authStorage';
import {
    checkHasActiveModule,
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { useI18n } from 'vue-i18n';
import i18n from '@/plugins/vue-i18n';

const validateLoginFormSchema = yup.object({
    username: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .required()
        .label('ldapUsername'),
    password: yup.string().trim().required().label('password'),
});

export function setupLoginLdapForm() {
    const { t } = useI18n();
    const initValues = {
        username: '',
        password: '',
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateLoginFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.login-ldap-form-popup',
        });
        const preLoginReponse = await authService.preLoginLDAP(values);
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
        const response = await authService.loginLDAP(values);
        loading.close();
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

                if (response.data.isExistOtherTokenUnexpired) {
                    const isConfirm = await showConfirmPopUpFunction(
                        i18n.global.t('login.message.logoutOtherDevice.confirmAsk'),
                        i18n.global.t('login.message.logoutOtherDevice.title') as string,
                        {},
                    );
                    if (isConfirm) {
                        const logoutResponse = await authService.logoutOtherDevice({
                            refreshToken: response.data.refreshToken.token,
                        });
                        if (logoutResponse.success) {
                            showSuccessNotificationFunction(
                                i18n.global.t(
                                    'login.message.logoutOtherDevice.success',
                                ) as string,
                            );
                        } else {
                            showErrorNotificationFunction(logoutResponse.message);
                        }
                    }
                }

                localStorageAuthService.addLoginedUser({
                    user: response.data?.profile,
                });
                authModule.setIsShowLoginLdapFormPopUp(false);
                router.push({
                    name: PageName.PROFILE_VIEW_PAGE,
                });
            } else {
                showErrorNotificationFunction(t('common.error.accessModuleError'));
            }
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: username } = useField('username');
    const { value: password } = useField('password');

    return {
        errors,
        username,
        password,
        validate,
        onSubmit,
        resetForm,
    };
}
