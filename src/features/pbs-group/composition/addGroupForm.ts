import { HttpStatus, INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import yup from '@/plugins/yup';
import { ElLoading } from 'element-plus';
import cloneDeep from 'lodash/cloneDeep';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { pbsGroupService } from '../services/pbsGroup.service';
import { pbsGroupModule } from '../store';

const addGroupSchema = yup.object({
    groupIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .required()
        .label('group'),
});

const innitAddGroup = {
    groupIds: [],
};

export const setupAddGroupForm = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: innitAddGroup,
        validationSchema: addGroupSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let groupIds = cloneDeep(pbsGroupModule.selectedPbsGroup?.groupIds);
        groupIds =
            groupIds?.concat(values.groupIds as string[]) ||
            (values.groupIds as string[]);
        const response = await pbsGroupService.update(
            pbsGroupModule.selectedPbsGroup?._id as string,
            {
                groupIds,
            },
        );

        if (response.success) {
            showSuccessNotificationFunction(t('pbsGroup.message.addGroupSuccess'));
            pbsGroupModule.setIsShowAddGroupForm(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await pbsGroupModule.getSelectedPbsGroup(
                pbsGroupModule.selectedPbsGroup?._id as string,
            );
            loading.close();
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                pbsGroupModule.setIsShowAddGroupForm(false);
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

    const { value: groupIds } = useField('groupIds');

    const openAddGroupForm = async () => {
        setErrors({});

        resetForm({ values: { ...innitAddGroup } });
    };

    return {
        errors,
        onSubmit,
        openAddGroupForm,
        resetForm,
        validate,
        setErrors,
        groupIds,
    };
};
