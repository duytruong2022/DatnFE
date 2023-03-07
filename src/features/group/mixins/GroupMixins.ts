import { AccessModules } from './../../../common/constants';
import { UpdateGroupAction } from '../constant';
import { UtilMixins } from '@/mixins/utilMixins';
import { mixins } from 'vue-class-component';
import { LIMIT_PER_PAGE } from '@/common/constants';
import localStorageAuthService from '@/common/authStorage';
import { IBodyResponse, IDropDownOption, IGetListResponse } from '@/common/interfaces';
import { IProfile } from '@/features/3D-viewer-profile/interfaces';
import { ISecurityProfile } from '@/features/security-profile/interface';
import { commonService } from '@/common/services/common.service';
import { groupModule } from '../store';

export class GroupMixin extends mixins(UtilMixins) {
    UpdateGroupAction = UpdateGroupAction;
    LIMIT_PER_PAGE = LIMIT_PER_PAGE;
    AccessModules = AccessModules;

    profileList: ISecurityProfile[] | IProfile[] = [];

    get currentAccessModule(): AccessModules {
        return localStorageAuthService.getSelectedAccessModule();
    }

    get profileOptions(): IDropDownOption[] {
        let options: IDropDownOption[] = [];
        options = this.profileList.map((securityProfile) => ({
            label: securityProfile.name,
            value: securityProfile._id,
        }));

        return options;
    }

    getProfileName(profileId: string) {
        const profile = this.profileOptions.find((profile) => {
            return profile.value == profileId;
        });

        return profile ? profile.label : '';
    }

    async getProfileList() {
        const response =
            this.currentAccessModule === AccessModules.SPACIALYTIC_CONSTELLATION
                ? ((await commonService.getSecurityProfileList()) as unknown as IBodyResponse<
                      IGetListResponse<ISecurityProfile>
                  >)
                : ((await commonService.getViewer3dProfileList()) as unknown as IBodyResponse<
                      IGetListResponse<ISecurityProfile>
                  >);
        if (response.success) {
            this.profileList = response.data?.items || [];
            const securityProfileDefault = this.profileList.find(
                (profile) => profile.isDefaultSelect,
            );

            if (securityProfileDefault) {
                groupModule.setSecurityProfileDefault({
                    label: securityProfileDefault?.name || '',
                    value: securityProfileDefault?._id || '',
                });
            } else {
                groupModule.setSecurityProfileDefault({});
            }
        }
    }
}
