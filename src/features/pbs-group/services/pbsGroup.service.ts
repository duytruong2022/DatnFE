import service from '@/plugins/axios';
import { ApiService } from '@/common/services/api';
import { ICommonGetListInProjectQuery } from '@/common/interfaces';

class PbsGroupApiService extends ApiService {
    getListPbs(queryString: ICommonGetListInProjectQuery) {
        return this.client.get(`${this.baseUrl}`, { params: queryString });
    }
}

export const pbsGroupService = new PbsGroupApiService({ baseUrl: '/pbs-group' }, service);
