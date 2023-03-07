import { DimensionType } from './../constant';
import { projectModule } from '@/features/project/store';
import { ExportFormat3D, ExportType, ExportFormat2D } from './../../../common/constants';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { ElLoading } from 'element-plus';
import {
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { Regex } from '@/common/constants';
import { webViewer3DService } from '../services/api.service';
import { webViewer3DModule } from '../store';

const validateSaveFileFormSchema = yup.object({
    folderPath: yup.string().required(),
    name: yup
        .string()
        .trim()
        .matches(Regex.FILE_NAME, 'abs.fileForm.error.invalidFileName')
        .required(),
    exportType: yup.mixed<ExportType>().oneOf(Object.values(ExportType)).required(),
    exportFormat: yup
        .mixed<ExportFormat3D | ExportFormat2D>()
        .oneOf([...Object.values(ExportFormat3D), ...Object.values(ExportFormat2D)])
        .required(),
    exportFileType: yup.mixed<DimensionType>().oneOf([...Object.values(DimensionType)]),
});
export function setupSaveFileForm() {
    const { t } = useI18n();
    const initValues = {
        name: '',
        folderPath: '',
        exportType: ExportType.ZONE,
        exportFormat: ExportFormat3D['3DSP'],
        exportFileType: DimensionType['3D'],
    };
    const { handleSubmit, errors, resetForm, validate } = useForm({
        initialValues: initValues,
        validationSchema: validateSaveFileFormSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        const loading = ElLoading.service({
            target: '.repository-popup',
        });
        const sessionToken = computed(() => webViewer3DModule.sessionToken);
        const response = await webViewer3DService.saveFile({
            folderPath: values.folderPath || '',
            name: values.name || '',
            sessionToken: sessionToken.value || '',
            exportType: values.exportType || ExportType.ZONE,
            exportFormat: values.exportFormat || ExportFormat3D['3DSP'],
            projectId: projectModule.selectedProjectId || undefined,
            exportFileType: values.exportFileType || '',
        });
        if (values.exportType === ExportType.SAVE_AS) {
            webViewer3DModule.setOpenFileId(response.data?.fileId);
        }
        loading.close();
        webViewer3DModule.setIsShowRepositoryPopup(false);
        webViewer3DModule.setIsShowAbsPopup(false);
        if (response.success) {
            showSuccessNotificationFunction(t('viewer3d.success.save') as string);
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    });
    const { value: name } = useField('name');
    const { value: folderPath } = useField('folderPath');
    const { value: exportType } = useField('exportType');
    const { value: exportFormat } = useField('exportFormat');
    const { value: exportFileType } = useField('exportFileType');
    return {
        errors,
        name,
        folderPath,
        exportType,
        exportFormat,
        exportFileType,
        validate,
        onSubmit,
        resetForm,
    };
}
