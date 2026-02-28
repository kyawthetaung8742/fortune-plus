import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { useLoading } from "@/contexts/LoadingContext";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import NavBar from "./Navbar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Main = () => {
  const { isLoading } = useLoading();
  const { open } = useSidebar();
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {isLoading && (
          <div className="flex items-center justify-center min-h-[calc(100vh)] bg-gray-100">
            <div className="w-24 h-24 border-5 border-yellow-300 rounded-full border-t-yellow-500 animate-spin"></div>
          </div>
        )}
        <main
          className={`min-h-[calc(100vh)] bg-white rounded-tl-2xl border border-gray-200 shadow-lg p-5 shadow-gray-300/50 
            ${isLoading ? "hidden" : ""} ${open ? "z-10" : ""}`}
        >
          <div className="-ml-6 md:hidden left-0 fixed">
            <SidebarTrigger className="bg-white shadow-md border rounded-full p-2 hover:bg-gray-100" />
          </div>
          <NavBar />
          <div className="h-[calc(100vh-7rem)] mt-16 overflow-auto scrollbar-none">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </>
  );
};

export default Main;
