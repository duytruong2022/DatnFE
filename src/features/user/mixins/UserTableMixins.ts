import { DEFAULT_FIRST_PAGE, LIMIT_PER_PAGE } from '@/common/constants';
import {
    showConfirmPopUpFunction,
    showSuccessNotificationFunction,
    showErrorNotificationFunction,
} from '@/common/helpers';
import { IELColumnSort } from '@/common/interfaces';
import { IProject } from '@/features/project/interfaces';
import { UtilMixins } from '@/mixins/utilMixins';
import i18n from '@/plugins/vue-i18n';
import { ElLoading } from 'element-plus';
import { mixins, setup } from 'vue-class-component';
import { setupDelete } from '../composition/userList';
import { UpdateProjectUserAction } from '../constant';
import { IUser } from '../interfaces';
import { userService } from '../services/api.services';
import { userModule } from '../store';

export class UserTableMixin extends mixins(UtilMixins) {
    LIMIT_PER_PAGE = LIMIT_PER_PAGE;
    UpdateProjectUserAction = UpdateProjectUserAction;
    deleteAction = setup(() => setupDelete());

    get userList() {
        return userModule.userList;
    }

    get totalItems(): number {
        return userModule.totalUsers;
    }

    get selectedPage(): number {
        return userModule.userListQueryString?.page || DEFAULT_FIRST_PAGE;
    }

    async onSortChange(column: IELColumnSort): Promise<void> {
        const loading = ElLoading.service({
            target: '.content',
        });
        userModule.setUserListQueryString({
            orderBy: column?.prop,
            orderDirection: column.order,
        });
        await userModule.getUserList();
        loading.close();
    }

    async handlePaginate(selectedPage: number): Promise<void> {
        userModule.setUserListQueryString({
            page: selectedPage,
        });

        const loading = ElLoading.service({
            target: '.content',
        });
        await userModule.getUserList();
        loading.close();
    }

    onClickRow(user: IUser) {
        userModule.setSelectedUser(user);
        userModule.setIsShowUserForm(true);
    }

    onClickButtonChangePassword(user: IUser) {
        userModule.setSelectedUser(user);
        userModule.setIsShowSetPasswordForm(true);
    }

    async onClickButtonDelete(id: string): Promise<void> {
        await this.deleteAction.deleteUser(id);
    }

    onClickButtonContact(user: IUser) {
        userModule.setSelectedUser(user);
        userModule.setIsShowContactForm(true);
    }

    async updateUserProjects(
        project: IProject,
        action: UpdateProjectUserAction,
    ): Promise<void> {
        const isConfirm = await showConfirmPopUpFunction(
            i18n.global.t(`user.message.${action}.confirmAsk`, {
                projectName: `${project.name ? project.name : ''}`,
            }) as string,
            i18n.global.t(`user.message.${action}.title`) as string,
            {},
        );
        if (isConfirm) {
            const loading = ElLoading.service({
                target: '.assign-project-user-popup',
            });

            const response = await userService.updateUserProjectIds(
                userModule.selectedUser?._id as string,
                {
                    projectId: project._id as string,
                    action,
                },
            );
            loading.close();
            if (response.success) {
                await this.handleSuccess(action);
                loading.close();
            } else {
                await this.handleError(response.message as string);
                loading.close();
            }
        }
    }

    async handleSuccess(action: UpdateProjectUserAction) {
        showSuccessNotificationFunction(
            i18n.global.t(`user.message.${action}.success`) as string,
        );
        userModule.getProjectAssignedUserList();
        userModule.getProjectNotAssignUserList();
    }

    async handleError(message: string) {
        showErrorNotificationFunction(message);
        userModule.getProjectAssignedUserList();
        userModule.getProjectNotAssignUserList();
    }
}
