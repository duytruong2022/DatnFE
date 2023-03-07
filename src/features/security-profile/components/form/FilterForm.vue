<template>
    <BaseFilterFormLayout
        @create="createSecurityProfile"
        @search="onSearch"
        @reset="onReset"
    >
        <BaseInputText
            v-model:value="keyword"
            @on-enter="onSearch"
            :placeholder="$t('securityProfile.form.placeholder.keyword')"
        />
    </BaseFilterFormLayout>
</template>

<script lang="ts">
import { showErrorNotificationFunction } from '@/common/helpers';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { securityProfileService } from '../../services/api.service';
import { securityProfileModule } from '../../store';

export default class FilterForm extends UtilMixins {
    keyword = '';

    createSecurityProfile() {
        securityProfileModule.setIsOpenSecurityProfileForm(true);
        securityProfileModule.setSecurityProfile(null);
    }

    async onSearch() {
        this.keyword = this.keyword.trim();
        securityProfileModule.resetSecurityProfileListQueryString();
        const loading = ElLoading.service({});
        securityProfileModule.setQueryList({
            ...securityProfileModule.queryList,
            keyword: this.keyword,
        });
        const response = await securityProfileService.getSecurityProfileList(
            securityProfileModule.queryList,
        );
        if (response.success) {
            securityProfileModule.setSecurityProfileList(response.data.items);
            securityProfileModule.setTotalItems(response.data.totalItems);
        } else {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    onReset() {
        securityProfileModule.resetSecurityProfileListQueryString();
        this.keyword = '';
        this.onSearch();
    }

    beforeUnmount() {
        this.onReset();
    }
}
</script>

<style lang="scss" scoped></style>
