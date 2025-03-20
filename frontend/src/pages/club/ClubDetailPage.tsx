import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import clubService, {
  ClubDetailResponse,
  ClubBoardListResponse,
  ClubBoardDetailResponse,
  ClubBoardPostRequest,
} from "../../services/clubService";
import ImageWithSkeleton from "../../components/ImageWithSkeleton";
import { useAuthStore } from "../../stores/useAuthStore";
import { Link, useNavigate } from "react-router-dom";

function ClubDetailPage() {
  const { clubId } = useParams();
  const [searchParams, _setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const navigate = useNavigate();

  // 모달 상태 통합 관리
  const [modals, setModals] = useState({
    post: false, // 게시글 작성/수정 모달
    delete: false, // 게시글 삭제 모달
    membership: false, // 멤버십 관리 모달
    confirm: false, // 확인 모달
    notification: false, // 알림 모달
  });

  // 모달 내용 상태
  const [modalContent, setModalContent] = useState({
    notification: { message: "", type: "success" as "success" | "error" },
    confirm: { message: "", onConfirm: () => {} },
  });

  // Club detail 상태
  const [clubDetail, setClubDetail] = useState<ClubDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Club board 상태
  const [activeTab, setActiveTab] = useState<"info" | "board" | "lightning">(
    "info"
  );
  const [boardList, setBoardList] = useState<ClubBoardListResponse | null>(
    null
  );
  const [selectedPost, setSelectedPost] =
    useState<ClubBoardDetailResponse | null>(null);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  // 게시글 작성/수정 상태
  const [isEditing, setIsEditing] = useState(false);
  const [postForm, setPostForm] = useState<ClubBoardPostRequest>({
    postTitle: "",
    postContent: "",
    isNotice: false,
  });
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  // 멤버십 상태
  const [pendingMembers, setPendingMembers] = useState<
    Array<{
      userId: number;
      userNickname: string;
      userProfileImage: string | null;
    }>
  >([]);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);

  // 클럽 번개 이벤트 상태
  const [clubLightningList, setClubLightningList] = useState<any>(null);
  const [isLightningLoading, setIsLightningLoading] = useState(false);
  const [lightningPage, setLightningPage] = useState(0);
  const [lightningPageSize] = useState(5);

  // 모달 열기/닫기 함수
  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  // 알림 모달 표시
  const showNotification = (message: string, type: "success" | "error") => {
    setModalContent((prev) => ({
      ...prev,
      notification: { message, type },
    }));
    openModal("notification");
  };

  // 확인 모달 표시
  const showConfirm = (message: string, onConfirm: () => void) => {
    setModalContent((prev) => ({
      ...prev,
      confirm: { message, onConfirm },
    }));
    openModal("confirm");
  };

  // 클럽 가입 신청 거절 – 실제 API 호출 함수
  const doRejectMember = async (userId: number) => {
    if (!clubId) return;
    setIsMembershipLoading(true);
    try {
      await clubService.rejectClubMember(Number(clubId), userId);
      const memberName =
        pendingMembers.find((m) => m.userId === userId)?.userNickname || "회원";

      const updatedPendingMembers = pendingMembers.filter(
        (member) => member.userId !== userId
      );

      setPendingMembers(updatedPendingMembers);

      showNotification(
        `${memberName} 님의 가입 신청을 거절했습니다.`,
        "success"
      );

      if (updatedPendingMembers.length > 0) {
        setTimeout(() => {
          openModal("membership");
        }, 300);
      }

      return updatedPendingMembers;
    } catch (error) {
      console.error("회원 거절에 실패했습니다.", error);
      showNotification("회원 거절에 실패했습니다.", "error");

      setTimeout(() => {
        openModal("membership");
      }, 300);

      return pendingMembers;
    } finally {
      setIsMembershipLoading(false);
    }
  };

  // 클럽 상세 정보 조회
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

  // URL 파라미터에 따른 탭/게시글 상세 조회
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "board") {
      setActiveTab("board");
      fetchBoardList();
    } else if (tab === "lightning") {
      setActiveTab("lightning");
      fetchClubLightningList();
    }
    const postId = searchParams.get("postId");
    if (postId && activeTab === "board") {
      fetchPostDetail(Number(postId));
    }
  }, [searchParams, clubId]);

  // 현재 사용자의 멤버십 상태 설정 및 클럽 리더인 경우 가입 신청 목록 조회
  useEffect(() => {
    if (clubDetail && user) {
      const currentUserData = clubDetail.users.find(
        (member) => member.userId === user.userId
      );
      setMembershipStatus(
        currentUserData ? currentUserData.participantStatus : null
      );
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
    // 승인된 멤버 또는 클럽장만 조회 가능
    if (
      membershipStatus !== "승인" &&
      clubDetail?.clubLeader.leaderId !== user?.userId
    ) {
      showNotification("승인된 클럽 멤버만 게시글을 볼 수 있습니다.", "error");
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
      closeModal("post");
      fetchBoardList();
    } catch (error) {
      console.error("게시글 작성에 실패했습니다.", error);
      showNotification("게시글 작성에 실패했습니다.", "error");
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
      closeModal("post");
      fetchPostDetail(selectedPost.postId);
    } catch (error) {
      console.error("게시글 수정에 실패했습니다.", error);
      showNotification("게시글 수정에 실패했습니다.", "error");
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
      closeModal("delete");
      fetchBoardList();
    } catch (error) {
      console.error("게시글 삭제에 실패했습니다.", error);
      showNotification("게시글 삭제에 실패했습니다.", "error");
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
    openModal("post");
  };

  const handleNewPostClick = () => {
    setPostForm({ postTitle: "", postContent: "", isNotice: false });
    setIsEditing(false);
    openModal("post");
  };

  const handleDeleteClick = (postId: number) => {
    setPostIdToDelete(postId);
    openModal("delete");
  };

  const doApplyClub = async () => {
    if (!clubId) return;
    setIsMembershipLoading(true);
    try {
      await clubService.applyClub(Number(clubId));
      setMembershipStatus("신청대기");
      showNotification("클럽 가입 신청이 완료되었습니다.", "success");
    } catch (error) {
      console.error("클럽 가입 신청에 실패했습니다.", error);
      showNotification("클럽 가입 신청에 실패했습니다.", "error");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  const doLeaveClub = async () => {
    if (!clubId) return;
    setIsMembershipLoading(true);
    try {
      await clubService.leaveClub(Number(clubId));
      setMembershipStatus(null);
      const data = await clubService.getClubDetail(Number(clubId));
      setClubDetail(data);
      showNotification("클럽 탈퇴가 완료되었습니다.", "success");
    } catch (error) {
      console.error("클럽 탈퇴에 실패했습니다.", error);
      showNotification("클럽 탈퇴에 실패했습니다.", "error");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  const handleAcceptMember = async (userId: number) => {
    if (!clubId) return;
    setIsMembershipLoading(true);
    closeModal("membership");
    try {
      await clubService.acceptClubMember(Number(clubId), userId);
      const memberName =
        pendingMembers.find((m) => m.userId === userId)?.userNickname || "회원";
      const updatedPendingMembers = pendingMembers.filter(
        (member) => member.userId !== userId
      );
      setPendingMembers(updatedPendingMembers);
      const data = await clubService.getClubDetail(Number(clubId));
      setClubDetail(data);
      showNotification(
        `${memberName} 님의 가입 신청을 수락했습니다.`,
        "success"
      );
      if (updatedPendingMembers.length > 0) {
        openModal("membership");
      }
    } catch (error) {
      console.error("회원 수락에 실패했습니다.", error);
      showNotification("회원 수락에 실패했습니다.", "error");
      openModal("membership");
    } finally {
      setIsMembershipLoading(false);
    }
  };

  const handleRejectMember = (userId: number) => {
    closeModal("membership");
    setTimeout(() => {
      showConfirm("정말로 이 가입 신청을 거절하시겠습니까?", async () => {
        await doRejectMember(userId);
      });
    }, 100);
  };

  const fetchPendingMembers = async () => {
    if (!clubId) return;
    setIsMembershipLoading(true);
    try {
      const pendingUsers =
        clubDetail?.users.filter(
          (member) => member.participantStatus === "신청대기"
        ) || [];
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

  const renderMembershipActions = () => {
    if (!user) {
      return (
        <button className="btn btn-outline w-full" disabled>
          로그인 후 이용 가능합니다
        </button>
      );
    }
    if (clubDetail?.clubLeader.leaderId === user.userId) {
      return (
        <div className="flex gap-2">
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              fetchPendingMembers();
              openModal("membership");
            }}
          >
            가입 신청 관리
            {pendingMembers.length > 0 && (
              <span className="badge badge-accent">
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
            className="btn btn-primary w-full"
            onClick={doApplyClub}
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
          <button className="btn btn-outline w-full" disabled>
            가입 신청 처리 중
          </button>
        );
      case "승인":
        return (
          <button
            className="btn btn-outline btn-error w-full"
            onClick={() =>
              showConfirm("정말 클럽을 탈퇴하시겠습니까?", doLeaveClub)
            }
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
            className="btn btn-primary w-full"
            onClick={doApplyClub}
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
      <div className="px-3">
        <div className="flex justify-end items-center">
          {canCreatePost() && (
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={handleNewPostClick}
            >
              글쓰기
            </button>
          )}
        </div>
        {boardList.content.length === 0 ? (
          <div className="text-center py-8">
            <p>게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="text-sm">
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
                        showNotification(
                          "승인된 클럽 멤버만 게시글을 볼 수 있습니다.",
                          "error"
                        );
                      }
                    }}
                  >
                    <td className="text-center px-2">
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
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "승인":
        return (
          <span className="badge badge-success badge-sm py-2 !text-white">
            승인
          </span>
        );
      case "신청대기":
        return (
          <span className="badge badge-warning badge-sm py-2 !text-white">
            대기
          </span>
        );
      case "탈퇴":
        return (
          <span className="badge badge-error badge-sm py-2 !text-white">
            탈퇴
          </span>
        );
      default:
        return null;
    }
  };

  const renderMemberList = () => {
    if (!clubDetail) return null;
    return (
      <div className="card bg-base-100 shadow-md rounded-lg border border-base-300 w-full">
        <div className="card-body p-6 gap-1">
          <div className="flex justify-start items-center gap-1.5 mb-2">
            <svg
              data-Slot="icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              strokeWidth="2"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            <h2 className="card-title">클럽 멤버</h2>
          </div>
          <div className="">
            <div className="flex justify-between items-center">
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
          {clubDetail?.users
            .filter(
              (user) =>
                clubDetail?.clubLeader.leaderId === user?.userId ||
                user.participantStatus === "승인"
            )
            .map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-2 p-2 border-b"
              >
                <div className="flex items-center gap-2 flex-[3]">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      {member.userProfileImage ? (
                        <ImageWithSkeleton
                          src={`https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${member.userProfileImage}`}
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
                    <div className="font-medium">{member.userNickname}</div>
                    <div className="text-xs">{member.bio || ""}</div>
                  </div>
                </div>
                {member.userId === clubDetail.clubLeader.leaderId && (
                  <div className="flex items-center gap-2 flex-[1] justify-end">
                    <span className="badge badge-primary badge-sm py-2">
                      리더
                    </span>
                  </div>
                )}
                {clubDetail.clubLeader.leaderId === user?.userId &&
                  member.userId !== user?.userId && (
                    <div className="flex items-center gap-2 flex-[1] justify-end">
                      {getStatusBadge(member.participantStatus)}
                      {member.participantStatus === "신청대기" && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-xs btn-success !text-white"
                            onClick={() => handleAcceptMember(member.userId)}
                          >
                            수락
                          </button>
                          <button
                            className="btn btn-xs btn-error !text-white"
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

  const renderPostDetail = () => {
    if (!selectedPost) return null;
    return (
      <div className="">
        <div className="flex justify-between items-center mb-2 px-3">
          <button
            className="btn btn-ghost btn-sm px-1"
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
          {selectedPost.canEdit && (
            <div className="flex gap-2">
              <button className="btn btn-gray btn-sm" onClick={handleEditClick}>
                수정
              </button>
              {selectedPost.canDelete && (
                <button
                  className="btn btn-error btn-sm text-white"
                  onClick={() => handleDeleteClick(selectedPost.postId)}
                >
                  삭제
                </button>
              )}
            </div>
          )}
        </div>
        <div className="card-body p-6 border border-gray-300 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-1">
            {selectedPost.isNotice && (
              <span className="badge badge-primary mr-2">공지</span>
            )}
            {selectedPost.postTitle}
          </h2>
          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
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

  const renderBoardContent = () => {
    return !selectedPost ? renderBoardList() : renderPostDetail();
  };

  const fetchClubLightningList = async (page = lightningPage) => {
    if (!clubId) return;
    setIsLightningLoading(true);
    try {
      const data = await clubService.getClubLightningList(
        Number(clubId),
        page,
        lightningPageSize
      );
      setClubLightningList(data);
      setLightningPage(page);
    } catch (error) {
      console.error("클럽 전용 번개 목록을 불러오는데 실패했습니다.", error);
      showNotification(
        "클럽 전용 번개 목록을 불러오는데 실패했습니다.",
        "error"
      );
    } finally {
      setIsLightningLoading(false);
    }
  };

  const handleCreateLightningClick = () => {
    navigate(`/lightning/post?clubId=${clubId}&isClubOnly=true`);
  };

  const renderClubLightningList = () => {
    if (isLightningLoading && !clubLightningList) {
      return (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      );
    }

    if (
      !clubLightningList ||
      !clubLightningList.content ||
      clubLightningList.content.length === 0
    ) {
      return (
        <div className="px-3">
          <div className="flex justify-end items-center">
            {canCreatePost() && (
              <button
                className="btn btn-primary btn-sm mr-2"
                onClick={handleCreateLightningClick}
              >
                번개 만들기
              </button>
            )}
          </div>
          <div className="text-center py-8">
            <p>등록된 클럽 전용 번개가 없습니다.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="px-3">
        <div className="flex justify-end items-center">
          {canCreatePost() && (
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={handleCreateLightningClick}
            >
              번개 만들기
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 ">
          {clubLightningList.content.map((lightning: any) => (
            <div key={lightning.lightningId} className="w-full relative">
              <div className="md:flex block items-start">
                <Link
                  to={`/lightning/${lightning.lightningId}`}
                  className="flex-1 group"
                >
                  <div
                    className="bg-base-100 w-full md:flex block items-center"
                    style={{ height: "150px" }}
                  >
                    <figure className="size-40 flex items-center justify-center md:ml-4 mx-auto md:mx-0 relative overflow-hidden md:my-0">
                      <ImageWithSkeleton
                        src={lightning.routeImgId}
                        alt={lightning.title}
                      />
                    </figure>
                    <div className="flex flex-col p-2 md:ml-6 md:text-left text-center flex-1">
                      <div className="flex flex-col gap-1">
                        <div className="text-lg font-bold">
                          {new Date(lightning.eventDate).toLocaleString([], {
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}{" "}
                          ({lightning.duration}분)
                        </div>
                        <div className="text-base truncate w-full text-overflow-ellipsis overflow-hidden">
                          {lightning.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 md:justify-start justify-center">
                          <svg
                            data-slot="icon"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="size-4 flex-shrink-0"
                          >
                            <path
                              clipRule="evenodd"
                              fillRule="evenodd"
                              d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
                            ></path>
                          </svg>
                          <span className="truncate w-full">
                            {lightning.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="divider w-full -my-2"></div>
            </div>
          ))}
        </div>
        {clubLightningList.totalPages && clubLightningList.totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="join">
              {Array.from({ length: clubLightningList.totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`join-item btn btn-sm ${
                    lightningPage === i ? "btn-active" : ""
                  }`}
                  onClick={() => fetchClubLightningList(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 클럽 번개 접근 권한 확인 함수 추가
  const canAccessLightning = () => {
    return (
      membershipStatus === "승인" ||
      clubDetail?.clubLeader.leaderId === user?.userId
    );
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

  const createdDate = new Date(clubDetail.createdAt);
  const formattedDate = `${createdDate.getFullYear()}년 ${
    createdDate.getMonth() + 1
  }월 ${createdDate.getDate()}일`;

  return (
    <div className="mb-10 max-w-screen-lg no-animation relative w-full">
      {/* 알림 모달 */}
      {modals.notification && (
        <div className="modal modal-open" style={{ zIndex: 99 }}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">알림</h3>
            <p className="py-4">{modalContent.notification.message}</p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => closeModal("notification")}
              >
                확인
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => closeModal("notification")}
          ></div>
        </div>
      )}

      {/* 멤버십 모달 */}
      {modals.membership && (
        <div className="modal modal-open" style={{ zIndex: 90 }}>
          <div className="modal-box">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">가입 신청 현황</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => closeModal("membership")}
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
                      <th className="text-right pr-5">처리</th>
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
                                  src={`https://taiso-web-gpx-file-space-korea.s3.ap-northeast-2.amazonaws.com/${member.userProfileImage}`}
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
                              className="btn btn-sm btn-success !text-white"
                              onClick={() => handleAcceptMember(member.userId)}
                            >
                              수락
                            </button>
                            <button
                              className="btn btn-sm btn-error !text-white"
                              onClick={() => handleRejectMember(member.userId)}
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
          <div
            className="modal-backdrop"
            onClick={() => closeModal("membership")}
          ></div>
        </div>
      )}

      {/* 게시글 작성/수정 모달 */}
      {modals.post && (
        <div className="modal modal-open" style={{ zIndex: 90 }}>
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
              <button className="btn" onClick={() => closeModal("post")}>
                취소
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => closeModal("post")}
          ></div>
        </div>
      )}

      {/* 게시글 삭제 모달 */}
      {modals.delete && (
        <div className="modal modal-open" style={{ zIndex: 90 }}>
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
              <button className="btn" onClick={() => closeModal("delete")}>
                취소
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => closeModal("delete")}
          ></div>
        </div>
      )}

      {/* 확인 모달 */}
      {modals.confirm && (
        <div className="modal modal-open" style={{ zIndex: 100 }}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">확인</h3>
            <p className="py-4">{modalContent.confirm.message}</p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  modalContent.confirm.onConfirm();
                  closeModal("confirm");
                }}
              >
                확인
              </button>
              <button className="btn" onClick={() => closeModal("confirm")}>
                취소
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => closeModal("confirm")}
          ></div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="mx-auto mb-10 max-w-screen-lg no-animation relative">
        {/* 클럽 헤더 */}
        <div className="card bg-base-100 shadow-md rounded-lg border border-base-300 mb-4">
          <div className="card-body p-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-48 md:w-48 flex-shrink-0">
                {clubDetail.clubProfileImageId ? (
                  <ImageWithSkeleton
                    src={`https://taiso-web-gpx-file-space-korea.s3.ap-southeast-2.amazonaws.com/${clubDetail.clubProfileImageId}`}
                    alt={clubDetail.clubName}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="bg-base-300 rounded-lg w-48 h-48 flex items-center justify-center">
                    <span className="text-3xl font-bold opacity-30">
                      {clubDetail.clubName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 p-2">
                <h1 className="text-2xl font-bold mb-2">
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
                    {clubDetail.clubShortDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 그리드 */}
        <div className="grid md:grid-cols-[5fr,2fr] grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <div className="">
              <div>
                <div role="tablist" className="tabs tabs-lifted tabs-lg">
                  <a
                    role="tab"
                    className={`tab font-semibold text-base ${
                      activeTab === "info" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("info")}
                  >
                    클럽 정보
                  </a>
                  <a
                    role="tab"
                    className={`tab font-semibold text-base ${
                      activeTab === "board" ? "tab-active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab("board");
                      if (!boardList) fetchBoardList();
                    }}
                  >
                    게시판
                  </a>
                  <a
                    role="tab"
                    className={`tab font-semibold text-base ${
                      activeTab === "lightning" ? "tab-active" : ""
                    }`}
                    onClick={() => {
                      if (canAccessLightning()) {
                        setActiveTab("lightning");
                        if (!clubLightningList) fetchClubLightningList();
                      } else {
                        showNotification(
                          "승인된 클럽 멤버만 클럽 번개를 볼 수 있습니다.",
                          "error"
                        );
                      }
                    }}
                  >
                    번개
                  </a>
                </div>

                <div>
                  <p className="text-sm text-blue-400 mt-3 mb-1 pl-2">
                    {activeTab === "info"
                      ? "클럽의 상세 정보와 멤버 목록을 확인하세요."
                      : activeTab === "board"
                      ? "클럽 게시판에서 멤버들과 소통하세요."
                      : "클럽 전용 번개를 확인하고 함께 라이딩하세요."}
                  </p>
                </div>
              </div>
            </div>
            {activeTab === "board" ? (
              renderBoardContent()
            ) : activeTab === "lightning" ? (
              canAccessLightning() ? (
                renderClubLightningList()
              ) : (
                <div className="card bg-base-100 shadow-md rounded-lg border border-base-300">
                  <div className="card-body">
                    <div className="text-center py-8">
                      <p className="text-error">
                        승인된 클럽 멤버만 클럽 번개를 볼 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="bg-gray-100">
                  <div className="card-body">
                    <h2 className="font-semibold">클럽 상세 소개</h2>
                    <div className="w-full">
                      <p
                        className="whitespace-pre-line break-all text-base"
                        style={{
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                          maxWidth: "100%",
                        }}
                      >
                        {clubDetail.clubDescription || "상세 설명이 없습니다."}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100">
                    <div className="card-body px-8 py-5">
                      <h3 className="font-semibold">클럽 태그</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {clubDetail.tags.map((tag, index) => (
                          <div key={index} className="badge badge-lg">
                            #{tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 사이드바 */}
          <div className="flex flex-col items-start justify-start gap-2 self-start w-full">
            <div className="w-full h-auto">
              <div className="my-2">{renderMembershipActions()}</div>
            </div>
            {renderMemberList()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubDetailPage;
