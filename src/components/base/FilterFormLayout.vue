<template>
    <el-collapse-transition>
        <div class="filter-form-layout">
            <div>
                <slot />
                <div class="button-group button-action">
                    <el-button type="danger" size="mini" @click="onClickButtonReset">
                        {{ $t('common.filterForm.reset') }}
                    </el-button>
                    <el-button type="primary" size="mini" @click="onClickButtonSearch">
                        {{ $t('common.filterForm.search') }}
                    </el-button>
                    <el-button
                        size="mini"
                        type="primary"
                        @click="onClickButtonCreate"
                        v-if="isShowCreateButton"
                    >
                        {{ createButtonText || $t('common.filterForm.create') }}
                    </el-button>
                    <slot name="custom-button" />
                </div>
            </div>
        </div>
    </el-collapse-transition>
</template>

<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator';

export default class FilterFormLayout extends Vue {
    @Prop({ default: true }) readonly isShowCreateButton!: boolean;
    @Prop({ default: '' }) readonly createButtonText!: string;

    onClickButtonCreate(): void {
        this.$emit('create');
    }

    onClickButtonSearch(): void {
        this.$emit('search');
    }

    onClickButtonReset(): void {
        this.$emit('reset');
    }
}
</script>

<style scoped lang="scss">
.button-action {
    display: flex;
    justify-content: center;
    margin-left: auto;
}
.filter-form-layout {
    text-align: left;
    background-color: #fff;
    z-index: map-get($map: $zIndex, $key: baseCustomFilterForm);
}
</style>
