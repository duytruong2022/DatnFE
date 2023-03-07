<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm
            :actionOptions="projectLogHistoryActionOptions"
            :projectLogType="projectLogType.PROJECT_LOG_HISTORY"
        />
    </div>
    <div class="content-wrapper">
        <ProjectLogHistoryTable />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import ProjectLogHistoryTable from '../components/ProjectLogHistoryTable.vue';
import FilterForm from '../components/FilterForm.vue';
import { projectLogModule } from '../store';
import { ProjectLogMixins } from '../mixin';

@Options({ components: { ProjectLogHistoryTable, FilterForm } })
export default class ProjectLogHistoryListPage extends mixins(ProjectLogMixins) {
    created() {
        projectLogModule.clearQueryStringProjectLog();
        projectLogModule.getProjectLogHistoryList();
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
