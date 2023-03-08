<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        :isShowCreateButton="canCreateGroup"
        @create="onClickButtonCreate"
    >
        <div class="row">
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="filterForm.keyword"
                    :label="$t('group.filterForm.keyword.label')"
                    :placeholder="$t('group.filterForm.keyword.placeholder')"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseMultipleSelect
                    v-model:value="filterForm.profileIds"
                    :options="profileOptions"
                    :filterable="true"
                    :label="$t(`group.groupForm.profile.${currentAccessModule}.label`)"
                    :placeholder="
                        $t(`group.groupForm.profile.${currentAccessModule}.placeholder`)
                    "
                />
            </div>
        </div>
        <template #custom-button>
            <el-button size="mini" class="import-button-" @click="onClickButtonUpload">
                {{ $t('common.importFiles.import') }}
            </el-button>
        </template>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component';

import { groupModule, initGroupQueryString } from '../../store';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import { IGroupListQueryString } from '../../interfaces';
import { ElLoading } from 'element-plus';
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { GroupMixin } from '../../mixins/GroupMixins';

export default class FilterForm extends mixins(GroupMixin) {
    filterForm = {
        keyword: '',
        profileIds: [],
    };

    get canCreateGroup(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.MANAGE_USERS_GROUPS,
        ]);
    }

    created() {
        this.getProfileList();
    }

    async resetFilter(): Promise<void> {
        this.filterForm = {
            keyword: '',
            profileIds: [],
        };
        groupModule.setGroupListQueryString(initGroupQueryString);
        await this.handleFilter();
    }

    async handleFilter(): Promise<void> {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: IGroupListQueryString = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            keyword: this.filterForm.keyword,
            profileIds: this.filterForm.profileIds,
        };
        groupModule.setGroupListQueryString(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await groupModule.getGroupList();
        loading.close();
    }

    onClickButtonCreate(): void {
        groupModule.setIsShowGroupForm(true);
    }

    onClickButtonUpload() {
        groupModule.setIsShowImportGroupFileForm(true);
    }
}
</script>

<style lang="scss" scoped></style>
