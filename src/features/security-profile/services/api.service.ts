import { ApiService } from '@/common/services/api';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import service from '@/plugins/axios';
import {
    ICreateSecurityProfile,
    ISecurityProfile,
    ISecurityProfileQueryList,
    IUpdateSecurityProfile,
} from '../interface';

class SecurityProfileService extends ApiService {
    async getSecurityProfileList(query: ISecurityProfileQueryList) {
        return await this.client.get<
            ISecurityProfileQueryList,
            IBodyResponse<IGetListResponse<ISecurityProfile>>
        >(this.baseUrl, {
            params: {
                ...query,
            },
        });
    }

    async createSecurityProfile(data: ICreateSecurityProfile) {
        this.beforeCreate<ICreateSecurityProfile>(data);
        return await this.client.post<ISecurityProfile, IBodyResponse<ISecurityProfile>>(
            this.baseUrl,
            { ...data },
        );
    }

    async updateSecurityProfile(id: string, data: IUpdateSecurityProfile) {
        this.beforeUpdate<IUpdateSecurityProfile>(data);
        return await this.client.patch<ISecurityProfile, IBodyResponse<ISecurityProfile>>(
            `${this.baseUrl}/${id}`,
            { ...data },
        );
    }

    async deleteSecurityProfile(id: string) {
        return await this.client.delete<{ _id: string }, IBodyResponse<{ _id: string }>>(
            `${this.baseUrl}/${id}`,
        );
    }
}

export const securityProfileService = new SecurityProfileService(
    { baseUrl: '/security-profile' },
    service,
);
