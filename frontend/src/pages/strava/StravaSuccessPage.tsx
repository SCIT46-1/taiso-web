import { useNavigate } from "react-router-dom";

function StravaSuccessPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 no-animation">
      <div className="text-xl font-semibold mt-20 mb-10">
        스트라바 아이디 연결을 완료했습니다!
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="btn btn-primary" onClick={() => navigate("/")}>
          홈으로 돌아가기
        </div>
        <div
          className="btn btn-primary"
          onClick={() => navigate("/user/me/lightning-completed")}
        >
          완료한 번개에서 확인하기
        </div>
      </div>
    </div>
  );
}

export default StravaSuccessPage;
