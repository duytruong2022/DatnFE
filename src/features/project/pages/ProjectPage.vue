<template>
    <div class="action-buttons">
        <el-button
            class="create-button"
            type="primary"
            @click="onClickCreateProject"
            v-if="canCreateProject"
        >
            {{ $t('project.projectForm.createProject') }}</el-button
        >
        <el-button class="export-button" @click="onClickExport"
            ><el-icon class="el-icon--left"><DownloadIcon /></el-icon>
            {{ $t('project.projectForm.export') }}</el-button
        >
    </div>
    <div class="project-page">
        <div class="map-container">
            <ProjectMap class="map" />
            <div class="wrapper-absolute">
                <div class="position-relative">
                    <div class="wrapper-absolute" id="map-wrapper">
                        <ProjectForm />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { projectModule } from '../store';
import ProjectForm from '../components/ProjectForm.vue';
import { UtilMixins } from '@/mixins/utilMixins';
import ProjectMap from '../components/ProjectMap.vue';
import { ElLoading } from 'element-plus';
import { Download as DownloadIcon } from '@element-plus/icons-vue';
import { SecurityPermissions } from '@/features/security-profile/constants';
import { hasPermissionToAccessRouteInConstellation } from '@/common/helpers';
import { initQueryString } from '../constants';
@Options({
    components: {
        ProjectForm,
        ProjectMap,
        DownloadIcon,
    },
})
export default class ProjectPage extends mixins(UtilMixins) {
    created() {
        this.initData();
    }

    async initData() {
        projectModule.setProjectListQueryString({ ...initQueryString, limit: undefined });
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await Promise.all([projectModule.getProjectList(), projectModule.getUserList()]);
        loading.close();
    }

    get canCreateProject(): boolean {
        return hasPermissionToAccessRouteInConstellation([
            SecurityPermissions.CREATE_PROJECT,
        ]);
    }

    onClickCreateProject() {
        projectModule.setIsShowProjectForm(true);
    }

    onClickExport() {
        projectModule.triggerExportButton();
    }
}
</script>
<style lang="scss" scoped>
.map-container {
    position: relative;
    .create-button {
        position: absolute;
    }

    :deep(#map-wrapper > div) {
        width: 30%;
        left: 70% !important;
    }
}

.project-page {
    padding: 0 24px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.action-buttons {
    display: flex;
    justify-content: flex-end;
    margin: 12px 24px;
}
.wrapper-absolute {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
