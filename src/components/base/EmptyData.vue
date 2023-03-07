<template>
    <div class="el-empty">
        <div class="el-empty__image">
            <img :src="noDataImage" />
        </div>
        <div class="el-empty__description">
            <p>{{ noDataText }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
export default class EmptyData extends Vue {
    get noDataImage(): string {
        return require('@/assets/images/no-data.svg');
    }

    get noDataText(): string {
        return this.$t('common.noData');
    }
}
</script>
<style lang="scss" scoped></style>
