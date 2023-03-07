<template>
    <div :class="{ 'flex-column': !isHorizontal, 'd-flex': isHorizontal }">
        <label
            class="fw-bold text-start mb-2"
            :class="{ 'w-100': !isHorizontal, 'label mt-1': isHorizontal }"
        >
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div
            class="position-relative"
            :class="{ 'w-100': !isHorizontal, input: isHorizontal }"
        >
            <el-radio-group v-model="selectedValue" :disabled="isDisabled" class="ml-4">
                <el-radio
                    v-for="option in options"
                    :key="option.value"
                    :label="option.value"
                    size="size"
                    >{{ option.label }}</el-radio
                >
            </el-radio-group>
            <div class="validation-error text-start" :class="{ 'd-block': error }">
                {{ error }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Model, Prop, Vue } from 'vue-property-decorator';
export default class SingleSelect extends Vue {
    @Prop({ default: 'small' }) readonly size!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: () => [] }) readonly options!: Record<string, unknown>[];
    @Prop({ default: false }) readonly isHorizontal!: boolean;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: false }) readonly isDisabled!: boolean;

    @Model('value', { type: [String, Number] })
    readonly selectedValue!: string;

    onChange(value: string): void {
        this.$emit('change', value);
    }
}
</script>
<style lang="scss" scoped>
.mark-required {
    color: red;
}
.label {
    word-break: break-word;
    width: 25%;
}
.input {
    width: 75%;
}
:deep(.el-radio-group) {
    width: 100% !important;
}
label {
    font-size: 15px;
}
</style>
