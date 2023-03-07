<template>
    <div>
        <ProjectDetail :project="dashboardData.project" />
        <ProjectStatistic :dashboardData="dashboardData" />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import ProjectDetail from '../components/ProjectDetail.vue';
import { projectService } from '../services/project.service';
import { IGetProjectDashboardResponse } from '../interfaces';
import { showErrorNotificationFunction } from '@/common/helpers';
import { Prop } from 'vue-property-decorator';
import { ProjectCategories } from '../constants';
import ProjectStatistic from '../components/ProjectStatistic.vue';
import { projectModule } from '../store';
import ganttChartStorage from '@/common/ganttChartStorage';
@Options({
    components: { ProjectDetail, ProjectStatistic },
})
export default class ProjectDetailPage extends mixins(UtilMixins) {
    @Prop({ default: '' }) readonly projectId!: string;
    dashboardData: IGetProjectDashboardResponse = {
        assignedUserCount: 0,
        planningCount: 0,
        file3DCount: 0,
        taskCount: 0,
        linkCount: 0,
        countTaskGroupByStatus: {},
        companyCount: 0,
        assignedResourceCount: {},
        allResourceCount: {},
        assignedResourceWith3DObjectCount: 0,
        project: {
            name: '',
            adminId: '',
            dataDate: new Date(),
            category: ProjectCategories.INFRASTRUCTURE,
            description: '',
            postalCode: '',
            latitude: NaN,
            longitude: NaN,
            taskIdIncrement: NaN,
            taskIdPrefix: '',
            taskIdSuffix: NaN,
        },
    };

    async created() {
        this.initData();
    }
    async initData() {
        const loading = ElLoading.service({
            target: '.main-wrapper',
        });
        const response = await projectService.getDashboardDetail(this.projectId);
        loading.close();
        if (response.success) {
            this.dashboardData = response.data;
            projectModule.setSelectedProject(response.data.project);
            ganttChartStorage.setDisplayActivityCode(
                response.data.project.displayActivityCode || false,
            );
            if (response.data.userProjectFieldSetting) {
                projectModule.setUserProjectFieldSetting(
                    response.data.userProjectFieldSetting,
                );
            }
        } else {
            showErrorNotificationFunction(response.message as string);
        }
    }
}
</script>
<style lang="scss" scoped></style>
