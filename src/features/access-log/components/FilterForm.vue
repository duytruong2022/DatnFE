<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="false"
    >
        <div class="row">
            <div class="col-6">
                <BaseInputText
                    v-model:value="filterForm.keyword"
                    :label="$t('accessLog.filterForm.keyword.label')"
                    :placeholder="$t('accessLog.filterForm.keyword.placeholder')"
                />
            </div>
            <div class="col-6">
                <BaseDatePickerRange
                    filterForm="{"
                    v-model:value="filterForm.loginAtRange"
                    size="medium"
                    :label="$t('accessLog.filterForm.loginAtRange.label')"
                    :dateFormat="DATE_TIME_FORMAT.MM_DD_YYYY_SLASH"
                    :range-separator="$t('accessLog.filterForm.loginAtRange.to')"
                    :start-placeholder="$t('accessLog.filterForm.loginAtRange.startDate')"
                    :end-placeholder="$t('accessLog.filterForm.loginAtRange.endDate')"
                />
            </div>
            <div class="col-6">
                <BaseMultipleSelect
                    v-model:value="filterForm.modules"
                    :options="accessModuleOptions"
                    :filterable="true"
                    :label="$t('accessLog.filterForm.module.label')"
                    :placeholder="$t('accessLog.filterForm.module.placeholder')"
                />
            </div>
            <div class="col-6">
                <BaseMultipleSelect
                    v-model:value="companies"
                    :options="companyOptions"
                    :filterable="true"
                    :label="$t('accessLog.filterForm.company.label')"
                    :placeholder="$t('accessLog.filterForm.company.placeholder')"
                />
            </div>
        </div>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';

import { accessLogModule, initQueryString } from '../store';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { IAccessLogListQueryString } from '../interfaces';
import { ElLoading } from 'element-plus';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { IDropDownOption } from '@/common/interfaces';
import { authModule } from '@/features/auth/store';
import { UtilMixins } from '@/mixins/utilMixins';
import { DefaultSelectCompany, DefaultSelectCompanyValue } from '../constants';
import { Watch } from 'vue-property-decorator';
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

export default class FilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        modules: [],
        loginAtRange: [],
    };

    companies: string[] = [];

    get accessModuleOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(authModule.accessModuleOptions);
    }

    get companyOptions() {
        return parseLanguageSelectOptions(
            DefaultSelectCompany.concat(
                accessLogModule.companyList.map((company) => ({
                    label: company,
                    value: company,
                })),
            ),
        );
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            modules: [],
            loginAtRange: [],
        };
        (this.companies = []),
            accessLogModule.setAccessLogListQueryString(initQueryString);
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        const query: IAccessLogListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            loginAtRange: this.parseDatePickerRangeValues(this.filterForm.loginAtRange),
            keyword: this.filterForm.keyword,
            modules: this.filterForm.modules,
            companies: this.companies,
        };
        accessLogModule.setAccessLogListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await accessLogModule.getAccessLogList();
        loading.close();
    }

    @Watch('companies')
    onChangeData(newValue: string[], oldValue: string[]) {
        if (newValue.length > oldValue.length) {
            const addItem = difference(newValue, oldValue)[0];
            if (addItem === DefaultSelectCompanyValue.ALL_COMPANY) {
                let tempData = this.companies;
                tempData = uniq(tempData.concat(accessLogModule.companyList));
                this.companies = tempData;
            }
        } else {
            const removeItem = difference(oldValue, newValue)[0];
            if (removeItem === DefaultSelectCompanyValue.ALL_COMPANY) {
                if (!difference(accessLogModule.companyList, newValue).length) {
                    const tempData = difference(newValue, accessLogModule.companyList);
                    this.companies = tempData;
                }
                return;
            }
            if (accessLogModule.companyList.includes(removeItem)) {
                const tempData = newValue?.filter(
                    (item) => item !== DefaultSelectCompanyValue.ALL_COMPANY,
                );
                this.companies = tempData;
                return;
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>
