<template>
    <BaseFilterFormLayout
        @search="handleFilter"
        @reset="resetFilter"
        @keyup.enter="handleFilter"
        @create="onClickButtonCreate"
    >
        <slot>
            <div class="row">
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseInputText
                        v-model:value="filterForm.keyword"
                        :label="$t('supportRequest.form.keyword.label')"
                        :placeholder="$t('supportRequest.form.keyword.placeholder')"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseMultipleSelect
                        v-model:value="filterForm.sites"
                        :filterable="true"
                        :options="siteOptions"
                        :label="$t('supportRequest.form.site.label')"
                        :placeholder="$t('supportRequest.form.site.placeholder')"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseMultipleSelect
                        v-model:value="filterForm.categories"
                        :options="categoryOptions"
                        :filterable="true"
                        :label="$t('supportRequest.form.category.label')"
                        :placeholder="$t('supportRequest.form.category.placeholder')"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <BaseMultipleSelect
                        v-model:value="filterForm.priorities"
                        :options="priorityOptions"
                        :filterable="true"
                        :label="$t('supportRequest.form.priority.label')"
                        :placeholder="$t('supportRequest.form.priority.placeholder')"
                    />
                </div>
            </div>
        </slot>
        <template #custom-button>
            <el-button size="mini" class="import-button" @click="onClickButtonExport">
                {{ $t('supportRequest.button.export') }}
            </el-button>
        </template>
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import localStorageAuthService from '@/common/authStorage';
import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import {
    parseLanguageSelectOptions,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { IBodyResponse, IDropDownOption } from '@/common/interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import i18n from '@/plugins/vue-i18n';
import Socket from '@/plugins/socket/socket';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { categoryOptions, priorityOptions, siteOptions } from '../contanst';
import { ISupportRequestExportQueryList, ISupportRequestQueryList } from '../interface';
import { supportRequestService } from '../services/api.service';
import { initSupportRequestQuery, supportRequestModule } from '../store';

@Options({
    components: {},
})
export default class SupportRequestFilter extends mixins(UtilMixins) {
    filterForm = {
        keyword: '',
        categories: [],
        sites: [],
        priorities: [],
    };

    get categoryOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(categoryOptions);
    }

    get siteOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(siteOptions);
    }

    get priorityOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(priorityOptions);
    }

    async handleFilter() {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const query: ISupportRequestQueryList = {
            page: DEFAULT_FIRST_PAGE,
            limit: LIMIT_PER_PAGE,
            ...this.filterForm,
        };
        await this.getSupportRequestList(query);
    }

    async resetFilter() {
        this.filterForm = {
            keyword: '',
            categories: [],
            sites: [],
            priorities: [],
        };
        await this.getSupportRequestList(initSupportRequestQuery);
    }

    async getSupportRequestList(query: ISupportRequestQueryList) {
        supportRequestModule.setQueryList(query);
        const loading = ElLoading.service({
            target: '.content',
        });
        await supportRequestModule.getSupportRequestList();
        loading.close();
    }

    onClickButtonCreate() {
        supportRequestModule.setIsShowSupportRequestForm(true);
    }

    async onClickButtonExport() {
        this.filterForm.keyword = this.filterForm.keyword?.trim();
        const socketClientId = Socket.getSocket()?.id;
        if (!socketClientId) {
            showErrorNotificationFunction(
                i18n.global.t('supportRequest.exportCSV.error.connectSocketFail'),
            );
            return;
        }

        const query: ISupportRequestExportQueryList = {
            accessModule: localStorageAuthService.getSelectedAccessModule(),
            socketClientId,
            ...this.filterForm,
        };
        const response = (await supportRequestService.exportCSVSupportResquestList(
            query,
        )) as IBodyResponse<boolean>;
        if (response.success) {
            showSuccessNotificationFunction(
                i18n.global.t('supportRequest.exportCSV.success'),
            );
        } else {
            showErrorNotificationFunction(
                i18n.global.t('supportRequest.exportCSV.error.canNotExport'),
            );
        }
    }
}
</script>
<style lang="scss" scoped>
.import-button {
    border-color: var(--el-color-primary) !important;
    &:hover {
        border-color: var(--el-color-primary) !important;
        background-color: rgb(245, 245, 245) !important;
    }
}
</style>
