import { ICommonGetListQuery } from '@/common/interfaces';
import { CalendarConfigRepeatTypes, DayType } from './constants';

export interface ICalendar {
    _id: string;
    name: string;
    isDefaultCalendar: boolean;
}

export interface ICalendarTimeBlock {
    startTime: string;
    endTime: string;
}

export interface IDayType {
    _id: string;
    name: string;
    timeBlocks: ICalendarTimeBlock[];
}

export interface IGetDayTypeQueryString extends ICommonGetListQuery {
    projectId: string;
}

export interface ICalendarConfig {
    _id?: string;
    date: string;
    dayType: DayType;
    workingDayType: IDayType;
    workingDayTypeId: string;
}
export interface IGetCalendarConfigQuery {
    startDate: string;
    endDate: string;
    calendarId?: string;
}

export interface IConfigCalendar {
    date: string;
    dayType: DayType;
    repeatType: CalendarConfigRepeatTypes;
    workingDayTypeId?: string;
    timezone: string;
}
