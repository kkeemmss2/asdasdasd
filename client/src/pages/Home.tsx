import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import Notification from "@/components/Notification";
import { NotificationType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function Home() {
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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Image Gallery</h1>
          <Link href="/upload">
            <Button className="mt-4 sm:mt-0">
              <Upload className="mr-2 h-4 w-4" />
              Upload New Image
            </Button>
          </Link>
        </div>
        
        <ImageGallery />
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
