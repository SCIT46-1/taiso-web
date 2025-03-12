import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import lightningService, {
  CompletedLightningResponse,
  LightningDetailGetResponse,
} from "../../services/lightningService";
import weatherService, {
  WeatherInfo,
  HourlyWeatherInfo,
} from "../../services/weatherService";
import { getWeatherIcon } from "../../utils/weatherIcons";
import KakaoMapRoute from "../../components/KakaoMap";
import KakaolocationMap from "../../components/KakaolocationMap";
import LightningSummaryInfo from "../../components/LightningSummaryInfo";
import bookmarkService from "../../services/bookmarkService";
import GlobalModal from "../../components/GlobalModal";
import UserProfileCard from "../../components/UserProfileCard";
import DateFormat from "../../components/DateFormat";

interface WeatherDisplayProps {
  weatherInfo: WeatherInfo | null;
  hourlyForecasts: HourlyWeatherInfo[];
  forecastDate: string;
  isLoading: boolean;
}

function WeatherDisplay({
  weatherInfo,
  hourlyForecasts,
  isLoading,
}: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full gap-2">
        <div>날씨정보 로딩중</div>
        <span className="loading loading-dots loading-sm"></span>
      </div>
    );
  }

  if (!weatherInfo && hourlyForecasts.length === 0) {
    return (
      <div className="p-2 rounded shadow-sm text-gray-500 text-sm">
        3일 이내의 날씨 정보만 제공합니다!
      </div>
    );
  }

  return (
    <div className="rounded-lg p-2">
      {/* Hourly Forecast */}
      {hourlyForecasts.length > 0 && (
        <div>
          <div className="overflow-x-auto">
            <div className="flex space-x-3 pb-2">
              {hourlyForecasts.map((forecast, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 flex-shrink-0 w-28 shadow-sm flex flex-col items-center border border-gray-200"
                >
                  <div className="text-sm font-bold">{forecast.time}</div>
                  <div className="text-2xl my-1">
                    {getWeatherIcon(
                      forecast.weatherInfo.skyCondition,
                      forecast.weatherInfo.precipitation
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {forecast.weatherInfo.temperature}°C
                  </div>
                  <div className="text-xs text-gray-500">
                    강수확률 : {forecast.weatherInfo.precipitationProbability}%
                  </div>
                  <div className="text-xs text-gray-500">
                    풍속 : {forecast.weatherInfo.windSpeed}m/s
                  </div>
                  <div className="text-xs text-gray-500">
                    습도 : {forecast.weatherInfo.humidity}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LightningDetailPage() {
  const { lightningId } = useParams();
  const [lightningDetail, setLightningDetail] =
    useState<LightningDetailGetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 로딩 및 날씨 관련 상태
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingLightningClose, setLoadingLightningClose] = useState(false);
  const [loadingLightningEnd, setLoadingLightningEnd] = useState(false);
  const [loadingAcceptLightning, setLoadingAcceptLightning] = useState(false);
  const [loadingParticipantActions, setLoadingParticipantActions] = useState<
    Record<number, { accept: boolean; reject: boolean }>
  >({});

  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [hourlyForecasts, setHourlyForecasts] = useState<HourlyWeatherInfo[]>([]);
  const [forecastDate, setForecastDate] = useState<string>("");
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [bookmarkLoading, setBookmarkLoading] = useState<boolean>(false);
  const [completedLightning, setCompletedLightning] =
    useState<CompletedLightningResponse | null>(null);
  
  // 날씨 데이터 캐시
  const weatherCache = useRef<{
    [key: string]: {
      weatherInfo: WeatherInfo | null;
      hourlyForecasts: HourlyWeatherInfo[];
      forecastDate: string;
    };
  }>({});

  const fetchLightningDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await lightningService.getLightningDetail(Number(lightningId));
      setLightningDetail(data);

      if (data && "bookmarked" in data) {
        setIsBookmarked(!!data.bookmarked);
      }

      if (data) {
        fetchWeatherData(data);
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [lightningId]);

  useEffect(() => {
    fetchLightningDetail();
  }, [fetchLightningDetail]);

  const isCreator = useMemo(() => {
    return lightningDetail && user
      ? lightningDetail.creator.userId === user.userId
      : false;
  }, [lightningDetail, user]);

  const currentMemberStatus = useMemo(() => {
    return lightningDetail && user
      ? lightningDetail.member.find(
          (member) => member.lightningUserId === user.userId
        ) || null
      : null;
  }, [lightningDetail, user]);

  const closeModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.close();
  };

  const showModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    modal?.showModal();
  };

  const handleJoinLightning = async () => {
    setLoadingJoin(true);
    try {
      await lightningService.joinLightning(Number(lightningId));
      const completedData = await lightningService.getCompletedLightnings(Number(lightningId));
      setCompletedLightning(completedData);
      closeModal("join-modal");
      showModal("join-complete-modal");
    } catch (error) {
      console.error("참여 실패:", error);
      closeModal("join-modal");
      showModal("join-fail-modal");
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleLeaveLightning = async () => {
    setLoadingLeave(true);
    try {
      await lightningService.leaveLightning(Number(lightningId));
      closeModal("leave-modal");
      await fetchLightningDetail();
    } catch (error) {
      console.error("나가기 실패:", error);
      closeModal("leave-modal");
      showModal("leave-fail-modal");
    } finally {
      setLoadingLeave(false);
    }
  };

  const handleJoinLightningComplete = () => {
    closeModal("join-complete-modal");
    fetchLightningDetail();
  };

  const handleAcceptParticipant = async (lightningUserId: number) => {
    setLoadingParticipantActions((prev) => ({
      ...prev,
      [lightningUserId]: { ...prev[lightningUserId], accept: true },
    }));
    try {
      await lightningService.acceptLightning(Number(lightningId), lightningUserId);
      fetchLightningDetail();
    } catch (error) {
      console.error("수락 실패:", error);
    } finally {
      setLoadingParticipantActions((prev) => ({
        ...prev,
        [lightningUserId]: { ...prev[lightningUserId], accept: false },
      }));
    }
  };

  const handleRejectParticipant = async (lightningUserId: number) => {
    setLoadingParticipantActions((prev) => ({
      ...prev,
      [lightningUserId]: { ...prev[lightningUserId], reject: true },
    }));
    try {
      await lightningService.rejectLightning(Number(lightningId), lightningUserId);
      fetchLightningDetail();
    } catch (error) {
      console.error("거절 실패:", error);
    } finally {
      setLoadingParticipantActions((prev) => ({
        ...prev,
        [lightningUserId]: { ...prev[lightningUserId], reject: false },
      }));
    }
  };

  const handleLightningClose = async () => {
    setLoadingLightningClose(true);
    try {
      await lightningService.closeLightning(Number(lightningId));
      fetchLightningDetail();
      closeModal("lightning-close-modal");
    } catch (error) {
      console.error("마감 실패:", error);
    } finally {
      setLoadingLightningClose(false);
    }
  };

  const handleLightningEnd = async () => {
    setLoadingLightningEnd(true);
    try {
      await lightningService.endLightning(Number(lightningId));
      fetchLightningDetail();
      closeModal("lightning-end-modal");
    } catch (error) {
      console.error("종료 실패:", error);
    } finally {
      setLoadingLightningEnd(false);
    }
  };

  const handleAcceptLightning = async () => {
    setLoadingAcceptLightning(true);
    try {
      await lightningService.joinLightning(Number(lightningId));
      closeModal("accept-modal");
      await fetchLightningDetail();
      showModal("accept-complete-modal");
    } catch (error) {
      console.error("신청 실패:", error);
    } finally {
      setLoadingAcceptLightning(false);
    }
  };

  const fetchWeatherData = async (detail: LightningDetailGetResponse) => {
    if (!detail.eventDate || !detail.latitude || !detail.longitude || !detail.duration) {
      return;
    }

    const cacheKey = `${detail.eventDate}-${detail.latitude}-${detail.longitude}-${detail.duration}`;
    setWeatherLoading(true);

    try {
      const eventDateTime = new Date(detail.eventDate);
      const eventEndDateTime = new Date(eventDateTime.getTime() + detail.duration * 60 * 1000);

      const formattedDate = eventDateTime.toISOString().split("T")[0];
      const startHours = eventDateTime.getHours().toString().padStart(2, "0");
      const startMinutes = eventDateTime.getMinutes().toString().padStart(2, "0");
      const formattedStartTime = `${startHours}:${startMinutes}`;

      const startHour = eventDateTime.getHours();
      const endHour = eventEndDateTime.getHours();
      const adjustedEndHour = eventEndDateTime.getMinutes() === 0 ? Math.max(0, endHour - 1) : endHour;

      if (weatherCache.current[cacheKey]) {
        const cachedData = weatherCache.current[cacheKey];
        setWeatherInfo(cachedData.weatherInfo);
        setHourlyForecasts(cachedData.hourlyForecasts);
        setForecastDate(cachedData.forecastDate);
        setWeatherLoading(false);
        return;
      }

      const nx = Math.floor(detail.latitude);
      const ny = Math.floor(detail.longitude);

      const { hourlyForecasts, date } =
        await weatherService.getHourlyWeatherForecasts(formattedDate, nx, ny);

      const filteredForecasts = hourlyForecasts.filter((forecast) => {
        const forecastHour = parseInt(forecast.time.split(":")[0]);
        return forecastHour >= startHour && forecastHour <= adjustedEndHour;
      });

      let forecasts = [];
      if (filteredForecasts.length === 0) {
        const closestToStart = hourlyForecasts.reduce((closest, current) => {
          const currentHour = parseInt(current.time.split(":")[0]);
          const closestHour = parseInt(closest.time.split(":")[0]);
          return Math.abs(currentHour - startHour) < Math.abs(closestHour - startHour)
            ? current
            : closest;
        }, hourlyForecasts[0]);

        const closestToEnd = hourlyForecasts.reduce((closest, current) => {
          const currentHour = parseInt(current.time.split(":")[0]);
          const closestHour = parseInt(closest.time.split(":")[0]);
          return Math.abs(currentHour - endHour) < Math.abs(closestHour - endHour)
            ? current
            : closest;
        }, hourlyForecasts[0]);

        forecasts = closestToStart.time !== closestToEnd.time ? [closestToStart, closestToEnd] : [closestToStart];
      } else {
        filteredForecasts.sort((a, b) => parseInt(a.time.split(":")[0]) - parseInt(b.time.split(":")[0]));
        forecasts = filteredForecasts;
      }

      setHourlyForecasts(forecasts);
      setForecastDate(date);

      const weatherData = await weatherService.getWeatherForecast(
        formattedDate,
        formattedStartTime,
        nx,
        ny
      );
      setWeatherInfo(weatherData);

      weatherCache.current[cacheKey] = {
        weatherInfo: weatherData,
        hourlyForecasts: forecasts,
        forecastDate: date,
      };
    } catch (error) {
      console.error("날씨 정보 불러오기 실패:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate("/auth/landing", { state: { from: `/lightning/${lightningId}` } });
      return;
    }

    setBookmarkLoading(true);
    try {
      if (!isBookmarked) {
        await bookmarkService.bookmarkLightning(Number(lightningId));
      } else {
        await bookmarkService.deleteBookmarkLightning(Number(lightningId));
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("북마크 작업 실패:", error);
      if (
        error instanceof Error &&
        "response" in (error as any) &&
        (error as any).response?.status === 401
      ) {
        navigate("/auth/landing", { state: { from: `/lightning/${lightningId}` } });
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen grid grid-cols-[2fr,1fr] gap-4 max-w-screen-lg mb-10 no-animation">
      {/* 상단 지도 영역 */}
      <div className="col-span-2 shadow-sm relative">
        {lightningDetail?.route.routePoints && (
          <KakaoMapRoute routePoints={lightningDetail.route.routePoints} />
        )}
      </div>

      {/* 하단 좌측 영역 */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl shadow-md border border-base-300">
          <div className="collapse collapse-arrow">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-xl font-medium flex items-center">
              <span className="ml-1 text-lg font-semibold">간략 번개</span>
            </div>
            <div className="collapse-content">
              <div className="flex flex-col p-2">
                <LightningSummaryInfo
                  gender={lightningDetail?.gender || ""}
                  level={lightningDetail?.level || ""}
                  recruitType={lightningDetail?.recruitType || ""}
                  bikeType={lightningDetail?.bikeType || ""}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 날씨 정보 아코디언 */}
        <div className="rounded-xl shadow-md border border-base-300">
          {lightningDetail?.status !== "종료" &&
            lightningDetail?.status !== "취소" && (
              <div className="collapse collapse-arrow">
                <input type="checkbox" />
                <div className="collapse-title text-xl font-medium flex items-center">
                  <span className="ml-1 text-lg font-semibold">날씨 정보</span>
                  {weatherLoading ? (
                    <span className="loading loading-dots loading-sm ml-2"></span>
                  ) : (
                    hourlyForecasts.length > 0 && <span className="text-sm font-normal"></span>
                  )}
                </div>
                <div className="collapse-content">
                  <WeatherDisplay
                    weatherInfo={weatherInfo}
                    hourlyForecasts={hourlyForecasts}
                    forecastDate={forecastDate}
                    isLoading={weatherLoading}
                  />
                </div>
              </div>
            )}
        </div>

        {/* 상세 정보 영역 */}
        <div className="rounded-xl shadow-md border border-base-300 p-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{lightningDetail?.title}</h2>
            <div className="flex flex-wrap gap-1">
              {lightningDetail?.lightningTag &&
                lightningDetail.lightningTag.map((tag, index) => (
                  <span key={index} className="badge badge-primary badge-outline">
                    {tag}
                  </span>
                ))}
            </div>
            <div className="divider -mt-1 -mb-[0.5px]"></div>
            <UserProfileCard
              userProfileId={lightningDetail?.creator.userId}
              userProfileImg={lightningDetail?.creator.creatorProfileImg || ""}
              userProfileName={lightningDetail?.creator.creatorNickname || ""}
              userRole="creator"
            />
            <p className="mt-2">{lightningDetail?.description}</p>
            <div className="mt-2 font-bold">주의사항</div>
            <p>주의사항 내용을 여기에 작성합니다.</p>
          </div>
        </div>
      </div>

      {/* 하단 우측 영역: 참여자 및 지도 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-xl border border-base-300 p-1 self-start relative">
          <div className="mb-4 mt-1">
            {user && (
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                className="absolute top-6 right-6 z-10"
              >
                {bookmarkLoading ? (
                  <span></span>
                ) : isBookmarked ? (
                  <svg
                    data-slot="icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="size-6"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    data-slot="icon"
                    fill="none"
                    strokeWidth="1.75"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="size-6 text-gray-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                    ></path>
                  </svg>
                )}
              </button>
            )}
            <div className="font-semibold text-lg my-1">
              {lightningDetail?.eventDate
                ? new Date(lightningDetail.eventDate).toLocaleString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
            <div className="flex gap-1 text-m text-gray-500 mb-4">
              <p className="font-semibold">
                {lightningDetail?.duration
                  ? lightningDetail.duration >= 60
                    ? `${Math.floor(lightningDetail.duration / 60)}시간${
                        lightningDetail.duration % 60 > 0
                          ? ` ${lightningDetail.duration % 60}분`
                          : ""
                      }`
                    : `${lightningDetail.duration}분`
                  : ""}
              </p>
              <p> 동안 진행됩니다!</p>
            </div>
            <div className="divider"></div>
            <KakaolocationMap
              lat={lightningDetail?.latitude}
              lng={lightningDetail?.longitude}
            />
            <div className="flex text-base mt-4">
              <svg
                data-Slot="icon"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="size-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {lightningDetail?.address}
            </div>
          </div>
          {!user && (
            <div
              className="btn w-full no-animation btn-primary"
              onClick={() =>
                navigate("/auth/landing", { state: { from: `/lightning/${lightningId}` } })
              }
            >
              로그인 하고 번개 참여하기!
            </div>
          )}
          {user &&
            !isCreator &&
            !currentMemberStatus &&
            lightningDetail?.recruitType === "참가형" &&
            lightningDetail?.status === "모집" && (
              <button
                className="btn w-full no-animation btn-primary"
                onClick={() => showModal("join-modal")}
              >
                참여하기
              </button>
          )}
          {lightningDetail?.recruitType === "수락형" &&
            user &&
            !isCreator &&
            !currentMemberStatus &&
            lightningDetail?.status === "모집" && (
              <button
                className="btn w-full"
                onClick={() => showModal("accept-modal")}
              >
                신청하기
              </button>
          )}
          {user &&
            !isCreator &&
            currentMemberStatus?.participantStatus === "완료" &&
            lightningDetail?.status === "모집" && (
              <button
                className="btn w-full no-animation"
                onClick={() => showModal("leave-modal")}
              >
                번개 나가기
              </button>
          )}
          {user &&
            !isCreator &&
            (lightningDetail?.status === "마감" ||
              lightningDetail?.status === "강제마감") &&
            currentMemberStatus == null && (
              <button className="btn w-full no-animation btn-disabled">
                이미 마감되었습니다!
              </button>
          )}
          {user &&
            !isCreator &&
            currentMemberStatus?.participantStatus === "탈퇴" && (
              <button className="btn w-full no-animation btn-disabled">
                탈퇴한 번개에 참여할 수 없습니다!
              </button>
          )}
          {user &&
            !isCreator &&
            currentMemberStatus?.participantStatus === "신청대기" && (
              <button className="btn w-full no-animation btn-disabled">
                신청 대기 중입니다!
              </button>
          )}
          <div className="divider mt-0"></div>
          <div className="mr-auto ml-3 font-bold">
            참가 인원 마감까지{" "}
            {lightningDetail?.capacity &&
              lightningDetail.currentMemberCount &&
              lightningDetail.capacity - lightningDetail.currentMemberCount}
            명 남았습니다!
          </div>
          <div className="mr-auto ml-3 mt-1 text-sm text-gray-500 mb-2">
            참가인원 {lightningDetail?.currentMemberCount} / {lightningDetail?.capacity}
          </div>
          <progress
            className="progress progress-primary w-[95%] mt-1 mb-4"
            value={lightningDetail?.currentMemberCount}
            max={lightningDetail?.capacity}
          ></progress>
          <div className="w-full">
            {lightningDetail?.member
              .filter(
                (member) =>
                  member.participantStatus === "완료" ||
                  member.participantStatus === "승인"
              )
              .map((member, index) => (
                <UserProfileCard
                  key={index}
                  userProfileId={member.lightningUserId}
                  userProfileImg={member.memberProfileImg || ""}
                  userProfileName={member.memberNickname || ""}
                  userRole={member.role === "번개생성자" ? "creator" : "member"}
                />
            ))}
          </div>
          {isCreator && lightningDetail?.recruitType === "수락형" && (
            <div className="w-full mt-4">
              <h3 className="font-bold mb-2 ml-2">신청 대기 중인 참가자</h3>
              {lightningDetail?.member
                .filter((member) => member.participantStatus === "신청대기")
                .map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-2">
                    <UserProfileCard
                      userProfileId={member.lightningUserId}
                      userProfileImg={member.memberProfileImg || ""}
                      userProfileName={member.memberNickname || ""}
                      userRole="member"
                    />
                    <div className="flex gap-2 ml-auto items-center">
                      <button
                        className="btn btn-sm"
                        disabled={loadingParticipantActions[member.lightningUserId]?.accept}
                        onClick={() => handleAcceptParticipant(member.lightningUserId)}
                      >
                        {loadingParticipantActions[member.lightningUserId]?.accept
                          ? "수락 중..."
                          : "수락하기"}
                      </button>
                      <button
                        className="btn btn-sm"
                        disabled={loadingParticipantActions[member.lightningUserId]?.reject}
                        onClick={() => handleRejectParticipant(member.lightningUserId)}
                      >
                        {loadingParticipantActions[member.lightningUserId]?.reject
                          ? "거절 중..."
                          : "거절하기"}
                      </button>
                    </div>
                  </div>
              ))}
              {lightningDetail?.status === "모집" && (
                <button
                  className="btn mt-4 w-full"
                  disabled={loadingLightningClose}
                  onClick={() => showModal("lightning-close-modal")}
                >
                  {loadingLightningClose ? "마감 중..." : "번개 마감하기"}
                </button>
              )}
              {(lightningDetail?.status === "마감" ||
                lightningDetail?.status === "강제마감") && (
                <button
                  className="btn mt-4 w-full"
                  disabled={loadingLightningEnd}
                  onClick={() => showModal("lightning-end-modal")}
                >
                  {loadingLightningEnd ? "종료 중..." : "번개 종료하기"}
                </button>
              )}
            </div>
          )}
          {isCreator && lightningDetail?.recruitType === "참가형" && (
            <div className="w-full mt-4">
              {lightningDetail?.status === "모집" && (
                <button
                  className="btn mt-4 w-full"
                  disabled={loadingLightningClose}
                  onClick={() => showModal("lightning-close-modal")}
                >
                  {loadingLightningClose ? "마감 중..." : "번개 마감하기"}
                </button>
              )}
              {(lightningDetail?.status === "마감" ||
                lightningDetail?.status === "강제마감") && (
                <button
                  className="btn mt-4 w-full"
                  disabled={loadingLightningEnd}
                  onClick={() => showModal("lightning-end-modal")}
                >
                  {loadingLightningEnd ? "종료 중..." : "번개 종료하기"}
                </button>
              )}
            </div>
          )}
          {!isCreator && lightningDetail?.recruitType === "수락형" && (
            <div className="w-full mt-4">
              <h3 className="font-bold mb-2 ml-2">신청 대기 중인 참가자</h3>
              {lightningDetail?.member
                .filter((member) => member.participantStatus === "신청대기")
                .map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-2">
                    <UserProfileCard
                      userProfileId={member.lightningUserId}
                      userProfileImg={member.memberProfileImg || ""}
                      userProfileName={member.memberNickname || ""}
                      userRole="member"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium">{member.memberNickname}</div>
                      <div className="text-sm text-gray-500">
                        상태: {member.participantStatus}
                      </div>
                    </div>
                  </div>
              ))}
              {lightningDetail?.member.filter(
                (member) => member.participantStatus === "신청대기"
              ).length === 0 && (
                <div className="text-center py-2 text-gray-500">
                  신청 대기 중인 참가자가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 모달 컴포넌트들 */}
      <GlobalModal
        id="join-modal"
        imgType="success"
        title="번개 참여 확인"
        middle="번개에 참여하시겠어요?"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingJoin}
              onClick={handleJoinLightning}
            >
              {loadingJoin ? "참여 중..." : "참여하기"}
            </button>
            <button className="btn" onClick={() => closeModal("join-modal")}>
              취소
            </button>
          </>
        }
      >
        <>
          <h4 className="mb-2">아래 사항을 확인해 주세요!</h4>
          <div className="bg-gray-100 border px-16 py-6 w-full max-w-full my-6 flex flex-col gap-1">
            <div className="flex gap-1 items-center">
              <svg
                data-Slot="icon"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-5 h-5 stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {lightningDetail?.eventDate
                ? DateFormat(lightningDetail?.eventDate)
                : lightningDetail?.eventDate}
            </div>
            <div className="flex gap-1 items-center">
              <svg
                data-Slot="icon"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-5 h-5 stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                />
              </svg>
              {lightningDetail?.duration
                ? lightningDetail.duration >= 60
                  ? `${Math.floor(lightningDetail.duration / 60)}시간${
                      lightningDetail.duration % 60 > 0
                        ? ` ${lightningDetail.duration % 60}분`
                        : ""
                    }`
                  : `${lightningDetail.duration}분`
                : ""}
            </div>
            <div className="flex gap-1 items-center">
              <svg
                data-Slot="icon"
                fill="none"
                strokeWidth={1.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-5 h-5 stroke-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {lightningDetail?.address}
            </div>
          </div>
          <p className="text-red-500">
            한번 참여 후 번개를 나가면 다시 참여 할 수 없어요!
          </p>
        </>
      </GlobalModal>

      <GlobalModal
        id="join-fail-modal"
        imgType="error"
        title="번개 참여 실패"
        actions={
          <button className="btn" onClick={() => closeModal("join-fail-modal")}>
            닫기
          </button>
        }
      >
        <p>
          번개 참여에 실패했습니다.
          <br />
          이미 참여한 번개이거나, 이미 완료된 번개입니다!
        </p>
      </GlobalModal>
      <GlobalModal
        id="leave-modal"
        imgType="warning"
        title="번개 나가기"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingLeave}
              onClick={handleLeaveLightning}
            >
              {loadingLeave ? "나가는 중..." : "진짜 나가기"}
            </button>
            <button className="btn" onClick={() => closeModal("leave-modal")}>
              취소
            </button>
          </>
        }
      >
        <p>정말 번개를 나가시겠습니까?</p>
        <br />
        <p className="text-red-500">한 번 나가면 재신청이 불가합니다.</p>
      </GlobalModal>
      <GlobalModal
        id="leave-fail-modal"
        imgType="error"
        title="번개 나가기 실패"
        actions={
          <button className="btn" onClick={() => closeModal("leave-fail-modal")}>
            닫기
          </button>
        }
      >
        <p>
          나가기 실패했습니다.
          <br />
          참여하지 않은 번개이거나, 이미 나간 번개입니다!
        </p>
      </GlobalModal>
      <GlobalModal
        id="lightning-close-modal"
        imgType="warning"
        title="번개 모집 마감"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingLightningClose}
              onClick={handleLightningClose}
            >
              {loadingLightningClose ? "마감 중..." : "마감하기"}
            </button>
            <button className="btn" onClick={() => closeModal("lightning-close-modal")}>
              취소
            </button>
          </>
        }
      >
        <p>번개 모집을 마감하시겠습니까?</p>
        <br />
        <p className="text-red-500">
          한번 마감한 번개는 다시 활성화 할 수 없습니다!
        </p>
      </GlobalModal>
      <GlobalModal
        id="lightning-end-modal"
        imgType="question"
        title="번개 종료"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingLightningEnd}
              onClick={handleLightningEnd}
            >
              {loadingLightningEnd ? "종료 중..." : "번개 종료하기"}
            </button>
            <button className="btn" onClick={() => closeModal("lightning-end-modal")}>
              취소
            </button>
          </>
        }
      >
        <p>번개를 종료하시겠습니까?</p>
      </GlobalModal>
      <GlobalModal
        id="accept-modal"
        imgType="question"
        title="번개 참여 신청"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingAcceptLightning}
              onClick={handleAcceptLightning}
            >
              {loadingAcceptLightning ? "신청 중..." : "신청하기"}
            </button>
            <button className="btn" onClick={() => closeModal("accept-modal")}>
              취소
            </button>
          </>
        }
      >
        <>
          <p>번개에 참여하시겠습니까?</p>
          <p className="text-red-500">
            본 번개는 수락형 번개로,
            <br />
            신청 이후 생성자가 수락해야지만 참여할 수 있습니다.
          </p>
        </>
      </GlobalModal>
      <GlobalModal
        id="join-complete-modal"
        imgType="success"
        title="참여 완료!"
        actions={
          <button className="btn" onClick={handleJoinLightningComplete}>
            닫기
          </button>
        }
      >
        <KakaolocationMap
          lat={lightningDetail?.latitude}
          lng={lightningDetail?.longitude}
        />
        <div className="bg-gray-100 border p-6 w-full max-w-full my-6 flex flex-col gap-1">
          <div>번개 제목 : {completedLightning?.routeTitle}</div>
          <div className="flex gap-1 items-center">
            <svg
              data-Slot="icon"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-5 h-5 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {lightningDetail?.eventDate
              ? DateFormat(lightningDetail?.eventDate)
              : lightningDetail?.eventDate}
          </div>
          <div className="flex gap-1 items-center">
            <svg
              data-Slot="icon"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-5 h-5 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
              />
            </svg>
            {lightningDetail?.duration
              ? lightningDetail.duration >= 60
                ? `${Math.floor(lightningDetail.duration / 60)}시간${
                    lightningDetail.duration % 60 > 0
                      ? ` ${lightningDetail.duration % 60}분`
                      : ""
                  }`
                : `${lightningDetail.duration}분`
              : ""}
          </div>
          <div className="flex gap-1 items-center">
            <svg
              data-Slot="icon"
              fill="none"
              strokeWidth={1.5}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-5 h-5 stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
            {lightningDetail?.address}
          </div>
          <div>정원 : {completedLightning?.capacity}</div>
          <div>참여자 : {completedLightning?.currentParticipants}</div>
          <div>
            참여 일시 :{" "}
            {completedLightning?.joinDate
              ? DateFormat(completedLightning?.joinDate)
              : completedLightning?.joinDate}
          </div>
        </div>
        <p>번개에 참여하셨습니다!</p>
      </GlobalModal>
    </div>
  );
}

export default LightningDetailPage;