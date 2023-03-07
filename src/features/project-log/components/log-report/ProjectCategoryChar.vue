<template>
    <div class="row">
        <div class="col-3"></div>
        <div class="col-6">
            <canvas ref="statChart"></canvas>
        </div>
        <div class="col-3"></div>
    </div>
</template>
<script lang="ts">
import { Chart, ChartItem, registerables } from 'chart.js';
import { mixins } from 'vue-class-component';
import { IProjectCategoryCount } from '../../interfaces';
import { logReportService } from '../../services/api.services';
import { ProjectLogMixins } from '../../mixin';
import { ProjectCategories } from '@/features/project/constants';

Chart.register(...registerables);

export default class ProjectCategoryChar extends mixins(ProjectLogMixins) {
    chart: Chart | null = null;
    projectCategoryCount: IProjectCategoryCount[] = [];

    get datasets() {
        const datasets: number[] = [];
        Object.values(ProjectCategories).forEach((projectCategory) => {
            const categoryCount = this.projectCategoryCount.find(
                (categoryCount) => categoryCount.category === projectCategory,
            );
            if (categoryCount) {
                datasets.push(categoryCount.categoryCount);
            } else {
                datasets.push(0);
            }
        });
        return datasets;
    }

    async createChart() {
        await this.getProjectCategoryCount();
        if (this.chart) {
            (this.chart as Chart).destroy();
        }
        this.chart = new Chart(this.$refs['statChart'] as ChartItem, {
            type: 'polarArea',
            data: {
                labels: Object.values(ProjectCategories).map((category) =>
                    this.$t(`project.categories.${category}`),
                ),

                datasets: [
                    {
                        data: this.datasets,
                        backgroundColor: [
                            '#880015',
                            '#FF7F27',
                            '#FFF200',
                            '#22B14C',
                            '#00A2E8',
                            '#FFAEC9',
                            '#B97A57',
                            '#B5E61D',
                            '#7092BE',
                        ],
                    },
                ],
            },
            options: {
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: this.$t('projectLog.chart.projectCategory'),
                    },
                },
            },
        });
    }

    async getProjectCategoryCount() {
        const response = await logReportService.getProjectCategoryCount();
        if (response.success) {
            this.projectCategoryCount = response.data.items;
        } else {
            this.projectCategoryCount = [];
        }
    }

    async created() {
        await this.createChart();
    }

    async handleFilter(): Promise<void> {
        await this.createChart();
    }

    async resetFilter(): Promise<void> {
        await this.createChart();
    }
}
</script>
