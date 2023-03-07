<template>
    <div class="form-group position-relative">
        <label v-if="label" class="fw-bold text-start mb-2 w-100"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span>
        </label>
        <el-time-picker
            :format="timeFormat"
            v-model="timeData"
            :placeholder="placeholder"
        >
        </el-time-picker>
        <div class="invalid-feedback text-start err" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { DATE_TIME_FORMAT } from '@/common/constants';
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class TimePicker extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly name!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: DATE_TIME_FORMAT.HH_MM_COLON }) readonly timeFormat!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly rules!: string | Record<string, unknown>;
    @Prop({ default: false }) readonly isRequired!: string;

    @Model('value', { type: [String, Number] })
    readonly timeData!: string;
}
</script>

<style scoped lang="scss">
:deep(.el-input, .el-input__inner) {
    width: 100% !important;
}
.form-group label {
    text-align: initial;
    width: 100%;
    font-weight: bold;
    margin-bottom: 6px;
}
.mark-required {
    color: red;
}
</style>
