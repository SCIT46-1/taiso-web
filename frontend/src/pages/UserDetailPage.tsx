import { useParams } from "react-router";
import userDetailService, { UserDetailResponse } from "../services/userDetailService";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import ReviewList from "../components/ReviewList";

// // 모달설정
// interface ModalProps {
//   id: string;
//   title: string;
//   children: React.ReactNode;
//   actions: React.ReactNode;
// }

// function Modal({ id, title, children, actions }: ModalProps) {
//   return (
//     <dialog id={id} className="modal">
//       <div className="modal-box">
//         <h3 className="font-bold text-lg">{title}</h3>
//         <div className="py-4">{children}</div>
//         <div className="modal-action">{actions}</div>
//       </div>
//       <form method="dialog" className="modal-backdrop">
//         <button>close</button>
//       </form>
//     </dialog>
//   );
// }

function UserDetailPage() {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  console.log(isLoading, user);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setIsLoading(true);
      const userDetailData = await userDetailService.getUserDetail(
        Number(userId)
      );
      setUserDetail(userDetailData);
      setIsLoading(false);
    };
    fetchUserDetail();
  }, [userId]);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="md:w-full max-w-screen-md rounded-xl w-[90%] mt-2 border-base-300 border-[1px] shadow-xl">
      <div className="flex flex-col relative">
        <img
          src={userDetail?.backgroundImg}
          alt="background"
          className="w-full h-64 object-cover rounded-t-xl"
        />
        <img
          src={userDetail?.profileImg}
          alt="profile"
          className="size-24 rounded-full bg-emerald-400 absolute -bottom-12 sm:left-14 left-6"
        ></img>
      </div>
      <div className="flex flex-col sm:ml-12 ml-6 mt-14 w-[85%]">
        <div className="flex gap-2 mb-2">
          <div className="text-2xl font-bold mb-2">{userDetail?.userNickname}</div>
          <div>
            <div className="badge badge-primary badge-outline">{userDetail?.level}</div>
            <div className="badge badge-primary badge-outline">{userDetail?.gender}</div>
            {(userDetail?.tags ?? []).map((tag) => (
              <div key={tag} className="badge badge-primary badge-outline">{tag}</div>
            ))}
          </div>
        </div>

        {/* {user?.userId == userDetail?.userId (
            <button
              className="btn w-full no-animation btn-primary"
              onClick={() => showModal("join-modal")}
            >
              프로필수정
            </button>
          )} */}

        <div>
          {userDetail?.bio}
        </div>
      </div>

      {/* 통계 */}
      <div className="flex justify-center first:before:w-fit mx-auto gap-2 ">
        <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
          <div>참여 번개</div>
          <div>DUMMY</div>
        </div>
        <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
          <div>가입 클럽</div>
          <div>DUMMY</div>
        </div>
        <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
          <div>등록 루트</div>
          <div>DUMMY</div>
        </div>
      </div>
      {/* 스트라바 통계 */}
      <div>스트라바</div>
      <div className="flex justify-center first:before:w-fit mx-auto gap-2 ">
        <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
          <div>주행거리</div>
          <div>DUMMY</div>
        </div>
        <div className="flex flex-col justify-center items-center border-2 border-base-300 p-2 rounded-xl">
          <div>획득고도</div>
          <div>DUMMY</div>
        </div>
      </div>
      {/* 리뷰*/}
      <ReviewList
        userId={Number(userId)}
      />
    </div>
  );
}

export default UserDetailPage;
