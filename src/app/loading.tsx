import { LoadingSpinner } from "../../components/loadingSpinner";

export const Loading = ({ hasBackground }: { hasBackground: boolean }) => {
  return (
    <div
      className={`w-full h-screen flex items-center justify-center mx-auto ${
        hasBackground ? "bg-blue-00" : ""
      }`}
    >
      <LoadingSpinner />
    </div>
  );
};

export default Loading;
