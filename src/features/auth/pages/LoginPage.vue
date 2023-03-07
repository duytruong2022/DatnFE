<template>
    <div class="wrap-content">
        <span class="mask"></span>
        <div class="row main-content justify-content-center mb-2 mt-5">
            <div class="col-lg-4 text-center">
                <h1 class="welcome-txt">{{ $t('login.header.welcome') }}</h1>
                <LoginForm />
            </div>
        </div>
        <LoginLDAPFormPopup />
        <ForgotPasswordFormPopup />
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import LoginForm from '../components/login/LoginForm.vue';
import LoginLDAPFormPopup from '../components/login/LoginLDAPFormPopup.vue';
import ForgotPasswordFormPopup from '../components/forgotPassword/ForgotPasswordFormPopup.vue';
import { appModule } from '@/plugins/vuex/appModule';
@Options({
    components: {
        LoginForm,
        LoginLDAPFormPopup,
        ForgotPasswordFormPopup,
    },
})
export default class LoginPage extends Vue {
    created() {
        appModule.resetSidebar();
    }
}
</script>
<style lang="scss" scoped>
.wrap-content {
    position: relative;
    height: 450px;
    margin: 15px;
    background-image: url('@/assets/images/login-background-header.jpg');
    background-position-x: 50%;
    background-position-y: 50%;
    border-radius: 12px;
    background-size: cover;

    .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0.6;
        background-image: linear-gradient(310deg, #141727, #3a416f);
        background-position-x: 50%;
        background-position-y: 50%;
        border-radius: 12px;
        background-size: cover;
    }
}

.welcome-txt {
    font-weight: 700;
}
.main-content {
    position: relative;
    color: #ffffff !important;
}
</style>
