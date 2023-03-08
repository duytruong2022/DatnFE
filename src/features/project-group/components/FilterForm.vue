<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="true"
        @create="onClickButtonCreate"
    >
        <div class="row">
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="filterForm.keyword"
                    :placeholder="$t('projectGroup.filterForm.keyword.placeholder')"
                    :label="$t('projectGroup.filterForm.keyword.label')"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseMultipleSelect
                    v-model:value="filterForm.profileIds"
                    :options="projectProfileOptions"
                    :filterable="true"
                    :label="$t(`projectGroup.groupForm.projectProfile.label`)"
                    :placeholder="$t(`projectGroup.groupForm.projectProfile.placeholder`)"
                />
            </div>
        </div>
        <template #custom-button>
            <el-button size="mini" class="import-button" @click="onClickButtonUpload">
                {{ $t('common.importFiles.import') }}
            </el-button>
        </template>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';

import { projectGroupModule, initQueryString } from '../store';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { IProjectGroupListQueryString } from '../interfaces';
import { ElLoading } from 'element-plus';
import { ProjectGroupMixin } from '../mixins/ProjectGroupMixin';

export default class FilterForm extends mixins(ProjectGroupMixin) {
    filterForm = {
        keyword: '',
        profileIds: [],
    };

    async created() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getProjectProfileList();
        loading.close();
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            profileIds: [],
        };
        projectGroupModule.setGroupListQueryString(initQueryString);
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: IProjectGroupListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
            profileIds: this.filterForm.profileIds,
        };
        projectGroupModule.setGroupListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await projectGroupModule.getGroupList();
        loading.close();
    }

    onClickButtonCreate(): void {
        projectGroupModule.setIsShowGroupForm(true);
    }

    onClickButtonUpload() {
        projectGroupModule.setIsShowImportGroupFileForm(true);
    }
}
</script>

<style lang="scss" scoped></style>
