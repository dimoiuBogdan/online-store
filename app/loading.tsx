import { Loader2 } from "lucide-react";

const LoadingPage = () => {
  return (
    <div className="flex-center h-screen">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
};

export default LoadingPage;
