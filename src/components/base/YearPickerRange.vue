<template>
    <div class="form-group d-flex flex-column">
        <label v-if="label" class="fw-bold text-start mb-2"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div class="row">
            <div class="col-5">
                <el-date-picker
                    v-model="startDateValue"
                    type="year"
                    :placeholder="startPlaceholder"
                    :format="DATE_TIME_FORMAT.YYYY"
                    :disabled-date="calculateDisabledStartDates"
                    unlink-panels
                    :size="size"
                    :clearable="clearable"
                    :disabled="isDisabled"
                    :default-value="defaultValue"
                />
            </div>
            <div class="col-2 range-separator">{{ rangeSeparator }}</div>
            <div class="col-5">
                <el-date-picker
                    v-model="endDateValue"
                    type="year"
                    :placeholder="endPlaceholder"
                    :format="DATE_TIME_FORMAT.YYYY"
                    :disabled-date="calculateDisabledEndDates"
                    unlink-panels
                    :size="size"
                    :clearable="clearable"
                    :disabled="isDisabled"
                    :default-value="defaultValue"
                />
            </div>
        </div>
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { Model, Prop, mixins } from 'vue-property-decorator';
import moment from 'moment';
import isArray from 'lodash/isArray';
import { UtilMixins } from '@/mixins/utilMixins';

export default class DatePickerRange extends mixins(UtilMixins) {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: 'medium' }) readonly size!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: 'daterange' }) readonly type!: string;
    @Prop({ default: null }) readonly minDate!: string | Date | string[] | Date[];
    @Prop({ default: null }) readonly maxDate!: string | Date | string[] | Date[];
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: false }) readonly clearable!: boolean;
    @Prop({ default: null }) readonly defaultValue!: Date | string;
    @Prop({ default: '' }) readonly rangeSeparator!: string;
    @Prop({ default: '' }) readonly startPlaceholder!: string;
    @Prop({ default: '' }) readonly endPlaceholder!: string;
    @Prop({ default: [] }) readonly disabledDates!: string[];
    @Model('startDate', { type: String })
    readonly startDateValue!: string | Date;
    @Model('endDate', { type: String })
    readonly endDateValue!: string | Date;

    calculateDisabledStartDates(time: Date): boolean {
        let { minDate, maxDate } = this.$props as {
            minDate: Date | string;
            maxDate: Date | string;
        };
        if (this.endDateValue) {
            maxDate = this.endDateValue;
        }
        let result = false;
        if (minDate) {
            if (isArray(minDate) && minDate.length) {
                result =
                    result ||
                    moment(time).isSameOrBefore(moment(minDate?.[minDate.length - 1]));
            } else if (minDate.toString().length) {
                result = result || moment(time).isSameOrBefore(moment(minDate));
            }
        }
        if (maxDate) {
            if (isArray(maxDate) && maxDate.length) {
                result = result || moment(time).isSameOrAfter(moment(maxDate?.[0]));
            } else if (maxDate.toString().length) {
                result = result || moment(time).isSameOrAfter(moment(maxDate));
            }
        }
        if (this.disabledDates.length > 0) {
            result = result || this.disabledDates.includes(moment(time).fmDayString());
        }
        return result;
    }

    calculateDisabledEndDates(time: Date): boolean {
        let { minDate, maxDate } = this.$props as {
            minDate: Date | string;
            maxDate: Date | string;
        };
        if (this.startDateValue) {
            minDate = this.startDateValue;
        }
        let result = false;
        if (minDate) {
            if (isArray(minDate) && minDate.length) {
                result =
                    result ||
                    moment(time).isSameOrBefore(moment(minDate?.[minDate.length - 1]));
            } else if (minDate.toString().length) {
                result = result || moment(time).isSameOrBefore(moment(minDate));
            }
        }
        if (maxDate) {
            if (isArray(maxDate) && maxDate.length) {
                result = result || moment(time).isSameOrAfter(moment(maxDate?.[0]));
            } else if (maxDate.toString().length) {
                result = result || moment(time).isSameOrAfter(moment(maxDate));
            }
        }
        if (this.disabledDates.length > 0) {
            result = result || this.disabledDates.includes(moment(time).fmDayString());
        }
        return result;
    }
}
</script>

<style scoped>
.mark-required {
    color: red;
}
:deep(.el-input) {
    width: 100% !important;
}
:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
.range-separator {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
