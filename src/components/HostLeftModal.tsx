type HostLeftModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function HostLeftModal({
  open,
  onClose,
}: HostLeftModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[420px] rounded-3xl border border-zinc-700 bg-zinc-900 p-10 text-center shadow-2xl">

        <h1 className="text-4xl font-black text-red-400">
          Host Left
        </h1>

        <p className="mt-5 text-zinc-300">
          The host ended the match.
        </p>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-400"
        >
          Return Home
        </button>

      </div>
    </div>
  );
}