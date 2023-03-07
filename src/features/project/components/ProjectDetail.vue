<template>
    <div class="project-card">
        <el-tag class="category">{{ getCategoryName(project.category) }}</el-tag>
        <el-button class="setting-button" @click="onClickOpenFieldSettingFormPopup">
            <ToolsIcon class="icon" />
        </el-button>
        <div
            class="thumbnail"
            :style="{
                backgroundImage: `url(${projectCategoryBackgroundUrl})`,
            }"
        />
        <div class="main">
            <h2 class="project-name">
                {{ project.name }}
            </h2>
            <span class="created-by"
                >{{ $t('projectList.card.by') }}:
                <span class="created-user"
                    >{{ project?.manager?.firstName }}
                    {{ project?.manager?.lastName }}</span
                >
            </span>
            <div class="details">
                <ul>
                    <li v-if="projectFieldSetting.category">
                        <span class="label">{{ $t('project.dashboard.category') }}:</span>
                        {{ getCategoryName(project.category) }}
                    </li>
                    <div
                        class="description-container"
                        v-if="projectFieldSetting.description && isCanEditProject"
                    >
                        <BaseInputTextarea
                            v-model:value="form.description"
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            :label="$t('project.projectForm.description.label')"
                            :placeholder="
                                $t('project.projectForm.description.placeholder')
                            "
                            name="description"
                            :error="translateYupError(form.errors.description)"
                        />
                        <el-button type="primary" @click="form.onSubmit">
                            {{ $t('project.projectForm.save') }}
                        </el-button>
                    </div>
                    <li v-else-if="projectFieldSetting.description">
                        <span class="label"
                            >{{ $t('project.dashboard.description') }}:</span
                        >
                        {{ project.description }}
                    </li>
                    <li v-if="projectFieldSetting.postalCode">
                        <span class="label"
                            >{{ $t('project.dashboard.postalCode') }}:</span
                        >
                        {{ project.postalCode }}
                    </li>
                    <li v-if="projectFieldSetting.coordinates">
                        <span class="label">{{ $t('project.dashboard.address') }}:</span>
                        {{ getDisplayAddress(project.coordinatesDetails) }}
                    </li>
                    <li v-if="projectFieldSetting.coordinates">
                        <span class="label"
                            >{{ $t('project.dashboard.coordinates') }}:</span
                        >
                        {{ project.latitude }},
                        {{ project.longitude }}
                    </li>
                </ul>
                <p v-if="projectFieldSetting.projectAdmin">
                    <span class="admin">{{ $t('projectList.card.projectAdmin') }}</span
                    >:
                    {{ project?.admin?.firstName }}
                    {{ project?.admin?.lastName }}
                </p>
            </div>
        </div>
        <div class="footer" v-if="projectFieldSetting.time">
            <span
                >{{ $t('projectList.card.createdAt') }}:
                {{ formatDate(project.createdAt || '') }}</span
            >
            <span
                >{{ $t('projectList.card.updatedAt') }}:
                {{ formatDate(project.updatedAt || '') }}
            </span>
        </div>
    </div>
    <FieldSettingFormPopup />
</template>
<script lang="ts">
import { Options, mixins, setup } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import FilterForm from '../components/FilterForm.vue';
import { IProject, IProjectSettingField } from '../interfaces';
import { ProjectMixins } from '../mixin';
import { Tools as ToolsIcon } from '@element-plus/icons-vue';
import FieldSettingFormPopup from './FieldSettingFormPopup.vue';
import { projectModule } from '../store';
import { setupProjectDetailForm } from '../composition/projectDetailForm';
import localStorageAuthService from '@/common/authStorage';
import { isAdmin } from '@/common/helpers';
import { AccessModules } from '@/common/constants';
@Options({
    components: { FilterForm, ToolsIcon, FieldSettingFormPopup },
})
export default class ProjectDetail extends mixins(ProjectMixins) {
    form = setup(() => setupProjectDetailForm());
    @Prop({ required: true }) readonly project!: IProject;

    get projectCategoryBackgroundUrl(): string {
        return require(`@/assets/images/project-thumbnails/${this.project.category}.jpeg`);
    }

    get projectFieldSetting(): IProjectSettingField {
        return projectModule.userProjectFieldSetting.settings;
    }

    get isCanEditProject(): boolean {
        return (
            this.project?.adminId === localStorageAuthService.getUser()?._id ||
            isAdmin(AccessModules.SPACIALYTIC_CONSTELLATION)
        );
    }

    onClickOpenFieldSettingFormPopup() {
        projectModule.setIsShowFieldSettingFormPopup(true);
    }

    @Watch('project', { deep: true })
    onChangeProject(project: IProject) {
        this.form.description = project.description;
    }
}
</script>
<style lang="scss" scoped>
.project-detail {
    color: #344767;
    h2 {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.label {
    font-weight: 600;
    color: #344767;
}

.project-card {
    background-color: white;
    border-radius: 15px;

    margin-bottom: 24px;
    position: relative;

    .setting-button {
        position: absolute;
        top: 30px;
        right: 5px;
        .icon {
            width: 24px;
        }
    }

    .category {
        position: absolute;
        top: 3px;
        right: 3px;
    }

    .thumbnail {
        width: 100%;
        height: 150px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center center;
        border-radius: 4px 4px 0 0;
    }

    .main {
        padding: 20px 20px;
        .project-name {
            font-weight: bold;
            color: #344767;
            margin-bottom: 5px !important;

            display: inline;
            -webkit-line-clamp: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            word-wrap: break-word;
        }
        .admin {
            font-weight: 600;
        }
        .created-by {
            font-size: 13px;
            .created-user {
                font-weight: 600;
            }
        }
    }
    .footer {
        padding: 5px 20px;
        font-size: 13px;
        font-weight: 600;
        border-top: 1px solid rgba(0, 0, 0, 0.12);

        span {
            display: block;
        }
    }
}

.description-container {
    :deep(.d-flex) {
        width: 90% !important;
    }
    display: flex;
    align-items: center;
    gap: 5px;
}
</style>
