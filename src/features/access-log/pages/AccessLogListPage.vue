<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm />
    </div>
    <div class="content-wrapper">
        <AccessLogTable />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import AccessLogTable from '../components/AccessLogTable.vue';
import FilterForm from '../components/FilterForm.vue';
import { accessLogModule, initQueryString } from '../store';

@Options({ components: { AccessLogTable, FilterForm } })
export default class AccessLogListPage extends Vue {
    created() {
        accessLogModule.setAccessLogListQueryString(initQueryString);
        accessLogModule.clearQueryStringAccessLog();
        accessLogModule.getAccessLogList();
        accessLogModule.getCompanyList();
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 20px 25px;
    padding-bottom: 30px;
    background-color: white;
    border-radius: 15px;
}

.filter-wrapper {
    margin-top: 0;
}
</style>
