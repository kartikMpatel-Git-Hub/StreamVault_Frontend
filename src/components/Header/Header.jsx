import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Menu } from "lucide-react";
import SearchResult from "../Home/SearchResult";
import { getCurrentUser } from "../../context/UserContext";

function Header({ setSidebarOpen, sidebarIsStatic, sidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const searchVideo = () => {
    if (searchQuery.trim().length > 0) {
      navigate(`../search/${searchQuery}`);
      window.scrollTo(0, 0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      window.scrollTo(0, 0);
      searchVideo();
    }
  };

  return (
    <header className="fixed top-0 bg-neutral-900 backdrop-blur-md left-0 right-0 shadow-lg z-50 border-b border-neutral-800 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Show toggle button when sidebar is not static OR on mobile */}
          
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 hover:bg-neutral-800 active:bg-neutral-700 rounded-full transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          <Link 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity" 
            to={`../`}
          >
            <img 
              src="/StreamVault1.png" 
              width={40}
              alt="Stream Vault"
              className="rounded-lg"
            />
            <span className="font-bold text-xl hidden sm:block">
              Stream<sup className="text-xs text-white">Vault</sup>
            </span> 
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full px-4 py-2.5 border rounded-l-full focus:outline-none transition-all duration-200 text-white bg-neutral-800 placeholder-gray-400 ${
                  isSearchFocused 
                    ? "border-blue-500 bg-neutral-700" 
                    : "border-neutral-600 hover:border-neutral-500"
                }`}
              />
            </div>
            <button 
              className="px-2 py-3 bg-neutral-700 border border-l-0 border-neutral-600 rounded-r-full hover:bg-neutral-600 transition-colors duration-200"
              onClick={searchVideo}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <Link 
            to={"../video/uploadVideo"} 
            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:block font-medium">Create</span>
          </Link>
          <Link
            to={currentUser ? `../getChannelProfile/${currentUser.userName}` : "../login"}
            className="ml-2"
          >
            <div className="hover:opacity-80 transition-opacity">
              <img
                src={currentUser ? currentUser.avatar : "/unknownUser.png"}
                className="h-8 w-8 rounded-full object-cover border-2 border-neutral-700"
                alt={currentUser ? currentUser.userName : "User"}
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
