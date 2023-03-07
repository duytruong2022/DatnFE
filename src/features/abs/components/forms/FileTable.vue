<template>
    <div class="file-table">
        <BaseTableLayout
            :data="folderFiles"
            :totalItems="folderFiles.length"
            :isHighlightCurrentRow="true"
            :isShowPagination="false"
        >
            <template #table-columns>
                <el-table-column
                    :label="$t('abs.table.header.name')"
                    width="250"
                    align="left"
                >
                    <template #default="scope">
                        <DocumentIcon class="icon" /> {{ scope.row?.name }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.type')"
                    align="center"
                    width="150"
                >
                    <template #default="scope">
                        {{ getFileType(scope.row?.name) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.createdBy')"
                    width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ scope.row?.user?.firstName }}
                        {{ scope.row?.user?.lastName }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.modifiedDate')"
                    width="220"
                    align="center"
                >
                    <template #default="scope">
                        {{ formatModifiedDate(scope.row?.modifyTime) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="$t('abs.table.header.size')"
                    min-width="150"
                    align="center"
                >
                    <template #default="scope">
                        {{ getFileSize(scope.row.size) }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('abs.table.header.pbs')" min-width="250">
                    <template #default="scope">
                        <div class="assigned-pbs">
                            <ul
                                v-for="assignedPBS in scope.row.assignedPbs"
                                :key="assignedPBS"
                                class="profiles"
                            >
                                <li>
                                    {{ assignedPBS?.name }}
                                </li>
                            </ul>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Action" min-width="150" align="center">
                    <template #default="scope">
                        <el-button
                            @click="onClickAssign(scope.row._id)"
                            v-if="canAssign(scope.row._id)"
                            >Assign</el-button
                        >
                        <el-button
                            @click="onClickUnassign(scope.row._id)"
                            v-if="canUnassign(scope.row._id)"
                            >Unassign</el-button
                        >
                    </template>
                </el-table-column>
            </template>
        </BaseTableLayout>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { absModule } from '../../store';

import {
    Document as DocumentIcon,
    Setting as SettingIcon,
    View as ViewIcon,
} from '@element-plus/icons-vue';
import { AbsFileMixin } from '../../mixin';
import { IFTPFile } from '@/common/interfaces';
import { ABSUploadedFileExtensions } from '../../constants';
import AssignToPBSForm from '../forms/AssignToPBSForm.vue';
import { ElLoading } from 'element-plus';
import { projectFileService } from '../../services/project-file.service';
import { projectModule } from '@/features/project/store';

@Options({
    components: {
        DocumentIcon,
        SettingIcon,
        ViewIcon,
        AssignToPBSForm,
    },
})
export default class FileTable extends mixins(AbsFileMixin) {
    ABSUploadedFileExtensions = ABSUploadedFileExtensions;
    selectedFilePaths: string[] = [];
    planningNameExtension = ABSUploadedFileExtensions.PLANNING;

    get folderFiles(): IFTPFile[] {
        return absModule.folderFiles;
    }

    get isShowFileAssignCheckBox(): boolean {
        return absModule.isShowFileAssignCheckBox;
    }

    get selectedFileIds(): string[] {
        return absModule.selectedFileIds;
    }

    set selectedFileIds(selectedFileIds: string[]) {
        absModule.setSelectedFileIds(selectedFileIds);
    }

    get isAssigningTo4DFile(): boolean {
        return absModule.isAssigningTo4DFile;
    }

    get isAssigningToPlanningFile(): boolean {
        return absModule.isAssigningToPlanningFile;
    }

    get isAssigningTo4DBoxFile(): boolean {
        return absModule.isAssigningTo4DBoxFile;
    }

    get selectedFile(): IFTPFile {
        return absModule.selectedFile;
    }

    get selectedPath() {
        return absModule.selectedFilePath;
    }

    canAssign(fileId: string): boolean {
        if (fileId) {
            if (this.isAssigningTo4DFile) {
                return !this.selectedFile.assigned4DFileIds?.includes(fileId);
            } else if (this.isAssigningToPlanningFile) {
                return !this.selectedFile.assignedPlanningFileIds?.includes(fileId);
            }
        }
        return false;
    }

    canUnassign(fileId: string): boolean {
        if (fileId) {
            if (this.isAssigningTo4DFile) {
                return !!this.selectedFile.assigned4DFileIds?.includes(fileId);
            } else if (this.isAssigningToPlanningFile) {
                return !!this.selectedFile.assignedPlanningFileIds?.includes(fileId);
            }
        }
        return false;
    }

    async onClickAssign(fileId: string) {
        const loading = ElLoading.service({ target: '.select-abs-file-popup' });
        if (this.isAssigningTo4DFile) {
            await projectFileService.assignTo4DFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        } else if (this.isAssigningToPlanningFile) {
            await projectFileService.assignToPlanningFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        } else if (this.isAssigningTo4DBoxFile) {
            await projectFileService.assignTo4DBoxFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        }
        const [updatedFileResponse] = await Promise.all([
            projectFileService.getDetail(absModule.selectedFileId),
            absModule.getFolderFiles({
                path: absModule.currentPath,
                projectId: projectModule.selectedProjectId || '',
            }),
        ]);
        absModule.setSelectedFile(updatedFileResponse.data);
        loading.close();
    }

    async onClickUnassign(fileId: string) {
        const loading = ElLoading.service({ target: '.select-abs-file-popup' });
        if (this.isAssigningTo4DFile) {
            await projectFileService.unassignTo4DFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        } else if (this.isAssigningToPlanningFile) {
            await projectFileService.unassignToPlanningFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        } else if (this.isAssigningTo4DBoxFile) {
            await projectFileService.unassignTo4DBoxFile(
                absModule.selectedFileId,
                fileId,
                this.selectedPath,
            );
        }
        const [updatedFileResponse] = await Promise.all([
            projectFileService.getDetail(absModule.selectedFileId),
            absModule.getFolderFiles({
                path: absModule.currentPath,
                projectId: projectModule.selectedProjectId || '',
            }),
        ]);
        absModule.setSelectedFile(updatedFileResponse.data);
        loading.close();
    }
}
</script>

<style scoped lang="scss">
.file-table {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 0px;
}
.icon {
    width: 18px;
}
.assigned-pbs {
    max-height: 125px;
    overflow: auto;
}
</style>
