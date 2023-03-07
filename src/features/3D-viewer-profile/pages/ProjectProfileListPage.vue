<template>
    <div class="row px-2">
        <div
            class="col-3"
            :style="{
                minHeight: 'calc(100vh - 80px)',
            }"
        >
            <ProfileList />
        </div>
        <div class="col-9">
            <ProfileForm />
        </div>
    </div>
</template>

<script lang="ts">
import { showErrorNotificationFunction } from '@/common/helpers';
import { UtilMixins } from '@/mixins/utilMixins';
import { ElLoading } from 'element-plus';
import { mixins, Options } from 'vue-class-component';
import { projectModule } from '@/features/project/store';
import ProfileList from '../components/list/ProfileList.vue';
import { profileModule } from '../store';
import ProfileForm from '../components/form/ProfileForm.vue';
import { PageName } from '@/common/constants';
import router from '@/plugins/vue-router';

@Options({
    components: {
        ProfileList,
        ProfileForm,
    },
})
export default class ProjectProfileListPage extends mixins(UtilMixins) {
    async fetchData() {
        const loading = ElLoading.service({});
        const response = await profileModule.getProfileList();
        // auto select the first item in the list
        if (response.success) {
            profileModule.setSelectedProfile(response.data.items[0]);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }

        loading.close();
    }

    mounted() {
        if (!projectModule.selectedProjectId?.length) {
            return router.replace({
                name: PageName.PROJECT_MAP_PAGE,
            });
        }
        profileModule.setProfileListQueryString({
            projectId: projectModule.selectedProjectId || '',
        });
        this.fetchData();
    }
}
</script>

<style lang="sss" scoped></style>
