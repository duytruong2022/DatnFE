import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import {
    DATE_TIME_FORMAT,
    FILE_NAME_MAX_LENGTH,
    INPUT_TEXT_MAX_LENGTH,
    INTEGER_POSITIVE_MAX_VALUE,
    INTEGER_POSITIVE_MIN_VALUE,
    Regex,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import yup from '@/plugins/yup';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectService } from '../services/project.service';
import { computed } from 'vue';
import { projectModule } from '../store';
import { IBodyResponse } from '@/common/interfaces';
import { IProject } from '../interfaces';
import {
    LATITUDE_MIN_VALUE,
    LATITUDE_MAX_VALUE,
    LONGITUDE_MIN_VALUE,
    LONGITUDE_MAX_VALUE,
    ProjectCategories,
} from '../constants';
import { useI18n } from 'vue-i18n';
import moment from 'moment';

const validateProjectFormSchema = yup.object({
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).nullable().required(),
    adminId: yup.string().max(INPUT_TEXT_MAX_LENGTH).nullable().required(),
    category: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .oneOf(Object.values(ProjectCategories))
        .nullable()
        .required(),
    description: yup.string().max(TEXTAREA_MAX_LENGTH).nullable(),
    postalCode: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).nullable().required(),
    latitude: yup
        .number()
        .min(LATITUDE_MIN_VALUE)
        .max(LATITUDE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? null : +val))
        .nullable()
        .required(),
    longitude: yup
        .number()
        .min(LONGITUDE_MIN_VALUE)
        .max(LONGITUDE_MAX_VALUE)
        .transform((val) => (isNaN(val) ? null : +val))
        .nullable()
        .required(),
    isCreate: yup.boolean().required(),
});

export function setupProjectForm() {
    const { t } = useI18n();
    const isCreateProject = computed(() => !projectModule.selectedProjectIdToEdit);
    const initValues = {
        name: '',
        category: '',
        adminId: '',
        description: '',
        postalCode: '',
        latitude: NaN,
        longitude: NaN,
        isCreate: true,
    };
    const { handleSubmit, errors, resetForm, validate, setFieldValue } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectFormSchema,
    });

    const onOpen = async () => {
        const selectedProjectId = computed(() => projectModule.selectedProjectIdToEdit);
        if (!isCreateProject.value) {
            const loading = ElLoading.service({
                target: '.project-form',
            });
            const response = (await projectService.getDetail(
                selectedProjectId.value || '',
            )) as IBodyResponse<IProject>;
            loading.close();
            if (response.success) {
                resetForm({
                    values: {
                        name: response.data.name,
                        adminId: response.data.adminId,
                        description: response.data.description,
                        category: response.data.category,
                        postalCode: response.data.postalCode,
                        latitude: response.data.latitude,
                        longitude: response.data.longitude,
                        isCreate: false,
                    },
                });
            } else {
                showErrorNotificationFunction(response.message as string);
            }
        } else {
            resetForm({
                values: initValues,
            });
        }
    };

    const onSubmit = handleSubmit(async (values) => {
        delete values.isCreate;
        const loading = ElLoading.service({
            target: '.project-form',
        });
        let response: IBodyResponse<IProject>;
        if (isCreateProject.value) {
            response = (await projectService.create({
                ...values,
                timezone: moment.tz.guess(),
            })) as unknown as IBodyResponse<IProject>;
        } else {
            const selectedProjectId = computed(
                () => projectModule.selectedProjectIdToEdit,
            );
            response = (await projectService.update(selectedProjectId.value || NaN, {
                ...values,
            })) as unknown as IBodyResponse<IProject>;
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreateProject.value
                    ? t('project.message.updateSuccess')
                    : t('project.message.createSuccess'),
            );
            projectModule.setSelectedProjectIdToEdit(null);
            projectModule.setIsShowProjectForm(false);
            const loading = ElLoading.service({
                target: '.page-wrapper',
            });
            await projectModule.getProjectList();
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });

    const onDelete = async () => {
        const isConfirm = await showConfirmPopUpFunction(
            t('project.popup.delete.text') as string,
            t('project.popup.delete.title') as string,
            {
                type: 'error',
            },
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.project-form',
            });
            const selectedProjectId = computed(
                () => projectModule.selectedProjectIdToEdit,
            );
            const response = (await projectService.delete(
                selectedProjectId.value || '',
            )) as unknown as IBodyResponse;
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(t('project.message.deleteSuccess'));
                projectModule.setSelectedProjectIdToEdit(null);
                projectModule.setIsShowProjectForm(false);
                const loading = ElLoading.service({
                    target: '.page-wrapper',
                });
                await projectModule.getProjectList();
                loading.close();
            } else {
                showErrorNotificationFunction(response.message as string);
            }
        }
        return false;
    };
    const { value: name } = useField('name');
    const { value: adminId } = useField('adminId');
    const { value: category } = useField('category');
    const { value: description } = useField('description');
    const { value: postalCode } = useField('postalCode');
    const { value: latitude } = useField('latitude');
    const { value: longitude } = useField('longitude');
    const { value: isCreate } = useField('isCreate');

    return {
        errors,
        name,
        adminId,
        category,
        description,
        postalCode,
        latitude,
        longitude,
        isCreate,
        validate,
        onOpen,
        onSubmit,
        resetForm,
        onDelete,
        setFieldValue,
    };
}
