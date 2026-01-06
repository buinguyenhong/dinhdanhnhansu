
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { storageService } from './storageService';
import { supabaseService } from './supabaseClient';
import { Staff, Province, Ward, UpdateStaffPayload } from './types';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Camera, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Fingerprint,
  Building2,
  Search,
  X,
  CreditCard,
  Calendar,
  ShieldCheck,
  PenLine,
  Lock,
  Baby,
  Users,
  Briefcase,
  Home,
  Tag,
  Dna
} from 'lucide-react';

// --- Helper Functions for Date Handling ---
const formatDisplayDate = (isoDate: string) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

const parseToISODate = (displayDate: string) => {
  const parts = displayDate.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return '';
  return `${y}-${m}-${d}`;
};

// --- Sub-component: DateInput ---
interface DateInputProps {
  label: string;
  name: string;
  value: string; // YYYY-MM-DD
  onChange: (name: string, value: string) => void;
  icon: React.ElementType;
}

const DateInput: React.FC<DateInputProps> = ({ label, name, value, onChange, icon: Icon }) => {
  const [inputValue, setInputValue] = useState(formatDisplayDate(value));

  useEffect(() => {
    setInputValue(formatDisplayDate(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Chỉ lấy số
    if (val.length > 8) val = val.substring(0, 8);

    // Tự động chèn dấu /
    let formatted = val;
    if (val.length > 2) formatted = val.substring(0, 2) + '/' + val.substring(2);
    if (val.length > 4) formatted = val.substring(0, 2) + '/' + val.substring(2, 4) + '/' + val.substring(4);

    setInputValue(formatted);

    // Nếu đủ định dạng DD/MM/YYYY thì cập nhật lên cha dưới dạng YYYY-MM-DD
    if (formatted.length === 10) {
      const iso = parseToISODate(formatted);
      if (iso) onChange(name, iso);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    onChange(name, iso);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input
          type="text"
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleInputChange}
          maxLength={10}
          className="w-full h-14 pl-14 pr-12 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
          <input
            type="date"
            value={value}
            onChange={handleNativeChange}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
          />
          <Calendar size={18} className="text-slate-300 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// --- Sub-component: SearchableSelect ---
interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, label, icon: Icon, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const selectedLabel = options.find(opt => opt.value === value)?.label || "";

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">{label}</label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative w-full h-14 bg-white rounded-[1.2rem] px-5 flex items-center border-2 transition-all cursor-pointer shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300 focus-within:border-indigo-400'} ${isOpen ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-50'}`}
      >
        <Icon className="text-slate-300 mr-3" size={18} />
        <span className={`text-sm font-bold truncate ${!selectedLabel ? 'text-slate-400' : 'text-slate-700'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronRight size={16} className={`absolute right-4 text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[1.5rem] shadow-2xl z-[100] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                autoFocus
                type="text"
                className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
                placeholder="Gõ để tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-5 py-3.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {opt.label}
                  {value === opt.value && <CheckCircle2 size={14} className="text-indigo-600" />}
                </div>
              ))
            ) : (
              <div className="p-5 text-center text-[10px] font-bold text-slate-400 uppercase italic">Không tìm thấy kết quả</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [depts, setDepts] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Selection states
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearch, setStaffSearch] = useState<string>('');
  
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateStaffPayload>({
    phone: '',
    email: '',
    province_code: '',
    ward_code: '',
    address_permanent: '',
    cccd_number: '',
    cccd_date: '',
    cccd_issuer: '',
    birthday: '',
    gender: '',
    ethnicity: '',
    place_of_birth: '',
    hometown: '',
    software_code: '',
  });

  const [files, setFiles] = useState<{ front: File | null; back: File | null; signature: File | null }>({
    front: null,
    back: null,
    signature: null
  });

  const [previews, setPreviews] = useState<{ front: string; back: string; signature: string }>({
    front: '',
    back: '',
    signature: ''
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [d, p] = await Promise.all([
          supabaseService.getDepartments(),
          supabaseService.getProvinces()
        ]);
        setDepts(d);
        setProvinces(p);
      } catch (err) {
        setError("Không thể tải danh mục.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      setIsLoading(true);
      supabaseService.getStaffByDepartment(selectedDept)
        .then(setStaffList)
        .catch(() => setError("Lỗi khi tải danh sách nhân viên."))
        .finally(() => setIsLoading(false));
    } else {
      setStaffList([]);
    }
  }, [selectedDept]);

  useEffect(() => {
    if (formData.province_code) {
      supabaseService.getWards(formData.province_code).then(setWards);
    } else {
      setWards([]);
    }
  }, [formData.province_code]);

  const handleStaffClick = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowPasswordInput(true);
    setPasswordValue('');
    setPasswordError(null);
  };

  const handleVerifyPassword = () => {
    if (!selectedStaff) return;
    const correctPassword = selectedStaff.password || (selectedStaff as any).mk;
    if (passwordValue === correctPassword) {
      setFormData(prev => ({ 
        ...prev, 
        software_code: selectedStaff.software_code || '',
        phone: (selectedStaff as any).phone || '',
        email: (selectedStaff as any).email || ''
      }));
      setStep(2);
      setShowPasswordInput(false);
    } else {
      setPasswordError("Mật khẩu không chính xác.");
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => 
      s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      (s.id && s.id.toLowerCase().includes(staffSearch.toLowerCase()))
    );
  }, [staffList, staffSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, isoValue: string) => {
    setFormData(prev => ({ ...prev, [name]: isoValue }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [side]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [side]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = async () => {
    if (!selectedStaff || !files.front || !files.back) return;
    setIsLoading(true);
    setError(null);

    try {
      const uploadPromises: Promise<string>[] = [
        storageService.uploadCCCD(files.front, `${selectedStaff.id}_cccd1`),
        storageService.uploadCCCD(files.back, `${selectedStaff.id}_cccd2`)
      ];

      const results = await Promise.all(uploadPromises);
      const frontUrl = results[0];
      const backUrl = results[1];
      
      let signatureUrl = '';
      if (files.signature) {
        signatureUrl = await storageService.uploadCCCD(files.signature, `${selectedStaff.id}_signature`);
      }

      await supabaseService.saveStaffUpdate(selectedStaff.id, {
        ...formData,
        cccd_front_url: frontUrl,
        cccd_back_url: backUrl,
        signature_url: signatureUrl
      });

      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Lỗi trong quá trình cập nhật hồ sơ.');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep2Valid = () => {
    return (
      formData.phone && 
      formData.province_code && 
      formData.ward_code && 
      formData.address_permanent && 
      formData.cccd_number && 
      formData.cccd_date && 
      formData.cccd_issuer &&
      formData.birthday &&
      formData.gender &&
      formData.ethnicity &&
      formData.place_of_birth &&
      formData.hometown
    );
  };

  return (
    <div className="min-h-screen pt-6 px-4 flex flex-col">
      <header className="max-w-lg mx-auto w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Fingerprint size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Identity Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Employee Verification</p>
          </div>
        </div>
        {step > 1 && step < 4 && (
          <button onClick={() => setStep(step - 1)} className="w-11 h-11 glass-card rounded-2xl flex items-center justify-center text-slate-600">
            <ArrowLeft size={20} />
          </button>
        )}
      </header>

      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[200] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
          <p className="font-black text-slate-700 uppercase tracking-widest text-xs">Đang xử lý...</p>
        </div>
      )}

      {showPasswordInput && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black text-center mb-6">Xác thực quyền hạn</h3>
            <input 
              type="password"
              className="w-full h-14 px-6 bg-slate-50 border-2 rounded-2xl font-bold mb-4 outline-none focus:border-indigo-400"
              placeholder="Nhập mật khẩu (MK)"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
            />
            {passwordError && <p className="text-red-500 text-[10px] font-black uppercase text-center mb-4">{passwordError}</p>}
            <button onClick={handleVerifyPassword} className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black mb-3">XÁC NHẬN</button>
            <button onClick={() => setShowPasswordInput(false)} className="w-full h-12 text-slate-400 font-black uppercase text-xs">HỦY BỎ</button>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto w-full flex-grow mb-12">
        {step === 1 && (
          <div className="space-y-6">
            <div className="glass-card p-10 rounded-[3rem] shadow-2xl">
              <h2 className="text-3xl font-black mb-8 tracking-tighter">Bắt đầu xác thực</h2>
              <SearchableSelect
                label="Phòng ban / Khoa"
                options={depts.map(d => ({ value: d, label: d }))}
                value={selectedDept}
                onChange={setSelectedDept}
                placeholder="Chọn khoa/phòng..."
                icon={Building2}
              />
            </div>
            {selectedDept && (
              <div className="space-y-3">
                <div className="relative px-2">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.5rem] font-bold outline-none focus:border-indigo-300 shadow-sm"
                    placeholder="Tìm tên nhân viên..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 max-h-[50vh] overflow-y-auto px-2 custom-scrollbar">
                  {filteredStaff.map(staff => (
                    <button key={staff.id} onClick={() => handleStaffClick(staff)} className="w-full glass-card p-6 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-indigo-200 transition-all shadow-lg">
                      <div className="flex items-center gap-5 text-left">
                        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><User size={26} /></div>
                        <div>
                          <h4 className="font-black text-slate-800 text-lg">{staff.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{staff.position || 'Nhân viên'}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && selectedStaff && (
          <div className="space-y-6">
            <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl">
              <h2 className="text-4xl font-black mb-1 tracking-tighter">{selectedStaff.name}</h2>
              <p className="text-indigo-100 text-xs font-black uppercase tracking-widest">{selectedStaff.department_name}</p>
            </div>
            <div className="glass-card p-8 rounded-[3rem] shadow-2xl space-y-10">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2"><User size={14} /> Thông tin cá nhân</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateInput label="Ngày tháng năm sinh" name="birthday" value={formData.birthday} onChange={handleDateChange} icon={Baby} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Giới tính</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 text-sm appearance-none">
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="ethnicity" value={formData.ethnicity} onChange={handleInputChange} placeholder="Dân tộc (VD: Kinh)" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                  <input type="text" name="software_code" value={formData.software_code} onChange={handleInputChange} placeholder="Mã phần mềm (MAPM)" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                </div>
                <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} placeholder="Nơi sinh" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                <input type="text" name="hometown" value={formData.hometown} onChange={handleInputChange} placeholder="Quê quán" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2"><Mail size={14} /> Liên lạc & Thường trú</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect label="Tỉnh / Thành phố" options={provinces.map(p => ({ value: p.code, label: p.name }))} value={formData.province_code} onChange={(val) => setFormData(prev => ({ ...prev, province_code: val, ward_code: '' }))} placeholder="Chọn Tỉnh" icon={MapPin} />
                  <SearchableSelect label="Xã / Phường" options={wards.map(w => ({ value: w.code, label: w.name }))} value={formData.ward_code} onChange={(val) => setFormData(prev => ({ ...prev, ward_code: val }))} placeholder="Chọn Xã" icon={MapPin} disabled={!formData.province_code} />
                </div>
                <input type="text" name="address_permanent" value={formData.address_permanent} onChange={handleInputChange} placeholder="Địa chỉ chi tiết" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email (Không bắt buộc)" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b pb-2 flex items-center gap-2"><CreditCard size={14} /> CCCD</p>
                <input type="number" name="cccd_number" value={formData.cccd_number} onChange={handleInputChange} placeholder="Số CCCD (12 số)" className="w-full h-14 px-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none focus:border-indigo-400 text-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DateInput label="Ngày cấp CCCD" name="cccd_date" value={formData.cccd_date} onChange={handleDateChange} icon={Calendar} />
                  <SearchableSelect label="Nơi cấp" options={[{ value: "BỘ CÔNG AN", label: "BỘ CÔNG AN" }, { value: "CỤC CS QLHC", label: "CỤC CS QLHC" }]} value={formData.cccd_issuer} onChange={(val) => setFormData(prev => ({ ...prev, cccd_issuer: val }))} placeholder="Chọn Nơi cấp" icon={ShieldCheck} />
                </div>
              </div>

              <button onClick={() => setStep(3)} disabled={!isStep2Valid()} className="w-full h-18 bg-indigo-600 text-white rounded-[1.8rem] font-black text-lg disabled:opacity-40 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100">
                Tiếp tục <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedStaff && (
          <div className="space-y-8">
            <div className="text-center"><h3 className="text-3xl font-black text-slate-800 tracking-tighter">Hình ảnh hồ sơ</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[ {id: 'front' as const, label: 'CCCD Mặt Trước'}, {id: 'back' as const, label: 'CCCD Mặt Sau'} ].map(side => (
                <div key={side.id} className="relative glass-card p-4 rounded-[2.5rem] border-2 border-dashed border-slate-200 group transition-all hover:border-indigo-400">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, side.id)} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                  <div className="aspect-[1.6/1] bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden">
                    {previews[side.id] ? <img src={previews[side.id]} className="w-full h-full object-cover" /> : <div className="text-center text-indigo-500 font-black text-[10px] uppercase"><Camera size={28} className="mx-auto mb-2" />{side.label}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative glass-card p-6 rounded-[3rem] border-2 border-dashed border-indigo-200 bg-indigo-50/30">
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
              <div className="aspect-[2/1] bg-white rounded-[2rem] flex flex-col items-center justify-center overflow-hidden shadow-md">
                {previews.signature ? <img src={previews.signature} className="w-full h-full object-contain p-4" /> : 
                  <div className="text-center px-6">
                    <PenLine size={32} className="mx-auto mb-3 text-indigo-600" />
                    <span className="text-xs font-black text-indigo-700 uppercase tracking-widest block">Chữ ký cá nhân</span>
                    <p className="text-[10px] text-indigo-400 font-bold mt-2 uppercase">Chỉ yêu cầu đối với nhân viên sử dụng phần mềm HIS, LIS, PAC</p>
                  </div>
                }
              </div>
            </div>
            <button onClick={handleFinalSubmit} disabled={!previews.front || !previews.back} className="w-full h-20 bg-green-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-green-100 disabled:opacity-40">XÁC NHẬN VÀ GỬI HỒ SƠ</button>
          </div>
        )}

        {step === 4 && (
          <div className="glass-card p-16 rounded-[4rem] shadow-2xl flex flex-col items-center text-center space-y-10">
            <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl scale-110"><CheckCircle2 size={72} /></div>
            <h2 className="text-5xl font-black text-slate-900 leading-tight">Hoàn tất!</h2>
            <button onClick={() => window.location.reload()} className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest">Về Trang Chủ</button>
          </div>
        )}
      </main>

      <footer className="w-full pb-10 text-center mt-auto opacity-60">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Identity Hub Infrastructure Sync</p>
      </footer>
    </div>
  );
};

export default App;
