<template>
    <div class="content-wrapper filter-wrapper">
        <SupportRequestFilter />
    </div>
    <div class="content-wrapper">
        <SupportRequestTable />
    </div>
    <SupportRequestForm />
    <SupportRequestDetail />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import SupportRequestTable from '../components/SupportRequestTable.vue';
import SupportRequestFilter from '../components/SupportRequestFilter.vue';
import { initSupportRequestQuery, supportRequestModule } from '../store';
import SupportRequestForm from '../components/SupportRequestForm.vue';
import SupportRequestDetail from '../components/SupportRequestDetail.vue';

@Options({
    components: {
        SupportRequestTable,
        SupportRequestFilter,
        SupportRequestForm,
        SupportRequestDetail,
    },
})
export default class SupportRequestListPage extends mixins(UtilMixins) {
    created() {
        supportRequestModule.setQueryList(initSupportRequestQuery);
        supportRequestModule.getSupportRequestList();
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}
.filter-wrapper {
    margin-top: 0;
}
</style>
