<template>
    <BaseMenuForm
        :label="$t('planning.startAppearance.title')"
        :isRequire="true"
        :isDisabled="isDisableStartAppearance"
        :error="errorStartAppearance || errorStartAppearanceColor"
    >
        <template #append>
            <div class="type-detail">
                <div class="col-md-12 d-flex">
                    <BaseRadio
                        :label="$t('planning.startAppearance.contentDetail.labelColor')"
                        :isHorizontal="false"
                        :options="appearnceColorOptions"
                        v-model:value="startAppearanceColor"
                        :isRequire="true"
                        :isDisabled="isDisableStartAppearance"
                        @change="onChangeStartAppearanceColor"
                    >
                    </BaseRadio>
                    <div class="picker-color">
                        <el-color-picker
                            :disabled="
                                isDisableStartAppearance ||
                                startAppearanceColor === AppearanceOptions.ORIGINAL
                            "
                            v-model="startAppearanceColorValue"
                            color-format="hex"
                            @change="onChangeStartAppearanceColorValue"
                        ></el-color-picker>
                    </div>
                </div>
                <div class="col-md-12 d-flex">
                    <BaseRadio
                        :label="
                            $t('planning.startAppearance.contentDetail.labelTransparency')
                        "
                        :isHorizontal="false"
                        :options="appearanceTransparencyOptions"
                        v-model:value="startAppearanceTransparency"
                        :isRequire="true"
                        :isDisabled="isDisableStartAppearance"
                        @change="onChangeStartAppearanceTransparency"
                    >
                    </BaseRadio>
                    <div class="input-transparence">
                        <el-input
                            :disabled="
                                isDisableStartAppearance ||
                                startAppearanceTransparency === AppearanceOptions.ORIGINAL
                            "
                            v-model="startAppearanceTransparencyValue"
                            type="number"
                            :placeholder="
                                $t(
                                    'planning.startAppearance.contentDetail.transparencyInput',
                                )
                            "
                            @change="onChangeStartAppearanceTransparencyValue"
                        ></el-input>
                    </div>
                </div>
            </div>
        </template>
    </BaseMenuForm>
    <BaseMenuForm
        :label="$t('planning.activeAppearance.title')"
        :isRequire="true"
        :isDisable="isDisableActiveAppearance"
        :error="errorActiveAppearanceColor"
    >
        <template #append>
            <div class="type-detail">
                <div class="col-md-12 d-flex">
                    <BaseRadio
                        :label="$t('planning.activeAppearance.contentDetail.labelColor')"
                        :isHorizontal="false"
                        :options="appearnceColorOptions"
                        v-model:value="activeAppearanceColor"
                        :isRequire="true"
                        :isDisabled="isDisableActiveAppearance"
                        @change="onChangeActiveAppearanceColor"
                    >
                    </BaseRadio>
                    <div class="picker-color">
                        <el-color-picker
                            :disabled="
                                isDisableActiveAppearance ||
                                activeAppearanceColor === AppearanceOptions.ORIGINAL
                            "
                            v-model="activeAppearanceColorValue"
                            color-format="hex"
                            @change="onChangeActiveAppearanceColorValue"
                        ></el-color-picker>
                    </div>
                </div>
                <div class="col-md-12 flex-column">
                    <BaseRadio
                        :label="
                            $t(
                                'planning.activeAppearance.contentDetail.labelTransparency',
                            )
                        "
                        :isHorizontal="false"
                        :options="appearanceTransparencyOptions"
                        v-model:value="activeAppearanceTransparency"
                        :isRequire="true"
                        :isDisabled="isDisableActiveAppearance"
                        @change="onChangeActiveAppearanceTransparency"
                    >
                    </BaseRadio>
                    <div class="col-6">
                        <BaseInputNumber
                            :label="
                                $t(
                                    'planning.activeAppearance.contentDetail.labelStartTransparency',
                                )
                            "
                            :placeholder="
                                $t(
                                    'planning.activeAppearance.contentDetail.transparencyInput',
                                )
                            "
                            :isRequire="true"
                            :isClearable="true"
                            :isBold="false"
                            :isDisabled="
                                isDisableActiveAppearance ||
                                activeAppearanceTransparency ===
                                    AppearanceOptions.ORIGINAL
                            "
                            v-model:value="activeAppearanceStartTransparencyValue"
                            @change="onChangeActiveAppearanceStartTransparencyValue"
                            :error="errorActiveAppearanceStartTransparency"
                        ></BaseInputNumber>
                    </div>
                    <div class="col-6">
                        <el-checkbox
                            :label="
                                $t(
                                    'planning.activeAppearance.contentDetail.labelTransparencyInterpolation',
                                )
                            "
                            size="large"
                            :disabled="
                                isDisableActiveAppearance ||
                                activeAppearanceTransparency ===
                                    AppearanceOptions.ORIGINAL
                            "
                            v-model="isTransparencyInterpolation"
                            @change="onChangeTransparencyInterpolation"
                        />
                        <BaseInputNumber
                            :label="
                                $t(
                                    'planning.activeAppearance.contentDetail.labelEndTransparency',
                                )
                            "
                            :placeholder="
                                $t(
                                    'planning.activeAppearance.contentDetail.transparencyInput',
                                )
                            "
                            :isRequire="true"
                            :isClearable="true"
                            :isBold="false"
                            :isDisabled="
                                isDisableActiveAppearance ||
                                isTransparencyInterpolation !== true ||
                                activeAppearanceTransparency ===
                                    AppearanceOptions.ORIGINAL
                            "
                            v-model:value="activeAppearanceEndTransparencyValue"
                            @change="onChangeActiveAppearanceEndTransparencyValue"
                            :error="errorActiveAppearanceEndTransparency"
                        ></BaseInputNumber>
                    </div>
                </div>
            </div>
        </template>
    </BaseMenuForm>
    <BaseMenuForm
        :label="$t('planning.endAppearance.title')"
        :isRequire="true"
        :isDisabled="isDisableEndAppearance"
        :error="errorEndAppearance || errorEndAppearanceColor"
    >
        <template #append>
            <div class="type-detail">
                <div class="col-md-12 d-flex">
                    <BaseRadio
                        :label="$t('planning.endAppearance.contentDetail.labelColor')"
                        :isHorizontal="false"
                        :options="appearnceColorOptions"
                        v-model:value="endAppearanceColor"
                        :isRequire="true"
                        :isDisabled="isDisableEndAppearance"
                        @change="onChangeEndAppearanceColor"
                    >
                    </BaseRadio>
                    <div class="picker-color">
                        <el-color-picker
                            :disabled="
                                isDisableEndAppearance ||
                                endAppearanceColor === AppearanceOptions.ORIGINAL
                            "
                            v-model="endAppearanceColorValue"
                            color-format="hex"
                            @change="onChangeEndAppearanceColorValue"
                        ></el-color-picker>
                    </div>
                </div>
                <div class="col-md-12 d-flex">
                    <BaseRadio
                        :label="
                            $t('planning.endAppearance.contentDetail.labelTransparency')
                        "
                        :isHorizontal="false"
                        :options="appearanceTransparencyOptions"
                        v-model:value="endAppearanceTransparency"
                        :isRequire="true"
                        :isDisabled="isDisableEndAppearance"
                        @change="onChangeEndAppearanceTransparency"
                    >
                    </BaseRadio>
                    <div class="input-transparence">
                        <el-input
                            :disabled="
                                isDisableEndAppearance ||
                                endAppearanceTransparency === AppearanceOptions.ORIGINAL
                            "
                            :placeholder="
                                $t(
                                    'planning.endAppearance.contentDetail.transparencyInput',
                                )
                            "
                            v-model="endAppearanceTransparencyValue"
                            type="number"
                            @change="onChangeEndAppearanceTransparencyValue"
                        ></el-input>
                    </div>
                </div>
            </div>
        </template>
    </BaseMenuForm>
