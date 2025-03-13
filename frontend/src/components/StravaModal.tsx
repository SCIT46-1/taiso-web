import { useEffect, useState } from "react";
import stravaService, {
  StravaActivity,
  StravaActivityPagedResponse,
} from "../services/stravaService";

interface StravaModalProps {
  modalId: string;
  lightningId: number;
  onSuccess: () => void;
}

function StravaModal({ modalId, lightningId, onSuccess }: StravaModalProps) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

  // 활동 데이터 불러오기
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await stravaService.getStravaActivities(page, 10);

        setActivities(data.content);
        setError(null);
      } catch (error) {
        console.error("Error fetching strava activities:", error);
        setError("스트라바 활동을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page]);

  // 스트라바 활동을 번개에 연결
  const handleLinkActivity = async () => {
    if (!selectedActivity) return;

    try {
      setLinking(true);
      await stravaService.linkActivityToLightning(
        selectedActivity,
        lightningId
      );
      onSuccess();
      closeModal();
    } catch (error) {
      console.error("Error linking activity:", error);
      setError("스트라바 활동 연결에 실패했습니다.");
    } finally {
      setLinking(false);
    }
  };

  // 모달 닫기
  const closeModal = () => {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  // 스트라바 인증 페이지로 이동
  const goToStravaAuth = async () => {
    try {
      const url = await stravaService.getStravaLink();
      window.location.href = url;
    } catch (error) {
      console.error("Error getting Strava link:", error);
      setError("스트라바 연결에 실패했습니다.");
    }
  };

  // 시간 포맷팅 (초 -> 시:분:초)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours > 0 ? hours + "시간 " : ""}${minutes}분 ${secs}초`;
  };

  // 거리 포맷팅 (미터 -> km)
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + "km";
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <dialog id={modalId} className="modal">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">스트라바 활동 연결하기</h3>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {activities.length === 0 && !loading ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-center">
              스트라바 활동이 없거나 연결되지 않았습니다.
            </p>
            <button onClick={goToStravaAuth} className="btn btn-primary">
              스트라바 계정 연결하기
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center my-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>선택</th>
                      <th>활동명</th>
                      <th>날짜</th>
                      <th>타입</th>
                      <th>거리</th>
                      <th>시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr
                        key={activity.id}
                        className={
                          selectedActivity === activity.id
                            ? "bg-primary bg-opacity-20"
                            : ""
                        }
                      >
                        <td>
                          <input
                            type="radio"
                            name="activity-select"
                            className="radio radio-primary"
                            checked={selectedActivity === activity.id}
                            onChange={() => setSelectedActivity(activity.id)}
                          />
                        </td>
                        <td>{activity.name}</td>
                        <td>{formatDate(activity.start_date)}</td>
                        <td>{activity.type}</td>
                        <td>{formatDistance(Number(activity.distance))}</td>
                        <td>{formatDuration(activity.moving_time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-center gap-2 my-4">
              <button
                className="btn btn-outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
              >
                이전
              </button>
              <span className="flex items-center px-4">페이지 {page}</span>
              <button
                className="btn btn-outline"
                onClick={() => setPage(page + 1)}
                disabled={activities.length < 10 || loading}
              >
                다음
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="btn btn-primary"
                onClick={handleLinkActivity}
                disabled={!selectedActivity || linking}
              >
                {linking ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "활동 연결하기"
                )}
              </button>
            </div>
          </>
        )}

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>닫기</button>
      </form>
    </dialog>
  );
}

export default StravaModal;
