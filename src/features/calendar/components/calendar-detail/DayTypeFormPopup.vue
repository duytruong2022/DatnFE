<template>
    <el-dialog
        width="500px"
        lock-scroll
        v-model="isShowDayTypeFormPopup"
        @open="onOpen"
        @closed="onClosed"
        custom-class="calendar-config-form-popup"
        destroy-on-close
    >
        <template #header>
            <h3 class="text-start">
                {{ title }}
            </h3>
        </template>
        <div>
            <BaseInputText
                v-model:value="form.name"
                :label="$t('calendar.config.dayType.popup.name.label')"
                :placeholder="$t('calendar.config.dayType.popup.name.placeholder')"
                :isRequired="true"
                :maxLength="FILE_NAME_MAX_LENGTH"
                :error="translateYupError(form.errors.name)"
            />
            <div
                class="row"
                v-for="(timeBlock, index) in form.timeBlocks"
                :key="`timeblock-${index}`"
            >
                <div class="col-md-5">
                    <BaseTimePicker
                        :label="$t('calendar.config.dayType.popup.timeBlock.start.label')"
                        :placeholder="
                            $t(
                                'calendar.config.dayType.popup.timeBlock.start.placeholder',
                            )
                        "
                        v-model:value="form.timeBlocks[index].startTime"
                        name="startTime"
                        :isRequired="true"
                        :error="
                            translateYupError(form.errors[`timeBlocks[${index - 1}]`])
                        "
                    />
                </div>
                <div class="col-md-5">
                    <BaseTimePicker
                        :label="$t('calendar.config.dayType.popup.timeBlock.end.label')"
                        :placeholder="
                            $t('calendar.config.dayType.popup.timeBlock.end.placeholder')
                        "
                        v-model:value="form.timeBlocks[index].endTime"
                        name="startTime"
                        :isRequired="true"
                        :error="
                            translateYupError(form.errors[`timeBlocks[${index - 1}]`])
                        "
                    />
                </div>
                <div class="col-md-2">
                    <el-button
                        class="delete-button"
                        type="danger"
                        @click="onClickRemoveTimeBlock(index)"
                    >
                        <DeleteIcon class="icon" />
                    </el-button>
                </div>
            </div>
            <p>
                <b
                    >{{ $t('calendar.config.dayType.popup.totalWorkingTime.label') }}:
                    {{ totalWorkingTime }}</b
                >
            </p>
            <el-button @click="onClickAddTimeBlock">{{
                $t('calendar.config.dayType.popup.button.addTimeBlock')
            }}</el-button>
        </div>
        <div class="btn-upload d-flex justify-content-end">
            <el-button @click="isShowDayTypeFormPopup = false">
                {{ $t('calendar.config.popup.form.button.cancel') }}
            </el-button>
            <el-button type="primary" @click="onSubmit">
                {{ $t('calendar.config.popup.form.button.save') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts">
import moment from 'moment';
import { mixins, Options, setup } from 'vue-class-component';
import { Download as DownloadIcon, Delete as DeleteIcon } from '@element-plus/icons-vue';
import { calendarModule } from '../../store';
import { dayTypeOptions, calendarConfigRepeatOption } from '../../constants';
import { dayTypeService } from '../../services/day-type.service';
import { ICalendarTimeBlock, IDayType, IGetDayTypeQueryString } from '../../interfaces';
import { showErrorNotificationFunction } from '@/common/helpers';
import { IBodyResponse, IGetListResponse } from '@/common/interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectModule } from '@/features/project/store';
import { setupWorkingDayTypeForm } from '../../compositions/workingDayTypeForm';
import { minutesPerHour } from '@/features/3D-viewer/constant';
import cloneDeep from 'lodash-es/cloneDeep';

@Options({
    components: { DownloadIcon, DeleteIcon },
})
export default class DayTypeFormPopup extends mixins(UtilMixins) {
    form = setup(() => setupWorkingDayTypeForm());
    workingDayTypes: IDayType[] = [];
    totalTimeBlocks = 0;

    get title() {
        return calendarModule.selectedCalendarId.length
            ? this.$t('calendar.config.dayType.popup.title.update')
            : this.$t('calendar.config.dayType.popup.title.create');
    }

    get isShowDayTypeFormPopup(): boolean {
        return calendarModule.isShowDayTypeFormPopup;
    }

    set isShowDayTypeFormPopup(isShowDayTypeFormPopup: boolean) {
        calendarModule.setIsShowDayTypeFormPopup(isShowDayTypeFormPopup);
    }

    get workingDayTypeOptions() {
        return this.workingDayTypes.map((type) => ({
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

    get totalWorkingTime() {
        const totalMinutes = (this.form.timeBlocks as ICalendarTimeBlock[]).reduce(
            (total, timeBlock) => {
                return (
                    total + moment(timeBlock.endTime).diff(timeBlock.startTime, 'minute')
                );
            },
            0,
        );
        if (totalMinutes === 0) {
            return `0 ${this.$t('calendar.config.dayType.popup.totalWorkingTime.hour')}`;
        }
        const hours = Math.floor(totalMinutes / minutesPerHour);
        const minutes = totalMinutes - hours * minutesPerHour;
        let hourString = '';
        let minuteString = '';
        if (hours > 0) {
            hourString =
                hours > 1
                    ? `${hours} ${this.$t(
                          'calendar.config.dayType.popup.totalWorkingTime.hours',
                      )}`
                    : `${hours} ${this.$t(
                          'calendar.config.dayType.popup.totalWorkingTime.hour',
                      )}`;
        }
        if (minutes > 0) {
            minuteString =
                minutes > 1
                    ? `, ${minutes} ${this.$t(
                          'calendar.config.dayType.popup.totalWorkingTime.minutes',
                      )}`
                    : `, ${minutes} ${this.$t(
                          'calendar.config.dayType.popup.totalWorkingTime.minute',
                      )}`;
        }
        return `${hourString}${minuteString}`;
    }

    async onSubmit(): Promise<void> {
        this.form.onSubmit();
    }

    async onOpen() {
        this.form.onOpen();
        const query: IGetDayTypeQueryString = {
            projectId: projectModule.selectedProjectId || '',
        };
        const response = (await dayTypeService.getList(query)) as IBodyResponse<
            IGetListResponse<IDayType>
        >;
        if (response.success) {
            this.workingDayTypes = response.data.items;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }

    onClosed(): void {
        calendarModule.setSelectedCalendarConfigId('');
    }

    onClickAddTimeBlock() {
        this.totalTimeBlocks++;
        this.form.setFieldValue('timeBlocks', [
            ...(this.form.timeBlocks as ICalendarTimeBlock[]),
            {
                startTime: '',
                endTime: '',
            },
        ]);
    }

    onClickRemoveTimeBlock(index: number) {
        this.totalTimeBlocks--;
        const currentTimeBlocks = cloneDeep(this.form.timeBlocks as ICalendarTimeBlock[]);
        currentTimeBlocks.splice(index, 1);
        this.form.setFieldValue('timeBlocks', currentTimeBlocks);
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-radio) {
    width: 100% !important;
}
.delete-button {
    margin-top: 29px;
}
.icon {
    width: 16px;
}
</style>