</template>
<script lang="ts">
import { mixins, Prop, Watch } from 'vue-property-decorator';
import {
    AppearnceColorOptions,
    AppearanceTransparencyOptions,
    AppearanceType,
    AppearanceOptions,
} from '../../constants';
import { Planning4DMixin } from '../../mixins/mixin';
import { projectPlanningModule } from '../../store';
export default class AppearanceTypeDetail extends mixins(Planning4DMixin) {
    @Prop({ default: '' }) readonly appearanceProfileType!: AppearanceType;
    @Prop({ default: '' }) readonly errorStartAppearance!: string;
    @Prop({ default: '' }) readonly errorStartAppearanceColor!: string;
    @Prop({ default: '' }) readonly errorActiveAppearanceStartTransparency!: string;
    @Prop({ default: '' }) readonly errorActiveAppearanceColor!: string;
    @Prop({ default: '' }) readonly errorActiveAppearanceEndTransparency!: string;
    @Prop({ default: '' }) readonly errorEndAppearance!: string;
    @Prop({ default: '' }) readonly errorEndAppearanceColor!: string;
    isDisableStartAppearance = true;
    isDisableActiveAppearance = false;
    isDisableEndAppearance = false;
    startAppearanceColor = AppearanceOptions.ORIGINAL;
    startAppearanceColorValue = '';
    startAppearanceTransparencyValue = null;
    startAppearanceTransparency = AppearanceOptions.ORIGINAL;
    activeAppearanceColor = AppearanceOptions.ORIGINAL;
    activeAppearanceColorValue = '';
    activeAppearanceTransparency = AppearanceOptions.ORIGINAL;
    activeAppearanceStartTransparencyValue = null;
    activeAppearanceEndTransparencyValue = null;
    endAppearanceColor = AppearanceOptions.ORIGINAL;
    endAppearanceColorValue = '';
    endAppearanceTransparency = AppearanceOptions.ORIGINAL;
    endAppearanceTransparencyValue = null;
    isTransparencyInterpolation = false;
    appearnceColorOptions = AppearnceColorOptions;
    appearanceTransparencyOptions = AppearanceTransparencyOptions;
    AppearanceOptions = AppearanceOptions;

