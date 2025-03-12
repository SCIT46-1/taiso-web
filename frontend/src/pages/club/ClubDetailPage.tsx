import { useParams, useSearchParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import clubService, {
  ClubDetailResponse,
  ClubBoardListResponse,
  ClubBoardDetailResponse,
  ClubBoardPostRequest,
} from "../../services/clubService";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";
import { useAuthStore } from "../../stores/useAuthStore";

function ClubDetailPage() {
  const { clubId } = useParams();
  const [searchParams, _setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const modalRef = useRef<HTMLDialogElement>(null);
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // Club detail states
  const [clubDetail, setClubDetail] = useState<ClubDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Club board states
  const [activeTab, setActiveTab] = useState<"info" | "board">("info");
  const [boardList, setBoardList] = useState<ClubBoardListResponse | null>(
    null
  );
  const [selectedPost, setSelectedPost] =
    useState<ClubBoardDetailResponse | null>(null);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // Form states for creating/editing posts
  const [isEditing, setIsEditing] = useState(false);
  const [postForm, setPostForm] = useState<ClubBoardPostRequest>({
    postTitle: "",
    postContent: "",
    isNotice: false,
  });
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  // Membership states
  const [pendingMembers, setPendingMembers] = useState<
    Array<{
      userId: number;
      userNickname: string;
      userProfileImage: string | null;
    }>
  >([]);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [showPendingMembers, setShowPendingMembers] = useState(false);

  useEffect(() => {
    const fetchClubDetail = async () => {
      try {
        const data = await clubService.getClubDetail(Number(clubId));
        setClubDetail(data);
      } catch (error) {
        console.error("클럽 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubDetail();
  }, [clubId]);

  useEffect(() => {
    // Check for board tab parameter
    const tab = searchParams.get("tab");
    if (tab === "board") {
      setActiveTab("board");
      fetchBoardList();
    }

    // Check for post ID parameter
    const postId = searchParams.get("postId");
    if (postId && activeTab === "board") {
      fetchPostDetail(Number(postId));
    }
  }, [searchParams, clubId]);

  useEffect(() => {
    if (clubDetail && user) {
      // Find current user in club members to determine participation status
      const currentUserData = clubDetail.users.find(
        (member) => member.userId === user.userId
      );

      if (currentUserData) {
        setMembershipStatus(currentUserData.participantStatus);
      } else {
        setMembershipStatus(null);
      }

      // If current user is club leader, fetch pending membership requests
      if (clubDetail.clubLeader.leaderId === user.userId) {
        fetchPendingMembers();
      }
    }
  }, [clubDetail, user]);

  const fetchBoardList = async (page = currentPage) => {
    if (!clubId) return;

    setIsBoardLoading(true);
    try {
      const data = await clubService.getClubBoardList(
        Number(clubId),
        page,
        pageSize
      );
      setBoardList(data);
      setCurrentPage(page);
      setSelectedPost(null);
    } catch (error) {
      console.error("게시판 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
    }
  };

  const fetchPostDetail = async (postId: number) => {
    if (!clubId) return;

    // 승인된 멤버 또는 클럽장만 게시글 상세를 볼 수 있음
    if (
      membershipStatus !== "승인" &&
      clubDetail?.clubLeader.leaderId !== user?.userId
    ) {
      alert("승인된 클럽 멤버만 게시글을 볼 수 있습니다.");
      return;
    }

    setIsBoardLoading(true);
    try {
      const data = await clubService.getClubBoardDetail(Number(clubId), postId);
      setSelectedPost(data);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!clubId) return;

    setIsBoardLoading(true);
    try {
      await clubService.createClubBoard(Number(clubId), postForm);
      setPostForm({ postTitle: "", postContent: "", isNotice: false });
      modalRef.current?.close();
      fetchBoardList();
    } catch (error) {
      console.error("게시글 작성에 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!clubId || !selectedPost) return;

    setIsBoardLoading(true);
    try {
      await clubService.updateClubBoard(
        Number(clubId),
        selectedPost.postId,
        postForm
      );
      setIsEditing(false);
      modalRef.current?.close();
      fetchPostDetail(selectedPost.postId);
    } catch (error) {
      console.error("게시글 수정에 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!clubId || !postIdToDelete) return;

    setIsBoardLoading(true);
    try {
      await clubService.deleteClubBoard(Number(clubId), postIdToDelete);
      setSelectedPost(null);
      deleteModalRef.current?.close();
      fetchBoardList();
    } catch (error) {
      console.error("게시글 삭제에 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
      setPostIdToDelete(null);
    }
  };

  const handleEditClick = () => {
    if (!selectedPost) return;

    setPostForm({
      postTitle: selectedPost.postTitle,
      postContent: selectedPost.postContent,
      isNotice: selectedPost.isNotice,
    });
    setIsEditing(true);
    modalRef.current?.showModal();
  };

  const handleNewPostClick = () => {
    setPostForm({ postTitle: "", postContent: "", isNotice: false });
    setIsEditing(false);
    modalRef.current?.showModal();
  };

  const handleDeleteClick = (postId: number) => {
    setPostIdToDelete(postId);
    deleteModalRef.current?.showModal();
  };

  // Apply to join the club
  const handleApplyClub = async () => {
    if (!clubId) return;

    setIsMembershipLoading(true);
    try {
      await clubService.applyClub(Number(clubId));
      setMembershipStatus("신청대기");

      // Show success message
      alert("클럽 가입 신청이 완료되었습니다.");
    } catch (error) {
      console.error("클럽 가입 신청에 실패했습니다.", error);
      alert("클럽 가입 신청에 실패했습니다.");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // Leave the club
  const handleLeaveClub = async () => {
    if (!clubId) return;

    if (!window.confirm("정말 클럽을 탈퇴하시겠습니까?")) return;

    setIsMembershipLoading(true);
    try {
      await clubService.leaveClub(Number(clubId));
      setMembershipStatus(null);
      // Refresh club details to update member list
      const data = await clubService.getClubDetail(Number(clubId));
      setClubDetail(data);
    } catch (error) {
      console.error("Failed to leave club", error);
      // Show error message
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // Accept member request
  const handleAcceptMember = async (userId: number) => {
    if (!clubId) return;

    setIsMembershipLoading(true);
    try {
      await clubService.acceptClubMember(Number(clubId), userId);

      // Get the member name before removing from list
      const memberName =
        pendingMembers.find((m) => m.userId === userId)?.userNickname || "회원";

      // Update pending members list
      setPendingMembers((prev) =>
        prev.filter((member) => member.userId !== userId)
      );

      // Refresh club details to update member list
      const data = await clubService.getClubDetail(Number(clubId));
      setClubDetail(data);

      alert(`${memberName} 님의 가입 신청을 수락했습니다.`);
    } catch (error) {
      console.error("회원 수락에 실패했습니다.", error);
      alert("회원 수락에 실패했습니다.");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // Reject member request
  const handleRejectMember = async (userId: number) => {
    if (!clubId) return;

    if (!window.confirm("정말로 이 가입 신청을 거절하시겠습니까?")) return;

    setIsMembershipLoading(true);
    try {
      await clubService.rejectClubMember(Number(clubId), userId);

      // Get the member name before removing from list
      const memberName =
        pendingMembers.find((m) => m.userId === userId)?.userNickname || "회원";

      // Update pending members list
      setPendingMembers((prev) =>
        prev.filter((member) => member.userId !== userId)
      );

      alert(`${memberName} 님의 가입 신청을 거절했습니다.`);
    } catch (error) {
      console.error("회원 거절에 실패했습니다.", error);
      alert("회원 거절에 실패했습니다.");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // 보류 중인 회원 요청 조회 기능 구현
  const fetchPendingMembers = async () => {
    if (!clubId) return;

    setIsMembershipLoading(true);
    try {
      // Find members with 'PENDING' status from clubDetail
      const pendingUsers =
        clubDetail?.users.filter(
          (member) => member.participantStatus === "신청대기"
        ) || [];

      // Transform to the expected format
      const pendingMembersData = pendingUsers.map((user) => ({
        userId: user.userId,
        userNickname: user.userNickname,
        userProfileImage: user.userProfileImage,
      }));

      setPendingMembers(pendingMembersData);
    } catch (error) {
      console.error("보류 중인 회원 요청을 불러오는데 실패했습니다.", error);
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // 멤버십 액션 렌더링 함수 수정
  const renderMembershipActions = () => {
    if (!user) {
      return (
        <button className="btn btn-outline" disabled>
          로그인 후 이용 가능합니다
        </button>
      );
    }

    if (clubDetail?.clubLeader.leaderId === user.userId) {
      return (
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowPendingMembers(!showPendingMembers);
              if (!showPendingMembers) {
                fetchPendingMembers();
              }
            }}
          >
            가입 신청 관리
            {pendingMembers.length > 0 && (
              <span className="badge badge-accent ml-2">
                {pendingMembers.length}
              </span>
            )}
          </button>
        </div>
      );
    }

    switch (membershipStatus) {
      case null:
        return (
          <button
            className="btn btn-primary"
            onClick={handleApplyClub}
            disabled={
              isMembershipLoading ||
              clubDetail?.currentScale === clubDetail?.maxUser
            }
          >
            {isMembershipLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "클럽 가입 신청"
            )}
          </button>
        );
      case "신청대기":
        return (
          <button className="btn btn-outline" disabled>
            가입 신청 처리 중
          </button>
        );
      case "승인":
        return (
          <button
            className="btn btn-outline btn-error"
            onClick={handleLeaveClub}
            disabled={isMembershipLoading}
          >
            {isMembershipLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "클럽 탈퇴"
            )}
          </button>
        );
      case "탈퇴":
        return (
          <button
            className="btn btn-primary"
            onClick={handleApplyClub}
            disabled={isMembershipLoading}
          >
            {isMembershipLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "클럽 재가입 신청"
            )}
          </button>
        );
      default:
        return null;
    }
  };

  // 게시판 관련 접근 제어
  const canAccessBoardDetail = () => {
    return (
      membershipStatus === "승인" ||
      clubDetail?.clubLeader.leaderId === user?.userId
    );
  };

  const canCreatePost = () => {
    return (
      membershipStatus === "승인" ||
      clubDetail?.clubLeader.leaderId === user?.userId
    );
  };

  // 게시글 목록 렌더링 수정
  const renderBoardList = () => {
    if (isBoardLoading && !boardList) {
      return (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      );
    }

    if (!boardList) return null;

    return (
      <div className="card bg-base-100 shadow-md rounded-xl border border-base-300">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">게시판</h2>
            {canCreatePost() ? (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleNewPostClick}
              >
                글쓰기
              </button>
            ) : (
              user && (
                <div className="text-sm text-warning">
                  승인된 멤버만 글을 작성할 수 있습니다
                </div>
              )
            )}
          </div>

          {boardList.content.length === 0 ? (
            <div className="text-center py-8">
              <p>게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="w-16 text-center">번호</th>
                    <th>제목</th>
                    <th className="w-32">작성자</th>
                    <th className="w-32">작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {boardList.content.map((post) => (
                    <tr
                      key={post.postId}
                      className={`hover:bg-base-200 cursor-pointer ${
                        post.isNotice ? "bg-base-200" : ""
                      }`}
                      onClick={() => {
                        if (canAccessBoardDetail()) {
                          fetchPostDetail(post.postId);
                        } else {
                          alert("승인된 클럽 멤버만 게시글을 볼 수 있습니다.");
                        }
                      }}
                    >
                      <td className="text-center">
                        {post.isNotice ? (
                          <span className="badge badge-primary">공지</span>
                        ) : (
                          post.postId
                        )}
                      </td>
                      <td className="font-medium">
                        {post.postTitle}
                        {!canAccessBoardDetail() && (
                          <span className="ml-2 text-xs text-warning">
                            (승인된 멤버만 볼 수 있음)
                          </span>
                        )}
                      </td>
                      <td>{post.writerNickname}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination - 기존 코드 유지 */}
          {boardList.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="join">
                {Array.from({ length: boardList.totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`join-item btn btn-sm ${
                      currentPage === i ? "btn-active" : ""
                    }`}
                    onClick={() => fetchBoardList(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 멤버 목록 섹션에 참여 상태 표시 추가
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "승인":
        return <span className="badge badge-success badge-sm">승인됨</span>;
      case "신청대기":
        return <span className="badge badge-warning badge-sm">대기중</span>;
      case "탈퇴":
        return <span className="badge badge-error badge-sm">탈퇴</span>;
      default:
        return null;
    }
  };

  // 멤버 목록 렌더링 수정
  const renderMemberList = () => {
    if (!clubDetail) return null;

    return (
      <div className="card bg-base-100 shadow-md rounded-xl border border-base-300 w-full">
        <div className="card-body">
          <h2 className="card-title mb-2">멤버십 현황 및 멤버 목록</h2>

          {/* 멤버십 현황 정보 추가 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">인원 현황</div>
              <div className="text-sm font-medium">
                {clubDetail?.currentScale} / {clubDetail?.maxUser} 명
                <span className="ml-2">
                  (
                  {(
                    (clubDetail?.currentScale / clubDetail?.maxUser) *
                    100
                  ).toFixed(0)}
                  %)
                </span>
              </div>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={
                (clubDetail?.currentScale / clubDetail?.maxUser) * 100 || 0
              }
              max="100"
            ></progress>
          </div>

          <div className="divider my-2"></div>

          {/* 멤버 목록 - 클럽장에게는 모든 멤버 보여주기, 일반 유저에게는 승인된 멤버만 */}
          {clubDetail?.users
            .filter(
              (user) =>
                // 클럽장에게는 모든 멤버 표시, 일반 유저에게는 승인된 멤버만 표시
                clubDetail?.clubLeader.leaderId === user?.userId ||
                user.participantStatus === "승인"
            )
            .map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-2 p-2 border-b"
              >
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      {member.userProfileImage ? (
                        <ImageWithSkeleton
                          src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${member.userProfileImage}`}
                          alt={member.userNickname}
                        />
                      ) : (
                        <div className="bg-base-300 w-full h-full flex items-center justify-center font-bold">
                          {member.userNickname.substring(0, 1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="font-medium">
                      {member.userNickname}
                      {member.userId === clubDetail.clubLeader.leaderId && (
                        <span className="ml-2 text-xs text-primary">
                          클럽 리더
                        </span>
                      )}
                    </div>
                    <div className="text-xs">{member.bio || ""}</div>
                  </div>
                </div>

                {/* 클럽장에게만 멤버 상태 및 관리 옵션 표시 */}
                {clubDetail.clubLeader.leaderId === user?.userId &&
                  member.userId !== user?.userId && (
                    <div className="flex items-center gap-2">
                      {getStatusBadge(member.participantStatus)}
                      {member.participantStatus === "신청대기" && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => handleAcceptMember(member.userId)}
                          >
                            수락
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => handleRejectMember(member.userId)}
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
        </div>
      </div>
    );
  };

  // 게시글 상세 렌더링
  const renderPostDetail = () => {
    if (!selectedPost) return null;

    return (
      <div className="card bg-base-100 shadow-md rounded-xl border border-base-300">
        <div className="card-body">
          <div className="flex justify-between items-center mb-2">
            <div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedPost(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                목록
              </button>
            </div>
            {selectedPost.canEdit && (
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleEditClick}
                >
                  수정
                </button>
                {selectedPost.canDelete && (
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => handleDeleteClick(selectedPost.postId)}
                  >
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {selectedPost.isNotice && (
              <span className="badge badge-primary mr-2">공지</span>
            )}
            {selectedPost.postTitle}
          </h2>

          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div>작성자: {selectedPost.writerNickname}</div>
            <div className="flex gap-4">
              <div>
                작성일: {new Date(selectedPost.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="divider my-0"></div>

          <div className="py-4 whitespace-pre-line min-h-[200px]">
            {selectedPost.postContent}
          </div>
        </div>
      </div>
    );
  };

  // 게시판 컨텐츠 렌더링
  const renderBoardContent = () => {
    if (!selectedPost) {
      return renderBoardList();
    }
    return renderPostDetail();
  };

  // 가입 신청 목록 렌더링
  const renderPendingMembers = () => {
    if (!showPendingMembers) return null;

    return (
      <div className="card bg-base-100 shadow-md mb-8 rounded-xl border border-base-300">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">가입 신청 현황</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowPendingMembers(false)}
            >
              닫기
            </button>
          </div>

          {isMembershipLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : pendingMembers.length === 0 ? (
            <div className="text-center py-8 bg-base-200 rounded-lg">
              <p className="text-base-content/70">
                현재 처리할 가입 신청이 없습니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>사용자</th>
                    <th className="text-right">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMembers.map((member) => (
                    <tr key={member.userId}>
                      <td className="flex items-center gap-2">
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {member.userProfileImage ? (
                              <ImageWithSkeleton
                                src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${member.userProfileImage}`}
                                alt={member.userNickname}
                              />
                            ) : (
                              <div className="bg-base-300 w-full h-full flex items-center justify-center font-bold">
                                {member.userNickname.substring(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>
                        <span>{member.userNickname}</span>
                      </td>
                      <td className="text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleAcceptMember(member.userId)}
                            disabled={isMembershipLoading}
                          >
                            수락
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleRejectMember(member.userId)}
                            disabled={isMembershipLoading}
                          >
                            거절
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 클럽이 없을 경우
  if (!clubDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">클럽을 찾을 수 없습니다</h2>
        <button
          className="btn btn-primary"
          onClick={() => window.history.back()}
        >
          돌아가기
        </button>
      </div>
    );
  }

  // 생성일 포맷팅
  const createdDate = new Date(clubDetail.createdAt);
  const formattedDate = `${createdDate.getFullYear()}년 ${
    createdDate.getMonth() + 1
  }월 ${createdDate.getDate()}일`;

  // 멤버 비율 계산 부분 수정
  const memberPercentage =
    (clubDetail?.currentScale / clubDetail?.maxUser) * 100 || 0;

  return (
    <div className="w-screen mx-auto mb-10 max-w-screen-lg no-animation">
      {/* 클럽 헤더 - 전체 너비를 차지하는 컴포넌트 */}
      <div className="card bg-base-100 shadow-md rounded-xl border border-base-300 mb-4">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 클럽 이미지 */}
            <div className="w-full md:w-64 flex-shrink-0">
              {clubDetail.clubProfileImageId ? (
                <ImageWithSkeleton
                  src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${clubDetail.clubProfileImageId}`}
                  alt={clubDetail.clubName}
                  className="rounded-lg"
                />
              ) : (
                <div className="bg-base-300 rounded-lg w-full h-64 flex items-center justify-center">
                  <span className="text-3xl font-bold opacity-30">
                    {clubDetail.clubName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* 클럽 기본 정보 */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{clubDetail.clubName}</h1>

              <div className="flex items-center mb-2">
                <div className="badge badge-primary mr-2">리더</div>
                <span>{clubDetail.clubLeader.leaderName}</span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-base-content/70">
                  생성일: {formattedDate}
                </p>
              </div>

              <div className="tags flex flex-wrap gap-1 mb-4">
                {clubDetail.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="badge badge-primary badge-outline"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div className="mb-4 w-full">
                <p
                  className="whitespace-pre-line break-all"
                  style={{
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                    maxWidth: "100%",
                  }}
                >
                  {clubDetail.clubDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 나머지 컨텐츠를 그리드로 배치 */}
      <div className="grid grid-cols-[2fr,1fr] gap-4">
        {/* 좌측 컨텐츠 영역 */}
        <div className="flex flex-col gap-4">
          {/* 탭 네비게이션 */}
          <div className="card bg-base-100 shadow-md rounded-xl border border-base-300">
            <div className="card-body">
              <div className="tabs tabs-boxed w-fit mb-2">
                <a
                  className={`tab ${activeTab === "info" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  클럽 정보
                </a>
                <a
                  className={`tab ${activeTab === "board" ? "tab-active" : ""}`}
                  onClick={() => {
                    setActiveTab("board");
                    if (!boardList) fetchBoardList();
                  }}
                >
                  게시판
                </a>
              </div>

              <p className="text-sm text-gray-500">
                {activeTab === "info"
                  ? "클럽의 상세 정보와 멤버 목록을 확인하세요."
                  : "클럽 게시판에서 멤버들과 소통하세요."}
              </p>
            </div>
          </div>

          {/* 컨텐츠 영역 - 활성 탭에 따라 다른 내용 표시 */}
          {activeTab === "board" ? (
            renderBoardContent()
          ) : (
            <div className="card bg-base-100 shadow-md rounded-xl border border-base-300">
              <div className="card-body">
                <h2 className="card-title mb-4">클럽 상세 소개</h2>
                <div className="w-full">
                  <p
                    className="whitespace-pre-line break-all"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "break-word",
                      maxWidth: "100%",
                    }}
                  >
                    {clubDetail.clubDescription || "상세 설명이 없습니다."}
                  </p>
                </div>

                <h3 className="font-bold text-lg mt-6 mb-2">클럽 태그</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {clubDetail.tags.map((tag, index) => (
                    <div key={index} className="badge badge-lg">
                      #{tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 우측 사이드바 영역 */}
        <div className="flex flex-col items-start justify-start gap-4 self-start">
          {/* 멤버십 액션 부분 */}
          <div className="card bg-base-100 shadow-md rounded-xl border border-base-300 w-full">
            <div className="card-body">
              <h2 className="card-title mb-4">클럽 참여</h2>
              <div className="my-2">{renderMembershipActions()}</div>
            </div>
          </div>

          {/* Pending Membership Requests (only visible to club leader) */}
          {renderPendingMembers()}

          {/* 멤버 목록 (멤버십 현황 포함) - 새 함수로 교체 */}
          {renderMemberList()}
        </div>
      </div>

      {/* 게시글 작성/수정 모달 */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {isEditing ? "게시글 수정" : "새 게시글 작성"}
          </h3>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">제목</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={postForm.postTitle}
              onChange={(e) =>
                setPostForm({ ...postForm, postTitle: e.target.value })
              }
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">내용</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-40"
              value={postForm.postContent}
              onChange={(e) =>
                setPostForm({ ...postForm, postContent: e.target.value })
              }
            ></textarea>
          </div>

          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={postForm.isNotice}
                onChange={(e) =>
                  setPostForm({ ...postForm, isNotice: e.target.checked })
                }
              />
              <span className="label-text">공지글로 등록</span>
            </label>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={isEditing ? handleUpdatePost : handleCreatePost}
              disabled={
                !postForm.postTitle || !postForm.postContent || isBoardLoading
              }
            >
              {isBoardLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : isEditing ? (
                "수정하기"
              ) : (
                "등록하기"
              )}
            </button>
            <button className="btn" onClick={() => modalRef.current?.close()}>
              취소
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>닫기</button>
        </form>
      </dialog>

      {/* 게시글 삭제 확인 모달 */}
      <dialog ref={deleteModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">게시글 삭제</h3>
          <p className="py-4">
            정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={handleDeletePost}
              disabled={isBoardLoading}
            >
              {isBoardLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "삭제하기"
              )}
            </button>
            <button
              className="btn"
              onClick={() => deleteModalRef.current?.close()}
            >
              취소
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>닫기</button>
        </form>
      </dialog>
    </div>
  );
}

export default ClubDetailPage;
