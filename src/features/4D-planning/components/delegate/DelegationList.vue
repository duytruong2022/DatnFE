<template>
    <div class="table">
        <BaseTableLayout
            :data="planningList"
            :totalItems="planningList.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
            @row-click="handleRowClick"
        >
            <template #table-columns>
                <el-table-column width="55">
                    <template #default="scope">
                        <CircleCheckFilledIcon
                            v-if="scope.row?._id === planningSelected?._id"
                            class="icon"
                            color="#409EFF"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.type')"
                    :width="180"
                    align="center"
                >
                    {{ planningExtension }}
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.4d')" align="center">
                    <template #default="scope">
                        {{ scope.row?.userAccess?.city || '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.pbs')" align="center">
                    <template #default="scope">
                        {{ scope.row?.pbs }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.modifiedDate')"
                    :width="200"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.updatedAt) }}
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
        <div class="error-message">
            <span class="validation-error text-start mb-3" v-if="showError">{{
                $t('planning.folderForm.delegate.validateMessage')
            }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';

import {
    Document as DocumentIcon,
    CircleCheckFilled as CircleCheckFilledIcon,
    View,
} from '@element-plus/icons-vue';
import { projectPlanningModule } from '../../store';
import { IPlanning } from '../../interfaces';
import { ABSUploadedFileExtensions } from '@/features/abs/constants';
import { AbsFileMixin } from '@/features/abs/mixin';
import { Prop, Watch } from 'vue-property-decorator';
import { ElLoading } from 'element-plus';
import { boolean } from 'yup';
import localStorageAuthService from '@/common/authStorage';
import { PlanningOrderBy } from '../../constants';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectPlanningService } from '../../services/planning.service';

@Options({
    components: { DocumentIcon, View, CircleCheckFilledIcon },
})
export default class DelegationList extends mixins(AbsFileMixin) {
    @Prop({ type: boolean, default: false })
    readonly getDataDefault!: false;
    @Prop({ type: Array(String), default: [] })
    readonly taskIds!: [];
    planningExtension = ABSUploadedFileExtensions.PLANNING;
    planningSelected: IPlanning | null = null;
    showError = false;

    get planningList(): IPlanning[] {
        return projectPlanningModule.planningList.filter((planning) => {
            return planning.delegatedFromPlanningId === projectPlanningModule.planningId;
        });
    }

    get tableLayoutRef() {
        return this.$refs.tableLayoutRef as {
            toggleRowSelection: (row: any, selected: boolean) => void;
        };
    }

    handleRowClick(row: IPlanning) {
        this.planningSelected = row;
        this.showError = false;
    }

    async handleSubmit() {
        if (!this.planningSelected) {
            this.showError = true;
            return;
        }
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.folderForm.delegate.confirmDelegateMessage', {
                planningName: this.planningSelected.name,
            }),
            this.$t('planning.folderForm.delegate.confirmDelegateTitle'),
        );
        if (confirm) {
            const projectId = localStorageAuthService.getSelectedProjectId();
            const path = localStorageAuthService.getPlanningPermissions().path || '';
            const loading = ElLoading.service({});
            const response = await projectPlanningService.delegateTaskToExistDelegation(
                this.planningSelected._id,
                {
                    taskIds: this.taskIds,
                    projectId,
                    path,
                },
            );
            loading.close();
            if (response.success) {
                showSuccessNotificationFunction(
                    this.$t('planning.folderForm.delegate.success') as string,
                );
                this.$emit('delegated', response.data);
            } else {
                showErrorNotificationFunction(response.message as string);
            }
        }
    }

    @Watch('getDataDefault')
    async handleOnChangeGetDataDefault(value: boolean) {
        if (value) {
            const loading = ElLoading.service({});
            const projectId = localStorageAuthService.getSelectedProjectId();
            await projectPlanningModule.getPlanningList({
                projectId,
                query: {
                    orderBy: PlanningOrderBy.CREATED_AT,
                    allowSynthesizedPlanning: false,
                },
            });
            loading.close();
        } else {
            this.planningSelected = null;
            this.showError = false;
        }
    }
}
</script>

<style scoped lang="scss">
.table {
    width: 100% !important;
    background-color: #ffffff;
    border-radius: 16px;
    padding: 10px 0px;
}
.icon {
    width: 18px;
}

.error-message {
    border-top: 0 !important;
}
</style>
