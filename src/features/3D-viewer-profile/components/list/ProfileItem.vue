<template>
    <el-tooltip
        v-if="isDefaultSelect"
        :content="$t('3dViewerProfile.profileForm.tooltip.defaultSelect')"
    >
        <div
            class="d-flex justify-content-between wrapper align-items-center my-2"
            :class="{ selected: isSelected }"
            @click="handleClickItem"
        >
            <div class="px-2 name">{{ item.name }}</div>
            <div class="d-flex align-items-center">
                <div v-show="isDefaultSelect" class="px-2">
                    <el-icon color="green"><Check /></el-icon>
                </div>
                <div @click="handleDelete" class="icon-wrapper">
                    <el-icon color="red"><Delete /></el-icon>
                </div>
            </div>
        </div>
    </el-tooltip>
    <div
        v-else
        class="d-flex justify-content-between wrapper align-items-center my-2"
        :class="{ selected: isSelected }"
        @click="handleClickItem"
    >
        <div class="px-2 name">{{ item.name }}</div>
        <div class="d-flex align-items-center">
            <div v-show="isDefaultSelect" class="px-2">
                <el-icon color="green"><Check /></el-icon>
            </div>
            <div @click="handleDelete" class="icon-wrapper">
                <el-icon color="red"><Delete /></el-icon>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins, Options } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Delete, Check } from '@element-plus/icons-vue';
import { IProfile } from '../../interfaces';
import { profileModule } from '../../store';

@Options({
    components: {
        Delete,
        Check,
    },
})
export default class ProfileItem extends mixins(UtilMixins) {
    @Prop({ type: String })
    readonly item!: IProfile;

    get isSelected(): boolean {
        return this.item._id === profileModule.selectedProfile?._id;
    }

    get isDefaultSelect(): boolean {
        return this.item.isDefaultSelect;
    }

    handleClickItem() {
        this.$emit('click-item', this.item._id);
    }

    handleDelete(event: Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.$emit('click-delete', this.item._id);
    }
}
</script>

<style scoped lang="scss">
.wrapper {
    border: solid 1px $border-standard;
    border-radius: 5px;
    cursor: pointer;
}

.selected {
    border-color: var(--el-color-primary);
}

.name {
    word-break: break-all;
    padding: 0 12px !important;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    padding: 10px;
}

.name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
