<template>
    <el-dialog
        v-model="open"
        :title="$t('planning.buttons.delegate')"
        width="80%"
        height="60%"
        @open="handleOpen"
        @close="handleClose"
    >
        <div v-show="isAllowedCancelDelegation">
            <EmptyData />
        </div>
        <div v-show="!isAllowedCancelDelegation">
            <el-tabs v-model="delegateOption">
                <el-tab-pane
                    :label="
                        $t(
                            `planning.folderForm.delegate.options.${DelegateOptions.NEW_PLANNING}`,
                        )
                    "
                    :name="DelegateOptions.NEW_PLANNING"
                >
                    <DelegateFormPopup
                        ref="delegationForm"
                        :taskIds="taskIds"
                        :getDataDefault="getDataDefault"
                        @delegated="handleDelegated"
                    />
                </el-tab-pane>
                <el-tab-pane
                    :label="
                        $t(
                            `planning.folderForm.delegate.options.${DelegateOptions.EXIST_PLANNING}`,
                        )
                    "
                    :name="DelegateOptions.EXIST_PLANNING"
                >
                    <DelegationList
                        ref="delegationList"
                        :taskIds="taskIds"
                        :getDataDefault="getDataDefault"
                        @delegated="handleDelegated"
                    />
                </el-tab-pane>
            </el-tabs>
        </div>

        <template #footer>
            <span class="dialog-footer">
                <el-button
                    v-if="isAllowedCancelDelegation"
                    type="danger"
                    @click="onCancelDelegation"
                >
                    {{ $t('planning.buttons.cancelDelegation') }}
                </el-button>
                <el-button @click="onCancel">{{
                    $t('planning.folderForm.buttons.cancel')
                }}</el-button>
                <el-button
                    type="primary"
                    v-if="!isAllowedCancelDelegation"
                    @click="handleSubmit"
                    :disabled="isAllowedCancelDelegation"
                    >{{ $t('planning.folderForm.buttons.submit') }}</el-button
                >
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

import cloneDeep from 'lodash/cloneDeep';
import { DelegateOptions } from '../../constants';
import { IDelegateResponse, IProjectTask } from '../../interfaces';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';
import DelegateFormPopup from './DelegateFormPopup.vue';
import EmptyData from '@/components/base/EmptyData.vue';
import DelegationList from './DelegationList.vue';

@Options({
    components: {
        EmptyData,
        DelegateFormPopup,
        DelegationList,
    },
})
export default class DelegatePopup extends mixins(UtilMixins) {
    @Prop({ type: Array(String), default: [] })
    readonly taskIds!: [];
    DelegateOptions = DelegateOptions;
    getDataDefault = false;

    get open(): boolean {
        return projectPlanningModule.delegationPopupParam.show;
    }

    get delegateOption() {
        return projectPlanningModule.delegationPopupParam.tabSelected;
    }

    set delegateOption(value: DelegateOptions) {
        projectPlanningModule.delegationPopupParam.tabSelected = value;
    }

    get isAllowedCancelDelegation() {
        const selectedTaskIdList = projectPlanningModule.selectedTaskIdList;
        if (selectedTaskIdList.length !== 1) {
            return false;
        }
        const task = projectPlanningModule.planning?.tasks.find(
            (task) => task._id === selectedTaskIdList[0],
        );
        return !!task?.delegatedTo;
    }

    onCancel() {
        projectPlanningModule.setDelegatePopupParam({
            show: false,
            tabSelected: DelegateOptions.NEW_PLANNING,
        });
        this.getDataDefault = false;
    }

    async handleSubmit() {
        if (
            projectPlanningModule.delegationPopupParam.tabSelected ===
            DelegateOptions.NEW_PLANNING
        ) {
            await (this.$refs.delegationForm as DelegateFormPopup).handleSubmit();
        } else {
            await (this.$refs.delegationList as DelegationList).handleSubmit();
        }
    }

    async handleOpen() {
        this.getDataDefault = true;
    }

    handleClose() {
        this.onCancel();
    }

    handleDelegated(data: IDelegateResponse) {
        this.$emit('delegated', data);
        this.onCancel();
    }

    async onCancelDelegation() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.folderForm.cancelDelegation.confirmMessage'),
            this.$t('planning.folderForm.cancelDelegation.confirmTitle'),
        );
        if (!confirm) {
            return;
        }

        const selectedTaskId = projectPlanningModule.taskPopupParams.selectedTaskId;
        const loading = ElLoading.service({});
        const response = await projectPlanningService.cancelDelegation(
            selectedTaskId as string,
        );
        loading.close();
        if (response.success) {
            projectPlanningModule.setDelegatePopupParam({
                show: false,
                tabSelected: DelegateOptions.NEW_PLANNING,
            });
            showSuccessNotificationFunction(
                this.$t('planning.folderForm.cancelDelegation.success'),
            );

            const planning = cloneDeep(projectPlanningModule.planning);

            if (!planning) {
                return;
            }

            const aliveTasks: IProjectTask[] = [];
            const deletedMilestoneGanttIds: string[] = [];
            planning.tasks.forEach((task) => {
                if (response.data?.deletedMilestoneIds?.includes(task._id)) {
                    deletedMilestoneGanttIds.push(task.ganttId);
                } else {
                    aliveTasks.push(task);
                }
            });
            planning.tasks = aliveTasks;

            const updatedTaskIndex = planning.tasks.findIndex(
                (task) => task._id === response.data?.updatedTaskId,
            );
            planning.tasks[updatedTaskIndex].delegatedTo = null;

            projectPlanningModule.setPlanning(planning);
            this.$emit(
                'cancelDelegation',
                planning.tasks[updatedTaskIndex].ganttId,
                deletedMilestoneGanttIds,
            );
        } else {
            showErrorNotificationFunction(response.message);
        }
    }
}
</script>

<style lang="scss" scoped>
.folder-item {
    display: flex;
    align-items: center;
    padding: 15px, 10px !important;
    border: solid 1px rgb(207, 207, 207);
    border-radius: 6px;
    .folder-item-name {
        word-break: break-all;
        margin-left: 15px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.folder-space {
    max-height: 350px;
    overflow: auto;
}

.row {
    max-width: 100% !important;
}

.cursor-pointer {
    cursor: pointer;
}

:deep(.el-empty) {
    padding: 15px 0 15px 0;
    .el-empty__image {
        height: 100px;
    }
}

.el-checkbox {
    margin-bottom: 20px;
}
</style>
