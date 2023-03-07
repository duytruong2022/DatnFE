<template>
    <BaseRightDrawer
        :title="$t('supportRequest.form.title.detail')"
        size="50%"
        @onClosed="closePopup"
        @onOpen="openForm"
        v-model:value="isShowSupportRequestDetail"
        customClass="support-request-detail"
    >
        <template #body>
            <div class="row">
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.email.label')"
                        :value="supportRequestDetail.email"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.lastName.label')"
                        :value="supportRequestDetail.lastName"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.firstName.label')"
                        :value="supportRequestDetail.firstName"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.category.label')"
                        :value="
                            $t(
                                `supportRequest.list.category.${supportRequestDetail.category}`,
                            )
                        "
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.priority.label')"
                        :value="
                            $t(
                                `supportRequest.list.priority.${supportRequestDetail.priority}`,
                            )
                        "
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.version.label')"
                        :value="supportRequestDetail.version"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.object.label')"
                        :value="supportRequestDetail.object"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.file.label')"
                        :isFile="true"
                        :multipleLines="true"
                    >
                        <template #file-attachment>
                            <div v-if="supportRequestDetail.file?.path">
                                <a
                                    class="click-here"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    :href="supportRequestDetail.file?.path"
                                    ><u>{{ $t('supportRequest.button.linkFile') }}</u></a
                                >
                            </div>
                            <div v-else>N/A</div>
                        </template>
                    </LabelText>
                </div>
                <div class="col-xl-6 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.reference.label')"
                        :value="supportRequestDetail.reference"
                        :multipleLines="true"
                    />
                </div>
                <div class="col-xl-12 col-md-12 col-12">
                    <LabelText
                        :label="$t('supportRequest.form.detail.label')"
                        :value="supportRequestDetail.detail"
                        :multipleLines="true"
                    />
                </div>
            </div>
        </template>
    </BaseRightDrawer>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { supportRequestModule } from '../store';
import { IBodyResponse } from '@/common/interfaces';
import { showErrorNotificationFunction } from '@/common/helpers';
import { supportRequestService } from '../services/api.service';
import { ElLoading } from 'element-plus';
import { ISupportRequest } from '../interface';
import LabelText from '../components/LabelText.vue';

@Options({
    components: { LabelText },
})
export default class SupportRequestDetail extends mixins(UtilMixins) {
    supportRequest: ISupportRequest = {
        email: '',
        firstName: '',
        lastName: '',
        category: '',
        priority: '',
        site: '',
        version: '',
        object: '',
        reference: '',
        detail: '',
        file: null,
    };

    get supportRequestDetail(): ISupportRequest {
        return this.supportRequest;
    }

    get isShowSupportRequestDetail(): boolean {
        return supportRequestModule.isShowSupportRequestDetail || false;
    }

    closePopup() {
        supportRequestModule.setIsShowSupportRequestDetail(false);
        supportRequestModule.setSelectedSupportRequest(null);
    }

    async openForm() {
        const loading = ElLoading.service({
            target: '.support-request-detail',
        });
        const response = (await supportRequestService.getDetail(
            supportRequestModule.selectedSupportRequest?._id as string,
        )) as IBodyResponse<ISupportRequest>;
        loading.close();
        if (response.success) {
            this.supportRequest = response.data;
        } else {
            showErrorNotificationFunction(response.message);
        }
    }
}
</script>
<style lang="scss" scoped>
.upload-file-help {
    margin-bottom: 32px;
}
</style>
