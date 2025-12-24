
import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  CreditCard,
  Calendar,
  ShieldCheck
} from 'lucide-react';

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

  const [formData, setFormData] = useState<UpdateStaffPayload>({
    phone: '',
    email: '',
    province_code: '',
    ward_code: '',
    address_permanent: '',
    cccd_number: '',
    cccd_date: '',
    cccd_issuer: '',
  });

  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null
  });

  const [previews, setPreviews] = useState<{ front: string; back: string }>({
    front: '',
    back: ''
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
        setError("Không thể tải danh mục từ máy chủ.");
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

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      phone: '',
      email: '',
      province_code: '',
      ward_code: '',
      address_permanent: '',
      cccd_number: '',
      cccd_date: '',
      cccd_issuer: '',
    });
    setPreviews({ front: '', back: '' });
    setFiles({ front: null, back: null });
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
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
      const [frontUrl, backUrl] = await Promise.all([
        storageService.uploadCCCD(files.front, `${selectedStaff.id}_cccd1`),
        storageService.uploadCCCD(files.back, `${selectedStaff.id}_cccd2`)
      ]);

      await supabaseService.saveStaffUpdate(selectedStaff.id, {
        ...formData,
        cccd_front_url: frontUrl,
        cccd_back_url: backUrl
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
      formData.cccd_issuer
    );
  };

  const ProgressIndicator = () => (
    <div className="flex justify-between items-center mb-10 px-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <div className={`h-1.5 w-24 rounded-full transition-all duration-700 ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          <span className={`text-[10px] font-black uppercase tracking-tighter ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
            BƯỚC {s}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen pb-20 pt-6 px-4">
      <header className="max-w-lg mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Fingerprint size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Identity Hub</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Employee Verification</p>
          </div>
        </div>
        {step > 1 && step < 4 && (
          <button onClick={() => setStep(step - 1)} className="w-11 h-11 glass-card rounded-2xl flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-all">
            <ArrowLeft size={20} />
          </button>
        )}
      </header>

      {isLoading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="font-black text-slate-700 uppercase tracking-widest text-xs">Đang xử lý dữ liệu...</p>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto">
        {step < 4 && <ProgressIndicator />}
        
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-5 rounded-r-[1.5rem] text-red-700 flex items-center gap-4 animate-in fade-in">
            <AlertCircle size={24} />
            <div>
              <p className="text-sm font-black uppercase tracking-tight">Đã xảy ra lỗi</p>
              <p className="text-xs font-semibold opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* BƯỚC 1: CHỌN NHÂN VIÊN */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="glass-card p-10 rounded-[3rem] shadow-2xl">
              <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">Bắt đầu xác thực</h2>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase ml-3 tracking-widest">Phòng ban / Khoa</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <select 
                    className="w-full h-16 pl-14 pr-5 rounded-[1.5rem] border-2 border-transparent bg-white shadow-inner focus:border-indigo-500 outline-none font-bold text-slate-700 appearance-none transition-all"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">Chọn khoa/phòng...</option>
                    {depts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedDept && (
              <div className="space-y-3 animate-in slide-in-from-bottom-8 duration-500">
                <p className="text-xs font-black text-slate-400 uppercase ml-5 tracking-[0.2em]">Danh sách nhân viên</p>
                <div className="grid grid-cols-1 gap-3">
                  {staffList.length > 0 ? staffList.map(staff => (
                    <button
                      key={staff.id}
                      onClick={() => handleStaffSelect(staff)}
                      className="w-full glass-card p-6 rounded-[2rem] flex items-center justify-between border-2 border-transparent hover:border-indigo-200 hover:bg-white active:scale-[0.98] transition-all shadow-lg group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <User size={26} />
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-slate-800 text-lg leading-none mb-1">{staff.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{staff.id}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </button>
                  )) : (
                    <div className="p-10 text-center text-slate-400 font-bold italic">Không có nhân viên trong khoa này</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BƯỚC 2: THÔNG TIN LIÊN LẠC & CCCD */}
        {step === 2 && selectedStaff && (
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <h2 className="text-4xl font-black mb-1 leading-tight">{selectedStaff.name}</h2>
              <p className="text-indigo-100 text-sm font-black uppercase tracking-[0.2em] opacity-80">
                {selectedStaff.department_name}
              </p>
            </div>

            <div className="glass-card p-10 rounded-[3rem] shadow-2xl space-y-8">
              {/* Địa chỉ & Liên lạc Section */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-100 pb-2">Thông tin địa chỉ & Liên lạc</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Tỉnh / Thành phố</label>
                    <select name="province_code" value={formData.province_code} onChange={handleInputChange} className="w-full h-14 bg-white rounded-[1.2rem] px-5 font-bold border-2 border-slate-50 outline-none shadow-sm focus:border-indigo-400 transition-all text-sm">
                      <option value="">Chọn Tỉnh</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Quận / Huyện / Xã</label>
                    <select name="ward_code" value={formData.ward_code} onChange={handleInputChange} className="w-full h-14 bg-white rounded-[1.2rem] px-5 font-bold border-2 border-slate-50 outline-none shadow-sm focus:border-indigo-400 transition-all text-sm">
                      <option value="">Chọn Xã/Phường</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" name="address_permanent" value={formData.address_permanent} onChange={handleInputChange} placeholder="Địa chỉ thường trú (sau sát nhập)" className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại di động" className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email cá nhân" className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm" />
                  </div>
                </div>
              </div>

              {/* CCCD Details Section */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-100 pb-2">Chi tiết căn cước công dân</p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="number" name="cccd_number" value={formData.cccd_number} onChange={handleInputChange} placeholder="Số căn cước công dân (12 số)" className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="date" name="cccd_date" value={formData.cccd_date} onChange={handleInputChange} className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm" />
                  </div>

                  <div className="relative">
                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <select name="cccd_issuer" value={formData.cccd_issuer} onChange={handleInputChange} className="w-full h-14 pl-14 pr-6 bg-white border-2 border-slate-50 rounded-[1.2rem] font-bold outline-none shadow-sm focus:border-indigo-400 transition-all text-sm appearance-none">
                      <option value="">Chọn Nơi cấp</option>
                      <option value="BỘ CÔNG AN">BỘ CÔNG AN</option>
                      <option value="CỤC TRƯỞNG CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI">CỤC TRƯỞNG CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(3)}
                disabled={!isStep2Valid()}
                className="w-full h-18 bg-indigo-600 text-white rounded-[1.8rem] font-black text-lg shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-3"
              >
                Tiếp tục: Chụp ảnh thẻ <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: TẢI ẢNH CCCD */}
        {step === 3 && selectedStaff && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Hình ảnh CCCD</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Chụp rõ nét, không mất góc</p>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {[ {id: 'front' as const, label: 'Thẻ Mặt Trước'}, {id: 'back' as const, label: 'Thẻ Mặt Sau'} ].map(side => (
                <div key={side.id} className="relative glass-card p-5 rounded-[3rem] border-2 border-dashed border-slate-200 group transition-all hover:border-indigo-400">
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, side.id)} className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                  <div className="aspect-[1.6/1] bg-slate-50 rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden transition-all group-hover:bg-indigo-50 shadow-inner">
                    {previews[side.id] ? (
                      <img src={previews[side.id]} className="w-full h-full object-cover animate-in fade-in zoom-in-110 duration-700" alt={side.label} />
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-indigo-500 shadow-xl mb-4">
                          <Camera size={40} />
                        </div>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">{side.label}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleFinalSubmit}
              disabled={!previews.front || !previews.back}
              className="w-full h-20 bg-green-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-green-100 active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center gap-4"
            >
              <CheckCircle2 size={32} /> XÁC NHẬN VÀ GỬI HỒ SƠ
            </button>
          </div>
        )}

        {/* BƯỚC 4: THÀNH CÔNG */}
        {step === 4 && (
          <div className="glass-card p-16 rounded-[4rem] shadow-2xl flex flex-col items-center text-center space-y-10 animate-in zoom-in-90 duration-700">
            <div className="w-32 h-32 bg-gradient-to-tr from-green-500 to-emerald-700 text-white rounded-full flex items-center justify-center shadow-2xl scale-110">
              <CheckCircle2 size={72} />
            </div>
            <div className="space-y-3">
              <h2 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">Hoàn tất!</h2>
              <p className="text-slate-500 font-bold text-lg px-6 leading-relaxed">
                Hồ sơ của <strong>{selectedStaff?.name}</strong> đã được cập nhật thành công.
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl"
            >
              Về Trang Chủ
            </button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 left-0 right-0 px-4 text-center">
        <div className="max-w-xs mx-auto glass-card py-3 px-6 rounded-full inline-flex items-center gap-3 shadow-xl">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Cloud Infrastructure Syncing</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
