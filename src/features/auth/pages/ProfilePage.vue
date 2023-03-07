<template>
    <div class="content-wrapper">
        <ProfileForm />
    </div>
</template>
<script lang="ts">
import { ElLoading } from 'element-plus';
import { Options, Vue } from 'vue-class-component';
import ProfileForm from '../components/profile/ProfileForm.vue';
import { authModule } from '../store';
import { commonModule } from '../../common/common.store';
@Options({
    components: {
        ProfileForm,
    },
})
export default class ProfilePage extends Vue {
    async fetchData() {
        const loading = ElLoading.service({});
        await commonModule.getCountry();
        loading.close();
    }
    async mounted() {
        await this.fetchData();

        if (authModule.profile?.needToChangePassword) {
            authModule.setIsShowChangePasswordForm(true);
        }
    }

    created() {
        authModule.getProfile();
        authModule.getCompanyList();
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 0px 24px 24px 24px;
    padding: 20px 25px;
    padding-bottom: 30px;
    background-color: white;
    border-radius: 15px;
}
</style>
