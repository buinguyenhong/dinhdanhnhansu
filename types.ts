
export interface Department {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  department_name: string;
  title?: string;
  password?: string; // Mật khẩu để xác thực (MK)
  software_code?: string; // MAPM
}

export interface Province {
  code: string;
  name: string;
}

export interface Ward {
  code: string;
  name: string;
  province_code: string;
}

export interface UpdateStaffPayload {
  phone: string;
  email: string;
  province_code: string;
  ward_code: string;
  address_permanent: string;
  cccd_number: string;
  cccd_date: string;
  cccd_issuer: string;
  
  // Các trường mới bổ sung
  birthday: string;
  gender: string;
  ethnicity: string;
  place_of_birth: string;
  hometown: string;
  software_code: string;
  
  cccd_front_url?: string;
  cccd_back_url?: string;
  signature_url?: string;
}
