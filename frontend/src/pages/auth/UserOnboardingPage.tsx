import { useState } from "react";

function UserOnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex flex-col items-center justify-center max-w-screen-sm mx-auto gap-4">
      <ul className="steps">
        <li className="step step-primary">Register</li>
        <li className="step step-primary">Choose plan</li>
        <li className="step">Purchase</li>
        <li className="step">Receive Product</li>
      </ul>
      {step === 1 && (
        <>
          <div className="text-2xl font-bold">닉네임 입력</div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-ghost w-full max-w-xs"
          />
          <div className="btn btn-primary" onClick={() => setStep(step + 1)}>
            다음
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="text-2xl font-bold">정보 입력</div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-ghost w-full max-w-xs"
          />
          <div className="btn btn-primary" onClick={() => setStep(step + 1)}>
            다음
          </div>
        </>
      )}
    </div>
  );
}

export default UserOnboardingPage;
