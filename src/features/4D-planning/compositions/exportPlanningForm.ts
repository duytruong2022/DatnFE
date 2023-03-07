import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { ExportObjectList } from '../constants';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const exportFormSchema = yup.object({
    planningId: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    planningName: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    selectedObjects: yup
        .array(
            yup
                .string()
                .oneOf([...Object.values(ExportObjectList)])
                .required(),
        )
        .required(),
    fileName: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    savePath: yup.string().required(),
});

export const setupExportPlanningForm = () => {
    const initValues = {
        planningId: '',
        planningName: '',
        selectedObjects: [],
        fileName: '',
        savePath: '',
    };

    const { handleSubmit, resetForm, setFieldValue, validate, errors } = useForm({
        initialValues: initValues,
        validationSchema: exportFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const response = await projectPlanningService.exportPlanningToPrimaveraP6(
            projectPlanningModule.planning?._id as string,
            {
                projectId: projectPlanningModule.planning?.projectId as string,
                planningId: values.planningId as string,
                planningName: values.planningName as string,
                selectedObjects: values.selectedObjects as string[],
                fileName: values.fileName as string,
                savePath: values.savePath as string,
            },
        );
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('planning.exportForm.message.exportSuccess'),
            );
            projectPlanningModule.setIsShowExportPlanningPopup(false);
        } else {
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: planningId } = useField('planningId');
    const { value: planningName } = useField('planningName');
    const { value: selectedObjects } = useField('selectedObjects');
    const { value: fileName } = useField('fileName');
    const { value: savePath } = useField('savePath');

    return {
        initValues,
        onSubmit,
        resetForm,
        setFieldValue,
        validate,
        errors,
        planningId,
        planningName,
        selectedObjects,
        fileName,
        savePath,
    };
};
