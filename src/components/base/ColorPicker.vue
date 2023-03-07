<template>
    <div class="form-group d-flex flex-column">
        <label v-if="label" class="fw-bold text-start mb-2"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div class="d-flex flex-row align-items-center input-group">
            <el-color-picker
                v-model="colorValue"
                :size="size"
                :disabled="isDisabled"
                :default-value="defaultValue"
            />
            <el-input
                v-model="colorValue"
                :placeholder="placeholder"
                :clearable="clearable"
                :disabled="isDisabled"
                :default-value="defaultValue"
            />
        </div>
        <div class="validation-error text-start" :class="{ 'd-block': error }">
            {{ error }}
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Model, Prop } from 'vue-property-decorator';

export default class ColorPicker extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: 'small' }) readonly size!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isDisabled!: boolean;
    @Prop({ default: true }) readonly clearable!: boolean;
    @Prop({ default: null }) readonly defaultValue!: string;
    @Model('value', { type: String }) readonly colorValue!: string;
}
</script>

<style lang="scss" scoped>
:deep(.el-color-picker__trigger) {
    padding: 0;
    border: none;
}

/** Remove Arrows/Spinners */
/* Chrome, Safari, Edge, Opera */
:deep(.el-input__inner::-webkit-outer-spin-button),
:deep(.el-input__inner::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}
:deep(.el-input__wrapper) {
    margin-left: 12px;
    padding: 0;
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
    box-shadow: none;
}

.mark-required {
    color: red;
}

.label {
    word-break: break-word;
    width: 25%;
}

label {
    font-size: 15px;
}

.input-group {
    padding: 8px 12px;
    border-radius: 9px;
    box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
    flex-wrap: nowrap;
}
.input-group:focus-within {
    border-color: var(--el-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px var(--el-color-primary);
}
</style>
