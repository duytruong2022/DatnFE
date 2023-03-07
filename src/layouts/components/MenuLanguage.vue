<template>
    <el-dropdown trigger="click" @command="changeLanguage">
        <a class="nav-link" data-toggle="dropdown" href="#" role="button">
            <div class="language-box" v-if="lang === 'en'">
                <img src="@/assets/icons/flags/en.png" class="language-icon" alt="en" />
                <span class="language-text">
                    {{ $t('app.menuLanguage.en') }}
                </span>
            </div>
            <div class="language-box" v-else>
                <img src="@/assets/icons/flags/fr.png" class="language-icon" alt="fr" />
                <span class="language-text">
                    {{ $t('app.menuLanguage.fr') }}
                </span>
            </div>
        </a>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item @click="setLocale('en')">
                    <img
                        style="margin-right: 10px"
                        src="@/assets/icons/flags/en.png"
                        alt=""
                        height="16"
                        class="language-icon-sm"
                    />
                    {{ $t('app.menuLanguage.en') }}
                </el-dropdown-item>
                <el-dropdown-item @click="setLocale('fr')">
                    <img
                        style="margin-right: 10px"
                        src="@/assets/icons/flags/fr.png"
                        alt=""
                        height="16"
                        class="language-icon-sm"
                    />
                    {{ $t('app.menuLanguage.fr') }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import i18n from '@/plugins/vue-i18n';
import localStorageAuthService from '@/common/authStorage';
import { SUPPORT_LANGUAGE } from '@/common/constants';
import { appModule } from '@/plugins/vuex/appModule';

@Options({})
export default class MenuLanguage extends Vue {
    lang = localStorageAuthService.getLanguage();
    setLocale(lang: SUPPORT_LANGUAGE): void {
        this.lang = lang;
        localStorageAuthService.setLanguage(lang);
        // set language to i18n
        i18n.global.locale = lang;
        appModule.setLanguage(lang);
    }
}
</script>

<style lang="scss" scoped>
.language-box {
    display: flex;
    align-items: center;
    .language-text {
        line-height: initial;
        color: #344767;
        font-weight: 600;
        margin-left: 5px;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        @media only screen and (max-width: 991.98px) {
            display: none;
        }
    }
}
.language-icon {
    width: 25px;
}
.nav-link {
    display: flex;
    align-items: center;
    &:hover {
        background: unset;
    }
}

.el-dropdown-menu {
    padding: 0px !important;
}
.language-icon-sm {
    width: 16px;
    margin-right: 5px;
}
</style>
