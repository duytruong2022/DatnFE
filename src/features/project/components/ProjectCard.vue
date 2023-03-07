<template>
    <div class="project-card" @click="onSelectProject">
        <el-tag class="category">{{ getCategoryName(projectDetail.category) }}</el-tag>
        <div
            class="thumbnail"
            :style="{
                backgroundImage: `url(${projectCategoryBackgroundUrl})`,
            }"
        />
        <div class="main">
            <h5 class="project-name">
                {{ projectDetail.name }}
            </h5>
            <span class="created-by"
                >{{ $t('projectList.card.by') }}:
                <span class="created-user"
                    >{{ projectDetail?.manager?.firstName }}
                    {{ projectDetail?.manager?.lastName }}</span
                >
            </span>
            <div class="details">
                <p class="description" v-if="projectDetail.description.length > 0">
                    {{ projectDetail.description }}
                </p>
                <p class="place">
                    {{ getDisplayAddress(projectDetail.coordinatesDetails) }}
                </p>
                <p>
                    <span class="admin">{{ $t('projectList.card.projectAdmin') }}</span
                    >:
                    {{ projectDetail?.admin?.firstName }}
                    {{ projectDetail?.admin?.lastName }}
                </p>
            </div>
        </div>
        <div class="footer">
            <span
                >{{ $t('projectList.card.createdAt') }}:
                {{ formatDate(projectDetail.createdAt || '') }}</span
            >
            <span
                >{{ $t('projectList.card.updatedAt') }}:
                {{ formatDate(projectDetail.updatedAt || '') }}
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import { IProject } from '../interfaces';
import { ProjectMixins } from '../mixin';
import { Prop } from 'vue-property-decorator';
import { projectModule } from '../store';
import localStorageAuthService from '@/common/authStorage';
import { ElLoading } from 'element-plus';
import { IBodyResponse } from '@/common/interfaces';
import { IProjectSecurityPermissions } from '@/features/auth/interfaces';
import { authService } from '@/features/auth/services/api.services';
import { showErrorNotificationFunction } from '@/common/helpers';
@Options({})
export default class ProjectCard extends mixins(ProjectMixins) {
    @Prop({ default: true }) readonly projectDetail!: IProject;

    get projectCategoryBackgroundUrl(): string {
        return require(`@/assets/images/project-thumbnails/${this.projectDetail.category}.jpeg`);
    }

    async onSelectProject() {
        const loading = ElLoading.service({
            target: '.content',
        });
        const response = (await authService.getProjectSecurityPermissions(
            this.projectDetail._id as string,
        )) as IBodyResponse<IProjectSecurityPermissions>;
        if (response.success) {
            localStorageAuthService.setProjectSecurityPermissions(
                response.data.projectSecurityPermissions || [],
            );
            localStorageAuthService.setPbsGroupPermissions(
                response.data.pbsGroupPermissions || [],
            );
            localStorageAuthService.setProjectAdminId(response.data.adminId || '');
            projectModule.setSelectedProjectId(this.projectDetail._id || '');
            localStorageAuthService.setSelectedProjectId(
                this.projectDetail._id as string,
            );
            loading.close();
        } else {
            showErrorNotificationFunction(response.message as string);
            loading.close();
        }
    }
}
</script>
<style lang="scss" scoped>
.project-card {
    background-color: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    margin-bottom: 24px;
    position: relative;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 4px;
    &:hover {
        cursor: pointer;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
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
        .details {
            height: 140px;
        }
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
        .description {
            display: inline;
            -webkit-line-clamp: 2;
            text-overflow: ellipsis;
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            word-wrap: break-word;
        }
        .place {
            display: inline;
            -webkit-line-clamp: 2;
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
</style>
