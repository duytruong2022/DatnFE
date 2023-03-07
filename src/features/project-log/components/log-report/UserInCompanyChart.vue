<template>
    <div class="row user-in-company-chart">
        <div class="col-4">
            <UserInCompanyCharFilterForm @handleFilter="handleFilter" />
        </div>
        <div class="col-8">
            <canvas ref="statChart"></canvas>
        </div>
    </div>
</template>
<script lang="ts">
import { Chart, ChartDataset, ChartItem, registerables } from 'chart.js';
import { mixins, Options } from 'vue-class-component';
import { IUserInCompaniesCount } from '../../interfaces';
import { logReportService } from '../../services/api.services';
import { DateRangeTypes, MAX_COMPANY_COUNT, Months, WEEK_PER_YEAR } from '../../constant';
import { ProjectLogMixins } from '../../mixin';
import UserInCompanyCharFilterForm from './UserInCompanyCharFilterForm.vue';
import throttle from 'lodash-es/throttle';
import uniq from 'lodash-es/uniq';
import { projectLogModule } from '../../store';
import moment from 'moment';
import { ElLoading } from 'element-plus';

Chart.register(...registerables);

@Options({ components: { UserInCompanyCharFilterForm } })
export default class UserInCompanyChart extends mixins(ProjectLogMixins) {
    filterForm: Record<string, string | Array<string> | number> = {
        dateRangeType: DateRangeTypes.MONTH,
        projectId: '',
        dateRanges: [],
        endYear: moment().year(),
        startYear: moment().year(),
    };
    chart: Chart | null = null;
    userInCompanies: IUserInCompaniesCount[] = [];
    throttled = throttle(this.createChart, 2000, { trailing: false });

    get companies() {
        return uniq(
            this.userInCompanies.flatMap((userInCompany) =>
                userInCompany.companies.map((company) => company.companyName),
            ),
        );
    }

    get datasets() {
        const datasets: ChartDataset[] = [];
        this.companies.forEach((company, index) => {
            const data: number[] = [];
            if (this.filterForm.dateRangeType === DateRangeTypes.MONTH) {
                Months.forEach((month) => {
                    const userInCompany = this.userInCompanies.find(
                        (userInCompany) => userInCompany.month === month.value,
                    );
                    if (userInCompany) {
                        const selectedCompany = userInCompany.companies.find(
                            (compa) => compa.companyName === company,
                        );
                        if (selectedCompany) {
                            data.push(selectedCompany.userCount);
                        } else {
                            data.push(0);
                        }
                    } else {
                        data.push(0);
                    }
                });
            } else if (this.filterForm.dateRangeType === DateRangeTypes.WEEK) {
                [...Array(WEEK_PER_YEAR).keys()].forEach((week) => {
                    const userInCompany = this.userInCompanies.find(
                        (userInCompany) => userInCompany.week === week,
                    );
                    if (userInCompany) {
                        const selectedCompany = userInCompany.companies.find(
                            (compa) => compa.companyName === company,
                        );
                        if (selectedCompany) {
                            data.push(selectedCompany.userCount);
                        } else {
                            data.push(0);
                        }
                    } else {
                        data.push(0);
                    }
                });
            } else if (this.filterForm.dateRangeType === DateRangeTypes.YEAR) {
                if (this.filterForm.endYear && this.filterForm.startYear) {
                    for (
                        let year = this.filterForm.startYear as number;
                        year <= this.filterForm.endYear;
                        year++
                    ) {
                        const userInCompany = this.userInCompanies.find(
                            (userInCompany) => userInCompany.year === year,
                        );
                        if (userInCompany) {
                            const selectedCompany = userInCompany.companies.find(
                                (compa) => compa.companyName === company,
                            );
                            if (selectedCompany) {
                                data.push(selectedCompany.userCount);
                            } else {
                                data.push(0);
                            }
                        } else {
                            data.push(0);
                        }
                    }
                }
            }

            datasets.push({
                label: company,
                data,
                borderColor:
                    projectLogModule.randomColors[
                        Math.pow(index + 1, 4) % MAX_COMPANY_COUNT
                    ],
                backgroundColor:
                    projectLogModule.randomColors[
                        Math.pow(index + 1, 4) % MAX_COMPANY_COUNT
                    ],
            });
        });
        return datasets;
    }

    async createChart() {
        const loading = ElLoading.service({
            target: '.user-in-company-chart',
        });
        await this.getUserInCompanies();
        if (this.chart) {
            (this.chart as Chart).destroy();
        }

        let labels: string[] = [];
        if (this.filterForm.dateRangeType === DateRangeTypes.MONTH) {
            labels = Months.map((month) => this.$t(month.label));
        } else if (this.filterForm.dateRangeType === DateRangeTypes.WEEK) {
            labels = [...Array(WEEK_PER_YEAR).keys()].map((week) => week.toString());
        } else if (this.filterForm.dateRangeType === DateRangeTypes.YEAR) {
            for (
                let year = this.filterForm.startYear as number;
                year <= this.filterForm.endYear;
                year++
            ) {
                labels.push(year.toString());
            }
        }

        this.chart = new Chart(this.$refs['statChart'] as ChartItem, {
            type: 'bar',
            data: {
                labels,
                datasets: this.datasets,
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: this.$t('projectLog.chart.usersInCompany'),
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                    },
                },
            },
        });
        loading.close();
    }

    async getUserInCompanies() {
        const response = await logReportService.getUserInCompanyList({
            dateRangeType: (this.filterForm.dateRangeType ||
                DateRangeTypes.MONTH) as string,
            dateRanges: this.filterForm.dateRanges as string[],
            projectId: this.filterForm.projectId as string,
        });
        if (response.success) {
            this.userInCompanies = response.data.items;
        } else {
            this.userInCompanies = [];
        }
    }

    async created() {
        await this.createChart();
    }

    async handleFilter(filterForm: Record<string, string>): Promise<void> {
        this.filterForm = filterForm;
        await this.throttled();
    }
}
</script>
