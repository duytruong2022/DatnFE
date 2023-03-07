<template>
    <div class="row">
        <div class="col-md-3">
            <PbsTree />
        </div>
        <div class="col-md-9">
            <PbsGroupDetail />
        </div>
    </div>
    <PbsGroupForm />
    <AddUserForm />
    <AddGroupForm />
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import PbsTree from '../components/PbsTree.vue';
import PbsGroupForm from '../components/PbsGroupForm.vue';
import PbsGroupDetail from '../components/PbsGroupDetail.vue';
import AddUserForm from '../components/AddUserForm.vue';
import AddGroupForm from '../components/AddGroupForm.vue';
import { UtilMixins } from '@/mixins/utilMixins';
import { projectModule } from '@/features/project/store';
import { pbsGroupModule } from '../store';
@Options({
    components: { PbsTree, PbsGroupForm, PbsGroupDetail, AddUserForm, AddGroupForm },
})
export default class PbsGroupPage extends mixins(UtilMixins) {
    get selectedProjectId(): string {
        return projectModule.selectedProjectId || '';
    }

    created() {
        pbsGroupModule.setPbsGroupQueryString({ projectId: this.selectedProjectId });
        pbsGroupModule.getPbsTree();
        pbsGroupModule.getUserList();
        pbsGroupModule.getProjectGroupList();
        pbsGroupModule.setSelectedPbsGroup(null);
    }
}
</script>
<style lang="scss" scoped></style>
