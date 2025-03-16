function StravaSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="text-xl font-semibold mt-10">
        스트라바 아이디 연결을 완료했습니다!
      </div>
      <div className="btn btn-primary">홈으로 돌아가기</div>
      <div className="btn btn-primary">완료한 번개에서 확인하기</div>
    </div>
  );
}

export default StravaSuccessPage;
