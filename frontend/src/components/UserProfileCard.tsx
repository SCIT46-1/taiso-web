import { Link } from "react-router-dom";

interface UserProfileProps {
  userProfileId?: number;
  userProfileImg?: string;
  userProfileName?: string;
  userRole?: string;
  extraInfo?: string;
  showRoleIcon?: boolean;
}

function UserProfileCard({
  userProfileId,
  userProfileImg,
  userProfileName,
  userRole,
  extraInfo,
  showRoleIcon = true,
}: UserProfileProps) {
  return (
    <Link to={`/users/${userProfileId}`} className=" w-fit">
      <div className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-xl transition-colors">
        <img
          src={userProfileImg ? userProfileImg : "/userDefault.png"}
          alt={userProfileName}
          className="size-8 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-[0.4rem]">
            <span className="font-medium">{userProfileName}</span>
            {userRole === "creator" && showRoleIcon && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,215,0,1)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-crown"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
            )}
          </div>
          {extraInfo && (
            <div className="text-sm text-gray-500">{extraInfo}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default UserProfileCard;
