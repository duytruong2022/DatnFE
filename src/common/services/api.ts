import { AxiosInstance, AxiosPromise } from 'axios';
import { trimObject } from '../helpers';
import { IBodyResponse, ICommonGetListQuery, IGetListResponse } from '../interfaces';

interface IServiceOption {
    baseUrl: string;
}

export class ApiService {
    client: AxiosInstance;
    baseUrl: string;

    constructor(params: IServiceOption, axios: AxiosInstance) {
        this.client = axios;
        this.baseUrl = params.baseUrl;
    }

    get detailUrl(): string {
        return this.baseUrl;
    }

    get createUrl(): string {
        return this.baseUrl;
    }

    get updateUrl(): string {
        return this.baseUrl;
    }

    get deleteUrl(): string {
        return this.baseUrl;
    }

    useClient(axios: AxiosInstance): void {
        this.client = axios;
    }

    beforeCreate<P>(params: P): P {
        trimObject(params);
        return params;
    }

    beforeUpdate<P>(params: P): P {
        trimObject(params);
        return params;
    }

    getList<T>(
        queryString: ICommonGetListQuery,
    ): Promise<IBodyResponse<IGetListResponse<T>>> {
        return this.client.get(`${this.baseUrl}`, { params: queryString });
    }

    getDetail<R extends IBodyResponse<R>>(id: number | string): AxiosPromise {
        return this.client.get<R, R>(this.detailUrl + '/' + id);
    }

    create<P, R extends IBodyResponse<R>>(params: P): Promise<R> {
        params = this.beforeCreate<P>(params);
        return this.client.post(this.createUrl, params);
    }

    update<P, R extends IBodyResponse<R>>(id: number | string, params: P): Promise<R> {
        params = this.beforeUpdate<P>(params);
        return this.client.patch(this.updateUrl + '/' + id, params);
    }

    delete<R extends IBodyResponse<R>>(id: number | string): Promise<R> {
        return this.client.delete<R, R>(this.deleteUrl + '/' + id);
    }
}
