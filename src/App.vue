<template>
    <ElConfigProvider :locale="locale">
        <router-view />
    </ElConfigProvider>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Socket from './plugins/socket/socket';
import { ElConfigProvider } from 'element-plus';
import { DEFAULT_LANGUAGE, SUPPORT_LANGUAGE } from './common/constants';
import localStorageAuthService from './common/authStorage';
import en from '@/plugins/element-ui/locale/en';
import fr from '@/plugins/element-ui/locale/fr';
import { IExportCSVData } from './common/interfaces';
import { downloadFile, showSuccessNotificationFunction } from './common/helpers';
import i18n from './plugins/vue-i18n';

@Options({
    components: {
        ElConfigProvider,
    },
})
export default class App extends Vue {
    mounted(): void {
        this.connectSocket();
        this.subscribeExportCSV();
    }

    connectSocket(): void {
        const user = localStorageAuthService.getUser();
        Socket.connect({
            senderId: user?._id || '',
            senderEmail: user?.email || '',
        });
    }

    subscribeExportCSV() {
        // subscribe new csv is exported from socket
        Socket.subscribeReceiveSupportRequestExportCSVData(
            async (result: IExportCSVData) => {
                // show flash message & auto download file
                showSuccessNotificationFunction(
                    i18n.global.t('supportRequest.exportCSV.download'),
                    '',
                    'bottom-left',
                );
                await downloadFile(result.fileName, result.filePath);
            },
        );
    }

    get locale(): Record<string, unknown> {
        const i18nLocale = localStorageAuthService.getLanguage() || DEFAULT_LANGUAGE;
        if (i18nLocale === SUPPORT_LANGUAGE.EN) {
            return en;
        }
        return fr;
    }

    beforeDestroyed(): void {
        Socket.disconnect();
    }
}
</script>
