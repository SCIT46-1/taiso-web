import { useNavigate, useParams } from "react-router";

import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import lightningService, {
  LightningDetailGetResponse,
} from "../../services/lightningService";
import KakaoMapRoute from "../../components/KakaoMap";
import KakaolocationMap from "../../components/KakaolocationMap";

function LightningDetailPage() {
  const { lightningId } = useParams();
  const [lightningDetail, setLightningDetail] =
    useState<LightningDetailGetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLightningDetail = async () => {
      setIsLoading(true);
      const lightningDetailData = await lightningService.getLightningDetail(
        Number(lightningId)
      );
      setLightningDetail(lightningDetailData);
      setIsLoading(false);
    };
    fetchLightningDetail();
  }, [lightningId]);

  const handleJoinLightning = async () => {
    try {
      await lightningService.joinLightning(Number(lightningId));
    } catch (error) {
      console.error(error);
      (document.getElementById("join-modal") as HTMLDialogElement)?.close();
      (
        document.getElementById("join-fail-modal") as HTMLDialogElement
      )?.showModal();
      return;
    }
    (document.getElementById("join-modal") as HTMLDialogElement)?.close();

    (
      document.getElementById("join-complete-modal") as HTMLDialogElement
    )?.show();
  };

  const handleLeaveLightning = async () => {
    try {
      await lightningService.leaveLightning(Number(lightningId));
    } catch (error) {
      console.error(error);
      (document.getElementById("leave-modal") as HTMLDialogElement)?.close();
      (
        document.getElementById("leave-fail-modal") as HTMLDialogElement
      )?.showModal();
      return;
    }
    (document.getElementById("leave-modal") as HTMLDialogElement)?.close();
  };

  return (
    <div className="bg-red-200 w-screen max-w-screen-lg grid grid-cols-[2fr,1fr] gap-4">
      {/* 상단 컴포넌트: 전체 2열을 차지 */}
      <div className="bg-blue-200 col-span-2">
        {lightningDetail?.route.routePoints && (
          <KakaoMapRoute routePoints={lightningDetail?.route.routePoints} />
        )}
      </div>

      {/* 하단 좌측 컴포넌트 */}
      <div className="flex flex-col bg-purple-400 ">
        <div>{lightningDetail?.title}</div>
        {lightningDetail?.lightningTag && (
          <div>
            {lightningDetail?.lightningTag.map((tag, index) => (
              <div key={index}>{tag}</div>
            ))}
          </div>
        )}
        <div>{lightningDetail?.description}</div>
        <div className="flex flex-row">
          <img
            src={lightningDetail?.creator.creatorProfileImg as string}
            alt="creatorProfileImage"
            className="w-10 h-10 rounded-full bg-slate-500"
          />
          <div>{lightningDetail?.creator.creatorNickname}</div>
        </div>
        <div>{lightningDetail?.description}</div>
        <div>주의사항</div>
        <div>주의사항을써봅시다</div>
      </div>

      {/* 하단 우측 컴포넌트 */}
      <div className="flex flex-col items-center justify-center bg-sky-200">
        <div className="flex flex-col">
          <div>
            <div>{lightningDetail?.eventDate} 시작</div>
            <div>{lightningDetail?.duration} 분</div>
            <div>{lightningDetail?.address}</div>
            <KakaolocationMap
              lat={lightningDetail?.latitude}
              lng={lightningDetail?.longitude}
            />
          </div>
          <div>번개 참여자 목록</div>
          <div>
            참여 완료까지{" "}
            {lightningDetail?.capacity &&
              lightningDetail?.member &&
              lightningDetail?.capacity - lightningDetail?.member.length}{" "}
            명
          </div>
          <div
            className="btn"
            onClick={() => {
              (
                document.getElementById("join-modal") as HTMLDialogElement
              )?.showModal();
            }}
          >
            참여하기
          </div>
          <div
            className="btn"
            onClick={() => {
              (
                document.getElementById("leave-modal") as HTMLDialogElement
              )?.showModal();
            }}
          >
            번개 나가기
          </div>
          {lightningDetail?.member
            .filter(
              (member) =>
                member.participantStatus === "완료" ||
                member.participantStatus === "승인"
            )
            .map((member, index) => (
              <div key={index} className="flex flex-row items-center gap-2">
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
      </div>
      {/* 참여 확인 모달 */}
      <dialog id="join-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">정말로 참여하시겠어요?</h3>
          <p className="py-4">아래 사항을 다시한번 확인해 주세요!</p>
          <div>{lightningDetail?.eventDate} 시에 열리는 번개에요!</div>
          <div>{lightningDetail?.duration} 분 동안 진행되는 번개에요!</div>
          <div>{lightningDetail?.address}에서 진행되는 번개에요!</div>
          <div>주의사항</div>
          <div>주의사항을써봅시다 기타등등들어갈거추가합니다</div>
          <div className="btn btn-primary" onClick={handleJoinLightning}>
            참여하기
          </div>
          <div
            className="btn"
            onClick={() => {
              (
                document.getElementById("join-modal") as HTMLDialogElement
              )?.close();
            }}
          >
            취소
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
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* 번개 나가기 모달 */}
      <dialog id="leave-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 나가기</h3>
          <p className="py-4">
            정말 번개를 나가시겠어요?, 한번 나가면 재신청이 안되욥!
          </p>
          <div className="btn btn-primary" onClick={handleLeaveLightning}>
            진짜 나가기
          </div>
          <div
            className="btn"
            onClick={() => {
              (
                document.getElementById("leave-modal") as HTMLDialogElement
              )?.close();
            }}
          >
            취소
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* 번개 나가기 실패 모달 */}
      <dialog id="leave-fail-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 나가기 실패</h3>
          <p className="py-4">
            번개 나가기에 실패했습니다, 참여하지 않은 번개거나, 이미 나간
            번개에요!
          </p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* 번개 참여 실패 모달 */}
      <dialog id="join-fail-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">번개 참여 실패</h3>
          <p className="py-4">
            번개 참여에 실패했습니다, 이미 참여한 번개거나, 이미 완료된
            번개에요!
          </p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default LightningDetailPage;
