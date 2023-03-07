export enum DayType {
    WORKING_DAY = 'workingDay',
    NONE_WORKING_DAY = 'noneWorkingDay',
}

export const dayTypeOptions = [
    {
        label: 'calendar.config.popup.form.type.workingDay',
        value: DayType.WORKING_DAY,
    },
    {
        label: 'calendar.config.popup.form.type.noneWorkingDay',
        value: DayType.NONE_WORKING_DAY,
    },
];

export enum CalendarConfigRepeatTypes {
    ONLY_THIS_DATE = 'onlyThisDate',
    ALL_SAME_WEEK_DAY_THIS_MONTH = 'allSameWeekDayThisMonth',
    ALL_SAME_WEEK_DAY_THIS_YEAR = 'allSameWeekDayThisYear',
    ALL_SAME_WEEK_DAY = 'allSameWeekDay',
    GREATER_THAN_OR_EQUAL_TO_THIS_DATE = 'greaterThanOrEqualToThisDate',
    LESS_THAN_OR_EQUAL_TO_THIS_DATE = 'lessThanOrEqualToThisDate',
}

export const calendarConfigRepeatOption = [
    {
        label: 'calendar.config.popup.form.repeat.onlyThisDate',
        value: CalendarConfigRepeatTypes.ONLY_THIS_DATE,
    },
    {
        label: 'calendar.config.popup.form.repeat.allSameWeekDayThisMonth',
        value: CalendarConfigRepeatTypes.ALL_SAME_WEEK_DAY_THIS_MONTH,
    },
    {
        label: 'calendar.config.popup.form.repeat.allSameWeekDayThisYear',
        value: CalendarConfigRepeatTypes.ALL_SAME_WEEK_DAY_THIS_YEAR,
    },
    {
        label: 'calendar.config.popup.form.repeat.allSameWeekDay',
        value: CalendarConfigRepeatTypes.ALL_SAME_WEEK_DAY,
    },
];
