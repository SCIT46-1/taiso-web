import UserLightningVar from "../../components/UserLightningVar";
import UserCompletedLightningList from "../../components/UserCompletedLightningList";

function UserLightningCompletePage() {
  return (
    <div className="flex flex-col w-full max-w-screen-lg mx-auto no-animation">
      <UserLightningVar />

      <div className="px-4 pt-1">
        <UserCompletedLightningList />
      </div>
    </div>
  );
}

export default UserLightningCompletePage;
