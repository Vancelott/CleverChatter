export const SuspenseMessage = () => {
  return (
    <div className="w-full h-full flex items-start mx-auto gap-2 px-4 mt-1">
      <div className="h-3.5 w-3.5 animate-bounce bg-slate-100 rounded-full [animation-delay:-0.1s]" />
      <div className="h-3.5 w-3.5 animate-bounce  bg-slate-100 rounded-full [animation-delay:-0.3s]" />
      <div className="h-3.5 w-3.5 animate-bounce  bg-slate-100 rounded-full [animation-delay:-0.7s]" />
    </div>
  );
};

export default SuspenseMessage;
