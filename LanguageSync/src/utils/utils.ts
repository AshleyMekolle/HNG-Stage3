
export const validateInput = (text: string): { isValid: boolean; error: string | null } => {
  if (!text.trim()) {
    return { isValid: false, error: 'Please enter some text' };
  }
  
  if (text.trim().length < 2) {
    return { isValid: false, error: 'Text must be at least 2 characters long' };
  }

  return { isValid: true, error: null };
};

export const meetsMinimumLength = (text: string | undefined): boolean => {
  if (!text) return false;
  return text.length > 150;
};

