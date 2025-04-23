export const validateFile = (
    file: File,
    allowedTypes: string[],
    maxSizeMB: number
  ): { isValid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Please upload ${allowedTypes.join(", ")}`
      };
    }
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }
    
    return { isValid: true };
  };
  
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};