    get selectedAppearanceProfile() {
        return projectPlanningModule.selectedAppearanceProfile;
    }

    created(): void {
        this.onOpen();
    }

    onOpen() {
        if (this.selectedAppearanceProfile) {
            switch (this.appearanceProfileType) {
                case AppearanceType.INSTALL:
                    this.isDisableStartAppearance = true;
                    this.isDisableActiveAppearance = false;
                    this.isDisableEndAppearance = false;
                    break;
                case AppearanceType.REMOVE:
                    this.isDisableStartAppearance = false;
                    this.isDisableActiveAppearance = false;
                    this.isDisableEndAppearance = true;
                    break;
                case AppearanceType.MAINTAIN:
                    this.isDisableStartAppearance = false;
                    this.isDisableActiveAppearance = false;
                    this.isDisableEndAppearance = false;
                    break;
                case AppearanceType.TEMPORARY:
                    this.isDisableStartAppearance = true;
                    this.isDisableActiveAppearance = false;
                    this.isDisableEndAppearance = true;
                    break;
                default:
                    break;
            }
            if (this.selectedAppearanceProfile?.startAppearanceProfile) {
                this.startAppearanceColor =
                    this.selectedAppearanceProfile.startAppearanceProfile.colorType;
                this.startAppearanceColorValue =
                    this.selectedAppearanceProfile.startAppearanceProfile.colorValue;
                this.startAppearanceTransparency =
                    this.selectedAppearanceProfile.startAppearanceProfile.transparencyType;
                this.startAppearanceTransparencyValue = this.selectedAppearanceProfile
                    .startAppearanceProfile.transparencyValue as any;
            }
            if (this.selectedAppearanceProfile?.endAppearanceProfile) {
                this.endAppearanceColor =
                    this.selectedAppearanceProfile.endAppearanceProfile.colorType;
                this.endAppearanceColorValue =
                    this.selectedAppearanceProfile.endAppearanceProfile.colorValue;
                this.endAppearanceTransparency =
                    this.selectedAppearanceProfile.endAppearanceProfile.transparencyType;
                this.endAppearanceTransparencyValue = this.selectedAppearanceProfile
                    .endAppearanceProfile.transparencyValue as any;
            }
            if (this.selectedAppearanceProfile?.activeAppearanceProfile) {
                this.activeAppearanceColor =
                    this.selectedAppearanceProfile.activeAppearanceProfile.colorType;
                this.activeAppearanceColorValue =
                    this.selectedAppearanceProfile.activeAppearanceProfile.colorValue;
                this.activeAppearanceTransparency =
                    this.selectedAppearanceProfile.activeAppearanceProfile.transparencyType;
                this.activeAppearanceStartTransparencyValue = this
                    .selectedAppearanceProfile.activeAppearanceProfile
                    .transparencyStartValue as any;
                this.activeAppearanceEndTransparencyValue = this.selectedAppearanceProfile
                    .activeAppearanceProfile.transparencyEndValue as any;
                this.isTransparencyInterpolation =
                    this.selectedAppearanceProfile.activeAppearanceProfile.transparencyInterpolation;
            }
        }
    }

