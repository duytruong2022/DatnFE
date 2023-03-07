<template>
    <div class="pagination-container">
        <el-pagination
            :hide-on-single-page="false"
            layout="prev, pager, next"
            :page-size="DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE"
            :total="totalProjects"
            v-model:currentPage="currentPage"
            popper-class="pagination-select"
            v-if="totalProjects > DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE"
            @current-change="handlePaginate"
        >
        </el-pagination>
    </div>
    <div class="row" v-if="totalProjects > 0">
        <div class="col-md-4" v-for="project in projectList" :key="project._id">
            <ProjectCard :projectDetail="project" />
        </div>
    </div>
    <EmptyData v-else />
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import { IProject } from '@/features/project/interfaces';
import { projectModule } from '@/features/project/store';
import { ProjectMixins } from '../mixin';
import { ElLoading } from 'element-plus';
import ProjectCard from './ProjectCard.vue';
import EmptyData from '../../../components/base/EmptyData.vue';
import { DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE } from '../constants';
@Options({
    components: { ProjectCard, EmptyData },
})
export default class ProjectList extends mixins(ProjectMixins) {
    DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE =
        DEFAULT_LIMIT_PER_PAGE_FOR_PROJECT_LIST_PAGE;
    selectedPage = 1;
    get projectList(): IProject[] {
        return projectModule.projectList;
    }

    get totalProjects(): number {
        return projectModule.totalProjects;
    }

    get currentPage(): number {
        return projectModule.projectListQueryString.page || NaN;
    }

    set currentPage(page: number) {
        projectModule.setProjectListQueryString({
            page,
        });
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        projectModule.setProjectListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.main-wrapper',
        });
        await projectModule.getProjectList();
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
.project-table-wrapper {
    background-color: #fff;
    border-radius: 1rem;
    padding: 30px 0px;
}
.icon {
    width: 16px;
}
.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
}
</style>
