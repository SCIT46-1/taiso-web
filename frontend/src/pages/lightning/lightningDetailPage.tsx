import { useNavigate, useParams } from "react-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import lightningService, {
  LightningDetailGetResponse,
  Member,
} from "../../services/lightningService";
import KakaoMapRoute from "../../components/KakaoMap";
import KakaolocationMap from "../../components/KakaolocationMap";
import UserImage from "../../components/UserImage";

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

function Modal({ id, title, children, actions }: ModalProps) {
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

  // 로딩 상태 관리
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [loadingLightningClose, setLoadingLightningClose] = useState(false);
  const [loadingLightningEnd, setLoadingLightningEnd] = useState(false);
  const [loadingAcceptLightning, setLoadingAcceptLightning] = useState(false);
  // 참여자 승인/거절 버튼 별 로딩 상태 (key: lightningUserId)
  const [loadingParticipantActions, setLoadingParticipantActions] = useState<
    Record<number, { accept: boolean; reject: boolean }>
  >({});

  const fetchLightningDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await lightningService.getLightningDetail(
        Number(lightningId)
      );
      setLightningDetail(data);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen grid grid-cols-[2fr,1fr] gap-4 max-w-screen-lg">
      {/* 상단 지도 영역 */}

      <div className="col-span-2 ">
        {lightningDetail?.route.routePoints && (
          <KakaoMapRoute routePoints={lightningDetail.route.routePoints} />
        )}
      </div>

      {/* 하단 좌측 상세정보 영역 */}
      <div className="flex flex-col p-4 rounded-xl shadow-2xl border border-base-300">
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
        <div className="mb-4">
          <div>
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
          <div>
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
          <div>{lightningDetail?.address}</div>
          <KakaolocationMap
            lat={lightningDetail?.latitude}
            lng={lightningDetail?.longitude}
          />
        </div>
        <div className="mb-4">번개 참여자 목록</div>
        <div className="mb-4">
          참여 완료까지{" "}
          {lightningDetail?.capacity &&
            lightningDetail.member &&
            lightningDetail.capacity - lightningDetail.member.length}{" "}
          명
        </div>
        {!user && <div>로그인 후 이용해주세요</div>}
        {user &&
          !isCreator &&
          !currentMemberStatus &&
          lightningDetail?.recruitType === "참가형" && (
            <button
              className="btn mb-4"
              onClick={() => showModal("join-modal")}
            >
              참여하기
            </button>
          )}
        {lightningDetail?.recruitType === "수락형" &&
          user &&
          !isCreator &&
          !currentMemberStatus && (
            <button
              className="btn mb-4"
              onClick={() => showModal("accept-modal")}
            >
              신청하기
            </button>
          )}
        {user &&
          !isCreator &&
          currentMemberStatus?.participantStatus === "완료" && (
            <button
              className="btn mb-4"
              onClick={() => showModal("leave-modal")}
            >
              번개 나가기
            </button>
          )}
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
                className="flex flex-row items-center gap-2 p-2 border-b"
              >
                <UserImage profileImage={member.memberProfileImg as string} />
                <div>{member.memberNickname}</div>
                <div>{member.role}</div>
              </div>
            ))}
        </div>
        {isCreator && (
          <div className="w-full mt-4">
            {lightningDetail?.member
              .filter((member) => member.participantStatus === "신청대기")
              .map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border"
                >
                  <div>{member.memberNickname}</div>
                  <div className="flex gap-2">
                    <button
                      className="btn"
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
                      className="btn"
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
                className="btn mt-4"
                disabled={loadingLightningClose}
                onClick={() => showModal("lightning-close-modal")}
              >
                {loadingLightningClose ? "마감 중..." : "번개 마감하기"}
              </button>
            )}
            {(lightningDetail?.status === "마감" ||
              lightningDetail?.status === "강제마감") && (
              <button
                className="btn mt-4"
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
            <h3 className="font-medium mb-2">신청 대기 중인 참가자</h3>
            {lightningDetail?.member
              .filter((member) => member.participantStatus === "신청대기")
              .map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 border-b"
                >
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
          <div>
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
