interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}

function GlobalModal({ id, title, children, actions }: ModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box p-8">
        <h3 className="font-extrabold text-2xl">{title}</h3>
        <div className="py-4">{children}</div>
        <div className="modal-action">{actions}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}

export default GlobalModal;
