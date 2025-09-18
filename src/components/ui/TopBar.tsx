import React, { useEffect } from "react";
import { FaArrowUpLong } from "react-icons/fa6";
const OnTopBar: React.FC = () => {
  const [isvisible, setIsVisible] = React.useState(false);

  const onTopbtn = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // Define the scroll event handler function *****
  const handleScroll = () => {
    

    document.querySelector(".on-top-bar") as HTMLElement;
    if (window.scrollY > 120) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Render the component AS useEffect
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <button>
        <div className="">
        {isvisible && (
        <div className="fixed bottom-6 right-5 text-xl font-bold z-50 bg-gray-800 hover:bg-black hover:bg-black/90 w-12 h-12 flex items-center justify-center  text-white p-3 rounded-full cursor-pointer transition-opacity duration-300 ease-in-out hover:scale-[1.2] focus:border-spacing-2 hover:border-spacing-4" onClick={onTopbtn}>
          <FaArrowUpLong />
        </div>
      )}
      </div>
    </button>
  );
};

export default OnTopBar;
