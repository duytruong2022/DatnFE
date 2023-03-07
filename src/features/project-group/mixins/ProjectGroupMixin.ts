import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import { IBodyResponse, IDropDownOption, IGetListResponse } from '@/common/interfaces';
import { IProfile } from '@/features/3D-viewer-profile/interfaces';
import { commonService } from '@/common/services/common.service';
import { projectGroupModule } from '../store';
import { projectModule } from '@/features/project/store';

export class ProjectGroupMixin extends mixins(UtilMixins) {
    projectProfileList: IProfile[] = [];

    get projectProfileOptions(): IDropDownOption[] {
        return this.projectProfileList.map((projectProfile) => ({
            label: projectProfile.name,
            value: projectProfile._id,
        }));
    }

    async getProjectProfileList() {
        const response = (await commonService.getProjectProfileList(
            projectModule.selectedProjectId,
        )) as unknown as IBodyResponse<IGetListResponse<IProfile>>;
        if (response.success) {
            this.projectProfileList = response.data?.items || [];
            const projectProfileDefault = this.projectProfileList.find(
                (projectProfile) => projectProfile.isDefaultSelect,
            );

            if (projectProfileDefault) {
                projectGroupModule.setProjectProfileDefault({
                    label: projectProfileDefault?.name || '',
                    value: projectProfileDefault?._id || '',
                });
            } else {
                projectGroupModule.setProjectProfileDefault({});
            }
        }
    }
}
