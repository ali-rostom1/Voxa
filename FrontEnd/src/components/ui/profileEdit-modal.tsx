import { FC, useState, FormEvent } from 'react';
import { User, PenLine, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/AuthStore';
import { UserProfile } from '@/types';
import apiClient from '@/lib/apiClient';
import Swal from 'sweetalert2';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    old_password: '' ,
    new_password: '' ,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try{

        const submittedFormData: {
            name?: string;
            old_password?: string;
            new_password?: string;    
        } = {}
        if(formData.name !== user?.name){
            submittedFormData.name = formData.name;
        }
        if(formData.new_password){
            submittedFormData.new_password = formData.new_password;
            submittedFormData.old_password = formData.old_password
        }
        if(Object.keys(submittedFormData).length === 0){
            onClose();
            return;
        }
        const response = await apiClient.put('/api/v1/profile',submittedFormData);
        const updatedUser  = {
            id: response.data.data.id,
            name: response.data.data.name,
            email: response.data.data.email,
            pfp_path: response.data.data.pfp_path,
        };
        Swal.fire({
            title: "Success!",
            text: "Profile Edited Successfully",
            icon: "success"
          });
        updateUser(updatedUser);
    }catch(err: any){
        if(err.status === 422){
            Swal.fire({
                icon: "error",
                title: "Invalid Inputs",
                text: err.response.data.message,
            });
        }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
            <PenLine size={18} />
            Edit Profile
          </h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <User size={16} />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Lock size={16} />
              Old Password
            </label>
            <input
              type="password"
              value={formData.old_password}
              onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter old password"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Lock size={16} />
              New Password
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter new password"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-gray-600 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <PenLine size={16} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};