<template>
    <div class="container">
        <div class="text-end">
            <el-button @click="onClickChangePassword">{{
                $t('profile.form.buttons.changePassword')
            }}</el-button>
            <el-button type="primary" @click="form.updateProfile">{{
                $t('profile.form.buttons.save')
            }}</el-button>
        </div>
        <div class="row">
            <div class="row py-3">
                <div class="col-12 pb-3">
                    <span class="fw-bold">{{ $t('profile.form.labels.email') }}</span
                    >: {{ profile?.email || '' }}
                </div>
                <div class="col-12" v-show="false">
                    <RoleTable />
                </div>
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('profile.form.labels.firstName')"
                    :isRequired="true"
                    :placeholder="$t('userForm.placeholder.firstName')"
                    :error="translateYupError(form.errors.firstName)"
                    v-model:value="form.firstName"
                />
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('profile.form.labels.lastName')"
                    :placeholder="$t('userForm.placeholder.lastName')"
                    :isRequired="true"
                    :error="translateYupError(form.errors.lastName)"
                    v-model:value="form.lastName"
                />
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('profile.form.labels.phoneNumber')"
                    :placeholder="$t('userForm.placeholder.phoneNumber')"
                    :isRequired="false"
                    :error="translateYupError(form.errors.phoneNumber)"
                    v-model:value="form.phoneNumber"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    v-model:value="form.company"
                    :options="companyOptions"
                    :filterable="true"
                    :allowCreate="true"
                    :defaultFirstOption="true"
                    :label="$t('userForm.title.company')"
                    :placeholder="$t('userForm.placeholder.company')"
                    :error="translateYupError(form.errors.company)"
                />
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('profile.form.labels.jobTitle')"
                    :placeholder="$t('userForm.placeholder.jobTitle')"
                    :isRequired="false"
                    :error="translateYupError(form.errors.jobTitle)"
                    v-model:value="form.jobTitle"
                />
            </div>
            <div class="col-6">
                <BaseInputText
                    :label="$t('profile.form.labels.city')"
                    :placeholder="$t('userForm.placeholder.city')"
                    :isRequired="false"
                    :error="translateYupError(form.errors.city)"
                    v-model:value="form.city"
                />
            </div>
            <div class="col-6">
                <BaseSingleSelect
                    :label="$t('profile.form.labels.countryId')"
                    :isRequired="true"
                    :options="countryOptions"
                    :placeholder="$t('userForm.placeholder.country')"
                    :error="translateYupError(form.errors.countryId)"
                    v-model:value="form.countryId"
                    filterable
                />
            </div>
            <div class="col-md-6">
                <BaseSingleSelect
                    v-model:value="form.language"
                    :options="languageOptions"
                    :label="$t('profile.form.labels.language')"
                    :placeholder="$t('userForm.placeholder.language')"
                    :error="translateYupError(form.errors.language)"
                />
            </div>
            <div class="col-md-12">
                <BaseSingleSelect
                    v-model:value="form.timezone"
                    :label="$t('profile.form.labels.timezone')"
                    :placeholder="$t('userForm.placeholder.timezone')"
                    :error="translateYupError(form.errors.timezone)"
                    :options="timezoneOptions"
                    :filterable="true"
                />
            </div>
            <div class="col-12">
                <BaseInputTextarea
                    :label="$t('profile.form.labels.address')"
                    :placeholder="$t('userForm.placeholder.address')"
                    :isRequired="false"
                    :error="translateYupError(form.errors.address)"
                    v-model:value="form.address"
                />
            </div>
        </div>
    </div>
    <ChangePasswordForm />
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { Options, setup } from 'vue-class-component';
import { authModule } from '../../store';
import { setupProfileForm } from '../../composition/profile';
import { Watch } from 'vue-property-decorator';
import { IDropDownOption } from '@/common/interfaces';
import { commonModule } from '@/features/common/common.store';
import { AccessModules, LanguageOptions, TimezonesOptions } from '@/common/constants';
import { parseLanguageSelectOptions } from '@/common/helpers';
import RoleTable from './RoleTable.vue';
import ChangePasswordForm from './ChangePasswordForm.vue';
import { IUser } from '../../interfaces';
@Options({
    components: {
        RoleTable,
        ChangePasswordForm,
    },
})
export default class ProfileForm extends UtilMixins {
    form = setup(() => setupProfileForm());

    get languageOptions() {
        return parseLanguageSelectOptions(LanguageOptions);
    }

    get timezoneOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(TimezonesOptions);
    }

    get countryOptions(): IDropDownOption[] {
        return commonModule.countryList.map((country) => ({
            value: country._id,
            label: country.name,
        }));
    }

    get profile(): IUser | null {
        return authModule.profile;
    }

    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    get companyOptions() {
        return authModule.companyList.map((company) => ({
            label: company,
            value: company,
        }));
    }

    onClickChangePassword() {
        authModule.setIsShowChangePasswordForm(true);
    }

    setFormValue() {
        if (authModule.profile) {
            this.form.setFieldValue('lastName', authModule.profile.lastName);
            this.form.setFieldValue('firstName', authModule.profile.firstName);
            this.form.setFieldValue('ldapUsername', authModule.profile.ldapUsername);
            this.form.setFieldValue('phoneNumber', authModule.profile.phoneNumber);
            this.form.setFieldValue('jobTitle', authModule.profile.jobTitle);
            this.form.setFieldValue('company', authModule.profile.company);
            this.form.setFieldValue('address', authModule.profile.address);
            this.form.setFieldValue('countryId', authModule.profile.countryId);
            this.form.setFieldValue('city', authModule.profile.city);
            this.form.setFieldValue('language', authModule.profile.language);
            this.form.setFieldValue('timezone', authModule.profile.timezone);
            this.form.setFieldValue('lastName', authModule.profile.lastName);
        }
    }

    created() {
        this.setFormValue();
    }

    @Watch('profile', { deep: true })
    profileUpdated() {
        this.setFormValue();
    }
}
</script>

<style></style>
