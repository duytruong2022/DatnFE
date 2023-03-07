import moment from 'moment';
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
import { ICalendarConfig, IDayType } from '../interfaces';
import { computed } from 'vue';
import { dayTypeService } from '../services/day-type.service';
import { projectModule } from '@/features/project/store';

const validateProjectFormSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    timeBlocks: yup
        .array()
        .of(
            yup.object({
                startTime: yup.string().required(),
                endTime: yup.string().required(),
            }),
        )
        .required(),
});

export function setupWorkingDayTypeForm() {
    const initValues = {
        name: '',
        timeBlocks: [],
    };
    const { handleSubmit, errors, resetForm, validate, setFieldValue } = useForm({
        initialValues: initValues,
        validationSchema: validateProjectFormSchema,
    });

    const onOpen = async () => {
        const selectedDayTypeId = computed(() => calendarModule.selectedDayTypeId);
        if (selectedDayTypeId.value.length) {
            const loading = ElLoading.service({
                target: '.calendar-config-form-popup',
            });
            const response = (await dayTypeService.getDetail(
                selectedDayTypeId.value || '',
            )) as IBodyResponse<IDayType>;
            loading.close();
            if (response.success) {
                const todayString = moment().fmDayString();
                resetForm({
                    values: {
                        name: response.data.name,
                        timeBlocks: response.data.timeBlocks?.map((timeBlock) => ({
                            startTime: `${todayString} ${timeBlock.startTime}`,
                            endTime: `${todayString} ${timeBlock.endTime}`,
                        })),
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
        const selectedDayTypeId = computed(() => calendarModule.selectedDayTypeId);
        const selectedProjectId = computed(() => projectModule.selectedProjectId);
        let response;
        if (!selectedDayTypeId.value.length) {
            response = (await dayTypeService.create({
                name: values.name,
                projectId: selectedProjectId.value,
                timeBlocks: values.timeBlocks?.map((timeBlock) => ({
                    startTime: moment(timeBlock.startTime).fmHourMinuteString(),
                    endTime: moment(timeBlock.endTime).fmHourMinuteString(),
                })),
            })) as unknown as IBodyResponse<ICalendarConfig[]>;
        } else {
            //update
            response = (await dayTypeService.update(selectedDayTypeId.value, {
                name: values.name,
                timeBlocks: values.timeBlocks?.map((timeBlock) => ({
                    startTime: moment(timeBlock.startTime).fmHourMinuteString(),
                    endTime: moment(timeBlock.endTime).fmHourMinuteString(),
                })),
            })) as unknown as IBodyResponse<ICalendarConfig[]>;
        }

        loading.close();
        if (response.success) {
            calendarModule.setIsShowDayTypeFormPopup(false);

            if (!selectedDayTypeId.value.length) {
                showSuccessNotificationFunction(
                    i18n.global.t('calendar.config.dayType.message.create'),
                );
            } else {
                showSuccessNotificationFunction(
                    i18n.global.t('calendar.config.dayType.message.update'),
                );
            }
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            const calendarId = computed(() => calendarModule.selectedCalendarId);
            const currentCalendarMonth = computed(
                () => calendarModule.currentCalendarMonth,
            );
            const selectedProjectId = computed(() => projectModule.selectedProjectId);
            await Promise.all([
                calendarModule.getCalendarConfigs({
                    calendarId: calendarId.value,
                    startDate: moment(currentCalendarMonth.value)
                        .startOf('month')
                        .utc()
                        .fmFullTimeString(),
                    endDate: moment(currentCalendarMonth.value)
                        .endOf('month')
                        .utc()
                        .fmFullTimeString(),
                }),
                calendarModule.getDayTypeList(selectedProjectId.value || ''),
            ]);

            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: name } = useField('name');
    const { value: timeBlocks } = useField('timeBlocks');

    return {
        errors,
        name,
        timeBlocks,
        validate,
        onOpen,
        onSubmit,
        resetForm,
        setFieldValue,
    };
}
