<template>
    <div class="content-wrapper filter-wrapper">
        <FilterForm />
    </div>
    <div class="content-wrapper">
        <UserTablePlatform
            v-if="selectedAccessModule === accessModules.SPACIALYTIC_PLATFORM"
        />
        <UserTableConstellation
            v-if="selectedAccessModule === accessModules.SPACIALYTIC_CONSTELLATION"
        />
        <UserTable3DWebview
            v-if="selectedAccessModule === accessModules.SPACIALYTIC_3DWEBVIEWER"
        />
    </div>

    <UserForm />
    <SetPasswordForm />
    <ContactForm />
    <ImportUserForm />
    <ImportUserResultForm />
    <LdapUserForm />
    <AssignProjectPopup />
</template>

<script lang="ts">
import { Options, mixins } from 'vue-class-component';
import UserTablePlatform from '../components/UserTablePlatform.vue';
import UserTableConstellation from '../components/UserTableConstellation.vue';
import UserTable3DWebview from '../components/UserTable3DWebview.vue';
import FilterForm from '../components/FilterForm.vue';
import UserForm from '../components/UserForm.vue';
import ContactForm from '../components/ContactForm.vue';
import ImportUserForm from '../components/ImportUserForm.vue';
import ImportUserResultForm from '../components/ImportUserResultForm.vue';
import { userModule } from '../store';
import { UtilMixins } from '@/mixins/utilMixins';
import { authModule } from '@/features/auth/store';
import { AccessModules } from '@/common/constants';
import SetPasswordForm from '../components/forms/SetPasswordForm.vue';
import LdapUserForm from '../components/ImportLdapUserForm.vue';
import AssignProjectPopup from '../components/assign-project/AssignProjectPopup.vue';

@Options({
    components: {
        UserTable3DWebview,
        UserTablePlatform,
        UserTableConstellation,
        FilterForm,
        UserForm,
        SetPasswordForm,
        ContactForm,
        ImportUserForm,
        ImportUserResultForm,
        LdapUserForm,
        AssignProjectPopup,
    },
})
export default class UserManagementPage extends mixins(UtilMixins) {
    get selectedAccessModule(): AccessModules | null {
        return authModule.selectedAccessModule;
    }

    created() {
        userModule.getCountryList();
        userModule.getGroupList();
        userModule.getSecurityProfileList();
        userModule.getProjectProfileList();
        userModule.getViewer3dProfileList();
        userModule.getProjectGroupList();
        userModule.getCompanyList();
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
