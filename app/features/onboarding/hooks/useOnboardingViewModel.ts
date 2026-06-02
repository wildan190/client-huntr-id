import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { OnboardingController } from "../services/onboardingController";
import type { CompanyFormData, UploadedDoc, NpwpVerifiedData } from "../types";

/**
 * useOnboardingViewModel
 * 
 * Tanggung jawab: Mengelola state UI (Presentation Logic).
 * Menghubungkan View dengan Controller sesuai pola MVVM.
 */
export const useOnboardingViewModel = () => {
  const navigate = useNavigate();

  // --- State: Navigasi & Identitas ---
  const [slide, setSlide] = useState(1);
  const [user, setUser] = useState<any>(null);

  // --- State: Status Proses ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- State: Form Data ---
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: "", tax_id: "", email: "", phone: "",
    type: "buyer", industry_type: "", about: "", region: "",
    provincy_country: "Indonesia", regency: "", city: "",
    zip_code: "", address: "", bank_name: "", bank_account: "",
    bank_account_name: "",
  });

  // --- State: Verifikasi & Dokumen ---
  const [isVerifyingNpwp, setIsVerifyingNpwp] = useState(false);
  const [npwpVerifiedData, setNpwpVerifiedData] = useState<NpwpVerifiedData | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- State: Hasil Akhir ---
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // --- Inisialisasi Sesi User ---
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      navigate("/login");
      return;
    }
    const u = JSON.parse(session);
    setUser(u);
    setFormData(prev => ({
      ...prev,
      email: u.email || prev.email,
      phone: u.whatsapp || prev.phone
    }));
  }, [navigate]);

  /**
   * Mengupdate field form secara dinamis
   */
  const updateField = useCallback((k: keyof CompanyFormData, v: string) => {
    setFormData(prev => ({ ...prev, [k]: v }));
  }, []);

  /**
   * Melakukan verifikasi NPWP melalui Controller
   */
  const handleVerifyNpwp = async () => {
    setIsVerifyingNpwp(true);
    setError(null);
    try {
      const data = await OnboardingController.verifyTaxId(formData.tax_id);
      setNpwpVerifiedData(data);
      
      // Auto-fill form berdasarkan data NPWP yang valid
      setFormData(prev => ({
        ...prev,
        company_name: prev.company_name || data.nama,
        address: prev.address || data.alamat,
        // ... field lainnya bisa ditambahkan sesuai kebutuhan
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifyingNpwp(false);
    }
  };

  /**
   * Menangani upload dokumen legal
   */
  const handleDocUpload = async (file: File, docType: string) => {
    setIsUploadingDoc(true);
    setError(null);
    try {
      const doc = await OnboardingController.uploadLegalDoc(file, docType);
      setUploadedDocs(prev => [...prev, doc]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  /**
   * Finalisasi proses onboarding
   */
  const handleCompanySubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { company, allCompanies } = await OnboardingController.completeOnboarding({
        formData, user, uploadedDocs, selectedFile
      });

      setCompanies(allCompanies);
      setSelectedCompany(allCompanies[0] || company);
      setSlide(6); // Pindah ke slide sukses
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API Public ViewModel ---
  return {
    // State
    slide, setSlide,
    formData,
    isLoading, error, setError,
    isVerifyingNpwp, npwpVerifiedData,
    uploadedDocs, setUploadedDocs,
    isUploadingDoc,
    selectedFile, setSelectedFile,
    companies, selectedCompany, setSelectedCompany,
    user,

    // Actions
    updateField,
    handleVerifyNpwp,
    handleDocUpload,
    handleCompanySubmit,
  };
};
