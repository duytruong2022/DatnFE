import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import { DATE_TIME_FORMAT, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectService } from '../services/project.service';
import { computed } from 'vue';
import { projectModule } from '../store';
import { IBodyResponse } from '@/common/interfaces';
import { IProject } from '../interfaces';
import { useI18n } from 'vue-i18n';
import moment from 'moment';

const validateProjectFormSchema = yup.object({
    description: yup.string().max(TEXTAREA_MAX_LENGTH).nullable(),
});

export function setupProjectDetailForm() {
    const { t } = useI18n();
    const initValues = {
        description: '',
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.project-form',
        });
        const selectedProjectId = computed(() => projectModule.selectedProjectId);
        const selectedProject = computed(() => projectModule.selectedProject).value;
        const response = (await projectService.update(selectedProjectId.value || NaN, {
            description: values.description,
            name: selectedProject.name,
            category: selectedProject.category,
            adminId: selectedProject.adminId,
            postalCode: selectedProject.postalCode,
            taskIdPrefix: selectedProject.name,
            taskIdSuffix: selectedProject.taskIdSuffix,
            taskIdIncrement: selectedProject.taskIdIncrement,
            latitude: selectedProject.latitude,
            longitude: selectedProject.longitude,
            dataDate: moment(selectedProject.dataDate)
                .utc()
                .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        })) as unknown as IBodyResponse<IProject>;
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(t('project.message.updateSuccess'));
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });

    const { value: description } = useField('description');

    return {
        errors,
        description,
        validate,
        onSubmit,
        resetForm,
    };
}
