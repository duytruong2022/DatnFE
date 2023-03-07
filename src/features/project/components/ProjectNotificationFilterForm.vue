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
                    <div class="col-xl-6 col-md-12">
                        <BaseInputText
                            v-model:value="filterForm.keyword"
                            :label="$t('projectNotification.filter.keyword.label')"
                            :placeholder="
                                $t('projectNotification.filter.keyword.placeholder')
                            "
                        />
                    </div>
                    <div class="col-xl-6 col-md-12">
                        <BaseSingleSelect
                            :label="$t('projectNotification.filter.type.label')"
                            :placeholder="$t('projectNotification.filter.type.label')"
                            :options="projectOptions"
                            v-model:value="filterForm.type"
                            filterable
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
import { ProjectNotificationType } from '../constants';
import { UtilMixins } from '@/mixins/utilMixins';
import { IDropDownOption } from '@/common/interfaces';
import { projectModule } from '../store';

export default class ProjectNotificationFilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        type: null,
    };

    get projectOptions(): IDropDownOption[] {
        return Object.values(ProjectNotificationType).map((value) => ({
            value,
            label: this.$t(`projectNotification.filter.option.${value}`),
        }));
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            type: null,
        };
        projectModule.setProjectNotificationListQueryString({
            ...this.filterForm,
            page: DEFAULT_FIRST_PAGE,
        });
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        projectModule.setProjectNotificationListQueryString({ ...this.filterForm });
        const loading = ElLoading.service({
            target: '.content',
        });
        await projectModule.getProjectNotificationList();
        loading.close();
    }
}
</script>

<style lang="scss" scoped>
.filter-form-wrapper {
    background-color: #fff;
    border-radius: 16px;
    margin-bottom: 15px;
    padding: 30px 25px;
}
</style>
