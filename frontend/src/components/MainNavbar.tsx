import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

function MainNavbar() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="flex flex-col items-center justify-center mt-1 mb-1">
      {!isAuthenticated && (
        <div className="text-center text-sm text-gray-500 bg-base-200 p-4 px-8 rounded-xl mt-2 mb-8">
          <Link to="/auth/landing" className=" font-bold">
            <span className="text-primary hover:underline">로그인 하고</span>{" "}
            번개에 참여해보세요!
          </Link>
        </div>
      )}
      <div className="flex no-animation">
        <NavLink
          to="/lightning"
          end
          className={({ isActive }) =>
            ` ${
              isActive && "bg-base-200 font-bold"
            } flex items-center justify-center flex-col px-6 py-4 rounded-xl`
          }
        >
          <svg
            height="800px"
            width="800px"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 400 400"
            xmlSpace="preserve"
            className="size-8"
          >
            <g>
              <polygon
                style={{ fill: "#F7CF52" }}
                points="157.055,0 90.798,196.319 164.417,196.319 88.344,400 289.571,159.509 218.405,159.509 311.656,0 	"
              />
            </g>
          </svg>
          <div className="text-sm text-base-content mt-2">번개 참여하기</div>
        </NavLink>
        <NavLink
          to="/club"
          end
          className={({ isActive }) =>
            ` ${
              isActive && "bg-base-200 font-bold"
            } flex items-center justify-center flex-col px-6 py-4 rounded-xl`
          }
        >
          <svg
            width="800px"
            height="800px"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="size-8"
          >
            <title>70 Basic icons by Xicons.co</title>
            <path
              d="M24,23C12.4,23,3,29.27,3,37v7a2,2,0,0,0,2,2H43a2,2,0,0,0,2-2V37C45,29.27,35.6,23,24,23Z"
              fill="#ff7c3a"
            />
            <path
              d="M24,0A13,13,0,1,0,37,13,13,13,0,0,0,24,0Z"
              fill="#fac591"
            />
            <path
              d="M34.29,5A13,13,0,0,0,13.82,4.9a0.09,0.09,0,0,0,.07.14h20.4Z"
              fill="#84523c"
            />
          </svg>
          <div className="text-sm text-base-content mt-2">클럽 보러가기</div>
        </NavLink>
        <NavLink
          to="/route"
          end
          className={({ isActive }) =>
            ` ${
              isActive && "bg-base-200 font-bold"
            } flex items-center justify-center flex-col px-6 py-4 rounded-xl`
          }
        >
          <svg
            height="800px"
            width="800px"
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 511.983 511.983"
            xmlSpace="preserve"
            className="size-8"
          >
            <path
              fill="#8CC153"
              d="M468.233,166.787c-28.188-28.202-65.686-43.733-105.592-43.733
	c-39.872,0-77.371,15.531-105.581,43.733c-28.203,28.21-43.733,65.708-43.733,105.583c0,5.906,4.773,10.686,10.664,10.686h277.334
	c5.875,0,10.656-4.779,10.656-10.686C511.981,232.495,496.45,194.997,468.233,166.787z"
            />
            <path
              fill="#434A54"
              d="M450.202,151.381c-9.188-6.687-19.062-12.257-29.437-16.64c-0.625,0.086-64.592,8.586-93.84,62.334
	l42.247,17.203C388.11,161.49,449.577,151.483,450.202,151.381z"
            />
            <path
              fill="#A0D468"
              d="M491.856,332.337c-12.89-30.469-31.342-57.842-54.857-81.357
	c-23.499-23.507-50.889-41.967-81.356-54.857C324.067,182.773,290.552,176,255.991,176c-34.554,0-68.083,6.773-99.645,20.124
	c-30.484,12.89-57.865,31.35-81.365,54.857c-23.507,23.516-41.967,50.889-54.857,81.357C6.773,363.898,0,397.427,0,431.99
	c0,5.906,4.773,10.656,10.664,10.656h490.663c5.875,0,10.656-4.75,10.656-10.656C511.981,397.427,505.2,363.897,491.856,332.337z"
            />
            <path
              fill="#656D78"
              d="M346.784,192.567c-22.796-8.664-46.562-13.952-70.936-15.812
	c-15.327,7.562-136.339,73.544-126.519,265.89H255.99C241.959,303.399,324.519,213.934,346.784,192.567z"
            />
            <path
              fill="#A85D5D"
              d="M127.994,233.331c-5.89,0-10.664-4.773-10.664-10.664v-36.006c0-5.89,4.773-10.664,10.664-10.664
	c5.891,0,10.664,4.773,10.664,10.664v36.006C138.658,228.558,133.885,233.331,127.994,233.331z"
            />
            <path
              fill="#8CC153"
              d="M158.165,197.333H97.823c-3.648,0-7.046-1.875-9.007-4.953c-1.953-3.085-2.195-6.96-0.641-10.265
	l30.17-63.998c1.758-3.734,5.516-6.117,9.648-6.117c4.133,0,7.891,2.383,9.648,6.117l30.171,63.998
	c1.555,3.305,1.312,7.18-0.641,10.265C165.212,195.458,161.813,197.333,158.165,197.333z"
            />
            <path
              fill="#A0D468"
              d="M167.813,139.452l-30.171-63.998c-1.758-3.734-5.516-6.117-9.648-6.117
	c-4.132,0-7.89,2.383-9.648,6.117l-30.17,63.998c-1.555,3.305-1.312,7.172,0.641,10.257c1.961,3.086,5.359,4.953,9.007,4.953h60.342
	c3.648,0,7.046-1.867,9.007-4.953C169.126,146.624,169.368,142.757,167.813,139.452z"
            />
            <g>
              <path
                fill="#FFFFFF"
                d="M491.856,332.337c-12.89-30.469-31.342-57.842-54.857-81.357
		c-23.499-23.507-50.889-41.967-81.356-54.857C324.067,182.773,290.552,176,255.991,176c-3.57,0-7.125,0.078-10.664,0.219
		c30.788,1.25,60.662,7.929,88.975,19.905c30.497,12.89,57.872,31.35,81.371,54.857c23.499,23.516,41.968,50.889,54.858,81.357
		c13.358,31.561,20.108,65.09,20.108,99.652c0,5.906-4.766,10.656-10.656,10.656h21.343c5.875,0,10.656-4.75,10.656-10.656
		C511.981,397.427,505.2,363.897,491.856,332.337z"
              />
              <path
                fill="#FFFFFF"
                d="M468.233,166.787
		c-28.188-28.202-65.686-43.733-105.592-43.733c-1.781,0-3.547,0.039-5.312,0.101c37.874,1.32,73.31,16.688,100.247,43.632
		c28.202,28.21,43.748,65.708,43.748,105.583c0,5.906-4.781,10.686-10.687,10.686h10.687c5.875,0,10.656-4.779,10.656-10.686
		C511.981,232.495,496.45,194.997,468.233,166.787z"
              />
            </g>
          </svg>
          <div className="text-sm text-base-content mt-2">루트 둘러보기</div>
        </NavLink>
      </div>
    </div>
  );
}

export default MainNavbar;
