/**
 * Modular validator functions for Driver Verification
 * Keeping these separate allows easy replacement or backend API integration in the future.
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validate Full Name
 * - Required, 3 to 60 characters, only alphabets, spaces, hyphen, and apostrophe.
 */
export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, message: "Full name is required." };
  }
  if (trimmed.length < 3) {
    return { isValid: false, message: "Full name must be at least 3 characters long." };
  }
  if (trimmed.length > 60) {
    return { isValid: false, message: "Full name cannot exceed 60 characters." };
  }
  // Only alphabets, spaces, hyphen, and apostrophe
  const regex = /^[a-zA-Z\s'\-]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, message: "Full name can only contain alphabets, spaces, hyphens, and apostrophes." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate Date of Birth
 * - Must be at least 18 years old, no future dates.
 */
export function validateDOB(dobString: string): ValidationResult & { age?: number } {
  if (!dobString) {
    return { isValid: false, message: "Date of birth is required." };
  }
  
  const dobDate = new Date(dobString);
  const today = new Date();
  
  if (dobDate > today) {
    return { isValid: false, message: "Date of birth cannot be in the future." };
  }
  
  // Calculate age
  let age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    return { isValid: false, message: "You must be at least 18 years old to register as a driver.", age };
  }
  
  return { isValid: true, message: "", age };
}

/**
 * Validate Indian Phone Number
 * - Exactly 10 digits, no alphabets/spaces/specials, starts with 6, 7, 8, or 9.
 */
export function validatePhone(phone: string): ValidationResult {
  const cleanPhone = phone.replace(/[\s\-()]/g, ""); // strip common formatting characters if typed
  if (!cleanPhone) {
    return { isValid: false, message: "Phone number is required." };
  }
  
  if (/[a-zA-Z]/.test(cleanPhone)) {
    return { isValid: false, message: "Phone number cannot contain alphabets." };
  }
  
  if (/[^0-9]/.test(cleanPhone)) {
    return { isValid: false, message: "Phone number cannot contain special characters or spaces." };
  }
  
  if (cleanPhone.length !== 10) {
    return { isValid: false, message: "Phone number must be exactly 10 digits." };
  }
  
  const firstDigit = cleanPhone[0];
  if (!["6", "7", "8", "9"].includes(firstDigit)) {
    return { isValid: false, message: "Invalid phone number. First digit must be 6, 7, 8, or 9." };
  }
  
  return { isValid: true, message: "" };
}

/**
 * Validate Email Format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: "Email is required." };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { isValid: false, message: "Invalid email format." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate Address
 * - Required, min 10, max 200.
 */
export function validateAddress(address: string): ValidationResult {
  const trimmed = address.trim();
  if (!trimmed) {
    return { isValid: false, message: "Address is required." };
  }
  if (trimmed.length < 10) {
    return { isValid: false, message: "Address must be at least 10 characters long." };
  }
  if (trimmed.length > 200) {
    return { isValid: false, message: "Address cannot exceed 200 characters." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate Indian Driving License Format
 * - Regex: State Code (2 alphabets), RTO (2 digits), Year (4 digits), Unique code (7 digits)
 * - Reject other formats
 */
export function validateDrivingLicense(dl: string): ValidationResult {
  const cleanDl = dl.replace(/[\s\-]/g, "").toUpperCase();
  if (!cleanDl) {
    return { isValid: false, message: "Driving license number is required." };
  }
  
  // Format check: e.g. TS0120190001234
  const regex = /^[A-Z]{2}\d{2}\d{4}\d{7}$/;
  if (!regex.test(cleanDl)) {
    return { 
      isValid: false, 
      message: "Invalid license format. Format should be: State code (2 letters) + RTO (2 digits) + Year (4 digits) + Unique ID (7 digits). e.g. TS0120190001234" 
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate Indian Vehicle Registration (RC)
 * - Format check: e.g., AP39AB1234, TS09CD4567, KA01MN9999
 */
export function validateVehicleRegistration(rc: string): ValidationResult {
  const cleanRc = rc.replace(/[\s\-]/g, "").toUpperCase();
  if (!cleanRc) {
    return { isValid: false, message: "Vehicle registration number is required." };
  }
  
  const regex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
  if (!regex.test(cleanRc)) {
    return { 
      isValid: false, 
      message: "Invalid registration number format. Format should be: State (2 letters) + District (2 digits) + Series (1-2 letters) + 4 digit number. e.g. KA01MN9999" 
    };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate Insurance Number
 * - Optional, alphanumeric, allow '-'
 */
export function validateInsuranceNumber(ins: string): ValidationResult {
  if (!ins) {
    return { isValid: true, message: "" }; // Optional
  }
  if (ins.length < 5 || ins.length > 30) {
    return { isValid: false, message: "Insurance number must be between 5 and 30 characters." };
  }
  const regex = /^[a-zA-Z0-9\-]+$/;
  if (!regex.test(ins)) {
    return { isValid: false, message: "Insurance number can only contain letters, numbers, and hyphens." };
  }
  return { isValid: true, message: "" };
}

/**
 * Validate File Upload
 * - Checks file type and size
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSizeMb: number): ValidationResult {
  if (!file) {
    return { isValid: false, message: "File is required." };
  }
  
  // Check file type
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  const isAllowedType = allowedTypes.some(type => {
    if (type.startsWith(".")) {
      return type.toLowerCase() === fileExtension;
    }
    return file.type.match(new RegExp(type, "i"));
  });
  
  if (!isAllowedType) {
    return { isValid: false, message: `Unsupported file format. Allowed formats: ${allowedTypes.join(", ").toUpperCase()}` };
  }
  
  // Check file size
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isValid: false, message: `File size exceeds the maximum limit of ${maxSizeMb} MB.` };
  }
  
  return { isValid: true, message: "" };
}

/**
 * Validate Image Dimensions
 * - Minimum resolution check (e.g. 720x720)
 */
export function validateImageDimensions(file: File, minWidth: number, minHeight: number): Promise<ValidationResult> {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith("image/")) {
      resolve({ isValid: true, message: "" }); // Skip dimension checks for non-image files (like PDFs)
      return;
    }
    
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          isValid: false,
          message: `Image resolution too low. Minimum resolution is ${minWidth} x ${minHeight} pixels.`
        });
      } else {
        resolve({ isValid: true, message: "" });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({ isValid: false, message: "Invalid or corrupted image file." });
    };
  });
}
