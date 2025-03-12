
interface ModalProps {
  id: string;
  imgType?: "success" | "warning" | "error" | "question";
  img?: React.ReactNode;
  title?: string;
  middle?: string;
  summary?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

const getIcon = (type?: "success" | "warning" | "error" | "question") => {
  switch (type) {
    case "success":
      return (
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="#4CAF50"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="#FFD700"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="#F44336"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    case "question":
      return (
        <svg
          fill="none"
          strokeWidth={1.5}
          stroke="#2196F3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-12 h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
          />
        </svg>
      );
    default:
      return null;
  }
};


function GlobalModal({
  id,
  imgType,
  title,
  middle,
  summary,
  children,
  actions,
}: ModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box flex flex-col items-center p-16 mx-auto">
        {imgType && <div className="mb-4">{getIcon(imgType)}</div>}
        {title && <h3 className="font-extrabold text-2xl mb-5">{title}</h3>}
        {middle && <h3 className="font-extrabold text-xl">{middle}</h3>}
        {summary && (
          <div className="board board-gray-300 flex flex-col items-center py-6">
            {summary}
          </div>
        )}
        <div className="flex flex-col items-center text-center py-4 my-3">{children}</div>
        <div className="modal-action">{actions}</div>
      </div>
      <form method="dialog" className="modal-backdrop my-3">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default GlobalModal;