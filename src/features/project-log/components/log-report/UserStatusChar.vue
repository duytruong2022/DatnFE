<template>
    <div class="row user-status-chart">
        <div class="col-4">
            <BaseFilterFormLayout
                @search="handleFilter"
                @reset="resetFilter"
                @keyup.enter="handleFilter"
                :createButtonText="$t('user.filterForm.create')"
                :isShowCreateButton="false"
            >
                <slot>
                    <div class="row">
                        <!-- <div class="col-xl-12 col-md-12 col-12">
                            <BaseSingleSelect
                                v-model:value="filterForm.module"
                                :options="accessModuleOptions"
                                :label="$t('projectLog.filterForm.module.label')"
                                :placeholder="
                                    $t('projectLog.filterForm.module.placeholder')
                                "
                            />
                        </div> -->
                        <div class="col-xl-12 col-md-12 col-12">
                            <BaseSingleSelect
                                v-model:value="filterForm.projectId"
                                :filterable="true"
                                :options="projectOptions"
                                :label="$t('projectLog.filterForm.project.label')"
                                :placeholder="
                                    $t('projectLog.filterForm.project.placeholder')
                                "
                            />
                        </div>
                        <div class="col-xl-12 col-md-12 col-12">
                            <BaseSingleSelect
                                v-model:value="filterForm.company"
                                :filterable="true"
                                :options="companyOptions"
                                :label="$t('projectLog.filterForm.company.label')"
                                :placeholder="
                                    $t('projectLog.filterForm.company.placeholder')
                                "
                            />
                        </div>
                    </div>
                </slot>
            </BaseFilterFormLayout>
        </div>
        <div class="col-1"></div>
        <div class="col-5">
            <canvas ref="statChart"></canvas>
        </div>
    </div>
</template>
<script lang="ts">
import { Chart, ChartItem, registerables } from 'chart.js';
import { mixins } from 'vue-class-component';
import { logReportService } from '../../services/api.services';
import { ProjectLogMixins } from '../../mixin';
import { AccessModules, UserStatus } from '@/common/constants';
import { IUserStatusCount } from '../../interfaces';
import { projectLogModule } from '../../store';
import { IDropDownOption } from '@/common/interfaces';
import throttle from 'lodash-es/throttle';
import { ElLoading } from 'element-plus';

Chart.register(...registerables);

export default class UserStatusChar extends mixins(ProjectLogMixins) {
    filterForm = {
        module: '',
        projectId: '',
        company: '',
    };
    chart: Chart | null = null;
    userStatusCount: IUserStatusCount[] = [];
    throttled = throttle(this.createChart, 2000, { trailing: false });

    get companyOptions() {
        return projectLogModule.companyList.map((company) => ({
            label: company,
            value: company,
        }));
    }

    get projectOptions(): IDropDownOption[] {
        return projectLogModule.projectList.map((project) => {
            return {
                value: project._id,
                label: project.name,
            };
        });
    }

    get accessModuleOptions(): IDropDownOption[] {
        return Object.values(AccessModules).map((accessModule) => {
            return {
                value: accessModule,
                label: this.$t(`app.accessModule.${accessModule}`),
            };
        });
    }

    get datasets() {
        const datasets: number[] = [];
        Object.values(UserStatus).forEach((userStatus) => {
            const statusCount = this.userStatusCount.find(
                (statusCount) => statusCount.status === userStatus,
            );
            if (statusCount) {
                datasets.push(statusCount.statusCount);
            } else {
                datasets.push(0);
            }
        });
        return datasets;
    }

    async createChart() {
        const loading = ElLoading.service({
            target: '.user-status-chart',
        });
        await this.getUserStatusCount();
        if (this.chart) {
            (this.chart as Chart).destroy();
        }
        this.chart = new Chart(this.$refs['statChart'] as ChartItem, {
            type: 'pie',
            data: {
                labels: Object.values(UserStatus).map((status) =>
                    this.$t(`user.filterForm.status.${status}`),
                ),

                datasets: [
                    {
                        data: this.datasets,
                        backgroundColor: ['#FFF200', '#22B14C', '#7092BE', '#880015'],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: this.$t('projectLog.chart.userStatus'),
                    },
                },
            },
        });
        loading.close();
    }

    async getUserStatusCount() {
        const response = await logReportService.getUserStatusList({
            module: this.filterForm.module
                ? (this.filterForm.module as AccessModules)
                : undefined,
            projectId: this.filterForm.projectId || '',
            company: this.filterForm.company || '',
        });
        if (response.success) {
            this.userStatusCount = response.data.items;
        } else {
            this.userStatusCount = [];
        }
    }

    async created() {
        await this.createChart();
    }

    async handleFilter(): Promise<void> {
        await this.throttled();
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            module: '',
            projectId: '',
            company: '',
        };
        await this.throttled();
    }
}
</script>
