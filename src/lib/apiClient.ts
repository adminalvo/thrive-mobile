import toast from "react-hot-toast";

interface FetchOptions extends RequestInit {
  showToastOnError?: boolean;
}

/**
 * Global fetch wrapper for consistent error handling.
 */
export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { showToastOnError = true, ...fetchOptions } = options;
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      if (showToastOnError) {
        let errorMsg = "Xəta baş verdi";
        try {
          const errData = await response.clone().json();
          if (errData.error) errorMsg = errData.error;
        } catch(e) {
          if (response.status === 401) errorMsg = "Sessiya vaxtı bitib, yenidən daxil olun";
          else if (response.status === 403) errorMsg = "Bu əməliyyat üçün icazəniz yoxdur";
          else if (response.status === 404) errorMsg = "Məlumat tapılmadı";
          else if (response.status >= 500) errorMsg = "Sistem xətası";
        }
        toast.error(errorMsg);
      }
    }
    
    return response;
  } catch (error: any) {
    if (showToastOnError) {
      toast.error(error.message || "Şəbəkə xətası. İnternet bağlantınızı yoxlayın.");
    }
    throw error;
  }
}
