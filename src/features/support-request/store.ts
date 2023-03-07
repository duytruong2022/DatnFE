import localStorageAuthService from '@/common/authStorage';
import { LIMIT_PER_PAGE, OrderDirection } from '@/common/constants';
import { IBodyResponse, IFile, IGetListResponse } from '@/common/interfaces';
import store from '@/plugins/vuex';
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { SupportRequestOrderBy } from './contanst';
import {
    ISupportRequestQueryList,
    ISupportRequest,
    ISupportRequestUpdateBody,
} from './interface';
import { supportRequestService } from './services/api.service';

export const initSupportRequestQuery: ISupportRequestQueryList = {
    keyword: '',
    orderBy: SupportRequestOrderBy.CREATED_AT,
    orderDirection: OrderDirection.ASCENDING,
    page: 1,
    limit: LIMIT_PER_PAGE,
    categories: [],
    sites: [],
    priorities: [],
    accessModule: null,
};
@Module({ dynamic: true, namespaced: true, store, name: 'support-request' })
class SupportRequestModule extends VuexModule {
    supportRequestList: ISupportRequest[] = [];
    totalItems = 0;
    supportRequestQueryList: ISupportRequestQueryList = initSupportRequestQuery;

    isShowSupportRequestForm = false;
    isShowSupportRequestDetail = false;
    selectedSupportRequest: ISupportRequestUpdateBody | null = null;

    uploadFile: IFile | null = null;

    @Action
    async getSupportRequestList(): Promise<
        IBodyResponse<IGetListResponse<ISupportRequest>>
    > {
        this.supportRequestQueryList.accessModule =
            localStorageAuthService.getSelectedAccessModule();
        const response = (await supportRequestService.getList({
            ...this.supportRequestQueryList,
        })) as IBodyResponse<IGetListResponse<ISupportRequest>>;
        if (response.success) {
            this.MUTATE_SUPPORT_REQUEST_LIST(response?.data?.items || []);
            this.MUTATE_TOTAL_ITEMS(response?.data?.totalItems || 0);
        } else {
            this.MUTATE_SUPPORT_REQUEST_LIST([]);
            this.MUTATE_TOTAL_ITEMS(0);
        }
        return response;
    }

    @Action
    setSupportRequestList(value: ISupportRequest[]) {
        this.MUTATE_SUPPORT_REQUEST_LIST(value);
    }

    @Action
    setQueryList(value: ISupportRequestQueryList) {
        this.MUTATE_QUERY_LIST(value);
    }

    @Action
    setTotalItems(value: number) {
        this.MUTATE_TOTAL_ITEMS(value);
    }

    @Action
    setIsShowSupportRequestForm(value: boolean) {
        this.MUTATE_IS_SHOW_SUPPORT_REQUEST_POP_UP(value);
    }

    @Action
    setIsShowSupportRequestDetail(value: boolean) {
        this.MUTATE_IS_SHOW_SUPPORT_REQUEST_DETAIL_POP_UP(value);
    }

    @Mutation
    MUTATE_TOTAL_ITEMS(value: number) {
        this.totalItems = value;
    }

    @Action
    setSelectedSupportRequest(supportRequest: ISupportRequestUpdateBody | null) {
        this.MUTATE_SELECTED_SUPPORT_REQUEST(supportRequest);
    }

    @Action
    setUploadFile(file: IFile | null) {
        this.MUTATE_UPLOAD_FILE(file);
    }

    @Mutation
    MUTATE_QUERY_LIST(value: ISupportRequestQueryList) {
        this.supportRequestQueryList = {
            ...this.supportRequestQueryList,
            ...value,
        };
    }

    @Mutation
    MUTATE_SUPPORT_REQUEST_LIST(value: ISupportRequest[]) {
        this.supportRequestList = value;
    }

    @Mutation
    MUTATE_IS_SHOW_SUPPORT_REQUEST_POP_UP(value: boolean) {
        this.isShowSupportRequestForm = value;
    }

    @Mutation
    MUTATE_IS_SHOW_SUPPORT_REQUEST_DETAIL_POP_UP(value: boolean) {
        this.isShowSupportRequestDetail = value;
    }

    @Mutation
    MUTATE_SELECTED_SUPPORT_REQUEST(supportRequest: ISupportRequestUpdateBody | null) {
        this.selectedSupportRequest = supportRequest;
    }

    @Mutation
    MUTATE_UPLOAD_FILE(file: IFile | null) {
        this.uploadFile = file;
    }
}
export const supportRequestModule = getModule(SupportRequestModule);
