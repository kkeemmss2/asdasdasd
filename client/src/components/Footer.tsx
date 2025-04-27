import { Info, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="About">
              <Info className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Contact">
              <Mail className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="GitHub">
              <Github className="h-5 w-5" />
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-400">&copy; {new Date().getFullYear()} ImageShare. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
