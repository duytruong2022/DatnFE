<template>
    <div class="form-group d-flex flex-column">
        <label v-if="label" class="fw-bold text-start mb-2">
            {{ label }}
            <span v-if="isRequired" class="mark-required">*</span></label
        >
        <div>
            <el-autocomplete
                v-model="inputValue"
                :fetch-suggestions="querySearch"
                :placeholder="placeholder"
                :size="size"
                :maxlength="maxLength"
            >
            </el-autocomplete>
            <div class="validation-error text-start" :class="{ 'd-block': error }">
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { INPUT_TEXT_MAX_LENGTH } from '@/common/constants';
import { Model, Prop, Vue } from 'vue-property-decorator';

export default class AutoComplete extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: () => [] }) readonly options!: string[];
    @Prop({ default: '' }) readonly placeholder!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: 'medium' }) readonly size!: string;
    @Prop({ default: '' }) readonly error!: string;
    @Prop({ default: INPUT_TEXT_MAX_LENGTH }) readonly maxLength!: number;

    @Model('value', { type: [String, Number] })
    readonly inputValue!: string;

    querySearch(queryString: string, cb: CallableFunction): void {
        var results = queryString
            ? this.options.filter((option) => {
                  return option
                      .toString()
                      .toLowerCase()
                      .includes(queryString.toLowerCase());
              })
            : this.options;
        // we have to parse options array to the array which includes objects with "value" property
        const resultOptions: Record<string, unknown>[] = [];
        results.forEach((item) => {
            resultOptions.push({ value: item });
        });
        cb(resultOptions);
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-autocomplete) {
    width: 100% !important;
}
.mark-required {
    color: red;
}
:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
:deep(.el-input__wrapper.is-focus) {
    border-color: var(--el-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px var(--el-color-primary);
}
label {
    font-size: 15px;
}
</style>
