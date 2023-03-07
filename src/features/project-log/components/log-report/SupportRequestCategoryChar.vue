<template>
    <div class="row support-request-category-chart">
        <div class="col-4">
            <BaseFilterFormLayout
                @search="handleFilter"
                @reset="resetFilter"
                @keyup.enter="handleFilter"
                :createButtonText="$t('user.filterForm.create')"
                :isShowCreateButton="false"
            >
                <slot>
                    <BaseSingleSelect
                        v-model:value="filterForm.dateRangeType"
                        :options="dateRangeTypeOptions"
                        :clearable="false"
                        :label="$t('projectLog.filterForm.dateRangeType.label')"
                        :placeholder="
                            $t('projectLog.filterForm.dateRangeType.placeholder')
                        "
                    />
                    <BaseDatePicker
                        v-model:value="filterForm.dateRange"
                        :type="
                            filterForm.dateRangeType === dateRangeTypes.MONTH
                                ? 'year'
                                : 'month'
                        "
                        :dateFormat="
                            filterForm.dateRangeType === dateRangeTypes.MONTH
                                ? DATE_TIME_FORMAT.YYYY
                                : DATE_TIME_FORMAT.YYYY_MM_HYPHEN
                        "
                        :clearable="false"
                        :label="$t('projectLog.filterForm.dateRange.label')"
                        :placeholder="$t('projectLog.filterForm.dateRange.placeholder')"
                    />
                </slot>
            </BaseFilterFormLayout>
        </div>
        <div class="col-8">
            <canvas ref="statChart"></canvas>
        </div>
    </div>
</template>
<script lang="ts">
import { Chart, ChartItem, registerables } from 'chart.js';
import { mixins } from 'vue-class-component';
import { ISupportRequestCategoryCount } from '../../interfaces';
import { logReportService } from '../../services/api.services';
import {
    DateRangeTypeOptions,
    DateRangeTypes,
    DAY_PER_MONTH,
    Months,
} from '../../constant';
import { DATE_TIME_FORMAT } from '@/common/constants';
import { ProjectLogMixins } from '../../mixin';
import moment from 'moment';
import { IDropDownOption } from '@/common/interfaces';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { SupportRequestCategory } from '@/features/support-request/contanst';
import throttle from 'lodash-es/throttle';
import { ElLoading } from 'element-plus';

Chart.register(...registerables);

export default class SupportRequestCategoryChar extends mixins(ProjectLogMixins) {
    filterForm: Record<string, string> = {
        dateRangeType: DateRangeTypes.MONTH,
        dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
    };
    chart: Chart | null = null;
    supportRequestCategoryCount: ISupportRequestCategoryCount[] = [];
    throttled = throttle(this.createChart, 2000, { trailing: false });

    get dateRangeTypeOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(DateRangeTypeOptions);
    }

    get datasets() {
        const incidentCount: number[] = [];
        const requestCount: number[] = [];
        const ideaSuggestionCount: number[] = [];
        if (this.filterForm.dateRangeType === DateRangeTypes.MONTH) {
            Months.forEach((month) => {
                const userTime = this.supportRequestCategoryCount.find(
                    (userTimeByModule) => userTimeByModule.month === month.value,
                );
                if (userTime) {
                    incidentCount.push(userTime.incidentCount);
                    requestCount.push(userTime.requestCount);
                    ideaSuggestionCount.push(userTime.ideaSuggestionCount);
                } else {
                    incidentCount.push(0);
                    requestCount.push(0);
                    ideaSuggestionCount.push(0);
                }
            });
        } else {
            [...Array(DAY_PER_MONTH).keys()].forEach((day) => {
                const userTime = this.supportRequestCategoryCount.find(
                    (userTimeByModule) => userTimeByModule.day === day,
                );
                if (userTime) {
                    incidentCount.push(userTime.incidentCount);
                    requestCount.push(userTime.requestCount);
                    ideaSuggestionCount.push(userTime.ideaSuggestionCount);
                } else {
                    incidentCount.push(0);
                    requestCount.push(0);
                    ideaSuggestionCount.push(0);
                }
            });
        }
        return [
            {
                label: this.$t(
                    `supportRequest.list.category.${SupportRequestCategory.INCIDENT}`,
                ),
                data: incidentCount,
                borderColor: '#ED1C24',
                backgroundColor: `rgba(237, 28, 36, 0.3)`,
                fill: 1,
            },
            {
                label: this.$t(
                    `supportRequest.list.category.${SupportRequestCategory.REQUEST}`,
                ),
                data: requestCount,
                borderColor: '#FFF200',
                backgroundColor: 'rgba(255, 242, 0, 0.3)',
                fill: 1,
            },
            {
                label: this.$t(
                    `supportRequest.list.category.${SupportRequestCategory.IDEA_SUGGESTION}`,
                ),
                data: ideaSuggestionCount,
                borderColor: '#3F48CC',
                backgroundColor: 'rgba(63, 72, 204, 0.3)',
                fill: 1,
            },
        ];
    }

    async createChart() {
        const loading = ElLoading.service({
            target: '.support-request-category-chart',
        });
        await this.getSupportRequestCategoryCount();
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
                scales: {
                    y: {
                        stacked: true,
                    },
                },
                plugins: {
                    filler: {
                        propagate: false,
                    },
                    title: {
                        display: true,
                        text: this.$t('projectLog.chart.supportRequestCategory'),
                    },
                },
                interaction: {
                    intersect: false,
                },
            },
        });
        loading.close();
    }

    async getSupportRequestCategoryCount() {
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
        const response = await logReportService.getSupportRequestCategoryCount({
            dateRangeType: this.filterForm.dateRangeType || DateRangeTypes.MONTH,
            dateRanges,
        });
        if (response.success) {
            this.supportRequestCategoryCount = response.data.items;
        } else {
            this.supportRequestCategoryCount = [];
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
            dateRangeType: DateRangeTypes.MONTH,
            dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        };
        await this.throttled();
    }
}
</script>
