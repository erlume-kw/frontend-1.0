const VERIFALIA_API_KEY = process.env.NEXT_PUBLIC_VERIFALIA_API_KEY;
const VERIFALIA_API_URL = 'https://api.verifalia.com/api/v4/emails';

export interface VerificationResult {
  isValid: boolean;
  error?: string;
}

export async function verifyEmail(email: string): Promise<VerificationResult> {
  if (!VERIFALIA_API_KEY) {
    // Fallback: basic validation if API key not configured
    return { isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
  }

  try {
    const response = await fetch(VERIFALIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VERIFALIA_API_KEY}`,
      },
      body: JSON.stringify({
        entries: [{ inputData: email }],
        completionOption: 'AllAtOnce',
      }),
    });

    if (!response.ok) {
      console.error('Verifalia API error:', response.status);
      // Fallback to basic validation on API error
      return { isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
    }

    const data = await response.json();
    const result = data.entries?.[0];

    if (!result) {
      return { isValid: false, error: 'Verification failed' };
    }

    // Verifalia classification: "Deliverable" or "Risky" are valid, others are not
    const isValid = result.classification === 'Deliverable' || result.classification === 'Risky';

    if (!isValid) {
      return {
        isValid: false,
        error: result.classification === 'Invalid'
          ? 'Email address is invalid'
          : 'Email could not be verified'
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Email verification error:', error);
    // Fallback to basic validation on network error
    return { isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) };
  }
}
