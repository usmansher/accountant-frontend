const PERMISSIONS = {
    LIST_ACCOUNT: 'list-account',
    CREATE_ACCOUNT: 'create-account',
    EDIT_ACCOUNT: 'edit-account',
    DELETE_ACCOUNT: 'delete-account',
    VIEW_CHART_OF_ACCOUNTS: 'view-chart-of-accounts',

    LIST_ENTRIES: 'list-entries',
    EDIT_ENTRIES: 'edit-entries',
    DELETE_ENTRIES: 'delete-entries',
    CREATE_ENTRIES: 'create-entries',

    LIST_ENTRY_TYPES: 'list-entry-types',
    EDIT_ENTRY_TYPES: 'edit-entry-types',
    DELETE_ENTRY_TYPES: 'delete-entry-types',
    CREATE_ENTRY_TYPES: 'create-entry-types',

    LIST_TAGS: 'list-tags',
    EDIT_TAGS: 'edit-tags',
    DELETE_TAGS: 'delete-tags',
    CREATE_TAGS: 'create-tags',

    REPORTS_TRIAL_BALANCE: 'reports-trial-balance',
    REPORTS_BALANCE_SHEET: 'reports-balance-sheet',
    REPORTS_PROFIT_LOSS: 'reports-profit-loss',
    REPORTS_RECONCILIATION: 'reports-reconciliation',

    LIST_USER: 'list-user',
    CREATE_USER: 'create-user',
    EDIT_USER: 'edit-user',
    DELETE_USER: 'delete-user',
}

 const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      permission: null,
      needActiveAccount: false,
      children: [],
    },
    {
      label: 'List All Accounts',
      href: '/account',
      permission: 'list-account',
      needActiveAccount: false,
      children: [],
    },
    {
      label: 'Chart of Accounts',
      href: '/account/dashboard',
      permission: 'view-chart-of-accounts',
      needActiveAccount: true,
      children: [],
    },
    {
      label: 'Entries',
      href: '/account/entries',
      permission: 'list-entries',
      needActiveAccount: true,
      children: [],
    },
    {
      label: 'Entry Types',
      href: '/account/entrytypes',
      permission: 'list-entry-types',
      needActiveAccount: true,
      children: [],
    },
    {
      label: 'Tags',
      href: '/account/tags',
      permission: 'list-tags',
      needActiveAccount: true,
      children: [],
    },
    {
      label: 'Reports',
      href: '#',
      permission: null,
      needActiveAccount: true,
      children: [
        {
          label: 'Trial Balance',
          href: '/account/reports/trialbalance',
          permission: 'reports-trial-balance',
          needActiveAccount: true,
        },
        {
          label: 'Profit & Loss',
          href: '/account/reports/profitloss',
          permission: 'reports-profit-loss',
          needActiveAccount: true,
        },
        {
          label: 'Balance Sheet',
          href: '/account/reports/balancesheet',
          permission: 'reports-balance-sheet',
          needActiveAccount: true,
        },
        {
          label: 'Reconciliation',
          href: '/account/reports/reconciliation',
          permission: 'reports-reconciliation',
          needActiveAccount: true,
        },
      ],
    },
  ]
  
export { navItems, PERMISSIONS }
