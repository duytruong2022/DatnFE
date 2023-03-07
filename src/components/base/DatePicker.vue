<template>
    <div class="form-group d-flex flex-column">
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
            :size="size"
            :clearable="clearable"
            :disabled="isDisabled"
            :default-value="defaultValue"
        />
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { DATE_TIME_FORMAT } from '@/common/constants';
import moment from 'moment';
import { Vue, Model, Prop } from 'vue-property-decorator';

export default class DatePicker extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: 'large' }) readonly size!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: 'date' }) readonly type!: string;
    @Prop({ default: DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN }) readonly dateFormat!:
        | string
        | null;
    @Prop({ default: DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN }) readonly valueFormat!: string;
    @Prop({ default: null }) readonly minDate!: string | Date;
    @Prop({ default: null }) readonly maxDate!: string | Date;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: true }) readonly clearable!: boolean;
    @Prop({ default: null }) readonly defaultValue!: Date | string;
    @Prop({ default: [] }) readonly disabledDates!: string[];
    @Model('value', { type: String })
    readonly dateValue!: string | Date;

    calculateDisabledDates(time: Date): boolean {
        const { minDate, maxDate } = this.$props as {
            minDate: Date | string;
            maxDate: Date | string;
            isDisabledWeekend: boolean;
        };
        let result = false;
        if (minDate?.toString()?.length) {
            result = result || moment(time).isSameOrBefore(moment(minDate));
        }
        if (maxDate?.toString()?.length) {
            result = result || moment(time).isSameOrAfter(moment(maxDate));
        }
        if (this.disabledDates.length > 0) {
            result = result || this.disabledDates.includes(moment(time).fmDayString());
        }
        return result;
    }
}
</script>

<style scoped>
:deep(.el-input) {
    width: 100% !important;
}
:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
    min-height: 46px;
}
.mark-required {
    color: red;
}
label {
    font-size: 15px;
}

:deep(.validation-error) {
    margin-top: 12px;
}
</style>
