export const PageName = 'notification';

export enum NotificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}
export enum NotificationTypes {
    REGISTER = 'register',
    RESET_PASSWORD = 'reset_password',
    LDAP_IMPORT = 'ldap_import',
}
