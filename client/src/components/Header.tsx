import { Moon, Sun, Home, Upload } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <span className="text-primary font-bold text-xl cursor-pointer">ImageShare</span>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link href="/">
                <span className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${location === '/' 
                    ? 'text-primary bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Home className="h-4 w-4 mr-2" />
                  Gallery
                </span>
              </Link>
              <Link href="/upload">
                <span className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${location === '/upload' 
                    ? 'text-primary bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </span>
              </Link>
            </nav>
          </div>
          
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
