import { AccessModules } from '@/common/constants';
import { IBodyResponse } from '@/common/interfaces';
import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import {
    ICountPendingNotificationResponse,
    INotification,
    IRejectNotification,
} from '../interfaces';

class NotificationApiService extends ApiService {
    async reject(id: string, data: IRejectNotification) {
        this.beforeCreate<IRejectNotification>(data);
        return await this.client.post<INotification, IBodyResponse<INotification>>(
            `${this.baseUrl}/${id}/reject`,
            data,
        );
    }

    async countPendingNotification(accessModules: AccessModules[] | null) {
        return await this.client.get<
            void,
            IBodyResponse<ICountPendingNotificationResponse>
        >(`${this.baseUrl}/pending`, {
            params: {
                accessModules,
            },
        });
    }
}

export const notificationService = new NotificationApiService(
    { baseUrl: '/notification' },
    service,
);
