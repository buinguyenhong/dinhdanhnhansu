
/**
 * CLOUDINARY SERVICE CONFIGURATION
 * Đã cập nhật với thông tin dqn6opztb và nhan_vien_preset.
 */

const CLOUD_NAME = 'dqn6opztb'; 
const UPLOAD_PRESET = 'nhan_vien_preset'; 

export const storageService = {
  uploadCCCD: async (file: File, fileName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    /**
     * Sử dụng public_id để đặt tên file theo format: [MãNV]_cccd1
     * Lưu ý: Trong Cloudinary settings, bạn cần chọn "Use the filename... as public ID" 
     * và TẮT "Unique suffix" để tên file được giữ nguyên.
     */
    formData.append('public_id', fileName); 

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Lỗi upload lên Cloudinary.');
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw error;
    }
  }
};
