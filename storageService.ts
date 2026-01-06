
/**
 * CLOUDINARY SERVICE CONFIGURATION
 * Cập nhật để đảm bảo tính duy nhất cho mỗi file tải lên.
 */

const CLOUD_NAME = 'dqn6opztb'; 
const UPLOAD_PRESET = 'nhan_vien_preset'; 

export const storageService = {
  uploadCCCD: async (file: File, fileName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    /**
     * Để tránh ghi đè (overwrite) và lỗi cache ảnh cũ trên trình duyệt,
     * chúng ta thêm timestamp vào public_id.
     * Kết quả sẽ có dạng: [MãNV]_cccd1_1709123456789
     */
    const uniquePublicId = `${fileName}_${Date.now()}`;
    formData.append('public_id', uniquePublicId); 

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
