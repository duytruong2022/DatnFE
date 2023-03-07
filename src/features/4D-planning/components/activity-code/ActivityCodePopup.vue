<template>
    <BaseRightDrawer
        :title="title"
        v-model:value="activityCodePopup.show"
        @onClosed="closedPopup"
        size="50%"
    >
        <template #body>
            <div v-if="showActivityCodeValueForm">
                <ActivityCodeValueForm
                    :activityCodeValueList="activityCodeValueList"
                    @close-activity-code-value-form="handleCloseActivityCodeValueForm"
                    @updated-activity-code-value="emitEventToRefetchDataGantt"
                />
            </div>
            <div v-else>
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <span class="me-2">{{
                            $t('planning.activityCode.text.display')
                        }}</span>
                        <el-switch
                            v-model="activityCodeDisplayStatus"
                            :loading="isChangingDisplayStatus"
                            @change="onChangeDisplayStatus"
                        />
                    </div>
                    <el-button type="primary" @click="onClickCreateActivityCodeButton()">
                        {{ $t('planning.activityCode.buttons.createActivityCode') }}
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
                            :activityCodeTree="item"
                            @add-activity-code-value="handleAddActivityCodeValue"
                            @edit-activity-code="handleEditActivityCode"
                            @edit-activity-code-value="handleEditActivityCodeValue"
                            @delete-activity-code="emitEventToRefetchDataGantt"
                            @delete-activity-code-value="emitEventToRefetchDataGantt"
                        />
                    </div>
                </div>
            </div>
        </template>
    </BaseRightDrawer>
    <ActivityCodeFormPopup
        :open="openActivityCodeForm"
        @close-activity-code-form="handleCloseActivityCodeForm"
        @updated-activity-code="emitEventToRefetchDataGantt"
    />
</template>

<script lang="ts">
import ganttChartStorage from '@/common/ganttChartStorage';
import {
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { projectService } from '@/features/project/services/project.service';
import { projectModule } from '@/features/project/store';
import i18n from '@/plugins/vue-i18n';
import { cloneDeep } from 'lodash';
import { mixins, Options } from 'vue-class-component';
import { IActivityCodeValueItem } from '../../interfaces';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';
import ActivityCodeFormPopup from './ActivityCodeFormPopup.vue';
import ActivityCodeTree from './ActivityCodeTree.vue';
import ActivityCodeValueForm from './ActivityCodeValueForm.vue';

@Options({
    components: { ActivityCodeFormPopup, ActivityCodeTree, ActivityCodeValueForm },
})
export default class ActivityCodePopup extends mixins(Planning4DMixin) {
    openActivityCodeForm = false;
    showActivityCodeValueForm = false;
    activityCodeValueList: IActivityCodeValueItem[] = [];
    isChangingDisplayStatus = false;
    activityCodeDisplayStatus = cloneDeep(ganttChartStorage.getDisplayActivityCode());

    get title() {
        if (this.activityCodePopup.activityCodeValueSelected) {
            return this.activityCodePopup.isCreate
                ? this.$t('planning.activityCode.title.createActivityCodeValue')
                : this.$t('planning.activityCode.title.updateActivityCodeValue');
        }
        if (
            this.activityCodePopup.activityCodeIdSelected &&
            this.activityCodePopup.isCreate
        ) {
            return this.$t('planning.activityCode.title.createActivityCodeValue');
        }

        return this.$t('planning.activityCode.title.activityCodeList');
    }

    get activityCodePopup() {
        return projectPlanningModule.activityCodePopupParam;
    }

    get activityCodeList() {
        return projectPlanningModule.activityCodeList;
    }

    // need refetch data after update or delete activity code, activity code value
    emitEventToRefetchDataGantt() {
        this.$emit('has-change-data-activity-code');
    }

    closedPopup() {
        projectPlanningModule.setActivityCodePopupParam({
            show: false,
            isCreate: false,
            activityCodeIdSelected: '',
            activityCodeValueSelected: '',
        });
        this.showActivityCodeValueForm = false;
    }

    onClickCreateActivityCodeButton() {
        projectPlanningModule.setActivityCodePopupParam({
            show: true,
            isCreate: true,
            activityCodeIdSelected: '',
            activityCodeValueSelected: '',
        });
        this.openActivityCodeForm = true;
    }

    handleCloseActivityCodeForm() {
        projectPlanningModule.setActivityCodePopupParam({
            show: true,
            isCreate: false,
            activityCodeIdSelected: '',
            activityCodeValueSelected: '',
        });
        this.openActivityCodeForm = false;
    }

    handleCloseActivityCodeValueForm() {
        projectPlanningModule.setActivityCodePopupParam({
            show: true,
            isCreate: false,
            activityCodeIdSelected: '',
            activityCodeValueSelected: '',
        });
        this.showActivityCodeValueForm = false;
    }

    handleEditActivityCode() {
        this.openActivityCodeForm = true;
    }

    handleEditActivityCodeValue() {
        const activityCodeIdSelected = this.activityCodePopup.activityCodeIdSelected;
        const activityCodeValueIdSelected =
            this.activityCodePopup.activityCodeValueSelected;
        this.activityCodeValueList =
            this.activityCodeList
                .find((activityCode) => {
                    return activityCode._id === activityCodeIdSelected;
                })
                ?.activityCodeValues.filter((activityCodeValue) => {
                    return activityCodeValue._id !== activityCodeValueIdSelected;
                }) || [];
        this.showActivityCodeValueForm = true;
    }

    handleAddActivityCodeValue() {
        const activityCodeIdSelected = this.activityCodePopup.activityCodeIdSelected;
        this.activityCodeValueList =
            this.activityCodeList.find((activityCode) => {
                return activityCode._id === activityCodeIdSelected;
            })?.activityCodeValues || [];
        this.showActivityCodeValueForm = true;
    }

    async onChangeDisplayStatus(value: boolean) {
        this.isChangingDisplayStatus = true;
        const response = await projectService.updateActivityCodeDisplayStatus(
            projectPlanningModule.planning?.projectId as string,
            { status: value },
        );
        this.isChangingDisplayStatus = false;
        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t(
                    'planning.activityCode.message.updateDisplaySuccess',
                ) as string,
            );
            projectModule.setSelectedProject(response.data);
            ganttChartStorage.setDisplayActivityCode(
                response.data.displayActivityCode || false,
            );
            this.emitEventToRefetchDataGantt();
        } else {
            showErrorNotificationFunction(response.message as string);
        }
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
