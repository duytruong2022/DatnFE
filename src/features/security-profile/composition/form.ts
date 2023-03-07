import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { securityPrSchema } from '../constants';
import { ICreateSecurityProfile, IUpdateSecurityProfile } from '../interface';
import { securityProfileService } from '../services/api.service';
import { securityProfileModule } from '../store';
import i18n from '@/plugins/vue-i18n';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';

export const setupSecurityProfileForm = () => {
    const initValue = {
        name: '',
        description: '',
        permissions: [],
        isDefaultSelect: false,
    };

    const { errors, resetForm, handleSubmit, setFieldValue, setValues, values } = useForm(
        {
            validationSchema: securityPrSchema,
            initialValues: initValue,
        },
    );
    const onSubmit = handleSubmit(async (vales) => {
        const loading = ElLoading.service({ target: '.security-profile-form' });

        let response;
        // create
        if (!securityProfileModule.securityProfile) {
            response = await securityProfileService.createSecurityProfile(
                vales as ICreateSecurityProfile,
            );
        } else {
            response = await securityProfileService.updateSecurityProfile(
                securityProfileModule.securityProfile?._id as string,
                vales as IUpdateSecurityProfile,
            );
        }

        if (response.success) {
            if (!securityProfileModule.securityProfile) {
                showSuccessNotificationFunction(
                    i18n.global.t('securityProfile.create.success'),
                );
            } else {
                showSuccessNotificationFunction(
                    i18n.global.t('securityProfile.update.success'),
                );
            }
            securityProfileModule.resetSecurityProfileListQueryString();
            response = await securityProfileService.getSecurityProfileList(
                securityProfileModule.queryList,
            );
            if (response.success) {
                securityProfileModule.setSecurityProfileList(response.data.items);
                securityProfileModule.setTotalItems(response.data.totalItems);
            } else if (!response?.isRequestError) {
                showSuccessNotificationFunction(response.message);
            }
            securityProfileModule.setIsOpenSecurityProfileForm(false);
        } else if (!response?.isRequestError) {
            showErrorNotificationFunction(response.message);
        }

        loading.close();
    });

    const { value: name } = useField('name');
    const { value: description } = useField('description');
    const { value: permissions } = useField('permissions');
    const { value: isDefaultSelect } = useField('isDefaultSelect');
    return {
        onSubmit,
        name,
        description,
        permissions,
        errors,
        setFieldValue,
        isDefaultSelect,
        setValues,
        resetForm,
        values,
    };
};
