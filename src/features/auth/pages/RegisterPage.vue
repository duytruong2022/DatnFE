<template>
    <div class="wrap-content">
        <span class="mask"></span>
        <div class="row main-content justify-content-center mb-2 mt-5">
            <div class="col-lg-8 text-center">
                <RegisterForm />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import RegisterForm from '../components/regsiter/RegisterForm.vue';
@Options({
    components: {
        RegisterForm,
    },
})
export default class RegisterPage extends Vue {}
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
