import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import lightningService, {
  LightningDetailGetResponse,
  Member,
} from "../../services/lightningService";
import KakaoMapRoute from "../../components/KakaoMap";
import KakaolocationMap from "../../components/KakaolocationMap";

function LightningDetailPage() {
  const { lightningId } = useParams();
  const [lightningDetail, setLightningDetail] =
    useState<LightningDetailGetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [currentMemberStatus, setCurrentMemberStatus] = useState<Member | null>(
    null
  );
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const fetchLightningDetail = async () => {
    setIsLoading(true);
    try {
      const data = await lightningService.getLightningDetail(
        Number(lightningId)
      );
      setLightningDetail(data);
      setIsCreator(data?.creator.userId === user?.userId);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLightningDetail();
  }, [lightningId]);

  useEffect(() => {
    if (lightningDetail && user) {
      const current = lightningDetail.member.find(
        (member) => member.lightningUserId === user.userId
      );
      setCurrentMemberStatus(current || null);
    }
  }, [lightningDetail, user]);

  // 번개 참여 핸들러
  const handleJoinLightning = async () => {
    try {
      await lightningService.joinLightning(Number(lightningId));
      // 참여 모달 닫기
      (document.getElementById("join-modal") as HTMLDialogElement)?.close();
      // 참여 완료 모달 열기
      (
        document.getElementById("join-complete-modal") as HTMLDialogElement
      )?.showModal();
      fetchLightningDetail();
    } catch (error) {
      console.error("참여 실패:", error);
      (document.getElementById("join-modal") as HTMLDialogElement)?.close();
      (
        document.getElementById("join-fail-modal") as HTMLDialogElement
      )?.showModal();
    }
  };

  // 번개 나가기 핸들러
  const handleLeaveLightning = async () => {
    try {
      await lightningService.leaveLightning(Number(lightningId));
      // 나가기 성공 시 leave 모달을 닫고 새로 데이터를 불러옴
      (document.getElementById("leave-modal") as HTMLDialogElement)?.close();
      fetchLightningDetail();
    } catch (error) {
      console.error("나가기 실패:", error);
      // 에러 발생 시 leave 모달을 닫은 후, 나가기 실패 모달을 보여줌
      (document.getElementById("leave-modal") as HTMLDialogElement)?.close();
      (
        document.getElementById("leave-fail-modal") as HTMLDialogElement
      )?.showModal();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-red-200 w-screen max-w-screen-lg grid grid-cols-[2fr,1fr] gap-4">
      {/* 상단 컴포넌트: 전체 2열 */}
      <div className="bg-blue-200 col-span-2">
        {lightningDetail?.route.routePoints && (
          <KakaoMapRoute routePoints={lightningDetail.route.routePoints} />
        )}
      </div>

      {/* 하단 좌측 컴포넌트 */}
      <div className="flex flex-col bg-purple-400 p-4">
        <h2 className="text-xl font-bold">{lightningDetail?.title}</h2>
        {lightningDetail?.lightningTag && (
          <div className="flex gap-2">
            {lightningDetail.lightningTag.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-200 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2">{lightningDetail?.description}</p>
        <div className="flex items-center mt-4 gap-2">
          <img
            src={lightningDetail?.creator.creatorProfileImg as string}
            alt="creatorProfileImage"
            className="w-10 h-10 rounded-full bg-slate-500"
          />
          <span>{lightningDetail?.creator.creatorNickname}</span>
        </div>
        <div className="mt-4">{lightningDetail?.recruitType}</div>
        <div className="mt-2 font-bold">주의사항</div>
        <p>주의사항 내용을 여기에 작성합니다.</p>
      </div>

      {/* 하단 우측 컴포넌트 */}
      <div className="flex flex-col items-center justify-center bg-sky-200 p-4">
        <div className="mb-4">
          <div>{lightningDetail?.eventDate} 시작</div>
          <div>{lightningDetail?.duration} 분</div>
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
        {user && !isCreator && !currentMemberStatus && (
          <button
            className="btn mb-4"
            onClick={() => {
              (
                document.getElementById("join-modal") as HTMLDialogElement
              )?.showModal();
            }}
          >
            참여하기
          </button>
        )}
        {user &&
          !isCreator &&
          currentMemberStatus?.participantStatus === "완료" && (
            <button
              className="btn mb-4"
              onClick={() => {
                (
                  document.getElementById("leave-modal") as HTMLDialogElement
                )?.showModal();
              }}
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
                <img
                  src={member.memberProfileImg as string}
                  alt="memberProfileImage"
                  className="w-10 h-10 rounded-full bg-slate-500"
                />
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
                    <button className="btn">수락하기</button>
                    <button className="btn">거절하기</button>
                  </div>
                </div>
              ))}
            <button className="btn mt-4">번개 마감하기</button>
          </div>
        )}
      </div>

      {/* DaisyUI 모달 컴포넌트들 */}

      {/* 참여 확인 모달 */}
      <dialog id="join-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">정말로 참여하시겠어요?</h3>
          <p className="py-4">아래 사항을 다시 한 번 확인해 주세요!</p>
          <div>{lightningDetail?.eventDate} 시에 열리는 번개입니다.</div>
          <div>{lightningDetail?.duration} 분 동안 진행됩니다.</div>
          <div>{lightningDetail?.address}에서 진행됩니다.</div>
          <div className="mt-2 font-bold">주의사항</div>
          <p>주의사항 내용을 작성합니다.</p>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleJoinLightning}>
              참여하기
            </button>
            <button
              className="btn"
              onClick={() => {
                (
                  document.getElementById("join-modal") as HTMLDialogElement
                )?.close();
              }}
            >
              취소
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 참여 완료 모달 */}
      <dialog id="join-complete-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">참여 완료!</h3>
          <p className="py-4">번개에 참여하셨습니다!</p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => {
                (
                  document.getElementById(
                    "join-complete-modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              닫기
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 참여 실패 모달 */}
      <dialog id="join-fail-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 참여 실패</h3>
          <p className="py-4">
            번개 참여에 실패했습니다. 이미 참여한 번개이거나, 이미 완료된
            번개입니다!
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => {
                (
                  document.getElementById(
                    "join-fail-modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              닫기
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 나가기 모달 */}
      <dialog id="leave-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 나가기</h3>
          <p className="py-4">
            정말 번개를 나가시겠습니까? 한 번 나가면 재신청이 불가합니다.
          </p>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleLeaveLightning}>
              진짜 나가기
            </button>
            <button
              className="btn"
              onClick={() => {
                (
                  document.getElementById("leave-modal") as HTMLDialogElement
                )?.close();
              }}
            >
              취소
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* 나가기 실패 모달 */}
      <dialog id="leave-fail-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 나가기 실패</h3>
          <p className="py-4">
            나가기 실패했습니다. 참여하지 않은 번개이거나, 이미 나간 번개입니다!
          </p>
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => {
                (
                  document.getElementById(
                    "leave-fail-modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              닫기
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default LightningDetailPage;
