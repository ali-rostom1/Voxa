import { FC } from 'react';
import { Upload } from 'lucide-react';
import Link from 'next/link';

export const UploadButton: FC<{ isMobile: boolean }> = ({isMobile}) => {
    return (
        <Link href="/upload">   
            {isMobile ? <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Upload size={20} className="text-gray-600 dark:text-gray-300" />
        </button> : <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
      Upload
    </button>}
        </Link>
    );
  };