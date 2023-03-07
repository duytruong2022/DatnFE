<template>
    <div>
        <FullCalendar ref="calendar" :options="calendarOptions">
            <template v-slot:eventContent="arg">
                <div class="p-2">
                    <i class="day-type-name">{{ arg?.event?.title }}</i>
                    <div
                        class="day-type-time-block"
                        v-html="getWorkingTime(arg.event?.id)"
                    ></div>
                </div>
            </template>
        </FullCalendar>
        <CalendarConfigFormPopup />
    </div>
</template>

<script lang="ts">
import FullCalendar, {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
    LocaleSingularArg,
} from '@fullcalendar/vue3';
import { mixins, Options, Vue } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { Prop, Watch } from 'vue-property-decorator';
import { ICalendar, ICalendarConfig, IGetCalendarConfigQuery } from '../../interfaces';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { appModule } from '@/plugins/vuex/appModule';
import { SUPPORT_LANGUAGE } from '@/common/constants';
import { calendarModule } from '../../store';
import moment from 'moment';
import CalendarConfigFormPopup from './CalendarConfigFormPopup.vue';
import { showErrorNotificationFunction } from '@/common/helpers';
import { ElLoading } from 'element-plus';
interface CalendarApi extends Vue {
    // eslint-disable-next-line @typescript-eslint/ban-types
    getApi: Function;
}
@Options({ components: { FullCalendar, CalendarConfigFormPopup } })
export default class Calendar extends mixins(UtilMixins) {
    @Prop({ required: true }) calendar!: ICalendar;

    mapIdToConfig = new Map<string, ICalendarConfig>();

    get calendarLocale(): LocaleSingularArg | undefined {
        return appModule.selectedLanguage === SUPPORT_LANGUAGE.FR ? frLocale : undefined;
    }

    get calendarConfigs(): ICalendarConfig[] {
        return calendarModule.calendarConfigs;
    }

    get currentCalendarMonth() {
        return calendarModule.currentCalendarMonth;
    }

    onClickDate = (selectedDate: DateSelectArg) => {
        selectedDate?.view?.calendar?.unselect();
        calendarModule.setSelectedDate(moment(selectedDate.start).fmDayString());

        const selectedConfig = this.calendarConfigs.find((config) => {
            return (
                moment(config.date).startOf('day').fmDayString() ===
                moment(selectedDate.start).startOf('day').fmDayString()
            );
        });
        if (selectedConfig) {
            calendarModule.setSelectedCalendarConfigId(selectedConfig._id || '');
        }
        calendarModule.setIsShowCalendarConfigPopup(true);
    };

    onClickEvent = (calendarConfig: EventClickArg) => {
        const selectedCalendarConfig = this.mapIdToConfig.get(
            calendarConfig.event?.id || '',
        );
        if (selectedCalendarConfig) {
            calendarModule.setSelectedCalendarConfigId(calendarConfig.event?.id);
        }
    };

    getWorkingTime(id: string) {
        const config = this.mapIdToConfig.get(id);
        if (!config) {
            return '';
        }
        return config.workingDayType.timeBlocks
            .map(
                (timeBlock) =>
                    `<span>${timeBlock.startTime} - ${timeBlock.endTime}</span>`,
            )
            .join('');
    }

    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        events: [],
        select: this.onClickDate,
        eventClick: this.onClickEvent,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        headerToolbar: {
            left: '',
            center: '',
            right: '',
        },
        eventStartEditable: false,
        initialView: 'dayGridMonth',
        showNonCurrentDates: false,
        locale: this.calendarLocale,
    };

    created() {
        this.fetchData({
            startDate: moment().startOf('month').utc().fmFullTimeString(),
            endDate: moment().endOf('month').utc().fmFullTimeString(),
        });
    }

    async fetchData(query: IGetCalendarConfigQuery) {
        const loading = ElLoading.service({ target: '.main-wrapper' });
        const response = await calendarModule.getCalendarConfigs({
            calendarId: calendarModule.selectedCalendarId,
            ...query,
        });
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        }
    }

    @Watch('calendarConfigs', { deep: true })
    onChangeCalendarConfigs(calendarConfigs: ICalendarConfig[]) {
        this.calendarOptions.events = calendarConfigs.map((config) => ({
            id: config._id,
            title: config.workingDayType.name,
            start: moment(config.date).fmDayString(),
        }));
        this.mapIdToConfig = new Map<string, ICalendarConfig>();
        calendarConfigs.forEach((config) => {
            this.mapIdToConfig.set(config._id || '', config);
        });
    }

    @Watch('currentCalendarMonth')
    async onChangeCurrentCalendarMonth(currentCalendarMonth: string) {
        await this.fetchData({
            startDate: moment(currentCalendarMonth)
                .startOf('month')
                .utc()
                .fmFullTimeString(),
            endDate: moment(currentCalendarMonth).endOf('month').utc().fmFullTimeString(),
        });
        const calendar = (this.$refs.calendar as CalendarApi).getApi();
        calendar.gotoDate(currentCalendarMonth);
    }
}
</script>

<style lang="scss" scoped>
.calendar-card {
    background-color: #ffffff;
    padding: 5px;
    border-radius: 10px;
}
.day-type-name {
    font-weight: 600;
}
:deep(.day-type-time-block) {
    span {
        display: block;
        margin-bottom: 3px;
    }
}
</style>
