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
import ProfileList from '../components/list/ProfileList.vue';
import { profileModule } from '../store';
import ProfileForm from '../components/form/ProfileForm.vue';

@Options({
    components: {
        ProfileList,
        ProfileForm,
    },
})
export default class Viewer3DProfilePage extends mixins(UtilMixins) {
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
        profileModule.setProfileListQueryString({
            projectId: null,
        });
        this.fetchData();
    }
}
</script>

<style lang="sss" scoped></style>