    onChangeStartAppearanceColor() {
        if (this.startAppearanceColor === AppearanceOptions.ORIGINAL) {
            this.startAppearanceColorValue = '';
        }
        this.onChangeStart();
    }

    onChangeStartAppearanceColorValue() {
        if (this.startAppearanceColor === AppearanceOptions.CUSTOM) {
            this.onChangeStart();
        }
    }

    onChangeStartAppearanceTransparency() {
        if (this.startAppearanceTransparency === AppearanceOptions.ORIGINAL) {
            this.startAppearanceTransparencyValue = null;
        }
        this.onChangeStart();
    }

    onChangeStartAppearanceTransparencyValue() {
        if (this.startAppearanceTransparency === AppearanceOptions.CUSTOM) {
            this.onChangeStart();
        }
    }

    onChangeStart() {
        this.$emit(
            'change-start',
            this.startAppearanceColor,
            this.startAppearanceColorValue,
            this.startAppearanceTransparency,
            this.startAppearanceTransparencyValue,
        );
    }

    onChangeActiveAppearanceColor() {
        if (this.activeAppearanceColor === AppearanceOptions.ORIGINAL) {
            this.activeAppearanceColorValue = '';
        }
        this.onChangeActive();
    }

    onChangeActiveAppearanceColorValue() {
        if (this.activeAppearanceColor === AppearanceOptions.CUSTOM) {
            this.onChangeActive();
        }
    }

    onChangeActiveAppearanceTransparency() {
        if (this.startAppearanceTransparency === AppearanceOptions.ORIGINAL) {
            this.activeAppearanceStartTransparencyValue = null;
            this.activeAppearanceEndTransparencyValue = null;
            this.isTransparencyInterpolation = false;
        }
        this.onChangeActive();
    }

    onChangeActiveAppearanceStartTransparencyValue() {
        if (this.activeAppearanceTransparency === AppearanceOptions.CUSTOM) {
            this.onChangeActive();
        }
    }

    onChangeTransparencyInterpolation(value: boolean) {
        if (this.activeAppearanceTransparency === AppearanceOptions.CUSTOM) {
            if (!value) {
                this.activeAppearanceEndTransparencyValue = null;
            }
            this.onChangeActive();
        }
    }

    onChangeActiveAppearanceEndTransparencyValue() {
        if (
            this.activeAppearanceTransparency === AppearanceOptions.CUSTOM &&
            this.isTransparencyInterpolation
        ) {
            this.onChangeActive();
        }
    }

