import { useEffect } from "react";
import UserUpdateForm from "../../components/UserUpdateForm";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router";

function UserAccountUpdatePage() {
  const { isOAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOAuth) {
      navigate("/user/me/account");
    }
  }, [isOAuth, navigate]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">비밀번호 변경</h1>
      <UserUpdateForm />
    </div>
  );
}

export default UserAccountUpdatePage;
