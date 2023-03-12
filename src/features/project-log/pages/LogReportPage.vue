<template>
    <div class="content-wrapper">
        <SupportRequestCategoryChar />
    </div>
    <div class="content-wrapper">
        <UserStatusChar />
    </div>
    <div class="content-wrapper">
        <ProjectCategoryChar />
    </div>
    <div class="content-wrapper">
        <UserInCompanyChart />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import UserTimeChar from '../components/log-report/UserTimeChar.vue';
import SupportRequestCategoryChar from '../components/log-report/SupportRequestCategoryChar.vue';
import ProjectCategoryChar from '../components/log-report/ProjectCategoryChar.vue';
import UserStatusChar from '../components/log-report/UserStatusChar.vue';
import UserInCompanyChart from '../components/log-report/UserInCompanyChart.vue';
import { ProjectLogMixins } from '../mixin';
import { projectLogModule } from '../store';
import { MAX_COMPANY_COUNT } from '../constant';

@Options({
    components: {
        UserTimeChar,
        SupportRequestCategoryChar,
        ProjectCategoryChar,
        UserStatusChar,
        UserInCompanyChart,
    },
})
export default class LogReportPage extends mixins(ProjectLogMixins) {
    created() {
        projectLogModule.getCompanyList();
        projectLogModule.getProjectList();
        projectLogModule.generateRandomColor(MAX_COMPANY_COUNT);
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
:deep(.mb-3) {
    margin-bottom: 0 !important;
}
:deep(.form-group) {
    margin-bottom: 10px;
}
</style>
