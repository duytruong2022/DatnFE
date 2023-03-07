<template>
    <el-button @click="$emit('create')" type="primary" v-if="canCreateUserField">{{
        $t('planning.buttons.addField')
    }}</el-button>
    <BaseTableLayout
        :data="fieldList"
        :totalItems="fieldList.length"
        :isHighlightCurrentRow="true"
        :isShowPagination="false"
    >
        <template #table-columns>
            <el-table-column
                :label="$t('planning.taskFields.labels.name')"
                align="left"
                prop="name"
            >
            </el-table-column>
            <el-table-column
                :label="$t('planning.taskFields.labels.dataType')"
                align="left"
                prop="dataType"
            >
                <template #default="scope">
                    {{ $t(`planning.taskFields.dataType.${scope.row.dataType}`) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="$t('planning.taskFields.labels.action')"
                width="120"
                align="center"
                fixed="right"
            >
                <template #default="scope">
                    <el-tooltip
                        placement="top"
                        :content="$t('planning.taskFields.tooltip.edit')"
                        v-if="canCreateUserField"
                    >
                        <el-icon class="icon" @click="$emit('update', scope.row._id)"
                            ><EditIcon
                        /></el-icon>
                    </el-tooltip>
                    <el-tooltip
                        placement="top"
                        :content="$t('planning.taskFields.tooltip.delete')"
                    >
                        <el-icon class="icon" @click="deleteField(scope.row._id)"
                            ><DeleteIcon
                        /></el-icon>
                    </el-tooltip>
                </template>
            </el-table-column>
        </template>
    </BaseTableLayout>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { Edit as EditIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { projectPlanningModule } from '../../store';
import { IAdditionalTaskField } from '../../interfaces';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { projectPlanningService } from '../../services/planning.service';
import ganttChartStorage from '@/common/ganttChartStorage';
import { Planning4DMixin } from '../../mixins/mixin';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';

@Options({
    components: { EditIcon, DeleteIcon },
})
export default class TaskFieldList extends mixins(Planning4DMixin) {
    get fieldList(): IAdditionalTaskField[] {
        return projectPlanningModule.planning?.additionalTaskFields || [];
    }

    get canCreateUserField() {
        return this.planningPermissions.includes(
            ProjectSecurityPermissions['4DPLANNING_CREATE_USER_DEFINED'],
        );
    }

    async deleteField(_id: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.taskFields.confirm.delete'),
            this.$t('planning.taskFields.confirm.deleteTitle'),
        );

        if (confirm === 'confirm') {
            const loading = ElLoading.service({});
            const response = await projectPlanningService.deleteAdditionalTaskField(
                projectPlanningModule.planning?._id as string,
                _id,
            );
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('planning.taskFields.successMessage.delete.field'),
                );
                if (projectPlanningModule.planning) {
                    // update local storage
                    const fieldIdsInStorage =
                        ganttChartStorage.getAdditionalTaskFields() || [];
                    ganttChartStorage.setAdditionalTaskFields(
                        fieldIdsInStorage.filter((id) => id !== _id),
                    );

                    // emit to gantt chart hide the deleted field
                    this.$emit('deleted', _id);

                    const remainFields = (
                        projectPlanningModule.planning?.additionalTaskFields || []
                    ).filter((item) => item._id !== _id);
                    projectPlanningModule.planning.additionalTaskFields = remainFields;
                }
            } else if (!response?.isRequestError) {
                showErrorNotificationFunction(response.message);
            }
            loading.close();
        }
    }
}
</script>

<style scoped lang="scss">
.icon {
    width: 25px;
    margin-left: 10px;
}
</style>
