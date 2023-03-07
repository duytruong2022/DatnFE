import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';

export const validateGroupSchema = yup.object({
    name: yup.string().trim().required().max(INPUT_TEXT_MAX_LENGTH).label('groupName'),
    description: yup.string().trim().required().max(TEXTAREA_MAX_LENGTH),
    profileId: yup.string().trim().max(TEXTAREA_MAX_LENGTH).label('profile'),
});

export enum UpdateGroupAction {
    ASSIGN_USER = 'assignUser',
    REMOVE_USER = 'removeUser',
    ASSIGN_PROJECT = 'assignProject',
    REMOVE_PROJECT = 'removeProject',
}

export const importConstellationGroupHeader = ['name', 'securityProfile', 'description'];
export const importView3DGroupHeader = ['name', 'viewer3dProfile', 'description'];
