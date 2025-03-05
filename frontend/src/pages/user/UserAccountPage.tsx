import UserUpdateForm from "../../components/UserUpdateForm";

function UserAccountPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">계정 정보 수정</h1>
      <UserUpdateForm />
    </div>
  );
}

export default UserAccountPage;
