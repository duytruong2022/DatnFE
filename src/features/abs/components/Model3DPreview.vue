<template>
    <div class="model-preview">
        <div class="thumbnail-container">
            <img class="thubmnail-img" crossorigin="anonymous" :src="thumbnailImageUrl" />
        </div>

        <BaseSingleSelect
            :isRequired="true"
            :options="fileActionOptions"
            :placeholder="$t('abs.table.action.placeholder')"
            v-model:value="selectedFileAction"
            filterable
            error=""
        />
        <div class="footer">
            <span>{{ fileDetail?.name }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { parseLanguageSelectOptions } from '@/common/helpers';
import { IFTPFile } from '@/common/interfaces';
import { mixins } from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { AbsFileAction, fileActionOptions } from '../constants';
import { AbsFileMixin } from '../mixin';
export default class Model3DPreview extends mixins(AbsFileMixin) {
    @Prop({ required: true }) fileDetail!: IFTPFile;
    selectedFileAction: AbsFileAction | null = null;

    get thumbnailImageUrl(): string {
        return this.fileDetail?.thumbnail
            ? this.fileDetail?.thumbnail
            : require('@/assets/images/no-thumbnail.png');
    }

    get fileActionOptions() {
        const options = [...fileActionOptions];
        if (this.is3DFile(this.fileDetail.name)) {
            options.unshift({
                label: 'abs.table.action.open',
                value: AbsFileAction.OPEN,
            });
        }
        return parseLanguageSelectOptions(options);
    }

    @Watch('selectedFileAction')
    onChangeSelectedFileAction(selectedFileAction: AbsFileAction | null) {
        if (selectedFileAction) {
            switch (selectedFileAction) {
                case AbsFileAction.OPEN:
                    this.onClickOpenFile([this.fileDetail.path || '']);
                    break;
                case AbsFileAction.RENAME:
                    this.onClickRenameFile(
                        this.fileDetail.path || '',
                        this.fileDetail.name,
                    );
                    break;
                case AbsFileAction.DOWNLOAD:
                    this.onClickDownload(this.fileDetail);
                    break;
                case AbsFileAction.DELETE:
                    this.onClickDeleteFile(this.fileDetail.path || '');
                    break;
                default:
                    break;
            }
            this.selectedFileAction = null;
        }
    }
}
</script>

<style scoped lang="scss">
.model-preview {
    background: #fff;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    margin-bottom: 24px;

    .thumbnail-container {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
        .thubmnail-img {
            max-width: 300px;
            max-height: 250px;
            width: 100%;
            height: auto;
        }
    }
    .footer {
        text-align: center;
        padding: 5px 0;
        border-top: 1px solid black;
        margin-top: 5px;
        min-height: 59px;
        color: #606266;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;

        span {
            word-break: break-all;
        }
    }
}
</style>
