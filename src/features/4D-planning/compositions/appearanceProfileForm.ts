import { ARRAY_MAX_LENGTH, HttpStatus, INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';
import { useI18n } from 'vue-i18n';
import { projectPlanningModule } from '../store';
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../services/planning.service';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { AppearanceOptions, AppearanceType, GrowthSimulation } from '../constants';
import { projectModule } from '@/features/project/store';
import localStorageAuthService from '@/common/authStorage';
import {
    IActiveAppearanceProfile,
    IEndAppearanceProfile,
    IStartAppearanceProfile,
} from '../interfaces';
const appearanceProfileSchema = yup.object({
    name: yup.string().max(INPUT_TEXT_MAX_LENGTH).required().trim(),
    type: yup
        .string()
        .oneOf([...Object.values(AppearanceType)])
        .required(),
    growthSimulation: yup
        .string()
        .oneOf([...Object.values(GrowthSimulation)])
        .required(),
    assignFileIds: yup
        .array()
        .of(yup.string().optional().optional().nullable())
        .max(ARRAY_MAX_LENGTH)
        .optional(),
    startAppearanceProfile: yup.object({
        colorType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),
        colorValue: yup.string().when('colorType', {
            is: AppearanceOptions.CUSTOM,
            then: yup
                .string()
                .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
                .required(),
        }),
        transparencyType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),
        transparencyValue: yup
            .number()
            .min(0)
            .max(100)
            .when('transparencyType', {
                is: AppearanceOptions.CUSTOM,
                then: yup
                    .number()
                    .transform((value) => (isNaN(value) ? undefined : value))
                    .required(),
            })
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable(true),
    }),
    activeAppearanceProfile: yup.object({
        colorType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),
        colorValue: yup.string().when('colorType', {
            is: AppearanceOptions.CUSTOM,
            then: yup
                .string()
                .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
                .required(),
        }),
        transparencyType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),
        transparencyStartValue: yup
            .number()
            .min(0)
            .max(100)
            .when('transparencyType', {
                is: AppearanceOptions.CUSTOM,
                then: yup
                    .number()
                    .transform((value) => (isNaN(value) ? undefined : value))
                    .required(),
            })
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable(true),
        transparencyInterpolation: yup.boolean(),
        transparencyEndValue: yup
            .number()
            .min(0)
            .max(100)
            .when('transparencyInterpolation', {
                is: true,
                then: yup
                    .number()
                    .transform((value) => (isNaN(value) ? undefined : value))
                    .required(),
            })
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable(true),
    }),
    endAppearanceProfile: yup.object({
        colorType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),

        colorValue: yup.string().when('colorType', {
            is: AppearanceOptions.CUSTOM,
            then: yup
                .string()
                .matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
                .required(),
        }),
        transparencyType: yup
            .string()
            .oneOf([...Object.values(AppearanceOptions)])
            .required(),
        transparencyValue: yup
            .number()
            .min(0)
            .max(100)
            .when('transparencyType', {
                is: AppearanceOptions.CUSTOM,
                then: yup
                    .number()
                    .transform((value) => (isNaN(value) ? undefined : value))
                    .required(),
            })
            .transform((value) => (isNaN(value) ? undefined : value))
            .nullable(true),
    }),
});

export const innitStartAppearanceProfile = {
    colorType: AppearanceOptions.ORIGINAL,
    colorValue: '',
    transparencyType: AppearanceOptions.ORIGINAL,
    transparencyValue: null,
};

export const innitEndAppearanceProfile = {
    colorType: AppearanceOptions.ORIGINAL,
    colorValue: '',
    transparencyType: AppearanceOptions.ORIGINAL,
    transparencyValue: null,
};

export const innitActiveAppearanceProfile = {
    colorType: AppearanceOptions.ORIGINAL,
    colorValue: '',
    transparencyType: AppearanceOptions.ORIGINAL,
    transparencyStartValue: null,
    transparencyInterpolation: false,
    transparencyEndValue: null,
};

export const innitAppearanceProfile = {
    name: '',
    type: AppearanceType.INSTALL,
    growthSimulation: GrowthSimulation.RIGHT_LEFT,
    assignFileIds: [],
    startAppearanceProfile: innitStartAppearanceProfile,
    activeAppearanceProfile: innitActiveAppearanceProfile,
    endAppearanceProfile: innitEndAppearanceProfile,
};

