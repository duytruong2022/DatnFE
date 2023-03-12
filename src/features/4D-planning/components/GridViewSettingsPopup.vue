<template>
    <el-dialog
        v-model="open"
        @open="handleOpen"
        :title="$t(`planning.buttons.gridSettings`)"
        width="25%"
    >
        <div>
            <div class="item-wrapper">
                <span>{{ $t(`planning.gantt.columns.all`) }}</span>
                <el-checkbox v-model="checkedAll"></el-checkbox>
            </div>
            <div class="item-wrapper" v-for="(key, index) in columnKeys" :key="index">
                <span>{{ $t(`planning.gantt.columns.${key}`) }}</span>
                <el-checkbox v-model="displayingStatus[key]"></el-checkbox>
            </div>
            <!-- <el-divider>
                {{ $t('planning.buttons.userField') }}
            </el-divider>
            <div class="item-wrapper" v-for="item in additionTaskFields" :key="item._id">
                <span style="padding-right: 10px">{{ item.name }}</span>
                <el-checkbox
                    :checked="additionalTaskFieldIdsDisplaying.includes(item._id)"
                    @change="(value) => onCheck(value, item)"
                ></el-checkbox>
            </div> -->
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="onCancel">{{
                    $t('planning.buttons.cancel')
                }}</el-button>
                <el-button type="primary" @click="onSubmit">{{
                    $t('planning.buttons.save')
                }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import cloneDeep from 'lodash-es/cloneDeep';
import { Vue } from 'vue-class-component';
import { IAdditionalTaskField, IGanttGridDisplayingStatus } from '../interfaces';
import { projectPlanningModule } from '../store';
import ganttChartStorage from '@/common/ganttChartStorage';

export default class GridViewSettingsPopup extends Vue {
    displayingStatus: IGanttGridDisplayingStatus = {};
    additionalTaskFieldIdsDisplaying: string[] = [];

    get additionTaskFields(): IAdditionalTaskField[] {
        return projectPlanningModule.planning?.additionalTaskFields || [];
    }

    get columnKeys(): string[] {
        return Object.keys(this.displayingStatus);
    }

    get open(): boolean {
        return projectPlanningModule.gridSettingParams.open;
    }

    set open(value: boolean) {
        projectPlanningModule.setGridSettingsParams({
            open: value,
        });
    }

    get checkedAll(): boolean {
        const keys = Object.keys(
            projectPlanningModule.initialGridSettingParams.displayingStatus,
        );
        const checkedNodes = keys.filter((key) => {
            return this.displayingStatus[key as keyof IGanttGridDisplayingStatus];
        });

        return keys.length === checkedNodes.length;
    }

    set checkedAll(value: boolean) {
        if (!value) {
            this.displayingStatus = cloneDeep(
                projectPlanningModule.initialGridSettingParams.displayingStatus,
            );
        } else {
            const keys = Object.keys(
                projectPlanningModule.initialGridSettingParams.displayingStatus,
            );
            keys.forEach((key) => {
                this.displayingStatus[key as keyof IGanttGridDisplayingStatus] = true;
            });
        }
    }

    onCancel() {
        projectPlanningModule.setGridSettingsParams({
            open: false,
        });
    }

    onSubmit() {
        ganttChartStorage.setGanttDisplayingStatus(this.displayingStatus);
        this.$emit('save', {
            displayingStatus: this.displayingStatus,
            additionalFieldIds: this.additionalTaskFieldIdsDisplaying,
        });
    }

    handleOpen() {
        const displayingStatus = ganttChartStorage.getGanttDisplayingStatus();
        if (displayingStatus) {
            this.displayingStatus = displayingStatus;
        } else {
            this.displayingStatus = cloneDeep(
                projectPlanningModule.initialGridSettingParams.displayingStatus,
            );
        }

        const displayingFieldIds = ganttChartStorage.getAdditionalTaskFields() || [];
        this.additionalTaskFieldIdsDisplaying = [...displayingFieldIds];
    }

    onCheck(value: boolean, item: IAdditionalTaskField) {
        if (value && !this.additionalTaskFieldIdsDisplaying.includes(item._id)) {
            this.additionalTaskFieldIdsDisplaying.push(item._id);
        } else if (!value) {
            this.additionalTaskFieldIdsDisplaying =
                this.additionalTaskFieldIdsDisplaying.filter((_id) => item._id !== _id);
        }
    }
}
</script>

<style lang="scss" scoped>
.item-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
