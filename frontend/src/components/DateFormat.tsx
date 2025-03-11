export function DateFormat(isoString: string): string {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // 요일 배열 (일요일부터 토요일까지)
    const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = weekDays[date.getDay()];

    return `${year}.${month}.${day}(${dayOfWeek}) ${hours}시 ${minutes}분`;
}

export default DateFormat;