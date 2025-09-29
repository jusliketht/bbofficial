// =====================================================
// MOBILE BIOMETRIC AUTHENTICATION HOOK
// Cross-platform biometric authentication for iOS and Android
// =====================================================

import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

// =====================================================
// TYPES
// =====================================================
interface BiometricResult {
  success: boolean;
  token?: string;
  error?: string;
}

interface BiometricCapabilities {
  available: boolean;
  biometryType: BiometryTypes | null;
  error?: string;
}

// =====================================================
// BIOMETRIC AUTHENTICATION HOOK
// =====================================================
export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryTypes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =====================================================
  // INITIALIZATION
  // =====================================================
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      setIsLoading(true);
      
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      setIsAvailable(available);
      setBiometryType(biometryType);
      
      if (available) {
        console.log('Biometric authentication available:', biometryType);
      } else {
        console.log('Biometric authentication not available');
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setIsAvailable(false);
      setBiometryType(null);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // BIOMETRIC AUTHENTICATION
  // =====================================================
  const authenticateWithBiometrics = async (): Promise<BiometricResult> => {
    try {
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      // Create biometric key if it doesn't exist
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      if (!keysExist) {
        await rnBiometrics.createKeys();
      }

      // Authenticate with biometrics
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Authenticate to access your account',
        payload: `auth_${Date.now()}`,
      });

      if (success) {
        return {
          success: true,
          token: signature,
        };
      } else {
        return {
          success: false,
          error: 'Biometric authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // =====================================================
  // BIOMETRIC REGISTRATION
  // =====================================================
  const registerBiometric = async (userId: string): Promise<BiometricResult> => {
    try {
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      // Create biometric key
      const { publicKey } = await rnBiometrics.createKeys();
      
      // Test authentication
      const authResult = await authenticateWithBiometrics();
      if (!authResult.success) {
        return authResult;
      }

      // Register with backend
      const response = await fetch('/api/mobile/auth/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          publicKey,
          biometryType,
          deviceId: 'mobile_device_id', // Get from device info
        }),
      });

      if (response.ok) {
        return {
          success: true,
          token: authResult.token,
        };
      } else {
        return {
          success: false,
          error: 'Failed to register biometric authentication',
        };
      }
    } catch (error) {
      console.error('Biometric registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // =====================================================
  // BIOMETRIC LOGIN
  // =====================================================
  const loginWithBiometrics = async (): Promise<BiometricResult> => {
    try {
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device',
        };
      }

      const authResult = await authenticateWithBiometrics();
      if (!authResult.success) {
        return authResult;
      }

      // Send biometric token to backend for verification
      const response = await fetch('/api/mobile/auth/biometric/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biometricToken: authResult.token,
          biometryType,
          deviceId: 'mobile_device_id', // Get from device info
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          token: data.accessToken,
        };
      } else {
        return {
          success: false,
          error: 'Biometric login failed',
        };
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // =====================================================
  // DELETE BIOMETRIC AUTHENTICATION
  // =====================================================
  const deleteBiometric = async (): Promise<BiometricResult> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics({
        allowDeviceCredentials: true,
      });

      // Delete biometric keys
      await rnBiometrics.deleteKeys();

      // Notify backend
      await fetch('/api/mobile/auth/biometric/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: 'mobile_device_id', // Get from device info
        }),
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Delete biometric error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  // =====================================================
  // GET BIOMETRIC TYPE DISPLAY NAME
  // =====================================================
  const getBiometricTypeName = (): string => {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      default:
        return 'Biometric';
    }
  };

  // =====================================================
  // SHOW BIOMETRIC SETUP ALERT
  // =====================================================
  const showBiometricSetupAlert = () => {
    const biometricName = getBiometricTypeName();
    
    Alert.alert(
      'Enable Biometric Authentication',
      `Would you like to enable ${biometricName} for faster and more secure login?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Enable',
          onPress: () => {
            // Handle biometric setup
            console.log('User chose to enable biometric authentication');
          },
        },
      ]
    );
  };

  // =====================================================
  // RETURN HOOK VALUES
  // =====================================================
  return {
    isAvailable,
    biometryType,
    isLoading,
    authenticateWithBiometrics,
    registerBiometric,
    loginWithBiometrics,
    deleteBiometric,
    getBiometricTypeName,
    showBiometricSetupAlert,
    checkBiometricAvailability,
  };
};
