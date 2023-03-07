import { AccessModules } from '@/common/constants';
import { ICommonGetListQuery, IFile } from '@/common/interfaces';

export interface ISupportRequest {
    email: string;
    firstName: string;
    lastName: string;
    category: string;
    priority: string;
    site: string;
    version?: string;
    object?: string;
    reference?: string;
    detail?: string;
    accessModule?: AccessModules;
    file?: IFile | null;
    createdBy?: string;
}

export interface ISupportRequestUpdateBody extends ISupportRequest {
    _id: string | undefined;
}

export interface ISupportRequestQueryList extends ICommonGetListQuery {
    categories?: string[];
    sites?: string[];
    priorities?: string[];
    accessModule?: AccessModules | null;
}

export interface ISupportRequestExportQueryList extends ISupportRequestQueryList {
    socketClientId: string;
}
