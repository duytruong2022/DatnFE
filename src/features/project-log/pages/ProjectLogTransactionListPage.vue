<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm
            :actionOptions="projectLogTransactionActionOptions"
            :projectLogType="projectLogType.PROJECT_LOG_TRANSACTION"
        />
    </div>
    <div class="content-wrapper">
        <ProjectLogTransactionTable />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import ProjectLogTransactionTable from '../components/ProjectLogTransactionTable.vue';
import FilterForm from '../components/FilterForm.vue';
import { projectLogModule } from '../store';
import { ProjectLogMixins } from '../mixin';

@Options({ components: { ProjectLogTransactionTable, FilterForm } })
export default class ProjectLogTransactionListPage extends mixins(ProjectLogMixins) {
    created() {
        projectLogModule.clearQueryStringProjectLog();
        projectLogModule.getProjectLogTransactionList();
        projectLogModule.getProjectList();
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
