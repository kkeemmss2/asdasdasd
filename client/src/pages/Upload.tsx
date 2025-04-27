import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadCard from "@/components/UploadCard";
import Notification from "@/components/Notification";
import { NotificationType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Upload() {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    isOpen: boolean;
  }>({
    message: "",
    type: "success",
    isOpen: false,
  });
  
  const showNotification = (message: string, type: NotificationType) => {
    setNotification({
      message,
      type,
      isOpen: true,
    });
  };
  
  const closeNotification = () => {
    setNotification(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="pl-0 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Upload a New Image</h1>
        
        <UploadCard 
          onUploadSuccess={(message) => {
            showNotification(message, "success");
          }}
          onError={(message) => showNotification(message, "error")}
        />
      </main>
      
      <Footer />
      
      <Notification
        message={notification.message}
        type={notification.type}
        isOpen={notification.isOpen}
        onClose={closeNotification}
      />
    </div>
  );
}