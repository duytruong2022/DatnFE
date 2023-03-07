import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { ldapConfigFormSchema } from '../constant';
import { ILdapConfig } from '../interfaces';
import { userService } from '../services/api.services';
import { userModule } from '../store';

const initLdapConfigForm = {
    ldapServerUrl: '',
    ldapBaseUsersDn: '',
    ldapAdminPassword: '',
    ldapAdminDn: '',
};

export const setupConfigLdapForm = () => {
    const { t } = useI18n();

    const { handleSubmit, errors, resetForm, setErrors } = useForm({
        initialValues: initLdapConfigForm,
        validationSchema: ldapConfigFormSchema,
    });

    const createLdapUserForm = async () => {
        const loading = ElLoading.service({
            target: '.ldap-config-form',
        });
        setErrors({});
        const ldapConfig =
            (await userService.getLdapConfig()) as unknown as IBodyResponse<ILdapConfig>;
        resetForm({
            values: {
                ...initLdapConfigForm,
                ldapServerUrl: ldapConfig.data?.ldapServerUrl,
                ldapBaseUsersDn: ldapConfig.data?.ldapBaseUsersDn,
                ldapAdminPassword: ldapConfig.data?.ldapAdminPassword,
                ldapAdminDn: ldapConfig.data?.ldapAdminDn,
            },
        });

        await userModule.getLdapUserList();
        loading.close();
    };

    const onSubmit = handleSubmit(async (ldapConfig) => {
        const ldapConfigBody = {
            ldapServerUrl: ldapConfig.ldapServerUrl?.trim(),
            ldapBaseUsersDn: ldapConfig.ldapBaseUsersDn?.trim(),
            ldapAdminPassword: ldapConfig.ldapAdminPassword?.trim(),
            ldapAdminDn: ldapConfig.ldapAdminDn?.trim(),
        };

        const loading = ElLoading.service({
            target: '.ldap-config-form',
        });

        const response = (await userService.saveLdapConfig(
            ldapConfigBody,
        )) as unknown as IBodyResponse<boolean>;
        if (response.success) {
            showSuccessNotificationFunction(t('ldapConfigForm.message.saveSuccess'));
        } else {
            showErrorNotificationFunction(response.message);
        }
        await userModule.getLdapUserList();
        loading.close();
    });

    const { value: ldapServerUrl } = useField('ldapServerUrl');
    const { value: ldapBaseUsersDn } = useField('ldapBaseUsersDn');
    const { value: ldapAdminPassword } = useField('ldapAdminPassword');
    const { value: ldapAdminDn } = useField('ldapAdminDn');

    return {
        createLdapUserForm,
        resetForm,
        onSubmit,
        errors,
        ldapServerUrl,
        ldapBaseUsersDn,
        ldapAdminPassword,
        ldapAdminDn,
    };
};
