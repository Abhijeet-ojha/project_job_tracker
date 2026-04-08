import { Briefcase, LogOut, Moon, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from "@/hooks/useDarkMode";

interface HeaderProps {
  onAddClick: () => void;
}

const Header = ({ onAddClick }: HeaderProps) => {
  const { logout, token } = useAuth();
  const { isDark, toggle } = useDarkMode();

  const getUserInitial = () => {
    try {
      if (!token) return "U";
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email: string = payload.email || "";
      return email.charAt(0).toUpperCase() || "U";
    } catch {
      return "U";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/85 dark:bg-card/90 backdrop-blur-xl border-b border-border/50">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] shadow-sm">
            <Briefcase className="h-[18px] w-[18px] text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-foreground">
              Job Tracker
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
              AI-Powered
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            id="dark-mode-toggle"
            onClick={toggle}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-container transition-all duration-150"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* User avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 text-[13px] font-semibold text-primary select-none">
            {getUserInitial()}
          </div>

          {/* Add button */}
          <Button
            id="add-application-btn"
            onClick={onAddClick}
            size="sm"
            className="gap-1.5 rounded-lg bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-150 ml-1"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Button>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={logout}
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-container transition-all duration-150"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
