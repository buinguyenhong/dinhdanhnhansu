
import { createClient } from '@supabase/supabase-js';
import { Staff, Province, Ward } from './types';

const supabaseUrl = 'https://sifwtbfuqutdgpvhtbkx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpZnd0YmZ1cXV0ZGdwdmh0Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDE5NzcsImV4cCI6MjA4MjA3Nzk3N30.wPbvgtAlDUxzZGiwsxuc1CFoji2v-fbC7Au18-zUY2I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  getDepartments: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('staff')
      .select('department_name');
    
    if (error || !data) {
      console.error("Lỗi lấy khoa:", error);
      return [];
    }
    const uniqueDepts = Array.from(new Set(data.map((item: any) => item.department_name as string)));
    return uniqueDepts.filter(Boolean) as string[];
  },

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

  getProvinces: async (): Promise<Province[]> => {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name');
    
    if (error) return [];
    return (data as Province[]) || [];
  },

  getWards: async (provinceCode: string): Promise<Ward[]> => {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .eq('province_code', provinceCode)
      .order('name');
    
    if (error) return [];
    return (data as Ward[]) || [];
  },

  saveStaffUpdate: async (staffId: string, payload: any) => {
    const { error } = await supabase
      .from('staff')
      .update({
        phone: payload.phone,
        email: payload.email,
        province_code: payload.province_code,
        ward_code: payload.ward_code,
        address_permanent: payload.address_permanent,
        cccd_number: payload.cccd_number,
        cccd_date: payload.cccd_date,
        cccd_issuer: payload.cccd_issuer,
        
        // Cập nhật các trường mới
        birthday: payload.birthday,
        gender: payload.gender,
        ethnicity: payload.ethnicity,
        place_of_birth: payload.place_of_birth,
        hometown: payload.hometown,
        software_code: payload.software_code,
        
        cccd_front_url: payload.cccd_front_url,
        cccd_back_url: payload.cccd_back_url,
        signature_url: payload.signature_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', staffId);
    
    if (error) throw error;
    return true;
  }
};
