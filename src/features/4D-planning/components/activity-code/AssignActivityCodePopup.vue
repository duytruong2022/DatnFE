<template>
    <BaseRightDrawer
        :title="$t('planning.activityCode.title.assignActivityCode')"
        v-model:value="isShowAssignActivityCodePopup"
        @onOpen="openPopup"
        @onClosed="closedPopup"
        size="50%"
    >
        <template #body>
            <div :style="{ textAlign: 'right' }">
                <el-button
                    :disabled="isDisableResetButton"
                    type="danger"
                    @click="onClickResetButton"
                >
                    {{ $t('planning.buttons.reset') }}
                </el-button>
            </div>

            <BaseEmptyData v-if="!activityCodeList.length" />
            <div v-else>
                <div class="tree-header">
                    <div class="header-name col-4">
                        {{ $t('planning.activityCode.label.name') }}
                    </div>
                    <div class="header-description col-4">
                        {{ $t('planning.activityCode.label.description') }}
                    </div>
                    <div class="header-color col-2">
                        {{ $t('planning.activityCode.label.color') }}
                    </div>
                </div>
                <div v-for="(item, index) in activityCodeList" :key="index">
                    <ActivityCodeTree
                        :isAssignLayout="true"
                        :activityCodeTree="item"
                        @assign-activity-code-value="handleAssignActivityCodeValue"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import i18n from '@/plugins/vue-i18n';
import { mixins, Options } from 'vue-class-component';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningService } from '../../services/planning.service';
import { projectPlanningModule } from '../../store';
import ActivityCodeTree from './ActivityCodeTree.vue';

@Options({
    components: { ActivityCodeTree },
})
export default class AssignActivityCodePopup extends mixins(Planning4DMixin) {
    isDisableResetButton = false;

    get activityCodeList() {
        return projectPlanningModule.activityCodeList;
    }

    get isShowAssignActivityCodePopup() {
        return projectPlanningModule.isShowAssignActivityCodePopup;
    }

    closedPopup() {
        projectPlanningModule.setIsShowAssignActivityCodePopup(false);
    }

    checkDisableResetButton() {
        const taskIds = projectPlanningModule.selectedTaskIdList;
        this.isDisableResetButton =
            projectPlanningModule.planning?.tasks
                .filter((task) => {
                    return taskIds.includes(task._id);
                })
                .every((task) => {
                    return task.activityCodeValueId === null;
                }) === true;
    }

    openPopup() {
        this.checkDisableResetButton();
    }

    async onClickResetButton() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('planning.activityCode.message.confirmResetActivityCodeValue'),
            this.$t('planning.activityCode.title.resetActivityCodeValue'),
        );
        if (confirm) {
            const response = await projectPlanningService.assignActivityCodeValue({
                taskIds: projectPlanningModule.selectedTaskIdList,
                activityCodeValueId: null,
                projectId: projectPlanningModule.planning?.projectId || '',
            });
            if (response.success) {
                showSuccessNotificationFunction(
                    i18n.global.t('planning.activityCode.message.resetSuccess') as string,
                );

                this.$emit('assign-activity-code-value');
            } else {
                showErrorNotificationFunction(response.message as string);
            }
            this.checkDisableResetButton();
        }
    }

    handleAssignActivityCodeValue() {
        this.$emit('assign-activity-code-value');
        this.closedPopup();
    }
}
</script>

<style scoped lang="scss">
.tree-header {
    display: flex;
    align-items: center;
    margin-top: 12px;
    padding: 6px 0;
    width: 100%;
    border-top: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);
}
</style>
