import { HttpStatus, INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { pbsGroupService } from '../services/pbsGroup.service';
import { pbsGroupModule } from '../store';

const pbsGroupSchema = yup.object({
    name: yup.string().trim().max(INPUT_TEXT_MAX_LENGTH).required().label('pbsGroupName'),
});

const initPbsGroup = {
    name: '',
};

export const setupPbsGroupForm = () => {
    const { t } = useI18n();
    const isCreate = computed(() => pbsGroupModule.isCreatePbsGroup);

    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: initPbsGroup,
        validationSchema: pbsGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let response;
        const loading = ElLoading.service({
            target: '.pbs-group-form',
        });
        if (!isCreate.value) {
            response = await pbsGroupService.update(
                pbsGroupModule.selectedPbsGroup?._id as string,
                {
                    name: values.name,
                },
            );
        } else {
            const selectedProjectId = computed(() => projectModule.selectedProjectId);
            const parent = computed(() => pbsGroupModule.selectedParentPbsGroup);

            response = await pbsGroupService.create({
                name: values.name,
                projectId: selectedProjectId.value,
                parentId: parent.value?._id,
            });
        }
        loading.close();
        if (response.success) {
            showSuccessNotificationFunction(
                !isCreate.value
                    ? t('pbsGroup.message.updatePbsGroupSuccess')
                    : t('pbsGroup.message.createPbsGroupSuccess'),
            );
            pbsGroupModule.setIsShowPbsGroupForm(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await pbsGroupModule.getPbsTree();
            loading.close();
            pbsGroupModule.setIsChangePbsGroupTree(true);
            pbsGroupModule.setSelectedParentPbs(null);
            if (!isCreate.value) {
                await pbsGroupModule.getSelectedPbsGroup(
                    pbsGroupModule.selectedPbsGroup?._id || '',
                );
            }
            pbsGroupModule.setIsCreatePbsGRoup(false);
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                pbsGroupModule.setIsShowPbsGroupForm(false);
                const loading = ElLoading.service({
                    target: '.main-wrapper',
                });
                await pbsGroupModule.getPbsTree();
                loading.close();
                pbsGroupModule.setIsChangePbsGroupTree(true);
            }
            showErrorNotificationFunction(response.message);
        }
    });

    const { value: name } = useField('name');

    const openPbsGroupForm = async () => {
        setErrors({});

        if (!isCreate.value) {
            resetForm({
                values: {
                    name: pbsGroupModule.selectedPbsGroup?.name,
                },
            });
        } else {
            resetForm({ values: { ...initPbsGroup } });
        }
    };

    return {
        errors,
        onSubmit,
        openPbsGroupForm,
        resetForm,
        validate,
        name,
        isCreate,
    };
};
