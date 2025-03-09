import { useParams, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  console.log(setSearchParams);

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
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState<ClubBoardPostRequest>({
    postTitle: "",
    postContent: "",
    isNotice: false,
  });

  // Membership states
  const [pendingMembers, setPendingMembers] = useState<
    Array<{
      userId: number;
      userNickname: string;
      userProfileImage: string | null;
    }>
  >([]);
  const [membershipStatus, setMembershipStatus] = useState<
    "none" | "pending" | "member"
  >("none");
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
      // Check if current user is already a member
      const isMember = clubDetail.users.some(
        (member) => member.userId === user.userId
      );

      if (isMember) {
        setMembershipStatus("member");
      } else {
        // You would need an API to check if user has a pending request
        // For now, we'll set it to 'none'
        setMembershipStatus("none");
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
      setShowPostForm(false);
      setPostForm({ postTitle: "", postContent: "", isNotice: false });
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
      fetchPostDetail(selectedPost.postId);
    } catch (error) {
      console.error("게시글 수정에 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!clubId) return;

    if (!window.confirm("정말 게시글을 삭제하시겠습니까?")) return;

    setIsBoardLoading(true);
    try {
      await clubService.deleteClubBoard(Number(clubId), postId);
      setSelectedPost(null);
      fetchBoardList();
    } catch (error) {
      console.error("게시글 삭제에 실패했습니다.", error);
    } finally {
      setIsBoardLoading(false);
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
  };

  const handleNewPostClick = () => {
    setPostForm({ postTitle: "", postContent: "", isNotice: false });
    setShowPostForm(true);
  };

  // Function to fetch pending membership requests
  const fetchPendingMembers = async () => {
    if (!clubId) return;

    setIsMembershipLoading(true);
    try {
      const data = await clubService.getPendingMembers(Number(clubId));
      setPendingMembers(data);
    } catch (error) {
      console.error("가입 신청 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // Apply to join the club
  const handleApplyClub = async () => {
    if (!clubId) return;

    setIsMembershipLoading(true);
    try {
      await clubService.applyClub(Number(clubId));
      setMembershipStatus("pending");

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
      setMembershipStatus("none");
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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

  // 멤버 비율 계산
  const memberPercentage = (clubDetail.currentScale / clubDetail.maxUser) * 100;

  // Tab UI
  const renderTabs = () => (
    <div className="tabs tabs-boxed mb-4">
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
  );

  // Board list UI
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">게시판</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleNewPostClick}
            >
              글쓰기
            </button>
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
                      onClick={() => fetchPostDetail(post.postId)}
                    >
                      <td className="text-center">
                        {post.isNotice ? (
                          <span className="badge badge-primary">공지</span>
                        ) : (
                          post.postId
                        )}
                      </td>
                      <td className="font-medium">{post.postTitle}</td>
                      <td>{post.writerNickname}</td>
                      <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

  // Post detail UI
  const renderPostDetail = () => {
    if (!selectedPost) return null;

    if (isEditing) {
      return renderPostForm(handleUpdatePost, "수정하기", true);
    }

    return (
      <div className="card bg-base-100 shadow-xl">
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
                    onClick={() => handleDeletePost(selectedPost.postId)}
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

          <div className="flex items-center mb-4">
            <div className="avatar mr-2">
              <div className="w-8 h-8 rounded-full">
                {selectedPost.writerProfileImg ? (
                  <ImageWithSkeleton
                    src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${selectedPost.writerProfileImg}`}
                    alt={selectedPost.writerNickname}
                  />
                ) : (
                  <div className="bg-base-300 w-full h-full flex items-center justify-center text-sm font-bold">
                    {selectedPost.writerNickname.substring(0, 1)}
                  </div>
                )}
              </div>
            </div>
            <span className="font-medium">{selectedPost.writerNickname}</span>
            <span className="text-base-content/60 text-sm ml-4">
              {new Date(selectedPost.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="divider my-1"></div>

          <div className="py-4 min-h-32 whitespace-pre-line">
            {selectedPost.postContent}
          </div>
        </div>
      </div>
    );
  };

  // Post form UI (for creating and editing)
  const renderPostForm = (
    submitHandler: () => void,
    submitText: string,
    isEdit = false
  ) => {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">
              {isEdit ? "게시글 수정" : "새 게시글 작성"}
            </h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (isEdit) {
                  setIsEditing(false);
                } else {
                  setShowPostForm(false);
                }
              }}
            >
              취소
            </button>
          </div>

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

          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={submitHandler}
              disabled={!postForm.postTitle || !postForm.postContent}
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Determine what to render in the board tab
  const renderBoardContent = () => {
    if (showPostForm) {
      return renderPostForm(handleCreatePost, "등록하기");
    }

    if (selectedPost) {
      return renderPostDetail();
    }

    return renderBoardList();
  };

  // Render membership action buttons based on user status
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
      case "none":
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
      case "pending":
        return (
          <button className="btn btn-outline" disabled>
            가입 신청 처리 중
          </button>
        );
      case "member":
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
    }
  };

  // Render pending membership requests panel
  const renderPendingMembers = () => {
    if (!showPendingMembers) return null;

    return (
      <div className="card bg-base-100 shadow-xl mb-8">
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 탭 네비게이션 */}
      {renderTabs()}

      {activeTab === "info" ? (
        <>
          {/* 클럽 헤더 */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <div className="flex flex-col md:flex-row gap-6">
                {/* 클럽 이미지 */}
                <div className="w-full md:w-64 flex-shrink-0">
                  {clubDetail.clubProfileImageId ? (
                    <ImageWithSkeleton
                      src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${clubDetail.clubProfileImageId}`}
                      alt={clubDetail.clubName}
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
                  <h1 className="text-3xl font-bold mb-2">
                    {clubDetail.clubName}
                  </h1>

                  <div className="flex items-center mb-2">
                    <div className="badge badge-primary mr-2">리더</div>
                    <span>{clubDetail.clubLeader.leaderName}</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-base-content/70">
                      생성일: {formattedDate}
                    </p>
                  </div>

                  <div className="tags flex flex-wrap gap-2 mb-4">
                    {clubDetail.tags.map((tag, index) => (
                      <div key={index} className="badge badge-outline">
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="whitespace-pre-line">
                      {clubDetail.clubDescription}
                    </p>
                  </div>

                  {/* Add membership action buttons */}
                  <div className="mt-4">{renderMembershipActions()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Membership Requests (only visible to club leader) */}
          {renderPendingMembers()}

          {/* 멤버십 정보 */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">멤버십 현황</h2>

              <div className="flex items-center gap-4 mb-2">
                <div className="stats shadow flex-1">
                  <div className="stat">
                    <div className="stat-title">현재 인원</div>
                    <div className="stat-value">{clubDetail.currentScale}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">최대 인원</div>
                    <div className="stat-value">{clubDetail.maxUser}</div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-medium">인원 현황</span>
                  <span className="text-sm font-medium">
                    {memberPercentage.toFixed(0)}%
                  </span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={memberPercentage}
                  max="100"
                ></progress>
              </div>
            </div>
          </div>

          {/* 멤버 목록 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">멤버 목록</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clubDetail.users.map((user) => (
                  <div
                    key={user.userId}
                    className="card card-side bg-base-200 shadow-sm"
                  >
                    <figure className="pl-4">
                      {user.userProfileImage ? (
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-full">
                            <ImageWithSkeleton
                              src={`/api/images/${user.userProfileImage}`}
                              alt={user.userNickname}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="avatar placeholder">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-16 h-16">
                            <span className="text-xl">
                              {user.userNickname.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </figure>
                    <div className="card-body py-4">
                      <h3 className="card-title text-base">
                        {user.userNickname}
                      </h3>
                      <p className="text-sm truncate">
                        {user.bio || "소개글이 없습니다."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Show board content when board tab is active
        renderBoardContent()
      )}
    </div>
  );
}

export default ClubDetailPage;
