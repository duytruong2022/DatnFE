import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/plugins/vuex';
import {
    ICalendar,
    ICalendarConfig,
    IDayType,
    IGetCalendarConfigQuery,
    IGetDayTypeQueryString,
} from './interfaces';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { calendarService } from './services/calendar.service';
import { dayTypeService } from './services/day-type.service';
import { DEFAULT_FIRST_PAGE } from '@/common/constants';

@Module({ dynamic: true, namespaced: true, store, name: 'calendar' })
class CalendarModule extends VuexModule {
    calendarList: ICalendar[] = [];
    totalCalendar = 0;
    dayTypeList: IDayType[] = [];
    totalDayType = 0;
    isShowConfigCalendarPopup = false;
    selectedDate = '';
    currentCalendarMonth = '';
    calendarConfigs: ICalendarConfig[] = [];
    selectedCalendarId = '';
    selectedCalendarConfigId = '';
    selectedDayTypeId = '';
    isShowDayTypeFormPopup = false;
    isShowCalendarFormPopup = false;
    currentPage = DEFAULT_FIRST_PAGE;

    @Action
    async getCalendarList(projectId: string) {
        const calendarListQueryString: IGetDayTypeQueryString = {
            projectId,
            page: this.currentPage,
        };
        const response = (await calendarService.getList({
            ...calendarListQueryString,
        })) as IBodyResponse<IGetListResponse<ICalendar>>;
        if (response.success) {
            this.MUTATE_CALENDAR_LIST(response.data.items);
            this.MUTATE_TOTAL_CALENDAR(response.data.totalItems);
        }
        return response;
    }

    @Action
    async getDayTypeList(projectId: string) {
        const dayTypeListQueryString: IGetDayTypeQueryString = {
            projectId,
        };
        const response = (await dayTypeService.getList({
            ...dayTypeListQueryString,
        })) as IBodyResponse<IGetListResponse<IDayType>>;
        if (response.success) {
            this.MUTATE_DAY_TYPE_LIST(response.data.items);
            this.MUTATE_TOTAL_DAY_TYPE(response.data.totalItems);
        }
        return response;
    }

    @Action
    async getCalendarConfig(projectId: string) {
        const dayTypeListQueryString: IGetDayTypeQueryString = {
            projectId,
        };
        const response = (await dayTypeService.getList({
            ...dayTypeListQueryString,
        })) as IBodyResponse<IGetListResponse<IDayType>>;
        if (response.success) {
            this.MUTATE_DAY_TYPE_LIST(response.data.items);
            this.MUTATE_TOTAL_DAY_TYPE(response.data.totalItems);
        }
        return response;
    }

    @Action
    setIsShowCalendarConfigPopup(isShowCalendarConfigPopup: boolean) {
        this.MUTATE_IS_SHOW_CALENDAR_CONFIG_POPUP(isShowCalendarConfigPopup);
    }

    @Action
    setSelectedDate(selectedDate: string) {
        this.MUTATE_SELECTED_DATE(selectedDate);
    }

    @Action
    setCurrentCalendarMonth(currentCalendarMonth: string) {
        this.MUTATE_CURRENT_CALENDAR_MONTH(currentCalendarMonth);
    }

    @Action
    async getCalendarConfigs(query: IGetCalendarConfigQuery) {
        const response = await calendarService.getCalendarConfig(query.calendarId || '', {
            startDate: query.startDate,
            endDate: query.endDate,
        });
        if (response.success) {
            this.MUTATE_CALENDAR_CONFIGS(response.data.items);
        }
        return response;
    }

    @Action
    setSelectedCalendarId(selectedCalendarId: string) {
        this.MUTATE_SELECTED_CALENDAR_ID(selectedCalendarId);
    }

    @Action
    setSelectedCalendarConfigId(selectedCalendarConfigId: string) {
        this.MUTATE_SELECTED_CALENDAR_CONFIG_ID(selectedCalendarConfigId);
    }

    @Action
    setSelectedDayTypeId(selectedDayTypeId: string) {
        this.MUTATE_SELECTED_DAY_TYPE_ID(selectedDayTypeId);
    }

    @Action
    setIsShowDayTypeFormPopup(isShowDayTypeFormPopup: boolean) {
        this.MUTATE_IS_SHOW_DAY_TYPE_FORM_POPUP(isShowDayTypeFormPopup);
    }

    @Action
    setIsShowCalendarFormPopup(isShowCalendarFormPopup: boolean) {
        this.MUTATE_IS_SHOW_CALENDAR_FORM_POPUP(isShowCalendarFormPopup);
    }

    @Action
    setCurrentPage(currentPage: number) {
        this.MUTATE_CURRENT_PAGE(currentPage);
    }

    @Mutation
    MUTATE_CALENDAR_LIST(calendarList: ICalendar[]) {
        this.calendarList = calendarList;
    }

    @Mutation
    MUTATE_TOTAL_CALENDAR(totalCalendar: number) {
        this.totalCalendar = totalCalendar;
    }

    @Mutation
    MUTATE_DAY_TYPE_LIST(dayTyeList: IDayType[]) {
        this.dayTypeList = dayTyeList;
    }

    @Mutation
    MUTATE_TOTAL_DAY_TYPE(totalDayType: number) {
        this.totalDayType = totalDayType;
    }

    @Mutation
    MUTATE_IS_SHOW_CALENDAR_CONFIG_POPUP(isShowCalendarConfigPopup: boolean) {
        this.isShowConfigCalendarPopup = isShowCalendarConfigPopup;
    }

    @Mutation
    MUTATE_SELECTED_DATE(selectedDate: string) {
        this.selectedDate = selectedDate;
    }

    @Mutation
    MUTATE_CURRENT_CALENDAR_MONTH(currentCalendarMonth: string) {
        this.currentCalendarMonth = currentCalendarMonth;
    }

    @Mutation
    MUTATE_CALENDAR_CONFIGS(calendarConfigs: ICalendarConfig[]) {
        this.calendarConfigs = calendarConfigs;
    }

    @Mutation
    MUTATE_SELECTED_CALENDAR_ID(selectedCalendarId: string) {
        this.selectedCalendarId = selectedCalendarId;
    }

    @Mutation
    MUTATE_SELECTED_CALENDAR_CONFIG_ID(selectedCalendarConfigId: string) {
        this.selectedCalendarConfigId = selectedCalendarConfigId;
    }

    @Mutation
    MUTATE_SELECTED_DAY_TYPE_ID(selectedDayTypeId: string) {
        this.selectedDayTypeId = selectedDayTypeId;
    }

    @Mutation
    MUTATE_IS_SHOW_DAY_TYPE_FORM_POPUP(isShowDayTypeFormPopup: boolean) {
        this.isShowDayTypeFormPopup = isShowDayTypeFormPopup;
    }

    @Mutation
    MUTATE_IS_SHOW_CALENDAR_FORM_POPUP(isShowCalendarFormPopup: boolean) {
        this.isShowCalendarFormPopup = isShowCalendarFormPopup;
    }

    @Mutation
    MUTATE_CURRENT_PAGE(currentPage: number) {
        this.currentPage = currentPage;
    }
}

export const calendarModule = getModule(CalendarModule);
