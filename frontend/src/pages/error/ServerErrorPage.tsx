import { useNavigate } from "react-router-dom";

function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl font-bold mb-10">
        서버 오류가 발생했습니다! 😭
      </div>
      <div>
        <button
          onClick={() => navigate("/")}
          className="btn btn-primary no-animation"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ServerErrorPage;
