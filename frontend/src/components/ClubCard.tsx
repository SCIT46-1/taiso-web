import { Link } from "react-router";
import { ClubListResponse } from "../services/clubService";
import ImageWithSkeleton from "./ImageWithSkeleton";

function ClubCard({ club }: { club: ClubListResponse }) {
  return (
    <div className="mx-auto">
      <div className="flex">
        <Link to={`/club/${club.clubId}`} className="flex-1">
          <div className="bg-base-100 w-full flex items-center">
            <figure className="size-40 flex items-center justify-center ml-4 relative">
              <ImageWithSkeleton
                src={`https://taiso-web-gpx-file-space.s3.ap-southeast-2.amazonaws.com/${club.clubProfileImageId}`}
                alt={club.clubName}
              />
            </figure>
            <div className="flex flex-col p-2 ml-6">
              <div className="flex flex-col">
                <div className="text-lg font-semibold">{club.clubName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {club.clubShortDescription}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                  <svg
                    data-slot="icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="size-4"
                  >
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"></path>
                  </svg>
                  {club.currentScale}/{club.maxScale}명
                </div>
                <div className="flex flex-wrap gap-1 mt-2 max-w-[400px]">
                  {club.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="badge badge-primary badge-outline"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="p-4 mt-auto flex items-center justify-center">
          <Link to={`/club/${club.clubId}`} className="group">
            <button className="btn btn-outline btn-primary sm:w-[150px] no-animation">
              상세보기
            </button>
          </Link>
        </div>
      </div>
      <div className="divider w-full -my-2"></div>
    </div>
  );
}

export default ClubCard;
