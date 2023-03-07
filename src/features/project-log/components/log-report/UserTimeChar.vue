<template>
    <div class="row user-time-chart">
        <div class="col-4">
            <UserTimeCharFilterForm
                @handleFilter="handleFilter"
                @resetFilter="resetFilter"
            />
        </div>
        <div class="col-8">
            <canvas ref="statChart"></canvas>
        </div>
    </div>
</template>
<script lang="ts">
import { Chart, ChartItem, registerables } from 'chart.js';
import { mixins, Options } from 'vue-class-component';
import { IUserTimeByModule } from '../../interfaces';
import { logReportService } from '../../services/api.services';
import { DateRangeTypes, DAY_PER_MONTH, Months } from '../../constant';
import { AccessModules, DATE_TIME_FORMAT } from '@/common/constants';
import { ProjectLogMixins } from '../../mixin';
import UserTimeCharFilterForm from './UserTimeCharFilterForm.vue';
import moment from 'moment';
import { projectLogModule } from '../../store';
import { ElLoading } from 'element-plus';
import throttle from 'lodash-es/throttle';

Chart.register(...registerables);

@Options({ components: { UserTimeCharFilterForm } })
export default class UserTimeChar extends mixins(ProjectLogMixins) {
    filterForm: Record<string, string> = {
        dateRangeType: DateRangeTypes.MONTH,
        company: '',
        dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        projectId: '',
    };
    chart: Chart | null = null;
    userTimeByModules: IUserTimeByModule[] = [];
    throttled = throttle(this.createChart, 2000, { trailing: false });

    get datasets() {
        const platformModuleTimes: number[] = [];
        const constellationModuleTimes: number[] = [];
        const viewer3DProfileModuleTimes: number[] = [];
        const projectTimes: number[] = [];
        if (this.filterForm.dateRangeType === DateRangeTypes.MONTH) {
            Months.forEach((month) => {
                const userTime = this.userTimeByModules.find(
                    (userTimeByModule) => userTimeByModule.month === month.value,
                );
                if (userTime) {
                    platformModuleTimes.push(userTime.platformModuleTime);
                    constellationModuleTimes.push(userTime.constellationModuleTime);
                    viewer3DProfileModuleTimes.push(userTime.viewer3DProfileModuleTime);
                    projectTimes.push(userTime.projectTime);
                } else {
                    platformModuleTimes.push(0);
                    constellationModuleTimes.push(0);
                    viewer3DProfileModuleTimes.push(0);
                    projectTimes.push(0);
                }
            });
        } else {
            [...Array(DAY_PER_MONTH).keys()].forEach((day) => {
                const userTime = this.userTimeByModules.find(
                    (userTimeByModule) => userTimeByModule.day === day,
                );
                if (userTime) {
                    platformModuleTimes.push(userTime.platformModuleTime);
                    constellationModuleTimes.push(userTime.constellationModuleTime);
                    viewer3DProfileModuleTimes.push(userTime.viewer3DProfileModuleTime);
                    projectTimes.push(userTime.projectTime);
                } else {
                    platformModuleTimes.push(0);
                    constellationModuleTimes.push(0);
                    viewer3DProfileModuleTimes.push(0);
                    projectTimes.push(0);
                }
            });
        }
        if (this.filterForm.projectId?.length) {
            return [
                {
                    label: projectLogModule.projectList.find(
                        (project) => project._id === this.filterForm.projectId,
                    )?.name,
                    data: projectTimes,
                    borderColor: '#ED1C24',
                    backgroundColor: '#ED1C24',
                },
            ];
        }
        return [
            {
                label: this.$t(`app.accessModule.${AccessModules.SPACIALYTIC_PLATFORM}`),
                data: platformModuleTimes,
                borderColor: '#ED1C24',
                backgroundColor: '#ED1C24',
            },
            {
                label: this.$t(
                    `app.accessModule.${AccessModules.SPACIALYTIC_CONSTELLATION}`,
                ),
                data: constellationModuleTimes,
                borderColor: '#FFF200',
                backgroundColor: '#FFF200',
            },
            {
                label: this.$t(
                    `app.accessModule.${AccessModules.SPACIALYTIC_3DWEBVIEWER}`,
                ),
                data: viewer3DProfileModuleTimes,
                borderColor: '#3F48CC',
                backgroundColor: '#3F48CC',
            },
        ];
    }

    async createChart() {
        const loading = ElLoading.service({
            target: '.user-time-chart',
        });
        await this.getUserTimeByModules();
        if (this.chart) {
            (this.chart as Chart).destroy();
        }
        this.chart = new Chart(this.$refs['statChart'] as ChartItem, {
            type: 'line',
            data: {
                labels:
                    this.filterForm.dateRangeType === DateRangeTypes.MONTH
                        ? Months.map((month) => this.$t(month.label))
                        : [...Array(DAY_PER_MONTH).keys()].map((day) => day.toString()),
                datasets: this.datasets,
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: this.$t('projectLog.chart.userTime'),
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: false,
                    },
                },
            },
        });
        loading.close();
    }

    async getUserTimeByModules() {
        const dateRanges = [];
        if (this.filterForm.dateRange?.length) {
            if (this.filterForm.dateRangeType == DateRangeTypes.MONTH) {
                dateRanges.push(
                    moment(this.filterForm.dateRange)
                        .startOf('year')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
                dateRanges.push(
                    moment(this.filterForm.dateRange)
                        .endOf('year')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
            } else {
                dateRanges.push(
                    moment(this.filterForm.dateRange)
                        .startOf('month')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
                dateRanges.push(
                    moment(this.filterForm.dateRange)
                        .endOf('month')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
            }
        }
        const response = await logReportService.getUserTimeByModule({
            dateRangeType: this.filterForm.dateRangeType || DateRangeTypes.MONTH,
            company: this.filterForm.company || '',
            dateRanges,
            projectId: this.filterForm.projectId || '',
        });
        if (response.success) {
            this.userTimeByModules = response.data.items;
        } else {
            this.userTimeByModules = [];
        }
    }

    async created() {
        await this.createChart();
    }

    async handleFilter(filterForm: Record<string, string>): Promise<void> {
        this.filterForm = filterForm;
        await this.throttled();
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            dateRangeType: DateRangeTypes.MONTH,
            company: '',
            dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            projectId: '',
        };
        await this.throttled();
    }
}
</script>
