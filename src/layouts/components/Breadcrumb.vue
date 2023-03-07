<template>
    <el-breadcrumb class="bread-lists" separator="/">
        <el-breadcrumb-item
            :to="page.link"
            v-for="(page, index) in breadcrumb"
            :key="index"
            :class="{ current: index === breadcrumb.length - 1 }"
            >{{ $t(page.text) }}</el-breadcrumb-item
        >
    </el-breadcrumb>
</template>
<script lang="ts">
import { commonModule } from '@/features/common/common.store';
import { Options, Vue } from 'vue-class-component';
@Options({
    components: {},
})
export default class Breadcrumb extends Vue {
    get customBreadcrumb() {
        return commonModule.customBreadcrumb;
    }

    get breadcrumb() {
        if (this.customBreadcrumb) {
            return [
                ...(this.$route.meta.breadcrumb as string[]),
                {
                    text: this.customBreadcrumb,
                },
            ];
        }
        return this.$route.meta.breadcrumb;
    }
}
</script>
<style lang="scss" scoped>
:deep(.el-breadcrumb__inner) {
    color: #344767 !important;
    font-weight: 700 !important;
}
:deep(.el-breadcrumb__inner.is-link:hover) {
    cursor: pointer;
}

@media screen and (min-width: 401px) {
    :deep(.el-breadcrumb__inner.is-link) {
        font-weight: normal !important;
        font-size: 14px;
        color: #1d1d1d;
    }
}
:deep(.el-breadcrumb__inner.is-link) {
    font-weight: normal !important;
    color: #1d1d1d;
}
:deep(.current) {
    .el-breadcrumb__inner {
        color: #344767 !important;
        opacity: 1;
        font-weight: 700 !important;
    }
}
</style>
