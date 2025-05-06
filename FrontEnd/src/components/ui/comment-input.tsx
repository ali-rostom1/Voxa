import { Loader2 } from "lucide-react";
import { FC } from "react";



interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder: string;
  isSubmitting: boolean;
  submitLabel: string;
}


export const CommentInput: FC<CommentInputProps> = ({
    value,
    onChange,
    onSubmit,
    onCancel,
    placeholder,
    isSubmitting,
    submitLabel,
  }) => (
    <div className="mb-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={onCancel ? 2 : 3}
      />
      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`mt-2 px-4 py-2 text-white rounded-full flex items-center gap-2 ${
            isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 px-4 py-2 text-gray-600 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );