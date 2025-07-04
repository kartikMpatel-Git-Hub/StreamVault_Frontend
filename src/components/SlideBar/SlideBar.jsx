import { Home, UserCircle2Icon, TvMinimalPlay, Users, TrendingUp, History, Clock, ThumbsUp, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../context/UserContext";

function SlideBar({ sidebarIsStatic, setSidebarOpen, sidebarOpen }) {
  const [alertMsg, setAlertMsg] = useState(false);
  const currentUser = getCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const closeSidebar = () => {
    if (!sidebarIsStatic) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    // { icon: TrendingUp, label: "Trending", path: "/trending", active: location.pathname === "/trending" },
    { icon: TvMinimalPlay, label: "Subscriptions", path: "/subscriptions", active: location.pathname === "/subscriptions" },
    { icon: Users, label: "Playlists", path: "/playlist", requiresAuth: true},
  ];

  const profileItems = [
    { icon: UserCircle2Icon, label: "Profile", path: `/getChannelProfile/${currentUser?.userName}`, requiresAuth: true },
    { icon: History, label: "History", path: "/history" ,requiresAuth: true },
    // { icon: Clock, label: "Watch Later", path: "/watch-later", requiresAuth: true },
    { icon: ThumbsUp, label: "Liked Videos", path: "/likevideo", requiresAuth: true },
  ];

  const handleProfileClick = (item) => {
    if (item.requiresAuth && !currentUser) {
      setAlertMsg(true);
      return;
    }
    closeSidebar();
  };

    return (
      <>
        {/* Backdrop - only show when sidebar is open */}
        {sidebarOpen && (
          <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 ${sidebarIsStatic ? "hidden" : ""}`}
            onClick={sidebarIsStatic ? closeSidebar : () => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - only show when open */}
        {sidebarOpen && (
          <aside className="fixed top-18 left-0 h-full w-64 z-50 bg-neutral-900 shadow-2xl transform transition-transform duration-300 ease-in-out">

            {/* Navigation */}
            <div className="p-4 space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={currentUser ? item.path : "/login"}
                    onClick={closeSidebar}
                    className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      item.active
                        ? "bg-neutral-800 text-white font-semibold"
                        : "text-gray-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <hr className="border-neutral-800 my-4" />

              {/* Profile Section */}
              <div className="space-y-1">
                <h3 className="px-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  {currentUser ? "Account" : "Sign in"}
                </h3>
                {profileItems.map((item) => (
                  <Link
                    key={item.path}
                    onClick={() => handleProfileClick(item)}
                    to={currentUser ? item.path : "/login"}
                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-300 hover:bg-neutral-800 hover:text-white ${item.active ? "bg-neutral-800 text-white font-semibold" : ""}`}
                  >
                    <item.icon className="w-6 h-6" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </>
    );
  }
export default SlideBar;
