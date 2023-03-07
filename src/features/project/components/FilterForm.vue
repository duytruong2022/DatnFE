<template>
    <div class="filter-form-wrapper">
        <BaseFilterFormLayout
            @search="handleFilter"
            @reset="resetFilter"
            @keyup.enter="handleFilter"
            :isShowCreateButton="false"
        >
            <slot>
                <div class="row">
                    <div class="col-xl-6 col-md-6">
                        <BaseInputText
                            v-model:value="filterForm.keyword"
                            :label="
                                $t('projectList.projectTable.filterForm.keyword.label')
                            "
                            :placeholder="
                                $t(
                                    'projectList.projectTable.filterForm.keyword.placeholder',
                                )
                            "
                        />
                    </div>
                    <div class="col-xl-6 col-md-12">
                        <BaseSingleSelect
                            :label="
                                $t('projectList.projectTable.filterForm.category.label')
                            "
                            :placeholder="
                                $t(
                                    'projectList.projectTable.filterForm.category.placeholder',
                                )
                            "
                            :options="categoryOptions"
                            v-model:value="filterForm.category"
                            filterable
                            :clearable="true"
                        />
                    </div>
                    <div class="col-xl-6 col-md-12">
                        <BaseSingleSelect
                            v-model:value="filterForm.createdBy"
                            :options="userOptions"
                            :label="
                                $t('projectList.projectTable.filterForm.createdBy.label')
                            "
                            :placeholder="
                                $t(
                                    'projectList.projectTable.filterForm.createdBy.placeholder',
                                )
                            "
                            :filterable="true"
                            :clearable="true"
                        />
                    </div>
                    <div class="col-xl-6 col-md-12">
                        <BaseDatePickerRange
                            v-model:value="filterForm.createdAt"
                            size="medium"
                            :label="
                                $t('projectList.projectTable.filterForm.createdAt.label')
                            "
                            :range-separator="
                                $t('projectList.projectTable.filterForm.createdAt.to')
                            "
                            :start-placeholder="
                                $t(
                                    'projectList.projectTable.filterForm.createdAt.placeholder.start',
                                )
                            "
                            :end-placeholder="
                                $t(
                                    'projectList.projectTable.filterForm.createdAt.placeholder.end',
                                )
                            "
                        />
                    </div>
                </div>
            </slot>
        </BaseFilterFormLayout>
    </div>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';
import { DEFAULT_FIRST_PAGE } from '@/common/constants';
import { ElLoading } from 'element-plus';
import { projectModule } from '@/features/project/store';
import {
    DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE,
    initQueryString,
    ProjectCategories,
    ProjectCategoryOptions,
} from '@/features/project/constants';
import { IProjectListQueryString } from '@/features/project/interfaces';
import { IDropDownOption } from '@/common/interfaces';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { UtilMixins } from '@/mixins/utilMixins';

export default class FilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        category: '',
        createdBy: '',
        createdAt: [],
    };

    get categoryOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(ProjectCategoryOptions);
    }

    get userOptions() {
        return projectModule.userList.map((user) => ({
            label: user.email,
            value: user._id,
        }));
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            category: '',
            createdBy: '',
            createdAt: [],
        };
        projectModule.setProjectListQueryString(initQueryString);
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: IProjectListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE,
            keyword: this.filterForm.keyword,
            category: this.filterForm.category as ProjectCategories,
            createdBy: this.filterForm.createdBy,
            createdAt: this.parseDatePickerRangeValues(this.filterForm.createdAt),
        };
        projectModule.setProjectListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await projectModule.getProjectList();
        loading.close();
    }
}
</script>

<style lang="scss" scoped>
.filter-form-wrapper {
    background-color: #fff;
    border-radius: 1rem;
}
</style>
