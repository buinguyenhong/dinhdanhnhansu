
export interface Department {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  department_name: string;
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
  cccd_front_url?: string;
  cccd_back_url?: string;
}
