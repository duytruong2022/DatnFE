export enum DefaultSelectCompanyValue {
    BLANK = 'BLANK_SELECT_VALUE',
    ALL_COMPANY = 'ALL_COMPANY_SELECT_VALUE',
}

export const DefaultSelectCompany = [
    {
        label: 'accessLog.filterForm.company.selectBlank',
        value: DefaultSelectCompanyValue.BLANK.toString(),
    },
    {
        label: 'accessLog.filterForm.company.selectAllCompany',
        value: DefaultSelectCompanyValue.ALL_COMPANY.toString(),
    },
];
