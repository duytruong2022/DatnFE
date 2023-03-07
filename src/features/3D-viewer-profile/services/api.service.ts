import { ApiService } from '@/common/services/api';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import service from '@/plugins/axios';
import {
    ICreateProfileBody,
    IGetListProfileQueryString,
    IProfile,
    IUpdateProfileBody,
} from '../interfaces';

class ProfileService extends ApiService {
    async getProfileList(query: IGetListProfileQueryString) {
        return await this.client.get<
            IGetListProfileQueryString,
            IBodyResponse<IGetListResponse<IProfile>>
        >(this.baseUrl, {
            params: {
                ...query,
            },
        });
    }

    async getProfileById(_id: string) {
        return await this.client.get<IGetListProfileQueryString, IBodyResponse<IProfile>>(
            `${this.baseUrl}/${_id}`,
        );
    }

    async createProfile(body: ICreateProfileBody) {
        this.beforeCreate(body);
        return await this.client.post<ICreateProfileBody, IBodyResponse<IProfile>>(
            this.baseUrl,
            {
                ...body,
            },
        );
    }

    async updateProfile(_id: string, body: IUpdateProfileBody) {
        this.beforeUpdate(body);
        return await this.client.patch<IUpdateProfileBody, IBodyResponse<IProfile>>(
            `${this.baseUrl}/${_id}`,
            {
                ...body,
            },
        );
    }

    async deleteProfile(_id: string) {
        return await this.client.delete<void, IBodyResponse<{ _id: string }>>(
            `${this.baseUrl}/${_id}`,
        );
    }
}

export const viewer3dProfileService = new ProfileService(
    { baseUrl: '/3d-viewer-profile' },
    service,
);

export const projectProfileService = new ProfileService(
    { baseUrl: '/project-profile' },
    service,
);
