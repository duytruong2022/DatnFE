<template>
    <div class="webviewer-container">
        <iframe
            :src="webviewer3dUrl"
            style="width: 100%; height: calc(100vh - 150px)"
        ></iframe>
    </div>
</template>

<script lang="ts">
import {
    generateFullIndex,
    serializeObjectToURL,
    structure3DViewerPermissions,
    transform3DViewerPermission,
} from '@/common/helpers';
import {
    ProfilePermissionPrefix,
    ProjectSecurityPermissions,
} from '@/features/3D-viewer-profile/constants';
import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import { Vue, Options } from 'vue-class-component';
import { WEBVIEWER3D_URL } from '@/features/3D-viewer/constant';
import { webViewer3DModule } from '@/features/3D-viewer/store';
import { projectPlanningModule } from '../store';
import { Watch } from 'vue-property-decorator';
import { projectModule } from '@/features/project/store';

@Options({ components: {} })
export default class Viewer3D extends Vue {
    viewer3dFullPermissions = structure3DViewerPermissions(
        Object.keys(ProjectSecurityPermissions).filter((p) =>
            p.startsWith(ProfilePermissionPrefix.WEBVIEWER3D),
        ),
    );

    get viewer3dPermissions() {
        return structure3DViewerPermissions(webViewer3DModule.viewer3dPermissions);
    }

    get webviewer3dUrl() {
        const permissions = cloneDeep(this.viewer3dFullPermissions);
        permissions.forEach((p) => {
            const currentTab = this.viewer3dFullPermissions.find(
                (tab) => tab.tab === p.tab,
            );
            p.groups.forEach((g) => {
                const currentGroup = currentTab?.groups.find(
                    (group) => group.group === g.group,
                );
                if (currentGroup && currentTab) {
                    g.withoutFunctions = difference(g.funcs, currentGroup?.funcs);
                } else {
                    g.withoutFunctions = g.funcs;
                }
            });
        });
        let rawPermissions = transform3DViewerPermission(generateFullIndex(permissions));
        if (projectPlanningModule.extendPermission?.length) {
            rawPermissions = rawPermissions.concat(
                projectPlanningModule.extendPermission,
            );
        }
        return `${WEBVIEWER3D_URL}/index.html?token=${
            this.sessionToken
        }&${serializeObjectToURL({
            permissions: rawPermissions,
        })}`;
    }

    get sessionToken() {
        return webViewer3DModule.sessionToken;
    }

    get openFilePath() {
        return webViewer3DModule.openFilePaths;
    }

    unmounted() {
        webViewer3DModule.setSessionToken(null);
    }

    @Watch('sessionToken')
    onChangeSessionToken(sessionToken: null | string) {
        if (projectPlanningModule.selectedFilePaths?.length && sessionToken) {
            webViewer3DModule.loadFile({
                filePaths: projectPlanningModule.selectedFilePaths,
                sessionToken,
                projectId: projectModule.selectedProjectId || '',
            });
        }
    }

    @Watch('openFilePath')
    async onChangeOpenFilePath(openFilePaths: null | string[]) {
        if (openFilePaths?.length && webViewer3DModule.sessionToken) {
            await webViewer3DModule.loadFile({
                filePaths: openFilePaths,
                sessionToken: webViewer3DModule.sessionToken,
                projectId: projectModule.selectedProjectId || '',
            });
            projectPlanningModule.setIsShowImportResourcePopup(true);
        }
    }
}
</script>
<style lang="scss" scoped>
.webviewer-container {
    position: relative;
    :deep(.tooltip) {
        position: absolute;
        bottom: 15px;
        right: 0;
    }
}
</style>
