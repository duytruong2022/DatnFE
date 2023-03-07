import {
    ExportFormat2D,
    ExportFormat3D,
    ExportType,
    INPUT_TEXT_MAX_LENGTH,
} from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { DimensionType } from '@/features/3D-viewer/constant';
import { webViewer3DService } from '@/features/3D-viewer/services/api.service';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { projectModule } from '@/features/project/store';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
    fileXMLName: yup.string().max(INPUT_TEXT_MAX_LENGTH).trim().required(),
    saveXMLPath: yup.string().required(),
    folder3DPath: yup.string().required(),
    file3DName: yup.string().max(INPUT_TEXT_MAX_LENGTH).required(),
    exportType: yup.mixed<ExportType>().oneOf(Object.values(ExportType)).required(),
    exportFormat: yup
        .mixed<ExportFormat3D | ExportFormat2D>()
        .oneOf([...Object.values(ExportFormat3D), ...Object.values(ExportFormat2D)])
        .required(),
    exportFileType: yup.mixed<DimensionType>().oneOf([...Object.values(DimensionType)]),
});

export const setupSaveAsForm = () => {
    const { t } = useI18n();
    const initValues = {
        planningId: '',
        planningName: '',
        selectedObjects: [],
        fileXMLName: '',
        saveXMLPath: '',
        file3DName: '',
        folder3DPath: '',
        exportType: ExportType.EXPORT,
        exportFormat: ExportFormat3D['3DSP'],
        exportFileType: DimensionType['3D'],
    };

    const { handleSubmit, resetForm, setFieldValue, validate, errors, validateField } =
        useForm({
            initialValues: initValues,
            validationSchema: exportFormSchema,
        });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        const sessionToken = computed(() => webViewer3DModule.sessionToken);
        const responseSaveResource = await webViewer3DService.saveFile({
            folderPath: values.folder3DPath || '',
            name: values.file3DName || '',
            sessionToken: sessionToken.value || '',
            exportType: values.exportType || ExportType.ZONE,
            exportFormat: values.exportFormat || ExportFormat3D['3DSP'],
            projectId: projectModule.selectedProjectId || undefined,
            exportFileType: values.exportFileType || '',
        });
        if (responseSaveResource.success) {
            showSuccessNotificationFunction(t('viewer3d.success.save') as string);
        } else {
            showErrorNotificationFunction(responseSaveResource.message as string);
        }
        const response = await projectPlanningService.exportPlanningToPrimaveraP6(
            projectPlanningModule.planning?._id as string,
            {
                projectId: projectPlanningModule.planning?.projectId as string,
                planningId: values.planningId as string,
                planningName: values.planningName as string,
                selectedObjects: values.selectedObjects as string[],
                fileName: values.fileXMLName as string,
                savePath: values.saveXMLPath as string,
            },
        );
        loading.close();

        if (response.success) {
            showSuccessNotificationFunction(
                t('planning.exportForm.message.exportSuccess'),
            );
            projectPlanningModule.setIsShowSaveAsPopup(false);
        } else {
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: planningId } = useField('planningId');
    const { value: planningName } = useField('planningName');
    const { value: selectedObjects } = useField('selectedObjects');
    const { value: fileXMLName } = useField('fileXMLName');
    const { value: saveXMLPath } = useField('saveXMLPath');
    const { value: file3DName } = useField('file3DName');
    const { value: folder3DPath } = useField('folder3DPath');
    const { value: exportType } = useField('exportType');
    const { value: exportFormat } = useField('exportFormat');
    const { value: exportFileType } = useField('exportFileType');

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
        fileXMLName,
        saveXMLPath,
        file3DName,
        folder3DPath,
        exportType,
        exportFormat,
        exportFileType,
        validateField,
    };
};
function t(arg0: string): string {
    throw new Error('Function not implemented.');
}
