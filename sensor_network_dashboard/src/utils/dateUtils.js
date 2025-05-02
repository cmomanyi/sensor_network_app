// utils/dateUtils.js
export const filterLast30Days = (data) => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - 30);

    return data.filter((s) => new Date(s.timestamp) > cutoff);
};
