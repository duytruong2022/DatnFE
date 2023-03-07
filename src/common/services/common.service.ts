import { ApiService } from '@/common/services/api';
import service from '@/plugins/axios';
import {
    IBodyResponse,
    ICountry,
    IGetListResponse,
    IProjectFile,
    IQueryDropdown,
    IQueryDropdownByModules,
    IQueryDropdownFile,
} from '../interfaces';
import {
    IGetPostalCodeResponse,
    IGetCoordinatesFromPostalCode,
    IProject,
} from '@/features/project/interfaces';
import { ISecurityProfile } from '@/features/security-profile/interface';
import { IUser } from '@/features/user/interfaces';
import { IProfile } from '@/features/3D-viewer-profile/interfaces';

class CommonApiService extends ApiService {
    getCountryList() {
        return this.client.get<void, IBodyResponse<IGetListResponse<ICountry>>>(
            this.baseUrl + '/country',
        );
    }

    getSecurityProfileList() {
        return this.client.get<void, IBodyResponse<IGetListResponse<ISecurityProfile>>>(
            this.baseUrl + '/security-profile',
        );
    }

    getProjectProfileList(projectId: string | null) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IProfile>>>(
            this.baseUrl + '/project-profile',
            {
                params: {
                    projectId,
                },
            },
        );
    }

    getViewer3dProfileList() {
        return this.client.get<void, IBodyResponse<IGetListResponse<IProfile>>>(
            this.baseUrl + '/3d-viewer-profile',
        );
    }

    reverseGeocode(latitude: number, longitude: number) {
        return this.client.get<
            IGetPostalCodeResponse,
            IBodyResponse<IGetPostalCodeResponse>
        >(`${this.baseUrl}/postal-code`, {
            params: {
                longitude: longitude,
                latitude: latitude,
            },
        });
    }
    getCoordinatesFromPostalCode(postalCode: string, countryCode: string) {
        return this.client.get<
            IGetCoordinatesFromPostalCode,
            IBodyResponse<IGetCoordinatesFromPostalCode>
        >(`${this.baseUrl}/coordinates`, {
            params: {
                postalCode,
                countryCode,
            },
        });
    }

    getGroupList(query: IQueryDropdownByModules) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            this.baseUrl + '/group',
            { params: query },
        );
    }

    getProjectGroupList(query: IQueryDropdown) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            this.baseUrl + '/project-group',
            { params: query },
        );
    }

    getUserList(query: IQueryDropdownByModules) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IUser>>>(
            this.baseUrl + '/user',
            { params: query },
        );
    }

    getProjectList() {
        return this.client.get<void, IBodyResponse<IGetListResponse<IProject>>>(
            this.baseUrl + '/project',
        );
    }

    getCompanyList(query: IQueryDropdownByModules) {
        return this.client.get<void, IBodyResponse<IGetListResponse<string>>>(
            this.baseUrl + '/company',
            { params: query },
        );
    }

    getProjectFileList(query: IQueryDropdownFile) {
        return this.client.get<void, IBodyResponse<IGetListResponse<IProjectFile>>>(
            this.baseUrl + '/project-files',
            { params: query },
        );
    }
}

export const commonService = new CommonApiService({ baseUrl: '/common' }, service);
