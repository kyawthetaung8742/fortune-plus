import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Icons } from "@/components/ui/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NavLink, useLocation, Link } from "react-router-dom";

const sidebarItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Icons.layoutDashboard,
  },
  {
    title: "Exchange",
    url: "/exchange",
    icon: Icons.coins,
  },
  {
    title: "Shareholders",
    url: "/shareholders",
    icon: Icons.users,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Icons.bookUser,
  },
  {
    title: "Transaction History",
    url: "/transaction-history",
    icon: Icons.clipboardList,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: Icons.hand,
  },
  {
    title: "Payment",
    url: "/payments",
    icon: Icons.wallet,
  },
  {
    title: "User Management",
    url: "#",
    icon: Icons.user,
    items: [
      {
        title: "Users",
        url: "/users",
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { isMobile } = useSidebar();

  return (
    <Sidebar>
      {!isMobile && (
        <div className="absolute -right-5 top-4 z-50">
          <SidebarTrigger className="bg-white shadow-md border rounded-full p-2 hover:bg-gray-100" />
        </div>
      )}
      <SidebarHeader className="text-white admin-sidebar">
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-full focus:outline-none"
        >
          <img
            src="images/logo.png"
            alt="Logo"
            className="h-30 w-auto max-w-[160px] object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent>
          <SidebarMenu>
            {sidebarItems.map((item) => {
              const isCollapsibleActive = item.items?.some((subItem) =>
                location.pathname.startsWith(subItem.url),
              );

              return item.items ? (
                <Collapsible
                  key={item.title}
                  asChild
                  className="group/collapsible"
                  defaultOpen={isCollapsibleActive}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild className="cursor-pointer py-5">
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span className="text-xl">{item.title}</span>
                        <Icons.chevronRight
                          className={cn(
                            "ml-auto transition-transform duration-200",
                            "group-data-[state=open]/collapsible:rotate-90",
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild className="py-5">
                              <NavLink
                                to={subItem.url}
                                className={({ isActive }) =>
                                  isActive ||
                                  location.pathname.startsWith(subItem.url)
                                    ? "active"
                                    : ""
                                }
                                end={false}
                              >
                                <span className="text-xl">{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="py-5">
                    <NavLink to={item.url} end>
                      <item.icon />
                      <span className="text-xl">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  );
}
