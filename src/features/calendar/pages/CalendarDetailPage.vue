<template>
    <div>
        <div class="header">
            <div class="navigate-button">
                <BaseDatePicker
                    v-model:value="currentCalendarMonth"
                    type="month"
                    dateFormat="YYYY-MM"
                />
            </div>
            <h4>{{ currentCalendarMonthDisplay }}</h4>
        </div>
        <Calendar />
        <DayTypeFormPopup />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { calendarModule } from '../store';
import { ICalendar, ICalendarConfig } from '../interfaces';
import { Prop } from 'vue-property-decorator';
import Calendar from '../components/calendar-detail/Calendar.vue';
import moment from 'moment';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
} from '@element-plus/icons-vue';
import DayTypeFormPopup from '../components/calendar-detail/DayTypeFormPopup.vue';

@Options({
    components: {
        Calendar,
        DayTypeFormPopup,
        ArrowLeftIcon,
        ArrowRightIcon,
    },
})
export default class CalendarPage extends mixins(UtilMixins) {
    @Prop({ required: true }) calendarId!: string;

    calendarConfigs: ICalendarConfig[] = [];

    get calendarList(): ICalendar[] {
        return calendarModule.calendarList;
    }

    get currentCalendarMonth() {
        return calendarModule.currentCalendarMonth;
    }

    set currentCalendarMonth(value: string) {
        calendarModule.setCurrentCalendarMonth(value);
    }

    get currentCalendarMonthDisplay() {
        return moment(this.currentCalendarMonth).fmYearMonthString();
    }

    async created() {
        calendarModule.setSelectedCalendarId(this.calendarId);
        calendarModule.setCurrentCalendarMonth(moment().fmDayString());
    }

    onClickPreviousMonth() {
        calendarModule.setCurrentCalendarMonth(
            moment(calendarModule.currentCalendarMonth)
                .subtract(1, 'month')
                .fmDayString(),
        );
    }

    onClickThisMonth() {
        calendarModule.setCurrentCalendarMonth(moment().fmDayString());
    }

    onClickNextMonth() {
        calendarModule.setCurrentCalendarMonth(
            moment(calendarModule.currentCalendarMonth).add(1, 'month').fmDayString(),
        );
    }
}
</script>

<style lang="scss" scoped>
.header {
    h4 {
        font-weight: 600;
    }
    text-align: center;
    position: relative;
    .navigate-button {
        position: absolute;
        top: 0;
        left: 0;
    }
}
.icon {
    width: 16px;
}
</style>
