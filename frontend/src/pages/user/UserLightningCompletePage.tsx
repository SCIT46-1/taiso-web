import { useState, useEffect } from "react";
import UserLightningVar from "../../components/UserLightningVar";
import UserCompletedLightningList from "../../components/UserCompletedLightningList";

function UserLightningCompletePage() {
  return (
    <div className="flex flex-col w-full max-w-screen-lg mx-auto">
      <UserLightningVar />

      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">완료된 라이트닝</h2>
        <UserCompletedLightningList />
      </div>
    </div>
  );
}

export default UserLightningCompletePage;
