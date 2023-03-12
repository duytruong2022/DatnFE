<template>
    <BaseRightDrawer
        size="500px"
        v-model:value="isShowCalendarConfigPopup"
        @onOpen="onOpen"
        @onClosed="onClosed"
        custom-class="calendar-config-form-popup"
        :title="$t('calendar.config.popup.title')"
    >
        <template #body>
            <div>
                <BaseSingleSelect
                    :options="dayTypeOptions"
                    :label="$t('calendar.config.popup.form.dayType')"
                    :placeholder="$t('calendar.config.popup.form.dayType')"
                    v-model:value="form.dayType"
                    filterable
                    :error="translateYupError(form.errors.dayType)"
                    @clear="form.setFieldValue('dayType', null)"
                />

                <BaseSingleSelect
                    :options="workingDayTypeOptions"
                    :label="$t('calendar.config.popup.form.workingDayType')"
                    :placeholder="$t('calendar.config.popup.form.workingDayType')"
                    v-model:value="form.workingDayTypeId"
                    filterable
                    :error="translateYupError(form.errors.workingDayTypeId)"
                    @clear="form.setFieldValue('workingDayTypeId', null)"
                    v-if="isShowWorkingDayTypeIdSelect"
                />
                <el-button-group v-if="canCreateDayType">
                    <el-button @click="onClickAddDayType">
                        {{ $t('calendar.config.popup.form.button.add') }}
                    </el-button>
                    <el-button @click="onClickEditDayType" v-if="isShowEditButton">
                        {{ $t('calendar.config.popup.form.button.edit') }}
                    </el-button>
                    <el-button @click="onClickDeleteDayType" v-if="isShowDeleteButton">
                        {{ $t('calendar.config.popup.form.button.delete') }}
                    </el-button>
                </el-button-group>
                <BaseRadio
                    :label="$t('calendar.config.popup.form.repeat.label')"
                    v-model:value="form.repeatType"
                    :error="translateYupError(form.errors.repeatType)"
                    :options="calendarConfigRepeatOptionsLocale"
                    :isHorizontal="true"
                    :isRequired="true"
                />
            </div>
            <div class="btn-upload d-flex justify-content-end">
                <el-button @click="isShowCalendarConfigPopup = false">
                    {{ $t('calendar.config.popup.form.button.cancel') }}
                </el-button>
                <el-button type="primary" @click="onSubmit">
                    {{ $t('calendar.config.popup.form.button.save') }}
                </el-button>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import moment from 'moment';
import { mixins, Options, setup } from 'vue-class-component';
import { Download as DownloadIcon } from '@element-plus/icons-vue';
import { calendarModule } from '../../store';
import { DayType, dayTypeOptions, calendarConfigRepeatOption } from '../../constants';
import { setupCalendarConfigForm } from '../../compositions/calendarConfigForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectModule } from '@/features/project/store';
import {
    hasPermissionToAccessRouteInProject,
    showConfirmPopUpFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { dayTypeService } from '../../services/day-type.service';
import { ProjectSecurityPermissions } from '@/features/3D-viewer-profile/constants';

@Options({
    components: { DownloadIcon },
})
export default class CalendarConfigFormPopup extends mixins(UtilMixins) {
    form = setup(() => setupCalendarConfigForm());

    get isShowEditButton(): boolean {
        return !!(this.form.workingDayTypeId as string)?.length;
    }

    get isShowDeleteButton(): boolean {
        return !!(this.form.workingDayTypeId as string)?.length;
    }

    get isShowCalendarConfigPopup(): boolean {
        return calendarModule.isShowConfigCalendarPopup;
    }

    set isShowCalendarConfigPopup(isShowCalendarConfigPopup: boolean) {
        calendarModule.setIsShowCalendarConfigPopup(isShowCalendarConfigPopup);
    }

    get isShowWorkingDayTypeIdSelect(): boolean {
        return this.form.dayType === DayType.WORKING_DAY;
    }

    get workingDayTypeOptions() {
        return calendarModule.dayTypeList.map((type) => ({
            label: type.name,
            value: type._id,
        }));
    }

    get dayTypeOptions() {
        return dayTypeOptions.map((type) => ({
            label: this.$t(type.label),
            value: type.value,
        }));
    }

    get selectedDate() {
        return calendarModule.selectedDate;
    }

    get calendarConfigRepeatOptionsLocale() {
        return calendarConfigRepeatOption.map((option) => ({
            label: this.$t(option.label, {
                weekDay: moment(this.selectedDate).fmDayOfWeekString(),
            }),
            value: option.value,
        }));
    }

    get canCreateDayType() {
        return hasPermissionToAccessRouteInProject([
            ProjectSecurityPermissions.GENERAL_CREATE_CALENDAR,
        ]);
    }

    async onSubmit(): Promise<void> {
        this.form.onSubmit();
    }

    async onOpen() {
        this.form.onOpen();
        calendarModule.getDayTypeList(projectModule.selectedProjectId || '');
    }

    onClosed(): void {
        calendarModule.setSelectedCalendarConfigId('');
        calendarModule.setIsShowCalendarConfigPopup(false);
    }

    onClickAddDayType() {
        calendarModule.setSelectedDayTypeId('');
        calendarModule.setIsShowDayTypeFormPopup(true);
    }

    onClickEditDayType() {
        calendarModule.setSelectedDayTypeId(this.form.workingDayTypeId as string);
        calendarModule.setIsShowDayTypeFormPopup(true);
    }

    async onClickDeleteDayType() {
        const confirm = await showConfirmPopUpFunction(
            this.$t('calendar.config.dayType.message.delete.confirm.message'),
            this.$t('calendar.config.dayType.message.delete.confirm.title'),
        );
        if (confirm) {
            const response = await dayTypeService.delete(
                this.form.workingDayTypeId as string,
            );
            if (response.success) {
                showSuccessNotificationFunction(
                    'calendar.config.dayType.message.delete.success',
                );
                await Promise.all([
                    calendarModule.getCalendarConfigs({
                        calendarId: calendarModule.selectedCalendarId,
                        startDate: moment(calendarModule.currentCalendarMonth)
                            .startOf('month')
                            .utc()
                            .fmFullTimeString(),
                        endDate: moment(calendarModule.currentCalendarMonth)
                            .endOf('month')
                            .utc()
                            .fmFullTimeString(),
                    }),
                    calendarModule.getDayTypeList(projectModule.selectedProjectId || ''),
                ]);
                this.form.setFieldValue('workingDayTypeId', '');
            }
        }
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-radio) {
    width: 100% !important;
}
</style>
