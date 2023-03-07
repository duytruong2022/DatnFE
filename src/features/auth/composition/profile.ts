import {
    FORM_VALIDATION,
    INPUT_TEXT_MAX_LENGTH,
    SUPPORT_LANGUAGE,
    TEXTAREA_MAX_LENGTH,
    Timezones,
} from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { FormValidation } from '../constants';
import { authService } from '../services/api.services';
import { authModule } from '../store';

export const profileFormSchema = yup.object({
    firstName: yup
        .string()
        .trim()
        .max(FormValidation.FIRST_NAME_MAX_LENGTH)
        .required()
        .label('firstName'),
    lastName: yup
        .string()
        .trim()
        .max(FormValidation.LAST_NAME_MAX_LENGTH)
        .label('lastName')
        .required(),
    countryId: yup.string().trim().label('countryId').required(),
    language: yup
        .string()
        .oneOf([...Object.values(SUPPORT_LANGUAGE), ''])
        .label('language')
        .optional()
        .nullable(),
    timezone: yup
        .string()
        .oneOf([...Object.values(Timezones), ''])
        .label('timezone')
        .optional()
        .nullable(),
    ldapUsername: yup.string().trim().label('ldapUsername').optional(),
    city: yup
        .string()
        .trim()
        .label('city')
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable(),
    jobTitle: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('jobTitle')
        .optional()
        .nullable(),
    phoneNumber: yup
        .string()
        .trim()
        .transform((val) => (val ? val : null))
        .matches(FORM_VALIDATION.phoneRegExp)
        .label('phoneNumber')
        .optional()
        .nullable(),
    company: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .label('company')
        .optional()
        .nullable(),
    address: yup
        .string()
        .trim()
        .max(TEXTAREA_MAX_LENGTH)
        .label('address')
        .optional()
        .nullable(),
});

export const initialProfileValues = {
    firstName: '',
    lastName: '',
    ldapUsername: '',
    phoneNumber: '',
    address: '',
    company: '',
    jobTitle: '',
    city: '',
    language: undefined,
    countryId: undefined,
    timezone: undefined,
};

export function setupProfileForm() {
    const { handleSubmit, errors, resetForm, validate, setFieldValue, setValues } =
        useForm({
            initialValues: initialProfileValues,
            validationSchema: profileFormSchema,
        });

    const updateProfile = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        delete values.ldapUsername;
        const response = await authService.updateProfile(values);
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(i18n.global.t('profile.update.success'));
            authModule.setProfile({
                ...response.data,
                isCurrentPasswordRequired:
                    !!authModule.profile?.isCurrentPasswordRequired,
            });
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: firstName } = useField('firstName');
    const { value: lastName } = useField('lastName');
    const { value: countryId } = useField('countryId');
    const { value: ldapUsername } = useField('ldapUsername');
    const { value: city } = useField('city');
    const { value: jobTitle } = useField('jobTitle');
    const { value: phoneNumber } = useField('phoneNumber');
    const { value: address } = useField('address');
    const { value: company } = useField('company');
    const { value: language } = useField('language');
    const { value: timezone } = useField('timezone');

    return {
        errors,
        firstName,
        lastName,
        countryId,
        language,
        ldapUsername,
        city,
        jobTitle,
        phoneNumber,
        address,
        timezone,
        company,
        validate,
        updateProfile,
        resetForm,
        setFieldValue,
        setValues,
    };
}
