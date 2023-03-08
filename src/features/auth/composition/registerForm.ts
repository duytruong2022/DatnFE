import { AccessModules, PageName, SUPPORT_LANGUAGE } from './../../../common/constants';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import { ElLoading } from 'element-plus';
import { INPUT_TEXT_MAX_LENGTH, FORM_VALIDATION } from '@/common/constants';
import yup from '@/plugins/yup';
import { authService } from '../services/api.services';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { FormValidation } from '../constants';
import router from '@/plugins/vue-router';

const registerFormValidationSchema = yup.object({
    firstName: yup.string().trim().max(FormValidation.FIRST_NAME_MAX_LENGTH).required(),
    lastName: yup.string().trim().max(FormValidation.LAST_NAME_MAX_LENGTH).required(),
    email: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .matches(FORM_VALIDATION.email)
        .trim()
        .required(),
    countryId: yup.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    language: yup.string().oneOf(Object.values(SUPPORT_LANGUAGE)).required(),
    module: yup.string().oneOf(Object.values(AccessModules)).required(),
});

export function setupRegisterForm() {
    const { t } = useI18n();
    const initValues = {
        firstName: '',
        lastName: '',
        email: '',
        countryId: '',
        language: SUPPORT_LANGUAGE.FR,
        module: AccessModules.SPACIALYTIC_CONSTELLATION,
    };
    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: initValues,
        validationSchema: registerFormValidationSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.regsiter-form',
        });
        const response = await authService.register({
            ...values,
            language: values.language as SUPPORT_LANGUAGE,
            module: values.module as AccessModules,
        });
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                t('register.messages.registerSuccess') as string,
            );
            router.replace({
                name: PageName.LOGIN_PAGE,
            });
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: firstName } = useField('firstName');
    const { value: lastName } = useField('lastName');
    const { value: email } = useField('email');
    const { value: countryId } = useField('countryId');
    const { value: language } = useField('language');
    const { value: module } = useField('module');
    const { value: projectName } = useField('projectName');
    const { value: projectAdminEmail } = useField('projectAdminEmail');

    return {
        errors,
        firstName,
        lastName,
        email,
        countryId,
        language,
        module,
        projectName,
        projectAdminEmail,
        validate,
        onSubmit,
        resetForm,
        setErrors,
    };
}
