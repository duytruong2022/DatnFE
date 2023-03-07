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
                    <div
                        :class="{
                            'col-xl-6': shouldShowProjectSelect,
                            'col-md-12': shouldShowProjectSelect,
                            'col-md-12': !shouldShowProjectSelect,
                        }"
                    >
                        <BaseInputText
                            v-model:value="filterForm.keyword"
                            :label="$t('notification.filterForm.keyword.label')"
                            :placeholder="
                                $t('notification.filterForm.keyword.placeholder')
                            "
                        />
                    </div>
                    <div class="col-xl-6 col-md-12" v-if="shouldShowProjectSelect">
                        <BaseSingleSelect
                            :label="$t('notification.filterForm.project.label')"
                            :placeholder="$t('notification.filterForm.project.label')"
                            :options="projectOptions"
                            v-model:value="filterForm.projectId"
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
import { AccessModules, DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { ElLoading } from 'element-plus';
import { notificationModule } from '../store';
import { initQueryString } from '../store';
import { INotificationListQueryString } from '../interfaces';
import { NotificationStatus } from '../constants';
import { UtilMixins } from '@/mixins/utilMixins';
import { IDropDownOption } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';
import { authModule } from '@/features/auth/store';

export default class FilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        projectId: '',
    };

    get shouldShowProjectSelect(): boolean {
        return authModule.selectedAccessModule !== AccessModules.SPACIALYTIC_3DWEBVIEWER;
    }

    get projectOptions(): IDropDownOption[] {
        return projectModule.projectList.map((project) => ({
            value: project._id,
            label: project.name,
        }));
    }

    get selectedNotificationTab(): NotificationStatus {
        return notificationModule.selectedNotificationTab;
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            projectId: '',
        };
        notificationModule.setNotificationListQueryString({
            ...initQueryString,
            status: notificationModule.notificationListQueryString.status,
            accessModules: authModule.selectedAccessModule
                ? [authModule.selectedAccessModule]
                : undefined,
        });
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: INotificationListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
            projectId: this.filterForm.projectId,
        };
        notificationModule.setNotificationListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await notificationModule.getNotificationList();
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
