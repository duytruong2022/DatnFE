<template>
    <div class="wrapper">
        <FilterForm />
    </div>
    <div class="wrapper2">
        <ProjectList />
    </div>
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectModule } from '@/features/project/store';
import FilterForm from '../components/FilterForm.vue';
import ProjectList from '../components/ProjectList.vue';
import { initQueryString } from '../constants';
import { ElLoading } from 'element-plus';
@Options({
    components: { ProjectList, FilterForm },
})
export default class ProjectListPage extends mixins(UtilMixins) {
    async created() {
        this.initData();
    }
    async initData() {
        projectModule.setProjectListQueryString({ ...initQueryString });
        const loading = ElLoading.service({ target: '.page-wrapper' });
        await Promise.all([projectModule.getProjectList(), projectModule.getUserList()]);
        loading.close();
    }
}
</script>
<style lang="scss" scoped>
.wrapper {
    margin: 0px 24px 24px 24px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}
.wrapper2 {
    margin: 0px 24px 24px 24px;
    border-radius: 15px;
}
</style>
