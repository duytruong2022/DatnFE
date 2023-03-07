<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm />
    </div>
    <div class="content-wrapper">
        <GroupTable />
    </div>
    <GroupForm />
    <ImportGroupForm />
    <ImportGroupResultForm />
    <AssignUserPopup />
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component';
import GroupTable from '../components/ProjectGroupTable.vue';
import FilterForm from '../components/FilterForm.vue';
import GroupForm from '../components/ProjectGroupForm.vue';
import { projectGroupModule, initQueryString } from '../store';
import ImportGroupForm from '../components/ImportGroupForm.vue';
import ImportGroupResultForm from '../components/ImportGroupResultForm.vue';
import AssignUserPopup from '../components/AssignUserPopup.vue';

@Options({
    components: {
        GroupTable,
        FilterForm,
        GroupForm,
        ImportGroupForm,
        ImportGroupResultForm,
        AssignUserPopup,
    },
})
export default class ProjectGroupListPage extends Vue {
    created() {
        projectGroupModule.setGroupListQueryString(initQueryString);
        projectGroupModule.getGroupList();
    }
}
</script>
<style lang="scss" scoped>
.content-wrapper {
    margin: 20px 25px;
    padding: 30px 25px;
    background-color: white;
    border-radius: 15px;
}

.filter-wrapper {
    margin-top: 0;
}
</style>
