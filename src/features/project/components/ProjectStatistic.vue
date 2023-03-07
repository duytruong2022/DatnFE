<template>
    <div class="project-detail">
        <h4>{{ $t('project.dashboard.statistic') }}</h4>
        <el-collapse v-model="activeTab" :accordion="true">
            <el-collapse-item
                :title="$t('project.dashboard.main.title')"
                :name="DashboardTab.MAIN"
            >
                <ul>
                    <li>
                        {{ $t(`project.dashboard.main.assignedUser`) }}:
                        {{ dashboardData.assignedUserCount }}
                    </li>
                    <li>
                        {{ $t(`project.dashboard.main.numberOfCompany`) }}:
                        {{ dashboardData.companyCount }}
                    </li>
                    <li>
                        {{ $t(`project.dashboard.main.planning`) }}:
                        {{ dashboardData.planningCount }}
                    </li>
                </ul>
            </el-collapse-item>
            <el-collapse-item
                :title="$t('project.dashboard.task.title')"
                :name="DashboardTab.TASK"
            >
                <ul>
                    <li>
                        {{ $t(`project.dashboard.task.taskCount`) }}:
                        {{ dashboardData.taskCount }}
                    </li>
                    <li>
                        {{ $t(`project.dashboard.task.taskLink`) }}:
                        {{ dashboardData.linkCount }}
                    </li>
                    <li v-for="taskStatus in TaskStatus" :key="taskStatus">
                        {{
                            $t(
                                `project.dashboard.task.${converToCamelCase(
                                    taskStatus,
                                )}Task`,
                            )
                        }}:
                        {{ dashboardData.countTaskGroupByStatus?.[taskStatus] || 0 }}
                    </li>
                </ul>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import FilterForm from './FilterForm.vue';
import { IGetProjectDashboardResponse } from '../interfaces';
import { ProjectMixins } from '../mixin';
import { Prop } from 'vue-property-decorator';
import { ResourceType, TaskStatus } from '@/features/4D-planning/constants';
import camelCase from 'lodash/camelCase';
import { DashboardTab } from '../constants';
@Options({
    components: { FilterForm },
})
export default class ProjectDetail extends mixins(ProjectMixins) {
    @Prop({ required: true }) readonly dashboardData!: IGetProjectDashboardResponse;
    ResourceType = ResourceType;
    TaskStatus = TaskStatus;
    DashboardTab = DashboardTab;
    activeTab = DashboardTab.MAIN;

    converToCamelCase(value: string): string {
        return camelCase(value);
    }
}
</script>
<style lang="scss" scoped>
.project-detail {
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
    color: #344767;
    font-size: 16px !important;
    h2 {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.label {
    font-weight: 600;
    color: #344767;
}
:deep(.el-collapse-item__content) {
    font-size: 16px !important;
}
:deep(.el-collapse-item__header) {
    font-size: 16px !important;
    font-weight: 700;
    color: #344767;
}
</style>
