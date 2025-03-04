import { useState } from "react";

interface DateCarouselProps {
  /** 한 화면에 표시할 날짜 개수 (기본값 7) */
  range?: number;
  /** 날짜가 선택되었을 때 상위 컴포넌트에 전달하는 콜백 */
  onDateChange?: (date: Date) => void;
}

function DateCarousel({ range = 7, onDateChange }: DateCarouselProps) {
  /**
   * offset:
   *  - 0이면 오늘부터 range일을 표시
   *  - 양수를 증가시키면 오늘보다 미래 날짜
   *  - 음수를 감소시키면 오늘보다 과거 날짜
   *    -> 과거 날짜는 표시하지 않도록 음수가 되지 않게 처리
   */
  const [offset, setOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayInKorea());

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  // 한국 타임존(Asia/Seoul) 기준의 현재 날짜를 반환하는 함수
  function getTodayInKorea(): Date {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );
  }

  /** range만큼 날짜 배열을 생성하되, offset으로 시작점을 조절 */
  const getDates = (): Date[] => {
    const today = getTodayInKorea();
    const dates: Date[] = [];
    for (let i = 0; i < range; i++) {
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + offset + i);
      dates.push(newDate);
    }
    return dates;
  };

  /** 과거로 이동하지 않도록 offset을 최소 0으로 제한 */
  const handlePrev = () => {
    setOffset((prev) => Math.max(prev - 1, 0));
  };

  /** 미래로는 무제한 이동 가능 */
  const handleNext = () => {
    setOffset((prev) => prev + 1);
  };

  /** 요일이 토/일인지 판별 */
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay(); // 0: 일요일, 6: 토요일
    return day === 0 || day === 6;
  };

  const dateList = getDates();

  /** 날짜 클릭 시 선택한 날짜를 로컬 및 상위 상태로 업데이트 */
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      {/* 왼쪽 화살표 버튼 (과거 이동) */}
      <button className="btn btn-circle no-animation" onClick={handlePrev}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* 날짜 목록 */}
      <div className="flex items-center space-x-4">
        {dateList.map((d, index) => {
          const dayIndex = d.getDay(); // 0: 일, 1: 월, ... 6: 토
          const dayNumber = d.getDate();
          const dayName = daysOfWeek[dayIndex];

          // 기본 원형 스타일
          let circleClasses =
            "w-10 h-10 flex items-center justify-center rounded-full transition-colors no-animation";
          // 토/일이면 텍스트 빨간색, 아니면 검정색
          const textClasses = isWeekend(d) ? "text-red-500" : "text-black";

          // 선택된 날짜면 파란색 배경, 흰색 글자, 굵은 글씨 적용
          if (selectedDate.toDateString() === d.toDateString()) {
            circleClasses += " bg-blue-500 text-white font-bold no-animation";
          }

          return (
            <div
              key={index}
              className="flex flex-col items-center space-y-1 cursor-pointer"
              onClick={() => handleDateClick(d)}
            >
              <div className={`${circleClasses} ${textClasses}`}>
                {dayNumber}
              </div>
              <div className={textClasses}>{dayName}</div>
            </div>
          );
        })}
      </div>

      {/* 오른쪽 화살표 버튼 (미래 이동) */}
      <button className="btn btn-circle no-animation" onClick={handleNext}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

export default DateCarousel;
