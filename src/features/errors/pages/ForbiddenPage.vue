<template>
    <div class="page-wrapper">
        <h1 class="text-danger">{{ $t('errors.403.title') }}</h1>
        <h2 class="description">{{ $t('errors.403.description') }}</h2>
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';

export default class ForbiddenPage extends Vue {}
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
</style>
