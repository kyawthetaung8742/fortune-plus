import { Icons } from "@/components/ui/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const Navbar = () => {
  const name = localStorage.getItem("name");
  const { open, isMobile } = useSidebar();

  return (
    <>
      <header
        className={cn(
          "fixed z-40 bg-white border-b rounded-lg w-[calc(100%-18.5rem)]",
          "flex h-16 shrink-0 items-center gap-2 px-4 shadow-sm",
          !open || isMobile ? "w-[calc(100%-2.5rem)]" : "w-[calc(100%-18.5rem)]"
        )}
      >
        <div className="ml-auto flex items-center gap-4">
          <button className="border-1 border-gray-200 p-2 rounded-sm text-gray-500 hover:text-black">
            <Icons.moon size={24} />
          </button>
          <button className="border-1 border-gray-200 p-2 rounded-sm text-gray-500 hover:text-black">
            <Icons.bellDot size={24} />
          </button>
          <button className="flex gap-2 items-center px-2  border-1 border-gray-200 rounded-sm text-gray-500 hover:text-black">
            <Icons.circleUser size={24} />
            <div className="flex flex-col text-left">
              <span className="text-sm p-0 font-bold">{name}</span>
              <span className="text-sm p-0">Admin</span>
            </div>
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;
