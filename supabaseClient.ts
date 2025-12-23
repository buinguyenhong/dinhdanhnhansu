
import { createClient } from '@supabase/supabase-js';
import { Staff, Province, Ward } from './types';

// Thông tin kết nối Supabase của bạn
const supabaseUrl = 'https://sifwtbfuqutdgpvhtbkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZnd0YmZ1cXV0ZGdwdmh0Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDE5NzcsImV4cCI6MjA4MjA3Nzk3N30.wPbvgtAlDUxzZGiwsxuc1CFoji2v-fbC7Au18-zUY2I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  // Lấy danh sách khoa (duy nhất) từ bảng staff
  getDepartments: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('staff')
      .select('department_name');
    
    if (error || !data) {
      console.error("Lỗi lấy khoa:", error);
      return [];
    }
    // Lọc các giá trị trùng lặp và đảm bảo kiểu dữ liệu string[]
    const uniqueDepts = Array.from(new Set(data.map((item: any) => item.department_name as string)));
    return uniqueDepts.filter(Boolean) as string[];
  },

  // Lấy nhân viên theo khoa
  getStaffByDepartment: async (deptName: string): Promise<Staff[]> => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('department_name', deptName);
    
    if (error) {
      console.error("Lỗi lấy nhân viên:", error);
      return [];
    }
    return (data as Staff[]) || [];
  },

  // Lấy tỉnh thành
  getProvinces: async (): Promise<Province[]> => {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name');
    
    if (error) return [];
    return (data as Province[]) || [];
  },

  // Lấy phường xã theo tỉnh
  getWards: async (provinceCode: string): Promise<Ward[]> => {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .eq('province_code', provinceCode)
      .order('name');
    
    if (error) return [];
    return (data as Ward[]) || [];
  },

  // Cập nhật thông tin nhân viên
  saveStaffUpdate: async (staffId: string, payload: any) => {
    const { error } = await supabase
      .from('staff')
      .update({
        phone: payload.phone,
        email: payload.email,
        province_code: payload.province_code,
        ward_code: payload.ward_code,
        cccd_front_url: payload.cccd_front_url,
        cccd_back_url: payload.cccd_back_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId);
    
    if (error) throw error;
    return true;
  }
};
