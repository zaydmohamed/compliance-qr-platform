import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../../utils/api';
import { Modal } from '../../components/Modal';
import {
  Building2,
  UserPlus,
  QrCode,
  CheckCircle2,
  Copy,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  ORGANIZATION_TYPES,
  CATEGORY_COMPLAINTS_MAP,
  getCategoriesForType,
} from '../../constants/categories';
import { isValidSomaliPhone, normalizeSomaliPhone } from '../../utils/phone.util';

const ORG_TYPE_OPTIONS = [
  { value: 'HOTEL', label: 'Hotel (Huteel)' },
  { value: 'UNIVERSITY', label: 'University (Jaamacad)' },
  { value: 'COMPANY', label: 'Company (Shirkad / Ganacsi)' },
  { value: 'HOSPITAL', label: 'Hospital (Isbitaal / Caafimaad)' },
];

export const OrganizationCreatePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Org Data
  const [selectedType, setSelectedType] = useState(ORG_TYPE_OPTIONS[3]); // Default HOSPITAL
  const [orgData, setOrgData] = useState({
    name: '',
    displayTitle: '',
    email: '',
    phoneDigits: '',
    whatsappDigits: '',
    branch: 'Main Center',
    address: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Step 2: Org User Data
  const [userData, setUserData] = useState({
    fullName: '',
    username: '',
    phoneDigits: '',
    password: '',
  });

  // Step 3: Success Modal
  const [createdResult, setCreatedResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleNextToUser = (e) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      toast.error('Magaca xarunta waa loo baahan yahay (Organization Name is required)');
      return;
    }
    if (orgData.phoneDigits.trim() && !isValidSomaliPhone(orgData.phoneDigits.trim())) {
      toast.error('Fadlan geli 9-god oo taleefanka xarunta ah (tusaale: 615788577)');
      return;
    }
    if (orgData.whatsappDigits.trim() && !isValidSomaliPhone(orgData.whatsappDigits.trim())) {
      toast.error('Fadlan geli 9-god oo WhatsApp-ka ah (tusaale: 615788577)');
      return;
    }

    // Auto-fill user phone with org phone if empty
    if (!userData.phoneDigits && orgData.phoneDigits) {
      setUserData((prev) => ({ ...prev, phoneDigits: orgData.phoneDigits }));
    }
    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!userData.fullName.trim() || !userData.username.trim() || !userData.phoneDigits.trim()) {
      toast.error('Fadlan buuxi dhammaan xogta maamulaha xarunta');
      return;
    }
    if (!isValidSomaliPhone(userData.phoneDigits.trim())) {
      toast.error('Fadlan geli 9-god oo lambarka maamulaha ah (tusaale: 615788577)');
      return;
    }

    setSubmitting(true);
    try {
      const payloadOrg = {
        name: orgData.name.trim(),
        displayTitle: orgData.displayTitle.trim() || orgData.name.trim(),
        organizationType: selectedType.value,
        email: orgData.email.trim() || undefined,
        phone: orgData.phoneDigits.trim() ? normalizeSomaliPhone(orgData.phoneDigits.trim()) : undefined,
        whatsapp: orgData.whatsappDigits.trim() ? normalizeSomaliPhone(orgData.whatsappDigits.trim()) : undefined,
        branch: orgData.branch.trim() || 'Main Branch',
        address: orgData.address.trim() || undefined,
        description: orgData.description.trim() || undefined,
      };

      const payloadUser = {
        fullName: userData.fullName.trim(),
        username: userData.username.trim().toLowerCase(),
        phone: normalizeSomaliPhone(userData.phoneDigits.trim()),
        password: userData.password.trim() || undefined,
      };

      const formData = new FormData();
      formData.append('orgData', JSON.stringify(payloadOrg));
      formData.append('userData', JSON.stringify(payloadUser));
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.post('/admin/organizations/complete-wizard', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCreatedResult(res.data.data);
        setShowSuccessModal(true);
        setCurrentStep(3);
        toast.success('Xarunta waa la diiwaangeliyay, QR-ka waa la sameeyay, fariinta SMS-na waa la diray!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Khalad ayaa dhacay diiwaangelinta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const credText = `Platform Login Credentials:\nOrganization: ${createdResult.organization.name}\nUsername: ${createdResult.user.username}\nTemporary Password: ${createdResult.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(credText);
    toast.success('Credentials copied to clipboard!');
  };

  const autoCategories = getCategoriesForType(selectedType.value);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#F8FAFC',
      borderColor: state.isFocused ? '#2C3925' : '#E2E8F0',
      borderRadius: '0.875rem',
      padding: '2px 4px',
      fontSize: '0.8125rem',
      fontWeight: '700',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(44, 57, 37, 0.15)' : 'none',
      '&:hover': {
        borderColor: '#CBD5E1',
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '0.8125rem',
      fontWeight: '600',
      backgroundColor: state.isSelected ? '#2C3925' : state.isFocused ? '#EEF2EC' : '#FFFFFF',
      color: state.isSelected ? '#FFFFFF' : '#1E293B',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2E2D]">
          Register Organization Wizard
        </h1>
        <p className="text-xs text-[#5A5856]">
          Step-by-step guided workflow: Organization Info → Manager User → Automatic QR & 30-Day Service Activation.
        </p>
      </div>

      {/* Wizard Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 1
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : currentStep > 1
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 1 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            1
          </div>
          <span className="text-xs font-bold truncate">Organization Info</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 2
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : currentStep > 2
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 2 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            2
          </div>
          <span className="text-xs font-bold truncate">Manager User</span>
        </div>

        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            currentStep === 3
              ? 'bg-[#2C3925] text-white border-[#2C3925] shadow-sm'
              : 'bg-white text-slate-400 border-slate-200'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
              currentStep === 3 ? 'bg-[#0086FF] text-white' : 'bg-white/20'
            }`}
          >
            3
          </div>
          <span className="text-xs font-bold truncate">QR & Credentials</span>
        </div>
      </div>

      {/* STEP 1: ORGANIZATION INFORMATION */}
      {currentStep === 1 && (
        <form onSubmit={handleNextToUser} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#0086FF]" />
            <h3 className="text-base font-bold text-[#2F2E2D]">
              Step 1: Official Organization Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                placeholder="e.g. Jazeera Palace Hotel"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Display Title (Customer Facing)
              </label>
              <input
                type="text"
                value={orgData.displayTitle}
                onChange={(e) => setOrgData({ ...orgData, displayTitle: e.target.value })}
                placeholder="e.g. Huteelka Jazeera Palace"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Organization Category / Sector (React Select) *
              </label>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                options={ORG_TYPE_OPTIONS}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Branch / Location Name
              </label>
              <input
                type="text"
                value={orgData.branch}
                onChange={(e) => setOrgData({ ...orgData, branch: e.target.value })}
                placeholder="e.g. Main Branch"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            {/* Somalia Phone Input */}
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Phone (Receives Alerts)
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0086FF]/20 focus-within:border-[#0086FF]">
                <span className="px-3 py-2.5 bg-slate-200/60 text-xs font-bold text-slate-700 border-r border-slate-200">
                  +252
                </span>
                <input
                  type="tel"
                  maxLength={9}
                  value={orgData.phoneDigits}
                  onChange={(e) => setOrgData({ ...orgData, phoneDigits: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="615788577"
                  className="w-full px-3 py-2 bg-transparent text-xs text-[#2F2E2D] font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official WhatsApp Number (Optional)
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0086FF]/20 focus-within:border-[#0086FF]">
                <span className="px-3 py-2.5 bg-slate-200/60 text-xs font-bold text-slate-700 border-r border-slate-200">
                  +252
                </span>
                <input
                  type="tel"
                  maxLength={9}
                  value={orgData.whatsappDigits}
                  onChange={(e) => setOrgData({ ...orgData, whatsappDigits: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="615788577"
                  className="w-full px-3 py-2 bg-transparent text-xs text-[#2F2E2D] font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={orgData.email}
                onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                placeholder="e.g. info@jazeera.so"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={orgData.address}
                onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                placeholder="e.g. Airport Road, Mogadishu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
              Organization Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 bg-slate-50">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2C3925] file:text-white hover:file:bg-[#212B1C]"
              />
            </div>
          </div>

          {/* 10 Automatic Complaint Categories Display (Authoritative) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D]">
                Automatically Assigned Complaint Categories ({selectedType.label})
              </label>
              <p className="text-[11px] text-[#5A5856]">
                Nidaamku si toos ah ayuu 10-kan qaybood ugu qoondeeyay xaruntan:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {autoCategories.map((cat, idx) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs font-bold text-[#2C3925]"
                >
                  <span className="w-5 h-5 rounded-md bg-[#2C3925] text-white flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="truncate">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              Continue to Step 2: Manager User
              <ArrowRight className="w-4 h-4 text-[#0086FF]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: USER CREATION & GENERATION */}
      {currentStep === 2 && (
        <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6 animate-in fade-in">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-[#0086FF]" />
            <h3 className="text-base font-bold text-[#2F2E2D]">
              Step 2: Manager User & Automatic QR Generation
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-[#EEF2EC] border border-[#2C3925]/10 text-xs text-[#2C3925]">
            <p className="font-bold">Automatic Delivery via SMS:</p>
            <p className="mt-0.5 text-[11px] text-[#5A5856]">
              Marka la diiwaangeliyo, maamulaha waxaa taleefankiisa loogu diri doonaa Login URL, Username, iyo Furaha Ku-meel-gaarka ah (Default Password).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Manager Full Name *
              </label>
              <input
                type="text"
                required
                value={userData.fullName}
                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                placeholder="e.g. Ali Mohamed Hassan"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Username (Login ID) *
              </label>
              <input
                type="text"
                required
                value={userData.username}
                onChange={(e) => setUserData({ ...userData, username: e.target.value.toLowerCase() })}
                placeholder="e.g. jazeerapalace"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Manager Phone Number (Receives SMS) *
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0086FF]/20 focus-within:border-[#0086FF]">
                <span className="px-3 py-2.5 bg-slate-200/60 text-xs font-bold text-slate-700 border-r border-slate-200">
                  +252
                </span>
                <input
                  type="tel"
                  required
                  maxLength={9}
                  value={userData.phoneDigits}
                  onChange={(e) => setUserData({ ...userData, phoneDigits: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="615788577"
                  className="w-full px-3 py-2 bg-transparent text-xs text-[#2F2E2D] font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2F2E2D] mb-1">
                Initial Password (Optional — Uses Default Password if empty)
              </label>
              <input
                type="text"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                placeholder="Default System Password"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2F2E2D] focus:ring-2 focus:ring-[#0086FF]/20 focus:border-[#0086FF] outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#5A5856] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] disabled:opacity-50 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2"
            >
              {submitting ? 'Generating QR & Activating...' : 'Finish & Generate QR Code'}
              <CheckCircle2 className="w-4 h-4 text-[#0086FF]" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3 & SUCCESS MODAL */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/admin/organizations');
        }}
        title="Organization Successfully Activated!"
        subtitle="Credentials generated and 30-day service period initialized."
      >
        {createdResult && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Organization:</span>
                <span className="font-semibold text-[#2F2E2D]">
                  {createdResult.organization.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Username:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdResult.user.username}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Temporary Password:</span>
                <span className="font-mono font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {createdResult.temporaryPassword}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2C3925]">Service Period:</span>
                <span className="text-emerald-700 font-bold">30 Days Active</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs">
              <p className="font-bold text-[#0086FF] mb-1">Public QR Code URL:</p>
              <p className="font-mono text-[11px] text-slate-700 break-all">
                {window.location.origin}/c/{createdResult.qrCode.publicToken}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-[#2C3925] hover:bg-[#212B1C] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-[#0086FF]" />
                Copy Credentials
              </button>

              <button
                onClick={() => navigate(`/admin/organizations/${createdResult.organization._id}`)}
                className="flex-1 py-2.5 rounded-xl bg-[#0086FF] hover:bg-[#006ED6] text-white text-xs font-bold transition-colors text-center"
              >
                View Organization
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
