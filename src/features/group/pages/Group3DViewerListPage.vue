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
import GroupTable from '../components/group-list/GroupTable.vue';
import FilterForm from '../components/group-list/FilterForm.vue';
import GroupForm from '../components/group-list/GroupForm.vue';
import { groupModule, initGroupQueryString } from '../store';
import ImportGroupForm from '../components/group-list/ImportGroupForm.vue';
import ImportGroupResultForm from '../components/group-list/ImportGroupResultForm.vue';
import AssignUserPopup from '../components/assign-user/AssignUserPopup.vue';

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
export default class Group3DViewerListPage extends Vue {
    created() {
        groupModule.setGroupListQueryString(initGroupQueryString);
        groupModule.getGroupList();
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
