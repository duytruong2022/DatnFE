<template>
    <div class="login-ldap-form-popup-wrapper">
        <el-dialog
            width="50%"
            v-model="isShowLoginLdapFormPopUp"
            @closed="closePopup"
            @open="form.openPopup"
            custom-class="login-ldap-form-popup"
        >
            <template #title>
                <img style="height: 60px" src="@/assets/images/logo-ldap.png" />
                <h3 class="mt-2 fw-bold">
                    {{ $t('login.loginLdapForm.title') }}
                </h3>
                <h6 class="fw-bold">{{ $t('login.loginLdapForm.subTitle') }}</h6>
            </template>
            <div class="row">
                <div class="col-md-12 input-username">
                    <BaseAutoComplete
                        class="input-username"
                        v-model:value="form.username"
                        :options="loginedUsers"
                        :error="translateYupError(form.errors.username)"
                        :placeholder="$t('login.loginLdapForm.username')"
                        @keydown="onKeydown"
                    />
                </div>
                <div class="col-md-12">
                    <BaseInputPassword
                        v-model:value="form.password"
                        :error="translateYupError(form.errors.password)"
                        :placeholder="$t('login.loginLdapForm.password')"
                        @keydown="onKeydown"
                    />
                </div>
            </div>
            <template #footer>
                <el-button
                    class="btn btn-action bg-sign-in w-10 my-4 mb-2"
                    @click="onClickLoginButton"
                >
                    {{ $t('login.loginLdapForm.signIn') }}
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { setup } from 'vue-class-component';
import { setupLoginLdapForm } from '../../composition/loginLDAPForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { authModule } from '../../store';
import { KEY_CODE } from '../../constants';
import localStorageAuthService from '@/common/authStorage';
import { ILoginedUser } from '@/common/interfaces';

export default class LoginLDAPFormPopup extends UtilMixins {
    get loginedUsers(): string[] {
        return (localStorageAuthService.getLoginedUsers() as unknown as ILoginedUser[])
            .length
            ? localStorageAuthService
                  .getLoginedUsers()
                  ?.map((item) => item.user.ldapUsername)
                  .filter((item) => {
                      return item;
                  })
            : [];
    }

    form = setup(() => setupLoginLdapForm());

    get isShowLoginLdapFormPopUp(): boolean {
        return authModule.isShowLoginLdapFormPopUp;
    }

    set isShowLoginLdapFormPopUp(val: boolean) {
        authModule.setIsShowLoginLdapFormPopUp(val);
    }

    async closePopup(): Promise<void> {
        authModule.setIsShowLoginLdapFormPopUp(false);
        (this.form.resetForm as () => void)();
    }

    async onClickLoginButton(): Promise<void> {
        await this.form.onSubmit();
    }

    async onKeydown(event: KeyboardEvent): Promise<void> {
        if (event.key === KEY_CODE.ENTER) {
            await this.form.onSubmit();
        }
    }
}
</script>
<style lang="scss" scoped>
.sign-in-ldap-form-popup {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.text-left {
    text-align: left;
}

.btn-action {
    width: 100%;
    margin: 0px !important;
    border-radius: 10px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    height: 40px;
    transition: all 0.15s ease-in;
    background-image: linear-gradient(310deg, #2152ff 0%, #21d4fd 100%);
    &:hover {
        color: #fff !important;
        transform: scale(1.02);
    }
}

.input-username {
    margin-bottom: 35px !important;
}
.login-ldap-form-popup-wrapper {
    :deep(.el-dialog) {
        width: 400px;
        margin-top: 130px !important;
        .el-dialog__close {
            display: none;
        }
        .el-dialog__header {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 0px;
        }
        .el-dialog__header {
            width: 100%;
        }
    }
}
</style>
