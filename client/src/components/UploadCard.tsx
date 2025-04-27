import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { UploadFormData } from "@/lib/types";
import { validateImageFile } from "@/lib/utils";

interface UploadCardProps {
  onUploadSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function UploadCard({ onUploadSuccess, onError }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<UploadFormData>({
    defaultValues: {
      title: "",
      description: "",
      image: null
    },
    mode: "onChange"
  });

  const selectedFile = watch("image");

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData) => {
      if (!data.image) throw new Error("No image selected");
      
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      formData.append("image", data.image);
      
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      reset();
      setPreviewUrl(null);
      onUploadSuccess("Image uploaded successfully!");
    },
    onError: (error) => {
      onError(error.message || "Failed to upload image");
    }
  });

  const handleFileSelect = (file: File) => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      onError(validation.message || "Invalid file");
      return;
    }
    
    setValue("image", file, { shouldValidate: true });
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const removeSelectedFile = () => {
    setValue("image", null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const onSubmit = (data: UploadFormData) => {
    uploadMutation.mutate(data);
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="mb-12">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Share an image</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Drag & Drop Area */}
            {!previewUrl ? (
              <div 
                ref={dropAreaRef}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                  isDragging 
                    ? "border-primary bg-blue-50 dark:bg-blue-900/20" 
                    : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <div className="space-y-2">
                  <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto" />
                  <p className="text-gray-500 dark:text-gray-400">Drag and drop your image here</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">or</p>
                  <Button 
                    type="button" 
                    className="px-4 py-2"
                  >
                    Browse Files
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileInputChange}
                  />
                </div>
                <div className="mt-3 text-gray-400 dark:text-gray-500 text-xs">
                  <p>Supported formats: JPG, PNG, GIF</p>
                  <p>Maximum file size: 5MB</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full rounded-lg max-h-80 object-contain bg-gray-100 dark:bg-gray-800" 
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 rounded-full shadow"
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Form Fields */}
            <div>
              <Label htmlFor="title" className="mb-1">Header</Label>
              <Input
                id="title"
                placeholder="Give your image a title"
                maxLength={100}
                {...register("title", { required: "Please add a title" })}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description" className="mb-1">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description (optional)"
                rows={3}
                maxLength={500}
                {...register("description")}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!selectedFile || !isValid || uploadMutation.isPending}
                className="px-4 py-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Share Image"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
