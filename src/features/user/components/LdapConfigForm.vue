<template>
    <div>
        <div class="row">
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="form.ldapServerUrl"
                    :label="$t('ldapConfigForm.title.serverUrl')"
                    :placeholder="$t('ldapConfigForm.placeholder.serverUrl')"
                    :error="translateYupError(form.errors.ldapServerUrl)"
                    :is-required="true"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="form.ldapBaseUsersDn"
                    :label="$t('ldapConfigForm.title.baseUsersDn')"
                    :placeholder="$t('ldapConfigForm.placeholder.baseUsersDn')"
                    :error="translateYupError(form.errors.ldapBaseUsersDn)"
                    :is-required="true"
                />
            </div>

            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputText
                    v-model:value="form.ldapAdminDn"
                    :label="$t('ldapConfigForm.title.adminDn')"
                    :placeholder="$t('ldapConfigForm.placeholder.adminDn')"
                    :error="translateYupError(form.errors.ldapAdminDn)"
                    :is-required="true"
                />
            </div>
            <div class="col-xl-6 col-md-12 col-12">
                <BaseInputPassword
                    v-model:value="form.ldapAdminPassword"
                    :label="$t('ldapConfigForm.title.adminPassword')"
                    :placeholder="$t('ldapConfigForm.placeholder.adminPassword')"
                    :error="translateYupError(form.errors.ldapAdminPassword)"
                    :is-required="true"
                />
            </div>
        </div>
        <div :style="{ textAlign: 'center' }">
            <el-button type="primary" @click="onClickSaveLdapCofig">
                {{ $t('ldapConfigForm.button.save') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, setup } from 'vue-class-component';
import { setupConfigLdapForm } from '../composition/configLdapForm';

export default class LdapConfigForm extends mixins(UtilMixins) {
    form = setup(() => setupConfigLdapForm());

    async onClickSaveLdapCofig(): Promise<void> {
        await this.form.onSubmit();
    }

    created() {
        this.form.createLdapUserForm();
    }
}
</script>

<style></style>
