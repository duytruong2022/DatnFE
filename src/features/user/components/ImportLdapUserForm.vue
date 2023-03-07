<template>
    <BaseRightDrawer
        :title="$t('user.title.importLdapUser')"
        size="50%"
        v-model:value="isShowLdapUserForm"
        @onClosed="closePopup"
        customClass="ldap-config-form"
    >
        <template #body>
            <div class="ldap-config-collapse">
                <el-collapse model-value="1">
                    <el-collapse-item name="1">
                        <template #title>
                            <div class="collapse-item-ldap-title">
                                {{ $t('ldapConfigForm.title.ldapConfig') }}
                            </div>
                        </template>
                        <LdapConfigForm />
                    </el-collapse-item>
                </el-collapse>
            </div>

            <hr class="divider" />
            <div class="ldap-import-collapse">
                <el-collapse model-value="2">
                    <el-collapse-item name="2">
                        <template #title>
                            <div class="collapse-item-ldap-title">
                                {{ $t('ldapConfigForm.title.ldapUserList') }}
                            </div>
                        </template>
                        <UserLdapTable />
                    </el-collapse-item>
                </el-collapse>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options, setup } from 'vue-class-component';
import { initLdapQueryString, userModule } from '../store';
import { setupConfigLdapForm } from '../composition/configLdapForm';
import UserLdapTable from './UserLdapTable.vue';
import LdapConfigForm from './LdapConfigForm.vue';

@Options({ components: { UserLdapTable, LdapConfigForm } })
export default class LdapUserForm extends mixins(UtilMixins) {
    form = setup(() => setupConfigLdapForm());

    get isShowLdapUserForm(): boolean {
        return userModule.isShowLdapUserForm || false;
    }

    closePopup(): void {
        userModule.setIsShowLdapUserForm(false);
        (this.form.resetForm as () => void)();
        userModule.setUserLdapListQueryString({ ...initLdapQueryString });
    }
}
</script>

<style lang="scss" scoped>
.collapse-item-ldap-title {
    font-weight: 700;
    font-size: 16px;
    border: none;
}
.divider {
    opacity: 0.1;
    margin-bottom: 0px;
    margin-top: 0px;
}

.ldap-config-collapse,
.ldap-import-collapse {
    :deep(.el-collapse) {
        border: none;
    }
    :deep(.el-collapse-item__header) {
        border: none;
        margin-left: 4px;
    }
    :deep(.el-collapse-item__content) {
        padding-bottom: 16px;
    }
}

.ldap-config-collapse {
    :deep(.el-collapse-item__wrap) {
        border: none;
        padding: 0 7px 0 4px;
    }
}
.ldap-import-collapse {
    :deep(.el-collapse-item__wrap) {
        border: none;
        padding: 0 4px 0 4px;
    }
}

.ldap-config-form {
    :deep(.el-drawer__header) {
        margin-left: 4px;
    }
}
</style>
