export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const getAuthErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in or use a different email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return "We couldn't connect to the server. Please check your internet connection and try again.";
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const validateSignUpData = (
  email: string,
  password: string,
  confirmPassword?: string
): string | null => {
  if (!email || !password) {
    return 'Please fill in all required fields.';
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters long.';
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return 'Passwords do not match.';
  }

  return null;
};

export const validateSignInData = (email: string, password: string): string | null => {
  if (!email || !password) {
    return 'Please fill in all required fields.';
  }

  if (!isValidEmail(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
};
