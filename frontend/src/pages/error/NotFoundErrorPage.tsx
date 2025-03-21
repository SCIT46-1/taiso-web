import { useNavigate } from "react-router-dom";

function NotFoundErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-2xl font-bold mb-10">
        페이지를 찾을 수 없습니다! 😭
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

export default NotFoundErrorPage;
