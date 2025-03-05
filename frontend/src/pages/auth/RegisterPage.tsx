import { useLocation } from "react-router-dom";
import RegisterForm from "../../components/RegisterForm";

function RegisterPage() {
  const location = useLocation();
  const fromPath = location.state?.from || "/";

  return (
    <div className="flex flex-col items-center justify-center mt-16">
      <div className="text-2xl font-bold mb-12">회원가입 하기</div>
      <RegisterForm redirectPath={fromPath} />
    </div>
  );
}

export default RegisterPage;
