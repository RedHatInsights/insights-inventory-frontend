export const defaultFilters = [
    {
        staleFilter: ['fresh', 'stale']
    }, {
        registeredWithFilter: ['insights']
    }
];

export const isEmpty = (check) => !check || check?.length === 0;

export const generateFilter = (status, source, tagsFilter, filterbyName) => ([
    !isEmpty(status) && {
        staleFilter: Array.isArray(status) ? status : [status]
    },
    !isEmpty(tagsFilter) && {
        tagFilters: Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter]
    },
    !isEmpty(source) && {
        registeredWithFilter: Array.isArray(source) ? source : [source]
    },
    !isEmpty(filterbyName) && {
        value: 'hostname_or_id',
        filter: Array.isArray(filterbyName) ? filterbyName[0] : filterbyName
    },
    (!isEmpty(status) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) && isEmpty(source) && {
        registeredWithFilter: []
    },
    (!isEmpty(source) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) && isEmpty(status) && {
        staleFilter: []
    }
].filter(Boolean));
