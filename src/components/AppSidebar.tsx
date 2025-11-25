import { LayoutDashboard, Package, FolderOpen, FileText, ShoppingCart, ClipboardList, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  // { title: "Categories", url: "/categories", icon: FolderOpen },
  { title: "Orders", url: "/orders", icon: ClipboardList },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "POS", url: "/pos", icon: ShoppingCart },
];

export function AppSidebar() {
  const { open } = useSidebar();

  const [email, setEmail] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  // After login in Login.tsx
useEffect(() => {
  // 1️⃣ Check localStorage first (custom login)
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    setEmail(user.email);
    setAvatar(user.avatar_url || "");
    return; // done, skip Supabase Auth
  }

  // 2️⃣ Fallback to Supabase Auth (Google login)
  async function fetchSupabaseUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase getSession error:", error.message);
      return;
    }

    const user = data.session?.user;
    if (user) {
      setEmail(user.email ?? "");
      setAvatar(user.user_metadata?.avatar_url ?? "");
    }
  }

  fetchSupabaseUser();

  // Listen to Supabase Auth state changes
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setEmail(session.user.email ?? "");
      setAvatar(session.user.user_metadata?.avatar_url ?? "");
    } else {
      setEmail("");
      setAvatar("");
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);



  return (
    <Sidebar className="border-r border-sidebar-border flex flex-col justify-between">
      <SidebarContent>
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-sidebar-foreground">ABYOUTIFUL</h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Email & Avatar */}
      {email && (
        <div className="flex items-center gap-3 px-6 py-4 border-t border-sidebar-border bg-sidebar-user rounded-t-lg m-3">
          {avatar ? (
            <img
              src={avatar}
              alt="User avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-50 rounded-full bg-gray-400 flex items-center justify-center text-white">
              {email.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-sidebar-foreground truncate">{email}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{open ? "Admin" : ""}</span>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
