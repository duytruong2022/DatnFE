import {
    FORM_VALIDATION,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import yup from '@/plugins/yup';
import { INPUT_NAME_MAX_LENGTH } from '../user/constant';

export enum SupportRequestOrderBy {
    EMAIL = 'email',
    CREATED_AT = 'createdAt',
}

export enum SupportRequestCategory {
    INCIDENT = 'incident',
    REQUEST = 'request',
    IDEA_SUGGESTION = 'idea_suggestion',
}

export enum SupportRequestSite {
    SPACIALYTIC_PLATFORM = 'spacialytic_platform',
    SPACIALYTIC_3DWEBVIEWER = 'spacialytic_3dwebviewer',
    SPACIALYTIC_CONSTELLATION = 'spacialytic_constellation',
}
export enum SupportRequestPriority {
    HIGHT = 'hight',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum SupportRequestExportFile {
    CSV = 'CSV',
}

export const categoryOptions = [
    {
        label: `supportRequest.list.category.${SupportRequestCategory.INCIDENT}`,
        value: SupportRequestCategory.INCIDENT,
    },
    {
        label: `supportRequest.list.category.${SupportRequestCategory.REQUEST}`,
        value: SupportRequestCategory.REQUEST,
    },
    {
        label: `supportRequest.list.category.${SupportRequestCategory.IDEA_SUGGESTION}`,
        value: SupportRequestCategory.IDEA_SUGGESTION,
    },
];

export const siteOptions = [
    {
        label: `supportRequest.list.site.${SupportRequestSite.SPACIALYTIC_PLATFORM}`,
        value: SupportRequestSite.SPACIALYTIC_PLATFORM,
    },
    {
        label: `supportRequest.list.site.${SupportRequestSite.SPACIALYTIC_CONSTELLATION}`,
        value: SupportRequestSite.SPACIALYTIC_CONSTELLATION,
    },
    {
        label: `supportRequest.list.site.${SupportRequestSite.SPACIALYTIC_3DWEBVIEWER}`,
        value: SupportRequestSite.SPACIALYTIC_3DWEBVIEWER,
    },
];

export const priorityOptions = [
    {
        label: `supportRequest.list.priority.${SupportRequestPriority.HIGHT}`,
        value: SupportRequestPriority.HIGHT,
    },
    {
        label: `supportRequest.list.priority.${SupportRequestPriority.MEDIUM}`,
        value: SupportRequestPriority.MEDIUM,
    },
    {
        label: `supportRequest.list.priority.${SupportRequestPriority.LOW}`,
        value: SupportRequestPriority.LOW,
    },
];

export const validateSupportRequestSchema = yup.object({
    email: yup
        .string()
        .max(INPUT_TEXT_MAX_LENGTH)
        .matches(FORM_VALIDATION.email)
        .required()
        .trim()
        .label('email'),
    firstName: yup
        .string()
        .trim()
        .nullable()
        .max(INPUT_NAME_MAX_LENGTH)
        .label('firstName'),
    lastName: yup.string().trim().nullable().max(INPUT_NAME_MAX_LENGTH).label('lastName'),
    category: yup.string().trim().required().max(INPUT_NAME_MAX_LENGTH).label('category'),
    priority: yup.string().trim().required().max(INPUT_NAME_MAX_LENGTH).label('priority'),
    version: yup
        .string()
        .trim()
        .optional()
        .nullable()
        .max(INPUT_NAME_MAX_LENGTH)
        .label('version'),
    site: yup.string().trim().required().max(INPUT_NAME_MAX_LENGTH).label('site'),
    object: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('object'),
    reference: yup
        .string()
        .trim()
        .max(INPUT_TEXT_MAX_LENGTH)
        .optional()
        .nullable()
        .label('reference'),
    detail: yup.string().trim().nullable().max(TEXTAREA_MAX_LENGTH).label('detail'),
});
