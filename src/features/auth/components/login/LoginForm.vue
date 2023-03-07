<template>
    <el-card class="login-form">
        <h5 class="title">{{ $t('login.loginForm.title') }}</h5>
        <img class="logo" src="@/assets/images/logo/logo-vertical.png" alt="" />
        <BaseAutoComplete
            class="input-email"
            v-model:value="form.email"
            :options="loginedUsers"
            :error="translateYupError(form.errors.email)"
            :placeholder="$t('login.loginForm.email')"
            @keydown="onKeydown"
        />
        <BaseInputPassword
            v-model:value="form.password"
            :error="translateYupError(form.errors.password)"
            :placeholder="$t('login.loginForm.password')"
            @keydown="onKeydown"
        />
        <div class="forgot-password-btn" @click="onClickForgotPassword">
            {{ $t('login.loginForm.forgotPassword') }}
        </div>
        <div class="text-center">
            <el-button
                class="btn btn-action bg-sign-in w-100 my-4 mb-2"
                @click="onClickLoginButton"
            >
                {{ $t('login.loginForm.signIn') }}
            </el-button>
        </div>
        <div class="mb-2 text-center">
            <p
                class="text-sm font-weight-bold mb-2 text-secondary text-border d-inline z-index-2 bg-white px-3"
            >
                {{ $t('login.loginForm.or') }}
            </p>
        </div>
        <div class="text-center">
            <router-link class="action-link" to="/register">
                <el-button class="btn btn-action bg-sign-up w-100 mt-2 mb-4">
                    {{ $t('login.loginForm.register') }}
                </el-button>
            </router-link>
        </div>
    </el-card>
</template>

<script lang="ts">
import { Options, setup, mixins } from 'vue-class-component';
import { setupLoginForm } from '../../composition/loginForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { KEY_CODE } from '../../constants';
import { authModule } from '../../store';
import localStorageAuthService from '@/common/authStorage';
import { ILoginedUser } from '@/common/interfaces';
import { projectModule } from '@/features/project/store';

@Options({
    components: {},
})
export default class LoginForm extends mixins(UtilMixins) {
    get loginedUsers(): string[] {
        return (localStorageAuthService.getLoginedUsers() as unknown as ILoginedUser[])
            .length
            ? localStorageAuthService.getLoginedUsers().map((item) => item.user.email)
            : [];
    }

    form = setup(() => setupLoginForm());

    async onClickLoginButton(): Promise<void> {
        projectModule.setSelectedProjectId(null);
        await this.form.onSubmit();
    }

    onClickLoginLdapButton() {
        projectModule.setSelectedProjectId(null);
        authModule.setIsShowLoginLdapFormPopUp(true);
    }

    onClickForgotPassword() {
        authModule.setIsShowForgotPasswordFormPopUp(true);
    }

    async onKeydown(event: KeyboardEvent): Promise<void> {
        if (event.key === KEY_CODE.ENTER) {
            await this.form.onSubmit();
        }
    }
}
</script>
<style lang="scss" scoped>
.action-link {
    text-decoration: none;
}
.input-email {
    margin-bottom: 35px !important;
}
.login-form {
    max-width: 350px;
    width: 80%;
    border-radius: 12px;
    margin: 50px auto;
}
.btn-action {
    border-radius: 10px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    height: 40px;
    transition: all 0.15s ease-in;
    &:hover {
        color: #fff !important;
        transform: scale(1.02);
    }
}

:deep(.el-input) {
    height: 40px;
}
:deep(.form-group) {
    margin: 20px 0;
}
.title {
    font-weight: 600;
    margin-bottom: 20px;
    font-size: 25px;
}
.logo {
    width: 100px;
}
.bg-sign-in {
    background-image: linear-gradient(310deg, #2152ff 0%, #21d4fd 100%);
}

.bg-sign-in-ldap {
    display: flex;
    background-color: #fff;
    color: #000;
    &:hover {
        color: #000 !important;
        transform: scale(1.02);
    }
}

.bg-sign-up {
    background-image: linear-gradient(310deg, #141727 0%, #3a416f 100%);
}

.text-border:after,
.text-border:before {
    content: '';
    display: inline-block;
    width: 30%;
    height: 1px;
    position: relative;
    vertical-align: middle;
}

.text-border:after {
    background: linear-gradient(
        90deg,
        rgba(117, 117, 117, 0.4),
        rgba(117, 117, 117, 0.4),
        transparent
    );
}

.text-border:before {
    background: linear-gradient(
        90deg,
        transparent,
        rgba(117, 117, 117, 0.4),
        rgba(117, 117, 117, 0.4)
    );
}

.text-border:before {
    right: 0.5em;
    margin-left: -50%;
}

.text-border:after {
    left: 0.5em;
    margin-right: -50%;
}

.forgot-password-btn {
    display: flex;
    justify-content: flex-end;
    margin-top: -21px;
    font-size: 14px;
    color: blue;
    text-decoration-line: underline;
    cursor: pointer;
}
</style>
