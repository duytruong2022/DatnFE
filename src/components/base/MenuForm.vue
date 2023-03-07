<template>
    <div class="d-flex">
        <div class="icon-wrapper" @click="onClickShowContent" v-if="!isShowContent">
            <el-icon><ArrowDown /></el-icon>
        </div>
        <div class="icon-wrapper" @click="onClickHideContent" v-else>
            <el-icon><ArrowUp /></el-icon>
        </div>
        <label
            v-if="label"
            class="fw-bold text-start mb-2 label-content"
            @click="onClickLabel"
            >{{ label }} <span v-if="isRequired" class="mark-required">*</span></label
        >
    </div>
    <div
        v-if="isShowContent"
        :class="{ 'disable-content': isDisabled }"
        class="d-flex content"
    >
        <slot name="append"> </slot>
    </div>
    <div class="validation-error text-start" :class="{ 'd-block': error }">
        {{ error }}
    </div>
</template>

<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
@Options({
    components: {
        ArrowUp,
        ArrowDown,
    },
})
export default class MenuForm extends Vue {
    @Prop({ default: '' }) readonly label!: string;
    @Prop({ default: false }) readonly isRequired!: string;
    @Prop({ default: false }) readonly isDisabled!: string;
    @Prop({ default: '' }) readonly error!: string;
    isShowContent = false;
    onClickShowContent() {
        this.isShowContent = true;
    }
    onClickHideContent() {
        this.isShowContent = false;
    }
    onClickLabel() {
        this.isShowContent = !this.isShowContent;
    }
}
</script>
<style scoped lang="scss">
.icon-wrapper {
    display: flex;
    align-items: center;
    padding: 2px 0px 10px 0px;
}
.label-content {
    padding: 10px;
    padding-left: 0px;
    font: 1em sans-serif;
    font-weight: bold;
}
.disable-content {
    color: #ccc !important;
}
.content {
    margin-left: 20px;
}
:deep(.el-color-picker__trigger) {
    padding: 0;
    border: none;
}
.validation-error {
    line-height: 1.3;
    margin-left: 20px;
}
</style>
