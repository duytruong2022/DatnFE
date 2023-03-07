<template>
    <div class="form-group">
        <label v-if="label" class="fw-bold text-start mb-2"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
        <el-date-picker
            v-model="dateValue"
            :type="type"
            :placeholder="placeholder"
            :format="dateFormat"
            :value-format="valueFormat"
            :disabled-date="calculateDisabledDates"
            unlink-panels
            :size="size"
            :clearable="true"
            :disabled="isDisabled"
            :default-value="defaultValue"
            :range-separator="rangeSeparator"
            :start-placeholder="startPlaceholder"
            :end-placeholder="endPlaceholder"
        />
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { DATE_TIME_FORMAT } from '@/common/constants';
import { Vue, Model, Prop } from 'vue-property-decorator';
import moment from 'moment';
import isArray from 'lodash/isArray';

export default class DatePickerRange extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: 'medium' }) readonly size!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: 'daterange' }) readonly type!: string;
    @Prop({ default: DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN }) readonly dateFormat!: string;
    @Prop({ default: DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN }) readonly valueFormat!: string;
    @Prop({ default: null }) readonly minDate!: string | Date | string[] | Date[];
    @Prop({ default: null }) readonly maxDate!: string | Date | string[] | Date[];
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: null }) readonly defaultValue!: Date | string;
    @Prop({ default: '' }) readonly rangeSeparator!: string;
    @Prop({ default: '' }) readonly startPlaceholder!: string;
    @Prop({ default: '' }) readonly endPlaceholder!: string;
    @Prop({ default: [] }) readonly disabledDates!: string[];
    @Model('value', { type: String })
    readonly dateValue!: string[] | Date[];

    calculateDisabledDates(time: Date): boolean {
        const { minDate, maxDate } = this.$props as {
            minDate: Date | string;
            maxDate: Date | string;
        };
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
.form-group label {
    text-align: initial;
    width: 100%;
    font-weight: bold;
    margin-bottom: 6px;
    line-height: 22.5px;
    font-size: 15px;
}
.mark-required {
    color: red;
}
:deep(.el-date-editor) {
    height: 46px;
    width: 100% !important;
    padding: 8px 12px !important;
    margin-top: -1px;
    line-height: 30px;
    min-height: 46px;
    box-sizing: border-box;

    border-radius: 9px !important;
    transition: box-shadow 0.15s ease, border-color 0.15s ease !important;
    --el-input-hover-border-color: var(--el-border-color) !important;
}

:deep(.el-date-editor.is-active) {
    border-color: var(--el-color-primary) !important;
    outline: 0 !important;
    box-shadow: 0 0 0 2px var(--el-color-primary) !important;
}
</style>
