<template>
    <div class="d-flex flex-column">
        <label
            v-if="label"
            class="fw-bold text-start mb-2 d-flex align-items-center w-100 label"
        >
            {{ label }}
        </label>
        <div class="value-text w-100" :class="{ 'multiple-lines': multipleLines }">
            <div v-if="value">
                {{ value }}
            </div>
            <slot name="file-attachment" v-else-if="isFile" />
            <div v-else>N/A</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Vue } from 'vue-property-decorator';
export default class LabelText extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: '' }) readonly value!: string;
    @Prop({ default: false }) readonly multipleLines!: boolean;
    @Prop({ default: false }) readonly isFile!: boolean;
}
</script>

<style lang="scss" scoped>
.label {
    word-break: break-word;
}
label {
    font-size: 15px;
}
.value-text {
    margin-bottom: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.multiple-lines {
    white-space: normal;
}
</style>
