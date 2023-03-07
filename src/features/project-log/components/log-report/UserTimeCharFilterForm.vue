<template>
    <div>
        <BaseFilterFormLayout
            @search="handleFilter"
            @reset="resetFilter"
            @keyup.enter="handleFilter"
            :createButtonText="$t('user.filterForm.create')"
            :isShowCreateButton="false"
        >
            <slot>
                <div class="row">
                    <div class="col-12">
                        <BaseSingleSelect
                            v-model:value="filterForm.dateRangeType"
                            :options="dateRangeTypeOptions"
                            :clearable="false"
                            :label="$t('projectLog.filterForm.dateRangeType.label')"
                            :placeholder="
                                $t('projectLog.filterForm.dateRangeType.placeholder')
                            "
                        />
                    </div>
                    <div class="col-md-12 col-12">
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
                            :placeholder="
                                $t('projectLog.filterForm.dateRange.placeholder')
                            "
                        />
                    </div>
                    <div class="col-md-12 col-12">
                        <BaseSingleSelect
                            v-model:value="filterForm.company"
                            :options="companyOptions"
                            :filterable="true"
                            :label="$t('projectLog.filterForm.company.label')"
                            :placeholder="$t('projectLog.filterForm.company.placeholder')"
                        />
                    </div>
                    <div class="col-md-12 col-12">
                        <BaseSingleSelect
                            v-model:value="filterForm.projectId"
                            :options="projectOptions"
                            :filterable="true"
                            :label="$t('projectLog.filterForm.project.label')"
                            :placeholder="$t('projectLog.filterForm.project.placeholder')"
                        />
                    </div>
                </div>
            </slot>
        </BaseFilterFormLayout>
    </div>
</template>
<script lang="ts">
import { DATE_TIME_FORMAT } from '@/common/constants';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { IDropDownOption } from '@/common/interfaces';
import moment from 'moment';
import { mixins } from 'vue-class-component';
import { DateRangeTypeOptions, DateRangeTypes } from '../../constant';
import { ProjectLogMixins } from '../../mixin';
import { projectLogModule } from '../../store';
export default class UserTimeCharFilterForm extends mixins(ProjectLogMixins) {
    filterForm = {
        dateRangeType: DateRangeTypes.MONTH,
        company: '',
        dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        projectId: '',
    };

    get dateRangeTypeOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(DateRangeTypeOptions);
    }

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

    async handleFilter(): Promise<void> {
        this.$emit('handleFilter', this.filterForm);
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            dateRangeType: DateRangeTypes.MONTH,
            company: '',
            dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            projectId: '',
        };
        this.$emit('resetFilter');
    }
}
</script>