export const setupAppearanceProfileForm = () => {
    const { t } = useI18n();
    const isCreate = computed(
        () => !projectPlanningModule.selectedAppearanceProfile?._id,
    );

    const { handleSubmit, errors, resetForm, validate, setErrors, validateField } =
        useForm({
            initialValues: innitAppearanceProfile,
            validationSchema: appearanceProfileSchema,
        });

    const onSubmit = handleSubmit(async (values) => {
        let response;
        const planningPath = localStorageAuthService.getPlanningPermissions().path;

        const loading = ElLoading.service({});

        if (!isCreate.value) {
            const notAssignFileIds =
                projectPlanningModule.selectedResource?.fileIds.filter(
                    (fileId) => !values.assignFileIds?.includes(fileId),
                );
            response = await projectPlanningService.updateAppearanceProfile(
                projectPlanningModule.selectedAppearanceProfile?._id || '',
                {
                    name: values.name || '',
                    planningId: projectPlanningModule.planning?._id || '',
                    type: (values.type || '') as AppearanceType,
                    growthSimulation: (values.growthSimulation || '') as GrowthSimulation,
                    assignFileIds: values.assignFileIds || [],
                    startAppearanceProfile:
                        values.type !== AppearanceType.INSTALL &&
                        values.type !== AppearanceType.TEMPORARY
                            ? (({ ...values.startAppearanceProfile } ||
                                  {}) as IStartAppearanceProfile)
                            : undefined,
                    activeAppearanceProfile: ({ ...values.activeAppearanceProfile } ||
                        {}) as IActiveAppearanceProfile,
                    endAppearanceProfile:
                        values.type !== AppearanceType.REMOVE &&
                        values.type !== AppearanceType.TEMPORARY
                            ? (({ ...values.endAppearanceProfile } ||
                                  {}) as IEndAppearanceProfile)
                            : undefined,
                    notAssignFileIds: notAssignFileIds || [],
                    projectId: projectModule.selectedProjectId || '',
                    path: planningPath,
                },
            );
        } else {
            response = await projectPlanningService.createAppearanceProfile({
                name: values.name || '',
                planningId: projectPlanningModule.planning?._id || '',
                type: (values.type || '') as AppearanceType,
                growthSimulation: (values.growthSimulation || '') as GrowthSimulation,
                startAppearanceProfile:
                    values.type !== AppearanceType.INSTALL &&
                    values.type !== AppearanceType.TEMPORARY
                        ? (({ ...values.startAppearanceProfile } ||
                              {}) as IStartAppearanceProfile)
                        : undefined,
                activeAppearanceProfile: ({ ...values.activeAppearanceProfile } ||
                    {}) as IActiveAppearanceProfile,
                endAppearanceProfile:
                    values.type !== AppearanceType.REMOVE &&
                    values.type !== AppearanceType.TEMPORARY
                        ? (({ ...values.endAppearanceProfile } ||
                              {}) as IEndAppearanceProfile)
                        : undefined,
                projectId: projectModule.selectedProjectId || '',
                path: planningPath,
            });
        }
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('planning.appearanceProfile.message.updateSuccess')
                    : t('planning.appearanceProfile.message.createSuccess'),
            );
            projectPlanningModule.setIsShowAppearanceProfileDetailForm(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await projectPlanningModule.getAppearanceProfileList({
                planningId: projectPlanningModule.planning?._id || '',
            });
            loading.close();
            projectPlanningModule.setSelectedAppearanceProfile(null);
            projectPlanningModule.setNeedReload3DViewer(true);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                projectPlanningModule.setIsShowAppearanceProfileDetailForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await projectPlanningModule.getAppearanceProfileList({
                    planningId: projectPlanningModule.planning?._id || '',
                });
                loading.close();
                projectPlanningModule.setSelectedAppearanceProfile(null);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: name } = useField('name');
    const { value: type } = useField('type');
    const { value: growthSimulation } = useField('growthSimulation');
    const { value: assignFileIds } = useField('assignFileIds');
    const { value: startAppearanceProfile } = useField('startAppearanceProfile');
    const { value: activeAppearanceProfile } = useField('activeAppearanceProfile');
    const { value: endAppearanceProfile } = useField('endAppearanceProfile');

    return {
        errors,
        onSubmit,
        resetForm,
        validate,
        setErrors,
        name,
        type,
        growthSimulation,
        assignFileIds,
        startAppearanceProfile,
        activeAppearanceProfile,
        endAppearanceProfile,
        validateField,
    };
};
