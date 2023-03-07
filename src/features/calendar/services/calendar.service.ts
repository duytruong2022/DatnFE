import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import { ICalendarConfig, IConfigCalendar, IGetCalendarConfigQuery } from '../interfaces';

class CalendarService extends ApiService {
    async getCalendarConfig(
        calendarId: string,
        params: IGetCalendarConfigQuery,
    ): Promise<IBodyResponse<IGetListResponse<ICalendarConfig>>> {
        return await this.client.get<
            void,
            IBodyResponse<IGetListResponse<ICalendarConfig>>
        >(`${this.baseUrl}/${calendarId}/config`, {
            params,
        });
    }

    async getCalendarConfigById(
        calendarId: string,
        calendarConfigId: string,
    ): Promise<IBodyResponse<ICalendarConfig>> {
        return await this.client.get<void, IBodyResponse<ICalendarConfig>>(
            `${this.baseUrl}/${calendarId}/config/${calendarConfigId}`,
        );
    }

    async configCalendar(
        calendarId: string,
        data: IConfigCalendar,
    ): Promise<IBodyResponse<ICalendarConfig>> {
        return await this.client.post(`${this.baseUrl}/${calendarId}/config`, data);
    }

    async setDefaultCalendar(calendarId: string): Promise<IBodyResponse<void>> {
        return await this.client.post(`${this.baseUrl}/${calendarId}/set-default`);
    }

    async unsetDefaultCalendar(calendarId: string): Promise<IBodyResponse<void>> {
        return await this.client.post(`${this.baseUrl}/${calendarId}/unset-default`);
    }
}

export const calendarService = new CalendarService({ baseUrl: '/calendar' }, service);
