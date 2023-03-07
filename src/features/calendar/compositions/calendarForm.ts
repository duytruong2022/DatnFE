import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import i18n from '@/plugins/vue-i18n';
import { calendarModule } from '../store';
import { ICalendar, ICalendarConfig } from '../interfaces';
import { computed } from 'vue';
import { projectModule } from '@/features/project/store';
import { calendarService } from '../services/calendar.service';

const validateProjectFormSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).required(),
});

export function calendarForm() {
    const initValues = {
        name: '',
    };
    const { handleSubmit, errors, resetForm, validate, setFieldValue } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectFormSchema,
    });

    const onOpen = async () => {
        const selectedCalendarId = computed(() => calendarModule.selectedCalendarId);
        if (selectedCalendarId.value.length) {
            const loading = ElLoading.service({
                target: '.calendar-config-form-popup',
            });
            const response = (await calendarService.getDetail(
                selectedCalendarId.value || '',
            )) as IBodyResponse<ICalendar>;
            loading.close();
            if (response.success) {
                resetForm({
                    values: {
                        name: response.data.name,
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
        const loading = ElLoading.service({
            target: '.calendar-config-form-popup',
        });
        let response;
        const selectedCalendarId = computed(() => calendarModule.selectedCalendarId);
        const projectId = computed(() => projectModule.selectedProjectId);
        if (!selectedCalendarId.value.length) {
            response = (await calendarService.create({
                name: values.name,
                projectId: projectId.value,
            })) as unknown as IBodyResponse<ICalendar>;
        } else {
            response = (await calendarService.update(selectedCalendarId.value, {
                name: values.name,
            })) as unknown as IBodyResponse<ICalendarConfig[]>;
        }

        loading.close();
        if (response.success) {
            calendarModule.setIsShowCalendarFormPopup(false);
            if (!selectedCalendarId.value.length) {
                showSuccessNotificationFunction(
                    i18n.global.t('calendar.list.message.create.success'),
                );
            } else {
                showSuccessNotificationFunction(
                    i18n.global.t('calendar.list.message.update.success'),
                );
            }
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await calendarModule.getCalendarList(projectId.value || '');
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: name } = useField('name');

    return {
        errors,
        name,
        validate,
        onOpen,
        onSubmit,
        resetForm,
        setFieldValue,
    };
}
