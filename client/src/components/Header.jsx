import { useState, useEffect } from "react";
import { useTheme } from '@/context/ThemeContext.jsx';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export const Header = ({ toggleSidebar }) => {
  const { theme } = useTheme(); // retained if future use; button removed
  const darkMode = theme === 'dark';
  const [usernameInitials, setUsernameInitials] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateUserStatus = () => {
    // Check for both token/userId (for API calls) AND user object (for display info)
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const user = localStorage.getItem("user");
    
    // User is authenticated if they have both token/userId AND user object
    if (token && userId && user) {
      try {
        const parsed = JSON.parse(user);
        const username = parsed.username || parsed.name || "";
        if (username) {
          const initials = username
            .split(" ")
            .map((word) => word[0]?.toUpperCase())
            .join("")
            .slice(0, 2);
          setUsernameInitials(initials || "US");
          setIsLoggedIn(true);
          return;
        }
      } catch {
        console.warn("Failed to parse user from localStorage.");
      }
    }
    
    // If any authentication data is missing, user is not logged in
    setIsLoggedIn(false);
    setUsernameInitials(null);
  };

  useEffect(() => {
    updateUserStatus();

    window.addEventListener("userStatusChanged", updateUserStatus);
    return () =>
      window.removeEventListener("userStatusChanged", updateUserStatus);
  }, []);

  const toggleDarkMode = () => {
    toggleTheme();
    // backend persistence kept minimal; handled previously if needed
  };

  const handleLogout = () => {
    // Clear ALL authentication-related localStorage items
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("cfHandle");
    localStorage.removeItem("lcHandle");
    localStorage.removeItem("pendingVerificationUserId");
    localStorage.removeItem("pendingVerificationEmail");
    
    // Trigger user status change
    window.dispatchEvent(new Event("userStatusChanged"));
  };

  return (
    <header
      className="flex h-14 items-center gap-4 px-4 lg:px-6 border-b justify-between"
      style={{
        backgroundColor: "#161A30",
        borderColor: "#31304D",
      }}
    >
      {/* Left section: search & hamburger */}
      <div className="flex items-center gap-4 flex-1">
        {toggleSidebar && (
          <button className="sm:hidden" onClick={toggleSidebar}>
            <Menu className="h-6 w-6 text-[#F0ECE5]" />
          </button>
        )}

        <div className="relative w-full max-w-sm">
          <Search
            className="absolute left-2.5 top-2.5 h-4 w-4"
            style={{ color: "#B6BBC4" }}
          />
          <Input
            type="search"
            placeholder="Search problems, contests..."
            className="w-full appearance-none pl-8 shadow-none border-none"
            style={{
              backgroundColor: "#31304D",
              color: "#F0ECE5",
              borderRadius: "6px",
            }}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
  {/* Theme toggle removed as requested */}

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="" alt="User Avatar" />
              <AvatarFallback
                style={{ backgroundColor: "#B6BBC4", color: "#161A30" }}
              >
                {usernameInitials}
              </AvatarFallback>
            </Avatar>
            <Button
                size="sm"
                onClick={handleLogout}
                className="group relative overflow-hidden transform-gpu hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md hover:shadow-rose-500/25 focus-visible:ring-2 focus-visible:ring-rose-400/60 transition-all duration-300"
                style={{
                  backgroundColor: "#31304D",
                  color: "#F0ECE5",
                  border: "1px solid #444360"
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/15 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Logout</span>
              </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button
                size="sm"
                className="group relative overflow-hidden transform-gpu hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md hover:shadow-emerald-500/25 focus-visible:ring-2 focus-visible:ring-emerald-400/60 transition-all duration-300"
                style={{
                  backgroundColor: "#31304D",
                  color: "#F0ECE5",
                  border: "1px solid #444360"
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/15 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">Login</span>
              </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
