<template>
    <div class="page-wrapper">
        <h1 class="text-danger">{{ $t('errors.404.title') }}</h1>
        <h2 class="description">{{ $t('errors.404.description') }}</h2>
        <el-button class="go-homepage-btn" @click="goHomepage">{{
            $t('errors.404.goHomepage')
        }}</el-button>
    </div>
</template>

<script lang="ts">
import { PageName } from '@/common/constants';
import router from '@/plugins/vue-router';
import { Vue } from 'vue-class-component';

export default class NotFoundPage extends Vue {
    goHomepage(): void {
        router.push({
            name: PageName.PROFILE_VIEW_PAGE, //TODO: redirect HOME_PAGE later,
        });
    }
}
</script>
<style lang="scss" scoped>
.page-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 100px;
}
.text-danger {
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-image: linear-gradient(310deg, #d60808, #ffbed0);
    font-weight: 700;
    color: #ea0606 !important;
    font-size: 80px;
}
.description {
    font-weight: 700;
}
.go-homepage-btn {
    height: fit-content;
    margin-top: 50px;
    padding: 12px 24px;
    color: #fff;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 4px 7px -1px rgb(0 0 0 / 11%), 0 2px 4px -1px rgb(0 0 0 / 7%);
    background-image: linear-gradient(310deg, #141727, #3a416f);
    &:hover {
        color: #fff !important;
        box-shadow: 0 3px 5px -1px rgb(0 0 0 / 9%), 0 2px 3px -1px rgb(0 0 0 / 7%);
        transform: scale(1.02);
    }
}
</style>
