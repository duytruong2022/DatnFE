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

const addUserSchema = yup.object({
    userIds: yup
        .array()
        .of(yup.string().max(INPUT_TEXT_MAX_LENGTH))
        .required()
        .label('user'),
});

const innitAddUser = {
    userIds: [],
};

export const setupAddUserForm = () => {
    const { t } = useI18n();
    const { handleSubmit, errors, resetForm, validate, setErrors } = useForm({
        initialValues: innitAddUser,
        validationSchema: addUserSchema,
    });

    const onSubmit = handleSubmit(async (values) => {
        let userIds = cloneDeep(pbsGroupModule.selectedPbsGroup?.userIds);
        userIds =
            userIds?.concat(values.userIds as string[]) || (values.userIds as string[]);
        const response = await pbsGroupService.update(
            pbsGroupModule.selectedPbsGroup?._id as string,
            {
                userIds,
            },
        );

        if (response.success) {
            showSuccessNotificationFunction(t('pbsGroup.message.addUserSuccess'));
            pbsGroupModule.setIsShowAddUserForm(false);
            const loading = ElLoading.service({
                target: '.main-wrapper',
            });
            await pbsGroupModule.getSelectedPbsGroup(
                pbsGroupModule.selectedPbsGroup?._id as string,
            );
            loading.close();
        } else {
            if (response.code === HttpStatus.ITEM_NOT_FOUND) {
                pbsGroupModule.setIsShowAddUserForm(false);
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

    const { value: userIds } = useField('userIds');

    const openAddUserForm = async () => {
        setErrors({});

        resetForm({ values: { ...innitAddUser } });
    };

    return {
        errors,
        onSubmit,
        openAddUserForm,
        resetForm,
        validate,
        setErrors,
        userIds,
    };
};
