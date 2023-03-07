<template>
    <div class="profile-list">
        <div class="title-container">
            <div class="title">{{ $t('3dViewerProfile.profileForm.list.title') }}</div>
            <el-tooltip
                effect="dark"
                :content="$t('3dViewerProfile.profileForm.button.create')"
                placement="top"
            >
                <el-button size="mini" @click.stop="onCreate">
                    <CirclePlusFilledIcon class="action-icon" />
                </el-button>
            </el-tooltip>
        </div>
        <hr class="horizontal-line" />
        <BaseInputText
            v-model:value="keyword"
            @onEnter="onEnter"
            :placeholder="$t('3dViewerProfile.profileForm.list.searchBox.placeholder')"
        />

        <div class="mt-1 item-list">
            <div v-if="profileList.length > 0">
                <ProfileItem
                    @click-item="handleClickItem"
                    @click-delete="handleDelete"
                    :item="item"
                    v-for="item in profileList"
                    :key="item._id"
                />
            </div>
            <BaseEmptyData v-else />
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { CirclePlusFilled as CirclePlusFilledIcon } from '@element-plus/icons-vue';
import { profileModule } from '../../store';
import ProfileItem from './ProfileItem.vue';
import { ElLoading } from 'element-plus';
import {
    projectProfileService,
    viewer3dProfileService,
} from '../../services/api.service';
import {
    showConfirmPopUpFunction,
    showErrorNotificationFunction,
    showSuccessNotificationFunction,
} from '@/common/helpers';
import { authModule } from '@/features/auth/store';
import { AccessModules } from '@/common/constants';
import { initProjectProfile } from '../../constants';
import { projectModule } from '@/features/project/store';

@Options({
    components: {
        CirclePlusFilledIcon,
        ProfileItem,
    },
})
export default class ProfileList extends mixins(UtilMixins) {
    get profileList() {
        return profileModule.profileList;
    }

    get keyword(): string {
        return profileModule.profileListQueryString.keyword as string;
    }

    set keyword(value: string) {
        profileModule.setProfileListQueryString({
            ...profileModule.profileListQueryString,
            keyword: value,
        });
        if (!value) {
            this.onEnter();
        }
    }

    async handleClickItem(_id: string) {
        const loading = ElLoading.service({});
        let response;
        if (authModule.selectedAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION) {
            response = await projectProfileService.getProfileById(_id);
        } else {
            response = await viewer3dProfileService.getProfileById(_id);
        }

        if (response.success) {
            profileModule.setSelectedProfile(response.data);
        } else if (!response.isRequestError) {
            showErrorNotificationFunction(response.message);
        }
        loading.close();
    }

    async handleDelete(_id: string) {
        const confirm = await showConfirmPopUpFunction(
            this.$t('3dViewerProfile.profileForm.form.confirm.message'),
            this.$t('3dViewerProfile.profileForm.form.confirm.title'),
        );
        if (confirm) {
            let service;
            if (
                authModule.selectedAccessModule ===
                AccessModules.SPACIALYTIC_CONSTELLATION
            ) {
                service = projectProfileService;
            } else {
                service = viewer3dProfileService;
            }
            const loading = ElLoading.service({});
            const deleteRes = await service.deleteProfile(_id);
            if (deleteRes.success) {
                profileModule.setSelectedProfile(null);
                showSuccessNotificationFunction(
                    this.$t('3dViewerProfile.profileForm.delete.success'),
                );
            } else if (!deleteRes.isRequestError) {
                showErrorNotificationFunction(deleteRes.message);
            }
            const response = await profileModule.getProfileList();
            if (!response.isRequestError && !response.success) {
                showErrorNotificationFunction(response.message);
            } else {
                if (this.profileList.length) {
                    this.handleClickItem(this.profileList[0]._id || '');
                }
            }
            loading.close();
        }
    }

    onCreate() {
        profileModule.setSelectedProfile({
            ...initProjectProfile,
            projectId: projectModule.selectedProjectId,
        });
    }

    async onEnter() {
        const loading = ElLoading.service({});
        const trimedKeyword = profileModule.profileListQueryString.keyword?.trim();
        profileModule.setProfileListQueryString({
            ...profileModule.profileListQueryString,
            keyword: trimedKeyword,
        });
        await profileModule.getProfileList();
        loading.close();
    }

    beforeUnmount() {
        profileModule.setProfileListQueryString({
            ...profileModule.profileListQueryString,
            keyword: '',
        });
    }
}
</script>

<style scoped lang="scss">
.item-list {
    max-height: calc(100vh - 280px);
    overflow: auto;
}

.profile-list {
    background-color: #ffffff;
    border-radius: 16px;
    padding: 30px 15px;
    min-height: calc(100vh - 90px);

    .title-container {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        .title {
            font-size: 16px;
            font-weight: 650;
        }
    }
}
.action-icon {
    height: 16px;
    width: 16px;
}
:deep(.el-button) {
    border: none !important;
    width: 16px !important;
    margin-left: 0px;
}
:deep(.validation-error) {
    display: none;
}
</style>
