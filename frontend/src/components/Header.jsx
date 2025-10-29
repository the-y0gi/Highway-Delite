// import React from "react";
// import { ArrowLeft, Search } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import placeholder from "../assets/placeholder.png";
// const Header = ({ searchQuery, setSearchQuery }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogoClick = () => {
//     navigate("/");
//     setSearchQuery("");
//   };

//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
//         <div className="flex items-center justify-between gap-4">
//           {/* Logo */}
//           <div
//             className="flex items-center gap-2 cursor-pointer "
//             onClick={handleLogoClick}
//           >
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
//               <img
//                 src={placeholder}
//                 alt="profile"
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <div className="hidden sm:block">
//               <div className="font-bold text-base sm:text-lg leading-none">
//                 highway
//               </div>
//               <div className="text-xs sm:text-sm leading-none">delite</div>
//             </div>
//           </div>

//           {/* Search Bar - Show only on home page */}
//           {location.pathname === "/" && (
//             <div className="flex items-center gap-2 flex-1 max-w-lg">
//               <input
//                 type="text"
//                 placeholder="Search experiences"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//               <button className="bg-yellow-400 hover:bg-yellow-500 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition whitespace-nowrap">
//                 Search
//               </button>
//             </div>
//           )}

//           {/* Back Button - Show on other pages */}
//           {/* {location.pathname !== '/' && (
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-gray-700 hover:text-black transition"
//             >
//               <ArrowLeft size={20} />
//               <span className="font-semibold">Back</span>
//             </button>
//           )} */}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import placeholder from "../assets/placeholder.png";

const Header = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate("/");
    setSearchQuery("");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
              <img
                src={placeholder}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text: hidden on mobile only when on home page */}
            <div className={`${location.pathname === "/" ? "hidden sm:block" : "block"}`}>
              <div className="font-bold text-base sm:text-lg leading-none">
                highway
              </div>
              <div className="text-xs sm:text-sm leading-none">delite</div>
            </div>
          </div>

          {/* Search Bar - Show only on home page */}
          {location.pathname === "/" && (
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Search experiences"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button className="bg-yellow-400 hover:bg-yellow-500 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold transition whitespace-nowrap">
                Search
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};

export default Header;
