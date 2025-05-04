import { FC, useState, FormEvent } from 'react';
import { PenLine } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import Swal from 'sweetalert2';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePlalistModal: FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '' ,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try{
        const response = await apiClient.post('/api/v1/playlists',formData);
        Swal.fire({
            title: "Success!",
            text: "Playlist created successfully",
            icon: "success"
        });
    }catch(err: any){
       Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err?.response?.data?.message
       });
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
            Create Playlist
          </h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Enter description"
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
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};