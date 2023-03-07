import moment from 'moment';
import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import yup from '@/plugins/yup';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse } from '@/common/interfaces';
import { CalendarConfigRepeatTypes, DayType } from '../constants';
import { useI18n } from 'vue-i18n';
import { calendarService } from '../services/calendar.service';
import { calendarModule } from '../store';
import { ICalendarConfig } from '../interfaces';
import { computed } from 'vue';

const validateProjectFormSchema = yup.object({
    dayType: yup.string().oneOf(Object.values(DayType)).required(),
    workingDayTypeId: yup.string().when('dayType', {
        is: DayType.WORKING_DAY,
        then: yup.string().required(),
        otherwise: yup.string().notRequired(),
    }),
    repeatType: yup.string().when('dayType', {
        is: DayType.WORKING_DAY,
        then: yup.string().oneOf(Object.values(CalendarConfigRepeatTypes)).required(),
        otherwise: yup.string().optional(),
    }),
});

export function setupCalendarConfigForm() {
    const { t } = useI18n();
    const initValues = {
        dayType: DayType.WORKING_DAY,
        workingDayTypeId: '',
        repeatType: CalendarConfigRepeatTypes.ONLY_THIS_DATE,
    };
    const { handleSubmit, errors, resetForm, validate, setFieldValue } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectFormSchema,
    });

    const onOpen = async () => {
        const selectedCalendarConfigId = computed(
            () => calendarModule.selectedCalendarConfigId,
        );
        const selectedCalendarId = computed(() => calendarModule.selectedCalendarId);
        if (selectedCalendarConfigId.value.length) {
            const loading = ElLoading.service({
                target: '.calendar-config-form-popup',
            });
            const response = (await calendarService.getCalendarConfigById(
                selectedCalendarId.value || '',
                selectedCalendarConfigId.value || '',
            )) as IBodyResponse<ICalendarConfig>;
            loading.close();
            if (response.success) {
                resetForm({
                    values: {
                        dayType: response.data.dayType as unknown as DayType,
                        workingDayTypeId: response.data.workingDayTypeId,
                        repeatType: initValues.repeatType,
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
        const response = (await calendarService.configCalendar(
            calendarModule.selectedCalendarId,
            {
                date: moment(calendarModule.selectedDate).fmDayString(),
                dayType: values.dayType as DayType,
                repeatType: values.repeatType as CalendarConfigRepeatTypes,
                workingDayTypeId: values.workingDayTypeId,
                timezone: moment.tz.guess(),
            },
        )) as unknown as IBodyResponse<ICalendarConfig[]>;

        loading.close();
        if (response.success) {
            calendarModule.setIsShowCalendarConfigPopup(false);
            showSuccessNotificationFunction(t('calendar.config.popup.message.success'));
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await calendarModule.getCalendarConfigs({
                calendarId: calendarModule.selectedCalendarId,
                startDate: moment(calendarModule.currentCalendarMonth)
                    .startOf('month')
                    .utc()
                    .fmFullTimeString(),
                endDate: moment(calendarModule.currentCalendarMonth)
                    .endOf('month')
                    .utc()
                    .fmFullTimeString(),
            });

            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: dayType } = useField('dayType');
    const { value: workingDayTypeId } = useField('workingDayTypeId');
    const { value: repeatType } = useField('repeatType');

    return {
        errors,
        dayType,
        workingDayTypeId,
        repeatType,
        validate,
        onOpen,
        onSubmit,
        resetForm,
        setFieldValue,
    };
}
