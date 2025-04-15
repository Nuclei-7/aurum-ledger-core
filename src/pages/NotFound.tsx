
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0d1117] to-[#161b22]">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#ffd700] flex items-center justify-center mb-6">
            <span className="text-black text-3xl font-bold">₳</span>
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-400 mb-8">This blockchain address doesn't exist</p>
        <a href="/" className="px-6 py-3 bg-[#ffd700] text-black rounded-md font-medium hover:bg-[#e6c300]">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
