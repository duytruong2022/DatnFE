<template>
    <div class="wrap-content"></div>
</template>

<script lang="ts">
import localStorageAuthService, { sessionStorageAuthService } from '@/common/authStorage';
import { PageName } from '@/common/constants';
import { checkHasActiveModule, showErrorNotificationFunction } from '@/common/helpers';
import router from '@/plugins/vue-router';
import { ElLoading } from 'element-plus';
import { Options, Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { authService } from '../services/api.services';
@Options({})
export default class ActiveUserPage extends Vue {
    @Prop({ default: '' }) readonly token!: string;
    async created() {
        const loading = ElLoading.service({ target: 'content-wrapper' });
        const response = await authService.active({
            token: this.token,
        });
        loading.close();
        if (response.success) {
            if (
                checkHasActiveModule(
                    response.data?.profile.accessModules,
                    response.data?.profile?.status,
                )
            ) {
                localStorageAuthService.setUser(response.data?.profile);
                sessionStorageAuthService.setAccessToken(
                    response.data?.accessToken.token,
                );
                sessionStorageAuthService.setRefreshToken(
                    response.data?.refreshToken.token,
                );
                sessionStorageAuthService.setAccessTokenExpiredAt(
                    response.data?.accessToken.expiresIn,
                );
                sessionStorageAuthService.setRefreshTokenExpiredAt(
                    response.data?.refreshToken.expiresIn,
                );
                router.push({
                    name: PageName.PROFILE_VIEW_PAGE,
                });
                return;
            } else {
                showErrorNotificationFunction(this.$t('common.error.accessModuleError'));
            }
        } else {
            showErrorNotificationFunction(response.message as string);
        }
        router.replace({
            name: PageName.LOGIN_PAGE,
        });
    }
}
</script>
<style lang="scss" scoped></style>
