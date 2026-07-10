export function isDueDateToday(dueDate, frequencyStr) {
    const today = new Date();

    if (frequencyStr === 'semanal' || frequencyStr === 'WEEKLY') {
        const dayOfWeek = today.getDay() + 1;
        return Number(dueDate) === dayOfWeek;
    }

    if (frequencyStr === 'mensal' || frequencyStr === 'MONTHLY') {
        const dayOfMonth = today.getDate();
        return Number(dueDate) === dayOfMonth;
    }

    if (frequencyStr === 'anual' || frequencyStr === 'YEARLY') {
        if (dueDate && dueDate.day && dueDate.month) {
            const day = today.getDate();
            const month = today.getMonth() + 1;
            return Number(dueDate.day) === day && Number(dueDate.month) === month;
        }
    }

    return false;
}