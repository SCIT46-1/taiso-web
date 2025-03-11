import React, { useEffect, useRef, useState } from "react";

// kakao 전역 객체 타입 선언 (타입 정의가 필요하다면 추가 작업)
declare global {
  interface Window {
    kakao: any;
  }
}

interface LatLng {
  lat: number;
  lng: number;
}

interface MeetingLocationSelectorProps {
  onSelectLocation: (
    address: string,
    coords: LatLng,
    locationName?: string
  ) => void;
  selectedAddress?: string;
}

const MeetingLocationSelector: React.FC<MeetingLocationSelectorProps> = ({
  onSelectLocation,
  selectedAddress,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const markerRef = useRef<any>(null);
  const [inputAddress, setInputAddress] = useState<string>("");
  const [internalSelectedAddress, setInternalSelectedAddress] =
    useState<string>("");
  const [selectedCoords, setSelectedCoords] = useState<LatLng | null>(null);
  const [addressError, setAddressError] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");

  useEffect(() => {
    if (window.kakao && mapRef.current) {
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.553614, 126.878814),
        level: 10,
      };
      const mapInstance = new window.kakao.maps.Map(container, options);

      // 지도 타입 컨트롤 (오른쪽 상단)
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      mapInstance.addControl(
        mapTypeControl,
        window.kakao.maps.ControlPosition.TOPRIGHT
      );

      // 줌 컨트롤 (오른쪽)
      const zoomControl = new window.kakao.maps.ZoomControl();
      mapInstance.addControl(
        zoomControl,
        window.kakao.maps.ControlPosition.RIGHT
      );

      setMap(mapInstance);

      // 지도 클릭 시 좌표 선택 및 주소 변환 (법정동 주소)
      window.kakao.maps.event.addListener(
        mapInstance,
        "click",
        function (mouseEvent: any) {
          const clickedLatLng = mouseEvent.latLng;
          setSelectedCoords({
            lat: clickedLatLng.getLat(),
            lng: clickedLatLng.getLng(),
          });

          // 이미 마커가 있다면 위치 업데이트, 없으면 새로 생성
          if (markerRef.current) {
            markerRef.current.setPosition(clickedLatLng);
          } else {
            markerRef.current = new window.kakao.maps.Marker({
              position: clickedLatLng,
              map: mapInstance,
            });
          }

          // 좌표로 주소 검색 (법정동 상세 주소)
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.coord2Address(
            clickedLatLng.getLng(),
            clickedLatLng.getLat(),
            function (result: any, status: any) {
              if (
                status === window.kakao.maps.services.Status.OK &&
                result[0]
              ) {
                const addressName = result[0].address.address_name;
                setInternalSelectedAddress(addressName);
                setLocationName(addressName);
              }
            }
          );
        }
      );
    }
  }, []);

  // 입력한 주소로 좌표 검색 및 마커 표시
  const handleAddressSearch = () => {
    if (!inputAddress || !map) return;

    // 검색 시작 시 에러 메시지 초기화
    setAddressError("");

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(inputAddress, function (result: any, status: any) {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const lat = parseFloat(result[0].y);
        const lng = parseFloat(result[0].x);
        const coords = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(coords);
        setSelectedCoords({ lat, lng });
        const addressName = result[0].address_name;
        setInternalSelectedAddress(addressName);
        setLocationName(addressName);

        if (markerRef.current) {
          markerRef.current.setPosition(coords);
        } else {
          markerRef.current = new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });
        }
      } else {
        // alert 대신 에러 메시지 state 업데이트
        setAddressError("주소 결과가 없습니다. 정확한 주소를 입력해주세요.");
      }
    });
  };

  // 선택한 장소를 등록하고 부모 컴포넌트에 전달
  const handleRegisterLocation = () => {
    if (selectedCoords && internalSelectedAddress) {
      onSelectLocation(
        internalSelectedAddress,
        selectedCoords,
        locationName || internalSelectedAddress
      );
      modalRef.current?.close();
    } else {
      alert("먼저 장소를 선택해주세요.");
    }
  };

  return (
    <>
      {/* 모달 열기 버튼 - Show selected address if available */}
      <button
        className="btn w-full"
        onClick={() => modalRef.current?.showModal()}
        type="button"
      >
        {selectedAddress ? selectedAddress : "모임 장소 선택"}
      </button>

      {/* 모달 */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-1">모임 시작 장소 등록</h2>
          <div className="text-sm text-gray-500 mb-2">
            지도를 클릭해서 모임 시작 장소를 선택해보세요!
          </div>
          <div className="flex flex-col mb-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="주소를 입력하세요"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                className="input input-bordered w-[full] mr-2"
              />
              <button onClick={handleAddressSearch} className="btn">
                주소 검색
              </button>
            </div>
            {/* 에러 메시지 표시 */}
            {addressError && (
              <span className="text-error text-sm mt-1">{addressError}</span>
            )}
          </div>
          {/* 지도 표시 영역 */}
          <div ref={mapRef} className="w-full h-[400px] mx-auto mb-4"></div>
          <div className="flex flex-col gap-2">
            <label className="label flex items-center gap-2 -mb-2 -mt-2">
              <svg
                data-slot="icon"
                fill="grey"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-4"
              >
                <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l2.078-.64A.75.75 0 0 0 18 12.25v-8.5a.75.75 0 0 0-.904-.734l-2.38.501a7.25 7.25 0 0 1-4.186-.363l-.502-.2a8.75 8.75 0 0 0-5.053-.439l-1.475.31V2.75Z" />
              </svg>
              <span className="label-text mr-auto">모임 시작 장소 이름</span>
            </label>
            <div
              className="tooltip "
              data-tip="이름을 지어보세요! 주소, 원하는 이름을 지어도 됩니다!"
            >
              <input
                type="text"
                placeholder="모임 시작 장소 이름을 입력하세요"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="input input-bordered mr-2 mb-2 w-full"
              />
            </div>
            <button
              type="button"
              onClick={handleRegisterLocation}
              className="btn btn-primary"
            >
              장소 등록
            </button>
          </div>
        </div>
        {/* 모달 백드롭 (바깥쪽 클릭 시 모달이 닫힘) */}
        <button
          type="button"
          className="modal-backdrop cursor-auto"
          onClick={() => modalRef.current?.close()}
        >
          close
        </button>
      </dialog>
    </>
  );
};

export default MeetingLocationSelector;
