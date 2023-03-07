<template>
    <div class="profile-img">
        <img
            :class="imageClass"
            :src="imageUrl"
            @error="imageUrlAlt"
            :height="height"
            :width="width"
        />
    </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

export default class Avatar extends Vue {
    @Prop({ default: '' }) readonly imageUrl!: string;
    @Prop({ default: 'default' }) readonly imageClass!: string;
    @Prop({ default: '150' }) readonly width!: string;
    @Prop({ default: '150' }) readonly height!: string;

    get imageUrlAlt(): string {
        return require('@/assets/icons/avatar-default.png');
    }
}
</script>

<style scoped lang="scss">
.profile-img {
    position: relative;
    img {
        object-fit: cover;
        border-radius: 50%;
    }
}
</style>
