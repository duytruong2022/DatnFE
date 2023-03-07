<template>
    <div class="project-map-container">
        <div id="project-map" style="height: calc(100vh - 160px); width: 100%"></div>
        <div id="project-action-popup" class="project-popup">
            <el-menu>
                <el-menu-item index="1" @click="onClickViewProject">
                    <span>{{ $t('project.popup.view') }}</span>
                </el-menu-item>
                <el-menu-item
                    v-if="isCanEditProject"
                    index="2"
                    @click="onClickEditProject"
                >
                    <span>{{ $t('project.popup.edit') }}</span>
                </el-menu-item>
            </el-menu>
        </div>
        <div id="project-select-popup" class="project-popup">
            {{ $t('project.popup.selectAProject') }}
            <el-menu>
                <el-menu-item
                    index="1"
                    @click="onSelectProject(project._id || '')"
                    v-for="project in projectMapSelectedProject"
                    :key="project._id"
                >
                    <span class="project-name-option">{{ project.name }}</span>
                </el-menu-item>
            </el-menu>
        </div>
        <div id="project-preview-popup" class="project-popup">
            <h5 class="project-name">{{ selectedProject?.name }}</h5>
        </div>
    </div>
</template>

<script lang="ts">
import { mixins, Options } from 'vue-class-component';
import {
    DEFAULT_EXPORTED_MAP_NAME,
    DEFAULT_PROJECT_MAP_COORDINATES,
    MAP_LAYER_URL,
    ProjectCategories,
    RANDOM_COORDINATES_RANGE,
} from '../constants';
import { projectModule } from '../store';
import { ICoordinates, IProject, MapStyleNames } from '../interfaces';

import { toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import OlMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

import { Watch } from 'vue-property-decorator';
import {
    downloadFileFromBase64,
    isAdmin,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { ElLoading } from 'element-plus';
import { UtilMixins } from '@/mixins/utilMixins';
import { commonService } from '@/common/services/common.service';
import localStorageAuthService from '@/common/authStorage';
import { authService } from '@/features/auth/services/api.services';
import { IProjectSecurityPermissions } from '@/features/auth/interfaces';
import { IBodyResponse } from '@/common/interfaces';
import random from 'lodash/random';
import { AccessModules } from '@/common/constants';
import { accessLogModule } from '@/features/access-log/store';
@Options({})
export default class ProjectMap extends mixins(UtilMixins) {
    map!: OlMap;
    vectorSource!: VectorSource;
    selectedPostalCode!: string;
    actionPopupOverlay!: Overlay;
    projectSelectPopupOverlay!: Overlay;
    projectPreviewPopupOverlay!: Overlay;
    selectedProjectId: string | null = '';
    projectMapSelectedIds: string[] = [];
    selectProjectPopupCoordinates: Coordinate | undefined = undefined;
    previewProjectPopupCoordinates: Coordinate | undefined = [0, 0];
    actionPopupCoordinates: Coordinate | undefined = undefined;
    iconStyle: Style = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: require('../../../assets/images/building.png'),
            crossOrigin: 'anonymous',
        }),
    });

    get projectList(): IProject[] {
        const countProjectAtCoordinates = new Map<string, number>();
        projectModule.projectList.forEach((project) => {
            const coordinates = `${project.latitude} ${project.longitude}`;
            const counter = countProjectAtCoordinates.get(coordinates);
            if (!counter) {
                countProjectAtCoordinates.set(coordinates, 1);
            } else {
                countProjectAtCoordinates.set(coordinates, counter + 1);
            }
        });

        return projectModule.projectList.map((project) => {
            const coordinates = `${project.latitude} ${project.longitude}`;
            const isCoordinatesDuplicated =
                (countProjectAtCoordinates.get(coordinates) || 0) > 1;
            return {
                ...project,
                latitude: isCoordinatesDuplicated
                    ? project.latitude +
                      random(
                          RANDOM_COORDINATES_RANGE.min,
                          RANDOM_COORDINATES_RANGE.max,
                          true,
                      )
                    : project.latitude,
                longitude: isCoordinatesDuplicated
                    ? project.longitude +
                      random(
                          RANDOM_COORDINATES_RANGE.min,
                          RANDOM_COORDINATES_RANGE.max,
                          true,
                      )
                    : project.longitude,
            };
        });
    }

    get isShowProjectForm(): boolean {
        return projectModule.isShowProjectForm;
    }

    get selectedCoordinates(): ICoordinates {
        return projectModule.selectedCoordinates;
    }

    get triggerExportButtonFlag(): boolean {
        return projectModule.triggerExportButtonFlag;
    }

    get projectMapSelectedProject(): IProject[] {
        return this.projectList.filter((project) =>
            this.projectMapSelectedIds.includes(project._id || ''),
        );
    }

    get selectedProject(): IProject | undefined {
        return this.projectList.find((project) => project._id === this.selectedProjectId);
    }

    get isCanEditProject(): boolean {
        return (
            this.selectedProject?.adminId === localStorageAuthService.getUser()?._id ||
            isAdmin(AccessModules.SPACIALYTIC_CONSTELLATION)
        );
    }

    mounted(): void {
        this.$nextTick(() => {
            if (!this.map) {
                const mapContainer = document.getElementById('project-map');
                if (mapContainer) {
                    mapContainer.innerHTML = '';
                }
                this.actionPopupOverlay = new Overlay({
                    element: document.getElementById('project-action-popup') || undefined,
                    autoPan: {
                        animation: {
                            duration: 250,
                        },
                    },
                });
                this.projectSelectPopupOverlay = new Overlay({
                    element: document.getElementById('project-select-popup') || undefined,
                    autoPan: {
                        animation: {
                            duration: 250,
                        },
                    },
                });
                this.projectPreviewPopupOverlay = new Overlay({
                    element:
                        document.getElementById('project-preview-popup') || undefined,
                    autoPan: {
                        animation: {
                            duration: 250,
                        },
                    },
                });

                this.map = new OlMap({
                    target: 'project-map',
                    layers: [
                        new TileLayer({
                            source: new XYZ({
                                url: MAP_LAYER_URL,
                                crossOrigin: 'anonymous',
                            }),
                        }),
                    ],
                    overlays: [
                        this.actionPopupOverlay,
                        this.projectSelectPopupOverlay,
                        this.projectPreviewPopupOverlay,
                    ],
                    view: new View({
                        zoom: 7,
                        maxZoom: 25,
                        center: fromLonLat([
                            DEFAULT_PROJECT_MAP_COORDINATES.longitude,
                            DEFAULT_PROJECT_MAP_COORDINATES.latitude,
                        ]),
                    }),
                });

                this.map.on('click', async (e) => {
                    this.actionPopupCoordinates = undefined;
                    this.selectProjectPopupCoordinates = undefined;
                    // check if drawer is open then it means user is choosing a place
                    if (projectModule.isShowProjectForm) {
                        const loading = ElLoading.service({
                            target: '.project-form-popup',
                        });
                        const coordinates = toLonLat(e.coordinate);
                        const result = await commonService.reverseGeocode(
                            coordinates[1],
                            coordinates[0],
                        );
                        loading.close();

                        projectModule.setSelectedCoordinates({
                            latitude: coordinates[1],
                            longitude: coordinates[0],
                        });
                        projectModule.setSelectedPostalCode(result.data?.postalCode);
                    } else {
                        this.projectMapSelectedIds = [];
                        // check if user click on a project
                        this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
                            this.projectMapSelectedIds.push(
                                feature.getId()?.toString() || '',
                            );
                            this.actionPopupCoordinates = e.coordinate;
                            this.selectProjectPopupCoordinates = e.coordinate;
                            this.selectedProjectId = feature.getId()?.toString() || null;
                        });
                        if (this.projectMapSelectedIds.length > 1) {
                            this.actionPopupCoordinates = undefined;
                        } else {
                            this.selectProjectPopupCoordinates = undefined;
                        }
                    }

                    this.actionPopupOverlay.setPosition(this.actionPopupCoordinates);
                    this.projectSelectPopupOverlay.setPosition(
                        this.selectProjectPopupCoordinates,
                    );
                    this.previewProjectPopupCoordinates = undefined;
                });

                this.markCoordinates(this.projectList);

                this.map.on('pointermove', async (e) => {
                    this.previewProjectPopupCoordinates = undefined;
                    this.map.forEachFeatureAtPixel(e.pixel, (feature) => {
                        if (
                            !this.actionPopupCoordinates &&
                            !this.selectProjectPopupCoordinates
                        ) {
                            this.previewProjectPopupCoordinates = e.coordinate;
                            this.selectedProjectId = feature.getId()?.toString() || null;
                        } else {
                            this.previewProjectPopupCoordinates = undefined;
                        }
                    });
                });
            } else {
                //
            }
        });
    }

    markCoordinates(projectList: IProject[]): void {
        if (!this.map) {
            return;
        }
        if (this.vectorSource) {
            this.vectorSource.clear();
        }

        const projectMarks = projectList.map((project) => {
            const mark = new Feature({
                type: 'icon',
                geometry: new Point(fromLonLat([project.longitude, project.latitude])),
                name: project.name,
            });
            mark.setId(project._id);
            mark.setStyle((feature, resolution) => {
                const scale = (1 / Math.pow(resolution, 1 / 10)) * 1.5;
                return new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        src: require('../../../assets/images/building.png'),
                        crossOrigin: 'anonymous',
                        scale,
                    }),
                });
            });
            return mark;
        });
        this.vectorSource = new VectorSource({
            features: [...projectMarks],
        });

        const vectorLayer = new VectorLayer({
            source: this.vectorSource,
            style: (feature) => {
                if (feature.get('type') === MapStyleNames.ICON) {
                    return new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: require('../../../assets/images/building.png'),
                            crossOrigin: 'anonymous',
                        }),
                    });
                }
            },
        });

        this.map.addLayer(vectorLayer);
    }

    onClickEditProject() {
        this.actionPopupOverlay.setPosition(undefined);
        projectModule.setSelectedProjectIdToEdit(this.selectedProjectId);
        projectModule.setIsShowProjectForm(true);
    }

    async onClickViewProject() {
        this.actionPopupOverlay.setPosition(undefined);
        const loading = ElLoading.service({
            target: '.content',
        });
        const response = (await authService.getProjectSecurityPermissions(
            this.selectedProjectId as string,
        )) as IBodyResponse<IProjectSecurityPermissions>;
        if (response.success) {
            localStorageAuthService.setProjectSecurityPermissions(
                response.data.projectSecurityPermissions || [],
            );
            localStorageAuthService.setPbsGroupPermissions(
                response.data.pbsGroupPermissions || [],
            );
            localStorageAuthService.setProjectAdminId(response.data.adminId || '');
            projectModule.setSelectedProjectId(this.selectedProjectId);
            localStorageAuthService.setSelectedProjectId(
                this.selectedProjectId as string,
            );
            const selectedProject = projectModule.projectList.find(
                (project) => project._id === this.selectedProjectId,
            );
            if (selectedProject) {
                projectModule.setSelectedProject(selectedProject);
            }
            accessLogModule.createAccessLogModule({
                projectId: this.selectedProjectId || '',
            });
        } else {
            showErrorNotificationFunction(response.message as string);
        }
        loading.close();
    }

    onSelectProject(projectId: string) {
        this.actionPopupOverlay.setPosition(this.selectProjectPopupCoordinates);
        this.actionPopupCoordinates = this.selectProjectPopupCoordinates;
        this.selectProjectPopupCoordinates = undefined;
        this.projectSelectPopupOverlay.setPosition(undefined);
        this.selectedProjectId = projectId;
    }

    @Watch('projectList')
    onChangeProjectList(newProjectList: IProject[]) {
        this.markCoordinates(newProjectList);
    }

    @Watch('selectedCoordinates')
    onChangeSelectedCoordinates(selectedCoordinates: ICoordinates) {
        if (selectedCoordinates.latitude && selectedCoordinates.longitude) {
            this.markCoordinates([
                {
                    latitude: selectedCoordinates.latitude,
                    longitude: selectedCoordinates.longitude,
                    _id: undefined,
                    name: '',
                    adminId: '',
                    dataDate: new Date(),
                    category: ProjectCategories.INFRASTRUCTURE,
                    description: '',
                    postalCode: '',
                    taskIdPrefix: '',
                    taskIdSuffix: 0,
                    taskIdIncrement: 0,
                },
                ...this.projectList.filter(
                    (project) => project._id !== projectModule.selectedProjectId,
                ),
            ]);
        } else {
            this.markCoordinates(this.projectList);
        }
    }

    @Watch('triggerExportButtonFlag')
    onTriggerExportButtonFlag() {
        this.map.once('rendercomplete', () => {
            const mapCanvas = document.createElement('canvas');
            const size = this.map.getSize();
            mapCanvas.width = size?.[0] || 0;
            mapCanvas.height = size?.[1] || 0;
            const mapContext = mapCanvas.getContext('2d');
            if (!mapContext) {
                return;
            }
            Array.prototype.forEach.call(
                this.map
                    .getViewport()
                    .querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
                function (canvas) {
                    if (canvas.width > 0) {
                        const opacity =
                            canvas.parentNode.style.opacity || canvas.style.opacity;
                        mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

                        const backgroundColor = canvas.parentNode.style.backgroundColor;
                        if (backgroundColor) {
                            mapContext.fillStyle = backgroundColor;
                            mapContext.fillRect(0, 0, canvas.width, canvas.height);
                        }

                        let matrix;
                        const transform = canvas.style.transform;
                        if (transform) {
                            // Get the transform parameters from the style's transform matrix
                            matrix = transform
                                .match(/^matrix\(([^(]*)\)$/)[1]
                                .split(',')
                                .map(Number);
                        } else {
                            matrix = [
                                parseFloat(canvas.style.width) / canvas.width,
                                0,
                                0,
                                parseFloat(canvas.style.height) / canvas.height,
                                0,
                                0,
                            ];
                        }
                        // Apply the transform to the export map context
                        CanvasRenderingContext2D.prototype.setTransform.apply(
                            mapContext,
                            matrix,
                        );
                        mapContext.drawImage(canvas, 0, 0);
                    }
                },
            );
            mapContext.globalAlpha = 1;
            downloadFileFromBase64(DEFAULT_EXPORTED_MAP_NAME, mapCanvas.toDataURL());
        });
        this.map.renderSync();
    }

    @Watch('previewProjectPopupCoordinates', { deep: true })
    onChangePreviewProjectPopupCoordinates(
        previewProjectPopupCoordinates: Coordinate | undefined,
    ) {
        this.projectPreviewPopupOverlay.setPosition(previewProjectPopupCoordinates);
    }
}
</script>
<style lang="scss" scoped>
:deep(.ol-zoom) {
    display: none !important;
}
:deep(.ol-rotate) {
    display: none !important;
}

.project-popup {
    position: absolute;
    background-color: white;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    bottom: 8px;
    left: -140px;
    min-width: 280px;
    text-align: center;
}
.project-popup:after,
.project-popup:before {
    top: 100%;
    border: solid transparent;
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-bottom: none;
}
.project-popup:after {
    border-top-color: #ffffff;
    border-width: 6px;
    left: 140px;
    border-bottom: none;
    margin-left: -6px;
}
.project-popup:before {
    border-top-color: rgb(228, 231, 237);
    border-bottom: none;
    border-width: 7px;
    left: 140px;
    margin-left: -7px;
}
:deep(.el-menu) {
    border-right: none;
    border-radius: 4px;
    border: 1px solid rgb(228, 231, 237);
}
:deep(.el-menu-item) {
    height: 32px;
    color: #606266 !important;
}
.project-name {
    display: inline-block;
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}
.project-name-option {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
