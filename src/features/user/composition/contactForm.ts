import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { contactFormSchema } from '../constant';
import { IUser } from '../interfaces';
import { userService } from '../services/api.services';
import { userModule } from '../store';

const initContact = {
    phoneNumber: '',
    email: '',
    subject: '',
    description: '',
    firstName: '',
    lastName: '',
};

export const setupContactForm = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, validate, resetForm, setErrors } = useForm({
        initialValues: initContact,
        validationSchema: contactFormSchema,
    });

    const onSubmit = handleSubmit(async (contact) => {
        const contactBody = {
            email: contact.email?.trim(),
            subject: contact.subject?.trim(),
            description: contact.description?.trim(),
            fullName: `${contact.firstName} ${contact.lastName}`,
        };
        const loading = ElLoading.service({
            target: '.contact-form',
        });
        const response = await userService.contactUser(contactBody);
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(t('userForm.message.updateSuccess'));
            userModule.setSelectedUser(null);
            userModule.setIsShowContactForm(false);
        } else {
            showErrorNotificationFunction(response.message);
        }
    });
    const { value: email } = useField('email');
    const { value: subject } = useField('subject');
    const { value: description } = useField('description');
    const { value: phoneNumber } = useField('phoneNumber');
    const { value: firstName } = useField('firstName');
    const { value: lastName } = useField('lastName');

    const openContactForm = async () => {
        setErrors({});
        const loading = ElLoading.service({
            target: '.contact-form',
        });
        const userDetail = (await userService.getDetail(
            userModule.selectedUser?._id as string,
        )) as IBodyResponse<IUser>;
        loading.close();
        resetForm({
            values: {
                ...initContact,
                email: userDetail.data.email,
                phoneNumber: userDetail.data.phoneNumber,
                firstName: userDetail.data.firstName,
                lastName: userDetail.data.lastName,
            },
        });
    };

    return {
        errors,
        onSubmit,
        openContactForm,
        resetForm,
        validate,
        email,
        subject,
        phoneNumber,
        description,
        firstName,
        lastName,
    };
};
