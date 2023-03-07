import { INPUT_TEXT_MAX_LENGTH, TEXTAREA_MAX_LENGTH } from '@/common/constants';
import yup from '@/plugins/yup';

export enum UpdateProjectGroupAction {
    ASSIGN_USER = 'assignUser',
    REMOVE_USER = 'removeUser',
}

export const validateProjectGroupSchema = yup.object({
    name: yup.string().trim().required().max(INPUT_TEXT_MAX_LENGTH),
    description: yup.string().trim().required().max(TEXTAREA_MAX_LENGTH),
    projectProfileId: yup
        .string()
        .trim()
        .nullable()
        .max(TEXTAREA_MAX_LENGTH)
        .label('projectProfile'),
});

export const importProjectGroupHeader = ['name', 'projectProfile', 'description'];
