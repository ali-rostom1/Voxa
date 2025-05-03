import { useState, useRef } from 'react';
import { Category } from '@/types';
import { CategorySelect } from '@/components/ui/category-select';
import apiClient from '@/lib/apiClient';
import Swal from 'sweetalert2';

interface UploadVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

interface VideoFormData {
  title: string;
  description: string;
  category_id: number | null;
  video_upload: File | null;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    category_id: null,
    video_upload: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategorySelect = (categoryId: number) => {
    setFormData(prev => ({ ...prev, category_id: categoryId }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, video_upload: e.target.files![0] }));
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('api/v1/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        setFormData({
          title: '',
          description: '',
          category_id: categories.length > 0 ? categories[0].id : null,
          video_upload: null
        });
        onClose();
        Swal.fire({
          position: "bottom-right",
          icon: "success",
          title: "Your video is being processed",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        console.error('Error uploading video:', response.data.message);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg sm:max-w-md bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Upload Video</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Video Upload Area */}
          <div 
            className={`mb-4 p-4 border-2 border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 ${
              formData.video_upload ? 'bg-green-50 border-green-400' : ''
            }`}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            
            {formData.video_upload ? (
              <div>
                <svg className="w-8 h-8 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-gray-600 truncate">{formData.video_upload.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.video_upload.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Click to browse for a video</p>
                <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV up to 100MB</p>
              </div>
            )}
          </div>
          
          {/* Title Input */}
          <div className="mb-4">
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter video title"
              required
            />
          </div>
          
          {/* Description Input */}
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter video description"
            />
          </div>
          
          {/* Category Select */}
          <div className="mb-5">
            <CategorySelect
              categories={categories}
              selectedCategoryId={formData.category_id}
              onCategorySelect={handleCategorySelect}
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${
                !formData.video_upload || !formData.title ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!formData.video_upload || !formData.title}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};