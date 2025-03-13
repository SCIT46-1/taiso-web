import { useState, useRef, useEffect } from "react";

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // 선택된 날짜가 변경될 때 그 날짜가 화면에 보이도록 스크롤 조정
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedIndex = dateList.findIndex(
        (date) => date.toDateString() === selectedDate.toDateString()
      );

      if (selectedIndex !== -1) {
        const dateElement = container.children[selectedIndex] as HTMLElement;
        if (dateElement) {
          const scrollPosition =
            dateElement.offsetLeft -
            container.offsetWidth / 2 +
            dateElement.offsetWidth / 2;
          container.scrollTo({ left: scrollPosition, behavior: "smooth" });
        }
      }
    }
  }, [selectedDate, dateList]);

  return (
    <div className="relative w-screen left-[50%] right-[50%] py-3 -mx-[50vw]">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-1 px-2 sm:px-0 max-w-screen-xl mx-auto h-20">
        {/* 왼쪽 화살표 버튼 (과거 이동) */}
        <button
          className="btn btn-circle btn-sm sm:btn-md no-animation bg-gray-300 hover:bg-gray-400"
          onClick={handlePrev}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
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

        {/* 날짜 목록 - 스크롤 가능한 컨테이너 */}
        <div
          ref={scrollContainerRef}
          className="flex items-center overflow-x-auto hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dateList.map((d, index) => {
            const dayIndex = d.getDay(); // 0: 일, 1: 월, ... 6: 토
            const dayNumber = d.getDate();
            const dayName = daysOfWeek[dayIndex];

            // 기본 원형 스타일
            let circleClasses =
              "w-16 sm:w-24 h-14 sm:h-16 flex items-center justify-center rounded-full transition-colors no-animation mx-1 p-2";
            // 토/일이면 텍스트 빨간색, 아니면 검정색
            const textClasses = isWeekend(d) ? "text-red-500" : "text-black";

            // 선택된 날짜면 파란색 배경, 흰색 글자, 굵은 글씨 적용
            if (selectedDate.toDateString() === d.toDateString()) {
              circleClasses += " bg-blue-400 text-white font-bold no-animation";
            }

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer h-20 justify-center"
                onClick={() => handleDateClick(d)}
              >
                <div className={`${circleClasses} ${textClasses} flex flex-col items-center justify-center`}>
                  <span className="text-sm sm:text-base">{dayNumber}</span>

                  <div className={`${textClasses} text-xs sm:text-sm`}>
                    {dayName}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* 오른쪽 화살표 버튼 (미래 이동) */}
        <button
          className="btn btn-circle btn-sm sm:btn-md no-animation  bg-gray-300 hover:bg-gray-400"
          onClick={handleNext}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
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
    </div>
  );
}

// 스크롤바를 숨기기 위한 CSS 추가
// 이 부분은 전역 CSS 파일에 추가하거나 인라인 스타일로 적용 가능
const style = document.createElement("style");
style.textContent = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);

export default DateCarousel;
