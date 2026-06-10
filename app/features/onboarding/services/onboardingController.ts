import { OnboardingRepository } from "./onboardingService";
import type { CompanyFormData, UploadedDoc } from "../types";

/**
 * OnboardingController
 * 
 * Tanggung jawab: Mengelola logika bisnis onboarding (orchestration).
 * Menghubungkan ViewModel dengan Repository dan menangani transformasi data kompleks.
 */
export const OnboardingController = {
  /**
   * Menangani proses verifikasi NPWP dan memformat hasilnya
   */
  async verifyTaxId(taxId: string, country: string) {
    const rawNpwp = taxId.replace(/[^\d]/g, "");
    if (rawNpwp.length !== 15 && rawNpwp.length !== 16) {
      throw new Error("Nomor NPWP harus 15 atau 16 digit.");
    }

    const formattedNpwp = rawNpwp.length === 15 ? "0" + rawNpwp : rawNpwp;
    const res = await OnboardingRepository.verifyNpwp(formattedNpwp, country);
    
    if (res.status !== 1 || !res.data) {
      throw new Error(res.message || "Verifikasi NPWP gagal.");
    }
    
    return res.data;
  },

  /**
   * Menangani upload dokumen legalitas
   */
  async uploadLegalDoc(file: File, docType: string): Promise<UploadedDoc> {
    const fd = new FormData();
    fd.append("document", file);
    const res = await OnboardingRepository.uploadDocument(fd);
    
    return {
      name: file.name,
      type: docType,
      file_path: res.file_path,
      url: res.url,
      localName: file.name,
    };
  },

  /**
   * Menangani pendaftaran perusahaan dan impor data awal
   */
  async completeOnboarding(params: {
    formData: CompanyFormData;
    user: any;
    uploadedDocs: UploadedDoc[];
    selectedFile: File | null;
  }) {
    const { formData, user, uploadedDocs, selectedFile } = params;

    // 1. Persiapkan payload pendaftaran
    const payload = {
      ...formData,
      name: formData.company_name,
      user_id: user?.id,
      documents: uploadedDocs.map(d => ({
        name: d.type,
        type: d.type,
        file_path: d.file_path,
      })),
    };

    // 2. Daftar Perusahaan
    const res = await OnboardingRepository.registerCompany(payload);
    const company = res.company || res;

    // 3. Impor data historis/katalog jika ada file
    if (selectedFile && company.id) {
      const fd = new FormData();
      fd.append("company_id", String(company.id));
      fd.append("csv", selectedFile);
      
      if (formData.type === "buyer") {
        await OnboardingRepository.importHistoricalPo(fd);
      } else {
        await OnboardingRepository.importCatalogue(fd);
      }
    }

    // 4. Ambil data terbaru untuk sinkronisasi state
    const data = await OnboardingRepository.getMyCompanies(user.id);
    return {
      company,
      allCompanies: data.companies || [company]
    };
  }
};
