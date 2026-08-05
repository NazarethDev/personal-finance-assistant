export const parseYearMonthQuery = (queryYear, queryMonth) => {
    const now = new Date();
    
    let year = parseInt(queryYear, 10);
    let month = parseInt(queryMonth, 10);


    if (isNaN(year)) {
        year = now.getFullYear();
    }
    
    if (isNaN(month)) {
        month = now.getMonth() + 1;
    }

    return { year, month };
};


export const getMonthDateRange = (year, month) => {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];

    return { startDate, endDate };
};

export const getDashboardDateRanges = (queryYear, queryMonth) => {
    const { year, month } = parseYearMonthQuery(queryYear, queryMonth);

    const { startDate: currentStart, endDate: currentEnd } = getMonthDateRange(year, month);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const { startDate: previousStart, endDate: previousEnd } = getMonthDateRange(prevYear, prevMonth);

    return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
    };
};