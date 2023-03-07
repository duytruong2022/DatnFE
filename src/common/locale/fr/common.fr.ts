export const common = {
    error: {
        systemError: 'Something went wrong, please try again later',
        accessModuleError: 'You are not authorized to access the system',
        password: 'Password must contain at least one number, one character',
    },
    filterForm: {
        search: 'Search',
        reset: 'Reset',
        sort: 'Sort',
        create: 'Create',
        ldap: 'LDAP',
    },
    importFiles: {
        rules: {
            empty: 'The file field is required',
            tooBig: 'File size must be less than 10GB',
            invalidType: {
                pdf: 'File format must be PDF',
                excel: 'File format must be excel',
                xml: 'File format must be xml',
            },
        },
        template: 'Download template',
        upload: 'Upload',
        cancel: 'Cancel',
        import: 'Import CSV',
    },
    uploadMultiple: {
        dropFileHereOr: 'Drop file here or',
        clickToUpload: 'click to upload',
        sizeLimit: 'File size must be less than {size}MB',
        uploadFile: 'Upload',
    },
    noData: 'No data',
    uploadFile: {
        rules: {
            tooBig: 'File size must be little than 20Mb',
        },
    },
};
