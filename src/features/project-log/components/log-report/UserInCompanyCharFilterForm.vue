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
                    <div
                        class="col-md-12 col-12"
                        v-if="filterForm.dateRangeType !== dateRangeTypes.YEAR"
                    >
                        <BaseDatePicker
                            v-model:value="filterForm.dateRange"
                            type="year"
                            :dateFormat="DATE_TIME_FORMAT.YYYY"
                            :clearable="false"
                            :label="$t('projectLog.filterForm.dateRange.label')"
                            :placeholder="
                                $t('projectLog.filterForm.dateRange.placeholder')
                            "
                        />
                    </div>
                    <div class="col-md-12 col-12" v-else>
                        <BaseYearPickerRange
                            v-model:startDate="filterForm.startYear"
                            v-model:endDate="filterForm.endYear"
                            size="medium"
                            :label="$t('projectLog.filterForm.dateRange.label')"
                            :dateFormat="DATE_TIME_FORMAT.YYYY"
                            :range-separator="
                                $t('projectLog.filterForm.updatedAtRange.to')
                            "
                            :start-placeholder="
                                $t('projectLog.filterForm.updatedAtRange.startDate')
                            "
                            :end-placeholder="
                                $t('projectLog.filterForm.updatedAtRange.endDate')
                            "
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
import { DateRangeTypeForUserInCompanyOptions, DateRangeTypes } from '../../constant';
import { ProjectLogMixins } from '../../mixin';
import { projectLogModule } from '../../store';
export default class UserInCompanyCharFilterForm extends mixins(ProjectLogMixins) {
    filterForm = {
        dateRangeType: DateRangeTypes.MONTH,
        projectId: '',
        dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        endYear: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        startYear: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
    };

    get dateRangeTypeOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(DateRangeTypeForUserInCompanyOptions);
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
        const dateRanges = [];
        if (this.filterForm.dateRangeType !== DateRangeTypes.YEAR) {
            if (this.filterForm.dateRange?.length) {
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
            }
        } else {
            if (this.filterForm.endYear && this.filterForm.startYear) {
                dateRanges.push(
                    moment(this.filterForm?.startYear)
                        .startOf('year')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
                dateRanges.push(
                    moment(this.filterForm.endYear)
                        .endOf('year')
                        .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                );
            }
        }

        this.$emit('handleFilter', {
            ...this.filterForm,
            dateRanges,
            startYear: moment(this.filterForm?.startYear).year(),
            endYear: moment(this.filterForm?.endYear).year(),
        });
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            dateRangeType: DateRangeTypes.MONTH,
            projectId: '',
            dateRange: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            endYear: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            startYear: moment().format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
        };
        this.$emit('handleFilter', {
            ...this.filterForm,
            dateRanges: [
                moment()
                    .startOf('year')
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
                moment()
                    .endOf('year')
                    .format(DATE_TIME_FORMAT.YYYY_MM_DD_HYPHEN_HH_MM_SS_COLON),
            ],
            startYear: moment().year(),
            endYear: moment().year(),
        });
    }
}
</script>
