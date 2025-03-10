import UserLightningVar from "../../components/UserLightningVar";
import UserCompletedLightningList from "../../components/UserCompletedLightningList";

function UserLightningCompletePage() {
  return (
    <div className="flex flex-col w-full max-w-screen-lg mx-auto">
      <UserLightningVar />

      <div className="p-4">
        <UserCompletedLightningList />
      </div>
    </div>
  );
}

export default UserLightningCompletePage;
