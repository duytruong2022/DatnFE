<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="false"
    >
        <div class="row">
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="filterForm.keyword"
                    :label="$t('projectLog.filterForm.keyword.label')"
                    :placeholder="$t('projectLog.filterForm.keyword.placeholder')"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseMultipleSelect
                    v-model:value="filterForm.projectIds"
                    :options="projectOptions"
                    :filterable="true"
                    :label="$t('projectLog.filterForm.project.label')"
                    :placeholder="$t('projectLog.filterForm.project.placeholder')"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseMultipleSelect
                    v-model:value="filterForm.actions"
                    :options="projectLogActionOptions"
                    :filterable="true"
                    :label="$t('projectLog.filterForm.actions.label')"
                    :placeholder="$t('projectLog.filterForm.actions.placeholder')"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseDatePickerRange
                    v-model:value="filterForm.updatedAtRange"
                    size="medium"
                    :label="$t('projectLog.filterForm.updatedAtRange.label')"
                    :dateFormat="DATE_TIME_FORMAT.MM_DD_YYYY_SLASH"
                    :range-separator="$t('projectLog.filterForm.updatedAtRange.to')"
                    :start-placeholder="
                        $t('projectLog.filterForm.updatedAtRange.startDate')
                    "
                    :end-placeholder="$t('projectLog.filterForm.updatedAtRange.endDate')"
                />
            </div>
        </div>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';

import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { ElLoading } from 'element-plus';
import { IDropDownOption } from '@/common/interfaces';
import { projectLogModule } from '../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { Prop } from 'vue-property-decorator';
import { IProjectLogListQueryString } from '../interfaces';
import { ProjectLogType } from '../constant';

export default class FilterForm extends mixins(UtilMixins) {
    @Prop() readonly actionOptions!: IDropDownOption[];
    @Prop() readonly projectLogType!: ProjectLogType;

    filterForm = {
        keyword: '',
        projectIds: [],
        actions: [],
        updatedAtRange: [],
    };

    get projectOptions(): IDropDownOption[] {
        return projectLogModule.projectList.map((project) => {
            return {
                value: project._id,
                label: project.name,
            };
        });
    }

    get projectLogActionOptions() {
        return parseLanguageSelectOptions(this.actionOptions);
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            projectIds: [],
            actions: [],
            updatedAtRange: [],
        };

        projectLogModule.clearQueryStringProjectLog();
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: IProjectLogListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
            projectIds: this.filterForm.projectIds,
            actions: this.filterForm.actions,
            updatedAtRange:
                this.parseDatePickerRangeValues(
                    this.filterForm.updatedAtRange as string[],
                ) || undefined,
        };
        projectLogModule.setProjectLogListQueryString({ ...query });
        const loading = ElLoading.service({
            target: '.content',
        });
        if (this.projectLogType === ProjectLogType.PROJECT_LOG_HISTORY) {
            await projectLogModule.getProjectLogHistoryList();
        } else {
            await projectLogModule.getProjectLogTransactionList();
        }
        loading.close();
    }
}
</script>

<style lang="scss" scoped></style>
