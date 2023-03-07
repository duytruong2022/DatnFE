<template>
    <div class="notification-wrapper">
        <ProjectNotificationFilterForm />
    </div>
    <div class="notification-wrapper">
        <NotificationTable />
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import NotificationTable from '../components/NotificationTable.vue';
import { projectModule } from '../store';
import { showErrorNotificationFunction } from '@/common/helpers';
import { ElLoading } from 'element-plus';
import ProjectNotificationFilterForm from '../components/ProjectNotificationFilterForm.vue';
@Options({
    components: {
        NotificationTable,
        ProjectNotificationFilterForm,
    },
})
export default class ProjectPage extends mixins(UtilMixins) {
    created() {
        this.fetchData();
    }
    async fetchData() {
        const loading = ElLoading.service({
            target: '.content',
        });
        const response = await projectModule.getProjectNotificationList();
        if (!response.success) {
            showErrorNotificationFunction(response.message);
            return;
        }
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
.notification-wrapper {
    margin: 20px 25px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}
</style>
