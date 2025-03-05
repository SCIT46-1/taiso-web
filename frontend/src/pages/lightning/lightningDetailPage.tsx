import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import lightningService, {
  LightningDetailGetResponse,
} from "../../services/lightningService";
import weatherService, {
  WeatherInfo,
  HourlyWeatherInfo,
} from "../../services/weatherService";
import { getWeatherIcon } from "../../utils/weatherIcons";
import KakaoMapRoute from "../../components/KakaoMap";
import KakaolocationMap from "../../components/KakaolocationMap";
import UserImage from "../../components/UserImage";

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

interface WeatherDisplayProps {
  weatherInfo: WeatherInfo | null;
  hourlyForecasts: HourlyWeatherInfo[];
  forecastDate: string;
  isLoading: boolean;
}

function WeatherDisplay({
  weatherInfo,
  hourlyForecasts,
  forecastDate,
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

  // // Get the event time range for display
  // const startTime = hourlyForecasts.length > 0 ? hourlyForecasts[0].time : "";
  // const endTime =
  //   hourlyForecasts.length > 0
  //     ? hourlyForecasts[hourlyForecasts.length - 1].time
  //     : "";
  // const timeRangeDisplay =
  //   hourlyForecasts.length > 0 ? `${startTime} ~ ${endTime}` : "";

  return (
    <div className="rounded-lg p-2">
      <div className="font-bold text-lg mb-3">({forecastDate})</div>

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

export function Modal({ id, title, children, actions }: ModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">{actions}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

function LightningDetailPage() {
  const { lightningId } = useParams();
  const [lightningDetail, setLightningDetail] =
    useState<LightningDetailGetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // 로딩 상태 및 날씨 관련 상태
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingLightningClose, setLoadingLightningClose] = useState(false);
  const [loadingLightningEnd, setLoadingLightningEnd] = useState(false);
  const [loadingAcceptLightning, setLoadingAcceptLightning] = useState(false);
  const [loadingParticipantActions, setLoadingParticipantActions] = useState<
    Record<number, { accept: boolean; reject: boolean }>
  >({});

  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [hourlyForecasts, setHourlyForecasts] = useState<HourlyWeatherInfo[]>(
    []
  );
  const [forecastDate, setForecastDate] = useState<string>("");
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);

  // 날씨 데이터 캐시: key를 이벤트 날짜, 위치, 지속시간 조합으로 생성
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
      const data = await lightningService.getLightningDetail(
        Number(lightningId)
      );
      setLightningDetail(data);

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
      await lightningService.acceptLightning(
        Number(lightningId),
        lightningUserId
      );
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
      await lightningService.rejectLightning(
        Number(lightningId),
        lightningUserId
      );
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
    if (
      !detail.eventDate ||
      !detail.latitude ||
      !detail.longitude ||
      !detail.duration
    ) {
      return;
    }

    // 캐시 키 생성: 이벤트 날짜, 위치, 지속시간 조합
    const cacheKey = `${detail.eventDate}-${detail.latitude}-${detail.longitude}-${detail.duration}`;

    setWeatherLoading(true);

    try {
      const eventDateTime = new Date(detail.eventDate);
      const eventEndDateTime = new Date(
        eventDateTime.getTime() + detail.duration * 60 * 1000
      );

      const formattedDate = eventDateTime.toISOString().split("T")[0];
      const startHours = eventDateTime.getHours().toString().padStart(2, "0");
      const startMinutes = eventDateTime
        .getMinutes()
        .toString()
        .padStart(2, "0");
      const formattedStartTime = `${startHours}:${startMinutes}`;

      const startHour = eventDateTime.getHours();
      const endHour = eventEndDateTime.getHours();
      const adjustedEndHour =
        eventEndDateTime.getMinutes() === 0
          ? Math.max(0, endHour - 1)
          : endHour;

      // 캐시에 저장된 값이 있다면 바로 상태에 할당
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
          return Math.abs(currentHour - startHour) <
            Math.abs(closestHour - startHour)
            ? current
            : closest;
        }, hourlyForecasts[0]);

        const closestToEnd = hourlyForecasts.reduce((closest, current) => {
          const currentHour = parseInt(current.time.split(":")[0]);
          const closestHour = parseInt(closest.time.split(":")[0]);
          return Math.abs(currentHour - endHour) <
            Math.abs(closestHour - endHour)
            ? current
            : closest;
        }, hourlyForecasts[0]);

        if (closestToStart.time !== closestToEnd.time) {
          forecasts = [closestToStart, closestToEnd];
        } else {
          forecasts = [closestToStart];
        }
      } else {
        filteredForecasts.sort((a, b) => {
          return (
            parseInt(a.time.split(":")[0]) - parseInt(b.time.split(":")[0])
          );
        });
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

      // 캐시에 결과 저장
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen grid grid-cols-[2fr,1fr] gap-4 max-w-screen-lg mb-10">
      {/* 상단 지도 영역 */}

      <div className="col-span-2 ">
        {lightningDetail?.route.routePoints && (
          <KakaoMapRoute routePoints={lightningDetail.route.routePoints} />
        )}
      </div>

      {/* 하단 좌측 상세정보 영역 */}
      <div className="flex flex-col p-4 rounded-xl shadow-2xl border border-base-300">
        <div className="">
          {lightningDetail?.status !== "종료" &&
            lightningDetail?.status !== "취소" && (
              <WeatherDisplay
                weatherInfo={weatherInfo}
                hourlyForecasts={hourlyForecasts}
                forecastDate={forecastDate}
                isLoading={weatherLoading}
              />
            )}
        </div>
        <h2 className="text-2xl font-bold mb-2">{lightningDetail?.title}</h2>
        <div className="flex flex-wrap gap-1">
          <div className="badge badge-primary badge-outline">
            {lightningDetail?.region}
          </div>
          <div className="badge badge-primary badge-outline">
            {lightningDetail?.bikeType}
          </div>
          <div className="badge badge-primary badge-outline">
            {lightningDetail?.level}
          </div>
          <div className="badge badge-primary badge-outline">
            {lightningDetail?.gender}
          </div>
          {lightningDetail?.lightningTag &&
            lightningDetail.lightningTag.map((tag, index) => (
              <span key={index} className="badge badge-primary badge-outline">
                {tag}
              </span>
            ))}
        </div>
        <div className="divider mt-2"></div>
        <div className="flex items-center gap-2">
          <UserImage
            profileImage={lightningDetail?.creator.creatorProfileImg as string}
          />

          <span>{lightningDetail?.creator.creatorNickname}</span>
        </div>
        <p className="mt-2">{lightningDetail?.description}</p>
        <div className="mt-4">{lightningDetail?.recruitType}</div>
        <div className="mt-2 font-bold">주의사항</div>
        <p>주의사항 내용을 여기에 작성합니다.</p>
      </div>

      {/* 하단 우측 참여자 및 지도 영역 */}
      <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-2xl border border-base-300">
        <div className="mb-4 mt-2">
          <div className="font-semibold">
            {lightningDetail?.eventDate
              ? new Date(lightningDetail.eventDate).toLocaleString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}{" "}
          </div>
          <div className="text-sm text-gray-500 mb-4">
            {lightningDetail?.duration
              ? lightningDetail.duration >= 60
                ? `${Math.floor(lightningDetail.duration / 60)}시간${
                    lightningDetail.duration % 60 > 0
                      ? ` ${lightningDetail.duration % 60}분`
                      : ""
                  }`
                : `${lightningDetail.duration}분`
              : ""}{" "}
            동안 진행됩니다.
          </div>
          <KakaolocationMap
            lat={lightningDetail?.latitude}
            lng={lightningDetail?.longitude}
          />
          <div className="font-semibold text-sm mt-1">
            {lightningDetail?.address}
          </div>
        </div>
        {!user && (
          <div
            className="btn  w-full no-animation btn-primary"
            onClick={() =>
              navigate("/auth/landing", {
                state: { from: `/lightning/${lightningId}` },
              })
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
            <button className="btn  w-full no-animation btn-disabled">
              이미 마감되었습니다!
            </button>
          )}
        {user &&
          !isCreator &&
          currentMemberStatus?.participantStatus === "탈퇴" && (
            <button className="btn  w-full no-animation btn-disabled">
              탈퇴한 번개에 참여할 수 없습니다!
            </button>
          )}
        {user &&
          !isCreator &&
          currentMemberStatus?.participantStatus === "신청대기" && (
            <button className="btn  w-full no-animation btn-disabled">
              신청 대기 중입니다!
            </button>
          )}
        <div className="divider"></div>
        <div className=" mr-auto ml-3 font-bold">
          참가 인원 마감까지{" "}
          {lightningDetail?.capacity &&
            lightningDetail.currentMemberCount &&
            lightningDetail.capacity - lightningDetail.currentMemberCount}
          명 남았습니다!
        </div>
        <div className="mr-auto ml-3 mt-1 text-sm text-gray-500 mb-2">
          참가인원 {lightningDetail?.currentMemberCount} /{" "}
          {lightningDetail?.capacity}{" "}
        </div>

        <div className="w-full">
          {lightningDetail?.member
            .filter(
              (member) =>
                member.participantStatus === "완료" ||
                member.participantStatus === "승인"
            )
            .map((member, index) => (
              <div
                key={index}
                className="flex flex-row items-center gap-2 p-2 "
              >
                <UserImage profileImage={member.memberProfileImg as string} />
                <div className="font-medium ">{member.memberNickname}</div>
                {member.role === "번개생성자" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,215,0,1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-crown"
                  >
                    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                    <path d="M5 21h14" />
                  </svg>
                )}
              </div>
            ))}
        </div>
        {isCreator && lightningDetail?.recruitType === "수락형" && (
          <div className="w-full mt-4">
            <h3 className="font-bold mb-2 ml-2">신청 대기 중인 참가자</h3>
            {lightningDetail?.member
              .filter((member) => member.participantStatus === "신청대기")
              .map((member, index) => (
                <div key={index} className="flex items-center gap-2 p-2">
                  <UserImage profileImage={member.memberProfileImg as string} />
                  <div>{member.memberNickname}</div>
                  <div className="flex gap-2 ml-auto items-center">
                    <button
                      className="btn btn-sm"
                      disabled={
                        loadingParticipantActions[member.lightningUserId]
                          ?.accept
                      }
                      onClick={() =>
                        handleAcceptParticipant(member.lightningUserId)
                      }
                    >
                      {loadingParticipantActions[member.lightningUserId]?.accept
                        ? "수락 중..."
                        : "수락하기"}
                    </button>
                    <button
                      className="btn btn-sm"
                      disabled={
                        loadingParticipantActions[member.lightningUserId]
                          ?.reject
                      }
                      onClick={() =>
                        handleRejectParticipant(member.lightningUserId)
                      }
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
                <div key={index} className="flex items-center gap-2 p-2 ">
                  <UserImage profileImage={member.memberProfileImg as string} />
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

      {/* 모달 컴포넌트들 */}
      <Modal
        id="join-modal"
        title="정말로 참여하시겠어요?"
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
          <p>아래 사항을 다시 한 번 확인해 주세요!</p>
          <div>{lightningDetail?.eventDate} 시에 열리는 번개입니다.</div>
          <div className="text-sm text-gray-500">
            {lightningDetail?.duration
              ? lightningDetail.duration >= 60
                ? `${Math.floor(lightningDetail.duration / 60)}시간${
                    lightningDetail.duration % 60 > 0
                      ? ` ${lightningDetail.duration % 60}분`
                      : ""
                  }`
                : `${lightningDetail.duration}분`
              : ""}{" "}
            동안 진행됩니다.
          </div>
          <div>{lightningDetail?.address}에서 진행됩니다.</div>
          <div className="mt-2 font-bold">주의사항</div>
          <p>주의사항 내용을 작성합니다.</p>
        </>
      </Modal>

      <Modal
        id="join-complete-modal"
        title="참여 완료!"
        actions={
          <button className="btn" onClick={handleJoinLightningComplete}>
            닫기
          </button>
        }
      >
        <p>번개에 참여하셨습니다!</p>
      </Modal>

      <Modal
        id="join-fail-modal"
        title="번개 참여 실패"
        actions={
          <button className="btn" onClick={() => closeModal("join-fail-modal")}>
            닫기
          </button>
        }
      >
        <p>
          번개 참여에 실패했습니다. 이미 참여한 번개이거나, 이미 완료된
          번개입니다!
        </p>
      </Modal>

      <Modal
        id="leave-modal"
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
        <p>정말 번개를 나가시겠습니까? 한 번 나가면 재신청이 불가합니다.</p>
      </Modal>

      <Modal
        id="leave-fail-modal"
        title="번개 나가기 실패"
        actions={
          <button
            className="btn"
            onClick={() => closeModal("leave-fail-modal")}
          >
            닫기
          </button>
        }
      >
        <p>
          나가기 실패했습니다. 참여하지 않은 번개이거나, 이미 나간 번개입니다!
        </p>
      </Modal>

      <Modal
        id="lightning-close-modal"
        title="번개 마감"
        actions={
          <>
            <button
              className="btn btn-primary"
              disabled={loadingLightningClose}
              onClick={handleLightningClose}
            >
              {loadingLightningClose ? "마감 중..." : "번개 마감하기"}
            </button>
            <button
              className="btn"
              onClick={() => closeModal("lightning-close-modal")}
            >
              취소
            </button>
          </>
        }
      >
        <p>
          번개를 마감하시겠습니까? 한번 마감한 번개는 다시 활성화 할 수
          없습니다!
        </p>
      </Modal>

      <Modal
        id="lightning-end-modal"
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
            <button
              className="btn"
              onClick={() => closeModal("lightning-end-modal")}
            >
              취소
            </button>
          </>
        }
      >
        <p>번개를 종료하시겠습니까?</p>
      </Modal>

      <Modal
        id="accept-modal"
        title="번개 신청"
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
          <p>
            본 번개는 수락형 번개로, 신청 이후 생성자가 수락해야지만 참여할 수
            있습니다.
          </p>
        </>
      </Modal>

      <Modal
        id="accept-complete-modal"
        title="신청 완료!"
        actions={
          <button
            className="btn"
            onClick={() => closeModal("accept-complete-modal")}
          >
            닫기
          </button>
        }
      >
        <p>번개에 신청하셨습니다!</p>
      </Modal>
    </div>
  );
}

export default LightningDetailPage;
