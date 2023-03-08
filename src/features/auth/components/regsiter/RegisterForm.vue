<template>
    <el-card class="register-form">
        <h5 class="title">{{ $t('register.header') }}</h5>
        <BaseInputText
            v-model:value="form.firstName"
            :error="translateYupError(form.errors.firstName)"
            :label="$t('register.registerForm.firstName.label')"
            :placeholder="$t('register.registerForm.firstName.placeholder')"
            :isHorizontal="true"
            :isRequired="true"
        />
        <BaseInputText
            v-model:value="form.lastName"
            :error="translateYupError(form.errors.lastName)"
            :label="$t('register.registerForm.lastName.label')"
            :placeholder="$t('register.registerForm.lastName.placeholder')"
            :isHorizontal="true"
            :isRequired="true"
        />
        <BaseInputText
            v-model:value="form.email"
            :error="translateYupError(form.errors.email)"
            :label="$t('register.registerForm.email.label')"
            :placeholder="$t('register.registerForm.email.placeholder')"
            :isHorizontal="true"
            :isRequired="true"
        />
        <BaseSingleSelect
            v-model:value="form.countryId"
            :error="translateYupError(form.errors.countryId)"
            :label="$t('register.registerForm.countryId.label')"
            :placeholder="$t('register.registerForm.countryId.placeholder')"
            :isHorizontal="true"
            :options="countryOptions"
            :filterable="true"
            :isRequired="true"
        />
        <BaseSingleSelect
            v-model:value="form.language"
            :error="translateYupError(form.errors.language)"
            :label="$t('register.registerForm.language.label')"
            :placeholder="$t('register.registerForm.language.placeholder')"
            :isHorizontal="true"
            :options="languageOptions"
            :isRequired="true"
        />
        <div class="text-center">
            <el-button
                class="btn btn-action bg-sign-up w-100 mt-2 mb-4"
                @click="onClickRegister"
            >
                {{ $t('register.registerForm.register') }}
            </el-button>
        </div>
        <div class="mb-2 text-center">
            <p
                class="text-sm font-weight-bold mb-2 text-secondary text-border d-inline z-index-2 bg-white px-3"
            >
                {{ $t('register.registerForm.or') }}
            </p>
        </div>
        <div class="text-center">
            <router-link class="action-link" to="/login">
                <el-button class="btn btn-action bg-sign-in w-100 my-4 mb-2">
                    {{ $t('register.registerForm.signIn') }}
                </el-button>
            </router-link>
        </div>
    </el-card>
</template>

<script lang="ts">
import { Options, setup, mixins } from 'vue-class-component';
import { setupRegisterForm } from '../../composition/registerForm';
import { UtilMixins } from '@/mixins/utilMixins';
import { DEFAULT_COUNTRY_CODE, RegisterModuleOptions } from '../../constants';
import {
    IBodyResponse,
    ICountry,
    IDropDownOption,
    IGetListResponse,
} from '@/common/interfaces';
import { parseLanguageSelectOptions } from '@/common/helpers';
import { commonService } from '@/common/services/common.service';
import { ElLoading } from 'element-plus';
import { AccessModules, LanguageOptions } from '@/common/constants';
import { Watch } from 'vue-property-decorator';

@Options({
    components: {},
})
export default class RegisterForm extends mixins(UtilMixins) {
    form = setup(() => setupRegisterForm());
    countryList: ICountry[] = [];

    get languageOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(LanguageOptions);
    }

    get registerModeOptions(): IDropDownOption[] {
        return parseLanguageSelectOptions(RegisterModuleOptions);
    }

    get isConstellationModuleSelected(): boolean {
        return this.form.module === AccessModules.SPACIALYTIC_CONSTELLATION;
    }

    get countryOptions(): IDropDownOption[] {
        return this.countryList.map((country) => ({
            label: country.name,
            value: country._id,
        }));
    }

    async created() {
        this.initData();
    }

    async getCountryList() {
        const response =
            (await commonService.getCountryList()) as unknown as IBodyResponse<
                IGetListResponse<ICountry>
            >;
        if (response.success) {
            this.countryList = response.data?.items || [];
        }
    }

    setDefaultLanguage() {
        this.countryList.forEach((country) => {
            if (country.code === DEFAULT_COUNTRY_CODE) {
                this.form.countryId = country._id;
                return;
            }
        });
    }

    async initData() {
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await this.getCountryList();
        this.setDefaultLanguage();
        loading.close();
    }

    async onClickRegister() {
        this.form.onSubmit();
    }

    @Watch('isConstellationModuleSelected')
    onChangeIsConstellationModuleSelected(value: boolean) {
        if (value) {
            this.form.resetForm({
                values: {
                    firstName: this.form.firstName as string,
                    lastName: this.form.lastName as string,
                    email: this.form.email as string,
                    countryId: this.form.countryId as string,
                    language: this.form.language as string,
                    module: this.form.module as string,
                },
                errors: {
                    ...this.form.errors,
                },
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.action-link {
    text-decoration: none;
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
.title {
    font-weight: 600;
    margin-bottom: 20px;
    font-size: 25px;
}
.bg-sign-in {
    background-image: linear-gradient(310deg, #2152ff 0%, #21d4fd 100%);
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
</style>
