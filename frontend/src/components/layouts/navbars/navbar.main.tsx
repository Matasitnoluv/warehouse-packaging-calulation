import { TabNav } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/logout.services";
import mainApi from "@/apis/main.api";

const roleColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-800 border-blue-400",
  manager: "bg-orange-100 text-orange-800 border-orange-400",
  admin: "bg-red-100 text-red-800 border-red-400",
};

const NavbarMain = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await mainApi.get("/v1/auth/verify", { withCredentials: true });
        if (response.data?.responseObject?.user) {
          setRole(response.data.responseObject.user.status_role?.toLowerCase() || "");
          setUsername(response.data.responseObject.user.username || "");
        } else if (response.data?.user) {
          setRole(response.data.user.status_role?.toLowerCase() || "");
          setUsername(response.data.user.username || "");
        } else if (response.data?.responseObject?.status_role) {
          setRole(response.data.responseObject.status_role?.toLowerCase() || "");
        }
      } catch (error) {
        setRole("");
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdminOrManager = role === "admin" || role === "manager";

  return (
    <div className="flex flex-col sm:flex-row py-4 justify-between items-center">
      {/* Logo */}
      <div className="flex justify-between w-full sm:w-auto items-center">
        <img
          alt="Your Company"
          src="https://cdn.freebiesupply.com/logos/large/2x/warehouse-logo-png-transparent.png"
          className="h-14 mx-8"
        />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden text-2xl px-4 py-2">
          ☰
        </button>
      </div>

      {/* แสดง role ปัจจุบัน */}
      {role && (
        <div className={`border rounded px-3 py-1 mx-2 font-semibold flex items-center text-sm ${roleColors[role] || "bg-gray-100 text-gray-800 border-gray-400"}`}>
          <span className="mr-2">เข้าสู่ระบบในฐานะ:</span>
          <span className="uppercase">{role}</span>
          {username && <span className="ml-2 text-xs font-normal text-gray-500">({username})</span>}
        </div>
      )}

      {/* Navbar Links */}
      <div
        className={`flex-col sm:flex-row sm:flex p-2 mx-2 sm:flex-grow sm:justify-end transition-all duration-300 ${isMobileMenuOpen ? "flex" : "hidden sm:flex"
          }`}
      >
        <TabNav.Root className="flex flex-col sm:flex-row">
          <TabNav.Link href="/" className="p-2">Home</TabNav.Link>
          <TabNav.Link href="/dashboard" className="p-2">Monitor</TabNav.Link>
          <TabNav.Link href="/msproduct" className="p-2">Product Management</TabNav.Link>
          <TabNav.Link href="/Msbox" className="p-2">Box Management</TabNav.Link>
          {isAdminOrManager && (
            <TabNav.Link href="/mswarahouse" className="p-2">Warehouse Management</TabNav.Link>
          )}
          <TabNav.Link href="/user-management" className="p-2">User Management</TabNav.Link>
          <TabNav.Link href="/calculationproductbox" className="p-2">Calculation</TabNav.Link>
          <TabNav.Link href="/export" className="p-2">Export</TabNav.Link>
          <TabNav.Link onClick={handleLogout} className="p-2 cursor-pointer">Log Out</TabNav.Link>
        </TabNav.Root>
      </div>
    </div>
  );
};

export default NavbarMain;