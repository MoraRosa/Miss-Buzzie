import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, Upload, FileText, FileImage, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Lazy load AssetManager
const AssetManager = lazy(() => import("@/components/AssetManager"));

interface HeaderProps {
  onImport: () => void;
  onExportPDF: () => void;
  onExportImage: () => void;
  onExportJSON: () => void;
}

const Header = ({ onImport, onExportPDF, onExportImage, onExportJSON }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src="/Miss-Buzzie/images/logo.png"
              alt="Mizzie Logo"
              className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Mizzie</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Business Planning Made Simple
              </p>
            </div>
          </div>

          <nav
            className="flex items-center gap-1.5 md:gap-2 w-full sm:w-auto"
            aria-label="Main actions"
          >
            <Suspense
              fallback={
                <div className="h-9 w-9 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              }
            >
              <AssetManager />
            </Suspense>

            <Button
              variant="outline"
              size="sm"
              onClick={onImport}
              className="h-9 px-2 md:px-3"
              aria-label="Import business plan data"
            >
              <Upload className="h-4 w-4 md:mr-2" aria-hidden="true" />
              <span className="hidden md:inline">Import</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 px-2 md:px-3"
                  aria-label="Export options"
                >
                  <Download className="h-4 w-4 md:mr-2" aria-hidden="true" />
                  <span className="hidden md:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onExportPDF}>
                  <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as PDF
                  <span className="ml-auto text-xs text-muted-foreground">Recommended</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportImage}>
                  <FileImage className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export as Image
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onExportJSON}>
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Backup Data (JSON)
                  <span className="ml-auto text-xs text-muted-foreground">For restore</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 shrink-0"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun
                className="h-4 w-4 md:h-5 md:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                aria-hidden="true"
              />
              <Moon
                className="absolute h-4 w-4 md:h-5 md:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                aria-hidden="true"
              />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

