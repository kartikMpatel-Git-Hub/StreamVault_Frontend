import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header, SlideBar } from './components'
import { UserContext } from './context/UserContext';

function Layout() {
  const HOST = import.meta.env.VITE_HOST;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  // Detect if on home page
  const isHome = location.pathname === "/";

  // Responsive sidebar logic
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setSidebarOpen(isLargeScreen && isHome);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isHome]);

  // Fetch user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${HOST}/api/v1/users/getCurrentUser`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const result = await response.json();
        if (result.statusCode === 200) {
          const user = result.data;
          setCurrentUser({
            id: user._id,
            userName: user.userName,
            name: user.fullName,
            avatar: user.avatar,
            isVerified: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Sidebar overlay logic: static on home/desktop, overlay otherwise
  const sidebarIsStatic = isHome && window.innerWidth >= 1024;
  const showSidebar = sidebarIsStatic || sidebarOpen;

  return (
    <UserContext.Provider value={currentUser}>
      <Header
        setSidebarOpen={setSidebarOpen}
        sidebarIsStatic={sidebarIsStatic}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex min-h-screen bg-neutral-900">
        {showSidebar && (
          <SlideBar
            sidebarIsStatic={sidebarIsStatic}
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
          />
        )}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarIsStatic ? "lg:ml-60" : ""
          } pt-16`}
        >
          <Outlet currentUser={currentUser} />
        </main>
      </div>
    </UserContext.Provider>
  );
}

export default Layout;
