import localStorageAuthService from '@/common/authStorage';
import { INTEGER_POSITIVE_MAX_VALUE } from '@/common/constants';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectModule } from '@/features/project/store';
import yup from '@/plugins/yup';
import cloneDeep from 'lodash/cloneDeep';
import { ElLoading } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { LinkDependency, LinkType } from '../constants';
import { ICreateLinkDto, ILinkDetail, IUpdateLinkDto } from '../interfaces';
import { projectPlanningService } from '../services/planning.service';
import { projectPlanningModule } from '../store';

const linkSchema = yup.object({
    linkType: yup
        .string()
        .transform((val) => (val ? val : ''))
        .oneOf(Object.values(LinkType))
        .nullable()
        .required(),
    taskLag: yup.number().max(INTEGER_POSITIVE_MAX_VALUE).nullable().required(),
});

export const setupLinkForm = () => {
    const { t } = useI18n();

    const initValues = {
        linkType: '',
        taskLag: null,
    };

    const { handleSubmit, errors, setValues, setFieldValue, resetForm } = useForm({
        initialValues: initValues,
        validationSchema: linkSchema,
    });

    const onAddLinksItem = handleSubmit(async (values) => {
        const linkFormParam = cloneDeep(projectPlanningModule.linkFormPopupParam);

        const newLinksDetail: ILinkDetail[] = linkFormParam.taskLinkToList.map((task) => {
            return {
                dependency: linkFormParam.dependency || '',
                taskLinkToId: task.taskLinkToId,
                taskLinkToGanttId: task.taskLinkToGanttId,
                taskLinkToName: task.taskLinkToName,
                taskLinkToStart: task.taskLinkToStart,
                taskLinkToFinish: task.taskLinkToFinish,
                type: values.linkType as LinkType,
                taskLag: values.taskLag || 0,
            };
        });

        const bulkCreateLinkList = cloneDeep(projectPlanningModule.bulkCreateLinkList);
        const currentLinkList = projectPlanningModule.planning?.taskLinks;

        const linkNeedCreateList: ILinkDetail[] = [];
        const checkExist = newLinksDetail.every((link) => {
            let newLinkItem: ICreateLinkDto;
            if (link.dependency === LinkDependency.PREDECESSOR) {
                newLinkItem = {
                    source: link.taskLinkToId,
                    target: projectPlanningModule.linkPopupParam.selectedTask
                        ?._id as string,
                    type: values.linkType as LinkType,
                    lag: values.taskLag || 0,
                };
            } else {
                newLinkItem = {
                    target: link.taskLinkToId,
                    source: projectPlanningModule.linkPopupParam.selectedTask
                        ?._id as string,
                    type: values.linkType as LinkType,
                    lag: values.taskLag || 0,
                };
            }

            const isLinkExist = currentLinkList?.find((item) => {
                return (
                    item.source === newLinkItem.source &&
                    item.target === newLinkItem.target &&
                    item.type === newLinkItem.type
                );
            });

            if (isLinkExist) {
                showErrorNotificationFunction(
                    t('planning.linkForm.messages.linkExistInGantt'),
                );
                return false;
            }

            const isLinkExistInBulkCreateList = bulkCreateLinkList?.find((item) => {
                return (
                    item.dependency === link.dependency &&
                    item.taskLinkToGanttId === link.taskLinkToGanttId &&
                    item.type === link.type
                );
            });

            if (isLinkExistInBulkCreateList) {
                showErrorNotificationFunction(
                    t('planning.linkForm.messages.linkExistInList'),
                );
                return false;
            }

            linkNeedCreateList.push(link);
            return true;
        });

        if (checkExist) {
            projectPlanningModule.setBulkCreateLinkList([
                ...bulkCreateLinkList,
                ...linkNeedCreateList,
            ]);
            return true;
        } else {
            return false;
        }
    });

    const onEditLinkItem = handleSubmit(async (values) => {
        const link = projectPlanningModule.linkFormPopupParam.taskLinkToList[0];
        const bulkCreateLinkList = cloneDeep(projectPlanningModule.bulkCreateLinkList);
        const linkNeedEdit = bulkCreateLinkList.find((item) => {
            return (
                item.dependency === projectPlanningModule.linkFormPopupParam.dependency &&
                item.taskLinkToId === link.taskLinkToId
            );
        });
        if (linkNeedEdit) {
            linkNeedEdit.type = values.linkType as LinkType;
            linkNeedEdit.taskLag = values.taskLag as number;
            projectPlanningModule.setBulkCreateLinkList(bulkCreateLinkList);
            return true;
        }

        return false;
    });

    const linkSelected = computed(
        () => projectPlanningModule.linkDetailFormPopupParam.linkSelected,
    );

    const onUpdateLink = handleSubmit(async (values) => {
        const loading = ElLoading.service({});
        if (!linkSelected.value) {
            return;
        }
        const linkBody: IUpdateLinkDto = {
            source: linkSelected.value.source,
            target: linkSelected.value.target,
            type: linkSelected.value.type,
            lag: values.taskLag || 0,
            projectId: projectModule.selectedProjectId || '',
            path: localStorageAuthService.getPlanningPermissions().path || '',
        };

        const response = await projectPlanningService.updateLink(
            linkSelected.value._id,
            linkBody,
        );
        loading.close();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
        } else {
            showSuccessNotificationFunction(
                t('planning.linkForm.messages.updateSuccess'),
            );
            return response;
        }
    });

    const { value: linkType } = useField('linkType');
    const { value: taskLag } = useField('taskLag');

    return {
        initValues,
        onAddLinksItem,
        onEditLinkItem,
        onUpdateLink,
        setValues,
        setFieldValue,
        resetForm,
        errors,
        linkType,
        taskLag,
    };
};
