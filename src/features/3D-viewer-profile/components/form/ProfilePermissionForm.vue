<template>
    <div class="mb-5">
        <div class="custom-tree-node-container">
            <div class="block">
                <el-tree
                    :data="permissionTree"
                    show-checkbox
                    node-key="name"
                    default-expand-all
                    :expand-on-click-node="false"
                    check-on-click-node
                    @check="onCheckNode"
                    ref="refPermissionTree"
                >
                    <template #default="{ data }">
                        {{
                            data.name ? $t(`3dViewerProfile.permission.${data.name}`) : ''
                        }}
                    </template>
                </el-tree>
            </div>
        </div>
        <div class="validation-error text-start d-block">{{ error }}&nbsp;</div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import forEach from 'lodash/forEach';
import intersection from 'lodash/intersection';
import { mixins } from 'vue-class-component';
import { Model, Prop, Watch } from 'vue-property-decorator';
import {
    ProfilePermissionCategories,
    ProjectSecurityPermissions,
    ProfilePermissionTree,
} from '../../constants';
import { IPermissionTree, IProfile, ITreeStatus } from '../../interfaces';
import { profileModule } from '../../store';

interface ITreeRefs {
    setChecked: (
        item: ProjectSecurityPermissions | ProfilePermissionCategories,
        checked: boolean,
        deep: boolean,
    ) => void;
}

export default class ProfilePermissionForm extends mixins(UtilMixins) {
    @Model('value', {
        default: [],
    })
    readonly selectedPermisssions!: ProjectSecurityPermissions[];
    @Prop({
        type: String,
    })
    readonly error!: string;

    get permissionTree() {
        return ProfilePermissionTree;
    }

    onCheckNode(node: IPermissionTree, status: ITreeStatus): void {
        const selectedPermissions = status.checkedNodes.map(
            (permission) => permission.name as string,
        );
        this.$emit('onCheckNode', selectedPermissions);
    }

    filterPermissions(fullPermissions: any[], denyPermissions: any[]) {
        return fullPermissions.filter((element) => {
            if (denyPermissions.some((e) => e === element.name)) {
                return false;
            } else {
                if (element?.children) {
                    element.children = this.filterPermissions(
                        element.children,
                        denyPermissions,
                    );
                }
                return true;
            }
        });
    }

    get selectedProfile() {
        return profileModule.selectedProfile;
    }

    @Watch('selectedProfile')
    onChangeSelectedProfile(value: IProfile | null) {
        (this.$refs.refPermissionTree as ITreeRefs).setChecked(
            ProfilePermissionCategories.ALL,
            false,
            true,
        );
        if (value) {
            value.permissions.forEach((permission) => {
                (this.$refs.refPermissionTree as ITreeRefs).setChecked(
                    permission,
                    true,
                    false,
                );
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.custom-tree-node-container {
    overflow: auto;
}
</style>
