<template>
    <el-dialog
        v-model="isShowLogServerDetailPopup"
        @open="handleOpen"
        @close="handleClose"
        :title="selectedFileName"
        width="60%"
        custom-class="log-server-file-details"
    >
        <div v-html="file"></div>
    </el-dialog>
</template>

<script lang="ts">
import axios from 'axios';
import { ElLoading } from 'element-plus';
import { Vue } from 'vue-class-component';
import { projectLogModule } from '../store';

export default class LogServerDetailPopup extends Vue {
    file = '';
    get isShowLogServerDetailPopup() {
        return projectLogModule.isShowLogServerDetailPopup;
    }

    get selectedFileName() {
        return projectLogModule.selectedLogServerFile?.name || '';
    }

    async handleOpen() {
        const loading = ElLoading.service({
            target: '.log-server-file-details',
        });
        await projectLogModule.getSelectedLogServerFilePath(
            projectLogModule.selectedLogServerFile?.path || '',
        );
        axios({
            url: projectLogModule.selectedLogServerFilePath,
            method: 'GET',
        }).then((response) => {
            this.file = (response.data as string).replaceAll('\n', '<br/>');
        });
        loading.close();
    }

    handleClose() {
        projectLogModule.setIsShowLogServerDetailPopup(false);
        this.file = '';
    }
}
</script>
