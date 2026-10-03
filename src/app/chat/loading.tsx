import { LoadingSpinner } from "../../../components/loadingSpinner";

export const Loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center mx-auto">
      <LoadingSpinner />
    </div>
  );
};

export default Loading;
