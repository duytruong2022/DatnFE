<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="canCreateGroup"
        @create="onClickButtonCreate"
    >
        <div class="row">
            <div class="col-xl-12 col-md-12 col-12">
                <BaseInputText
                    v-model:value="filterForm.keyword"
                    :label="$t('group.filterForm.keyword.label')"
                    :placeholder="$t('group.filterForm.keyword.placeholder')"
                />
            </div>
        </div>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { ElLoading } from 'element-plus';
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { initPlanQueryString, projectPlanningModule } from '../store';
import { IPlanListQueryString } from '../interfaces';
import { projectModule } from '@/features/project/store';
import { mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';

export default class FilterForm extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
    };

    get canCreateGroup(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.MANAGE_USERS_GROUPS,
        ]);
    }

    get canImportCSV(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.IMPORT_CSV,
        ]);
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
        };
        projectPlanningModule.setGroupListQueryString(initPlanQueryString);
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: IPlanListQueryString = {
            keyword: this.filterForm.keyword,
        };
        projectPlanningModule.setGroupListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await projectPlanningModule.getPlanningList({
            projectId: projectModule.selectedProjectId as string,
            query,
        });
        loading.close();
    }

    onClickButtonCreate(): void {
        projectPlanningModule.setIsShowPlanningPopup(true);
    }
}
</script>

<style lang="scss" scoped></style>
