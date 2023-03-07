<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm />
    </div>
    <div class="content-wrapper">
        <SecurityProfileTable />
    </div>
    <SecurityProfileForm />
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import SecurityProfileTable from '../components/list/SecurityProfileTable.vue';
import SecurityProfileForm from '../components/form/SecurityProfileForm.vue';
import FilterForm from '../components/form/FilterForm.vue';
import { initSecurityProfileQuery, securityProfileModule } from '../store';
import { ElLoading } from 'element-plus';
import { securityProfileService } from '../services/api.service';
import { showErrorNotificationFunction } from '@/common/helpers';

@Options({
    components: { SecurityProfileTable, SecurityProfileForm, FilterForm },
})
export default class SecurityProfileListPage extends Vue {
    async fetchData() {
        const loading = ElLoading.service({});
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
    created() {
        this.fetchData();
    }

    beforeUnmount() {
        securityProfileModule.setQueryList(initSecurityProfileQuery);
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}

.filter-wrapper {
    margin-top: 0;
}
</style>