    onChangeActive() {
        this.$emit(
            'change-active',
            this.activeAppearanceColor,
            this.activeAppearanceColorValue,
            this.activeAppearanceTransparency,
            this.activeAppearanceStartTransparencyValue,
            this.isTransparencyInterpolation,
            this.activeAppearanceEndTransparencyValue,
        );
    }

    onChangeEndAppearanceColor() {
        if (this.endAppearanceColor === AppearanceOptions.ORIGINAL) {
            this.endAppearanceColorValue = '';
        }
        this.onChangeEnd();
    }

    onChangeEndAppearanceColorValue() {
        if (this.endAppearanceColor === AppearanceOptions.CUSTOM) {
            this.onChangeEnd();
        }
    }

    onChangeEndAppearanceTransparency() {
        if (this.endAppearanceTransparency === AppearanceOptions.ORIGINAL) {
            this.endAppearanceTransparencyValue = null;
        }
        this.onChangeEnd();
    }

    onChangeEndAppearanceTransparencyValue() {
        if (this.endAppearanceTransparency === AppearanceOptions.CUSTOM) {
            this.onChangeEnd();
        }
    }

    onChangeEnd() {
        this.$emit(
            'change-end',
            this.endAppearanceColor,
            this.endAppearanceColorValue,
            this.endAppearanceTransparency,
            this.endAppearanceTransparencyValue,
        );
    }
    @Watch('appearanceProfileType')
    onChangeAppearanceType(newValue: AppearanceType) {
        switch (newValue) {
            case AppearanceType.INSTALL:
                this.isDisableStartAppearance = true;
                this.isDisableActiveAppearance = false;
                this.isDisableEndAppearance = false;
                this.startAppearanceColor = AppearanceOptions.ORIGINAL;
                this.startAppearanceTransparency = AppearanceOptions.ORIGINAL;
                this.onChangeStart();
                break;
            case AppearanceType.REMOVE:
                this.isDisableStartAppearance = false;
                this.isDisableActiveAppearance = false;
                this.isDisableEndAppearance = true;
                this.endAppearanceColor = AppearanceOptions.ORIGINAL;
                this.endAppearanceTransparency = AppearanceOptions.ORIGINAL;
                this.onChangeEnd();
                break;
            case AppearanceType.MAINTAIN:
                this.isDisableStartAppearance = false;
                this.isDisableActiveAppearance = false;
                this.isDisableEndAppearance = false;
                break;
            case AppearanceType.TEMPORARY:
                this.isDisableStartAppearance = true;
                this.isDisableActiveAppearance = false;
                this.isDisableEndAppearance = true;
                this.endAppearanceColor = AppearanceOptions.ORIGINAL;
                this.endAppearanceTransparency = AppearanceOptions.ORIGINAL;
                this.startAppearanceColor = AppearanceOptions.ORIGINAL;
                this.startAppearanceTransparency = AppearanceOptions.ORIGINAL;
                this.onChangeEnd();
                this.onChangeStart();
                break;
            default:
                break;
        }
    }
}
</script>
<style lang="scss" scoped>
.picker-color {
    width: 20rem;
    text-align: center;
    margin-top: 20px;
    padding-left: 30px;
}
.type-detail {
    display: block;
}
.input-transparence {
    width: 11rem;
    text-align: left;
    margin-top: 20px;
    padding-left: 50px;
}
/** Remove Arrows/Spinners */
/* Chrome, Safari, Edge, Opera */
:deep(.el-input__inner::-webkit-outer-spin-button),
:deep(.el-input__inner::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}
:deep(.el-input__wrapper) {
    border-radius: 9px;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    --el-input-hover-border-color: var(--el-border-color);
}
:deep(.el-input__wrapper.is-focus) {
    border-color: var(--el-color-primary);
    outline: 0;
    box-shadow: 0 0 0 2px var(--el-color-primary);
}
</style>
