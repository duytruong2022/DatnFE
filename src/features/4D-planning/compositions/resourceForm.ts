import {
    ARRAY_MAX_LENGTH,
    DATE_TIME_FORMAT,
    HttpStatus,
    INPUT_TEXT_MAX_LENGTH,
    TEXTAREA_MAX_LENGTH,
} from '@/common/constants';
import yup from '@/plugins/yup';
import { useI18n } from 'vue-i18n';
import {
    ResourceType,
    ResourceOtherUnitType,
    ResourceMaterialUnitType,
    AssignToExistingResourceOption,
} from '../constants';
import { projectPlanningModule } from '../store';
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../services/planning.service';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import localStorageAuthService from '@/common/authStorage';
import { IResourceWorkloadAndCapacity } from '../interfaces';
import i18n from '@/plugins/vue-i18n';
import moment from 'moment';

export const resourceSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).required().trim(),
    parentId: yup.string().optional().nullable(),
    type: yup
        .string()
        .oneOf([...Object.values(ResourceType)])
        .required(),
    unit: yup
        .string()
        .oneOf([
            ...Object.values(ResourceMaterialUnitType),
            ...Object.values(ResourceOtherUnitType),
        ])
        .required(),
    fileIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .optional(),
    description: yup.string().max(TEXTAREA_MAX_LENGTH).optional().trim(),
    calendar: yup.string().nullable().required(),
    workloadAndCapacity: yup.array().of(
        yup
            .object({
                effectiveDate: yup.date().nullable().required(),
                unitPerPeriod: yup
                    .number()
                    .min(0)
                    .transform((val) => (+val ? val : null))
                    .nullable()
                    .required(),
                pricePerUnit: yup
                    .number()
                    .min(0)
                    .transform((val) => (+val ? val : null))
                    .nullable()
                    .required(),
            })
            .test('checkUniqueEffectiveDate', function test(value) {
                if (!value.effectiveDate) {
                    return true;
                }
                const countEffectiveDate = this.parent?.filter(
                    (item: IResourceWorkloadAndCapacity) => {
                        return (
                            item.effectiveDate?.toString() ===
                            value.effectiveDate?.toString()
                        );
                    },
                )?.length;

                if (countEffectiveDate > 1) {
                    return this.createError({
                        message: i18n.global.t(
                            'planning.resource.message.effectiveExist',
                        ),
                        path: `${this.path}.effectiveDate`,
                    });
                }

                return true;
            }),
    ),
    assignToExistingResourceOption: yup
        .string()
        .oneOf([...Object.values(AssignToExistingResourceOption), null])
        .optional()
        .nullable(),
    sessionToken: yup.string().optional(),
});

export const innitResource = {
    name: '',
    type: ResourceType.EQUIPMENT,
    unit: '',
    fileIds: [],
    description: '',
    parentId: null,
    calendar: null,
    workloadAndCapacity: [],
    assignToExistingResourceOption: null,
    sessionToken: '',
};

export const setupResourceForm = () => {
    const { t } = useI18n();
    const isCreate = computed(() => !projectPlanningModule.selectedResource?._id);

    const { handleSubmit, errors, resetForm, validate, setErrors, setFieldValue } =
        useForm({
            initialValues: innitResource,
            validationSchema: resourceSchema,
        });

    const onSubmit = handleSubmit(async (values) => {
        let response;
        const planningPath = localStorageAuthService.getPlanningPermissions().path;
        const loading = ElLoading.service({});
        if (values.type === ResourceType.HUMAN_RESOURCE) {
            values.fileIds = [];
        }
        if (!values.parentId?.length) {
            values.parentId = null;
        }
        const formatDateForEffectiveDate = values.workloadAndCapacity?.map((item) => {
            return {
                effectiveDate: moment(item.effectiveDate)
                    .utc()
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                unitPerPeriod: item.unitPerPeriod,
                pricePerUnit: item.pricePerUnit,
            };
        });
        if (!isCreate.value) {
            response = await projectPlanningService.updateResource(
                projectPlanningModule.selectedResource?._id || '',
                {
                    name: values.name || '',
                    type: (values.type || '') as ResourceType,
                    unit: (values.unit || '') as
                        | ResourceOtherUnitType
                        | ResourceMaterialUnitType,
                    fileIds: values.fileIds || [],
                    planningId: projectPlanningModule.planning?._id || '',
                    description: values.description || '',
                    path: planningPath || '',
                    projectId: projectModule.selectedProjectId || '',
                    parentId: values.parentId || undefined,
                    calendar: values.calendar || '',
                    workloadAndCapacity:
                        formatDateForEffectiveDate as unknown as Array<IResourceWorkloadAndCapacity>,
                    assignToExistingResourceOption:
                        (values.assignToExistingResourceOption as AssignToExistingResourceOption) ||
                        undefined,
                    sessionToken: values.sessionToken,
                },
            );
        } else {
            response = await projectPlanningService.createResource({
                name: values.name || '',
                type: (values.type || '') as ResourceType,
                unit: (values.unit || '') as
                    | ResourceOtherUnitType
                    | ResourceMaterialUnitType,
                planningId: projectPlanningModule.planning?._id || '',
                fileIds: values.fileIds || [],
                description: values.description || '',
                path: planningPath || '',
                projectId: projectModule.selectedProjectId || '',
                parentId: values.parentId || undefined,
                calendar: values.calendar || '',
                workloadAndCapacity:
                    formatDateForEffectiveDate as unknown as Array<IResourceWorkloadAndCapacity>,
            });
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('planning.resource.message.updateSuccess')
                    : t('planning.resource.message.createSuccess'),
            );
            projectPlanningModule.setIsShowResourceDetailForm(false);
            projectPlanningModule.setIsShowImportResourcePopup(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await projectPlanningModule.getResourceTree({
                planningId: projectPlanningModule.planning?._id || '',
                projectId: projectModule.selectedProjectId || '',
                path: planningPath || '',
            });
            loading.close();
            projectPlanningModule.setSelectedResource(null);
            projectPlanningModule.setNeedReload3DViewer(true);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowResourceDetailForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await projectPlanningModule.getResourceTree({
                    planningId: projectPlanningModule.planning?._id || '',
                    projectId: projectModule.selectedProjectId || '',
                    path: planningPath || '',
                });
                loading.close();
                projectPlanningModule.setSelectedResource(null);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: name } = useField('name');
    const { value: type } = useField('type');
    const { value: fileIds } = useField('fileIds');
    const { value: description } = useField('description');
    const { value: parentId } = useField('parentId');
    const { value: calendar } = useField('calendar');
    const { value: workloadAndCapacity } =
        useField<IResourceWorkloadAndCapacity[]>('workloadAndCapacity');
    const { value: unit } = useField('unit');
    const { value: assignToExistingResourceOption } = useField(
        'assignToExistingResourceOption',
    );

    return {
        errors,
        onSubmit,
        resetForm,
        validate,
        setErrors,
        setFieldValue,
        name,
        type,
        fileIds,
        description,
        parentId,
        calendar,
        workloadAndCapacity,
        unit,
        assignToExistingResourceOption,
    };
};
