/**
 * Authentication Domain Service
 * Cryptographic PIN hashing, recovery code lifecycle, brute-force lockout, and JWT token issuance.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userRepository, UserRecord } from '../../repositories/user.repository.js';
import { profileRepository } from '../../repositories/profile.repository.js';
import { config } from '../../config/environment.js';

const RECOVERY_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 unambiguous characters (no 0, O, 1, I)

export class AuthService {
  // ==========================================
  // Cryptographic Routines
  // ==========================================

  /**
   * Hashes a 6-digit numeric PIN using PBKDF2 with SHA-512, 100,000 iterations, and a 16-byte random salt.
   * Matches or exceeds standard bcrypt work factor 12 while ensuring 100% portability.
   */
  async hashPin(pin: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${derivedKey}`;
  }

  async verifyPin(pin: string, storedHash: string): Promise<boolean> {
    try {
      const [salt, key] = storedHash.split(':');
      if (!salt || !key) return false;
      const derivedKey = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Generates a single-use 8-character recovery code formatted as XXXX-XXXX
   */
  generateRecoveryCode(): string {
    const randomBytes = crypto.randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += RECOVERY_ALPHABET[randomBytes[i] % RECOVERY_ALPHABET.length];
    }
    return `${code.substring(0, 4)}-${code.substring(4, 8)}`;
  }

  async hashRecoveryCode(code: string): Promise<string> {
    const normalized = code.trim().toUpperCase().replace('-', '');
    return this.hashPin(normalized);
  }

  async verifyRecoveryCode(code: string, storedHash: string): Promise<boolean> {
    const normalized = code.trim().toUpperCase().replace('-', '');
    return this.verifyPin(normalized, storedHash);
  }

  generateJwt(user: UserRecord): string {
    const payload = {
      sub: user.id,
      role: user.role,
      mobileMasked: `${user.mobileNumber.substring(0, 2)}XXXXXX${user.mobileNumber.substring(8)}`
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
  }

  verifyJwt(token: string): { sub: string; role: string; mobileMasked: string } {
    return jwt.verify(token, config.jwtSecret) as { sub: string; role: string; mobileMasked: string };
  }

  // ==========================================
  // Core Business Workflows
  // ==========================================

  async register(params: {
    mobileNumber: string;
    pin: string;
    confirmPin: string;
    isAgeVerified: boolean;
  }): Promise<{ userId: string; recoveryCode: string; token: string }> {
    // 1. Validations
    if (!params.isAgeVerified) {
      throw new Error('AGE_VERIFICATION_REQUIRED');
    }
    if (!/^[6-9]\d{9}$/.test(params.mobileNumber)) {
      throw new Error('INVALID_MOBILE_NUMBER');
    }
    if (!/^\d{6}$/.test(params.pin)) {
      throw new Error('INVALID_PIN_FORMAT');
    }
    if (params.pin !== params.confirmPin) {
      throw new Error('PIN_MISMATCH');
    }

    // 2. Cryptographic Generation
    const pinHash = await this.hashPin(params.pin);
    const recoveryCode = this.generateRecoveryCode();
    const recoveryCodeHash = await this.hashRecoveryCode(recoveryCode);

    // 3. User Persistence
    const user = await userRepository.create({
      mobileNumber: params.mobileNumber,
      pinHash,
      recoveryCodeHash,
      isAgeVerified: true,
      role: 'PLAYER',
      isActive: true
    });

    const token = this.generateJwt(user);

    return {
      userId: user.id,
      recoveryCode,
      token
    };
  }

  async login(params: {
    mobileNumber: string;
    pin: string;
  }): Promise<{ userId: string; role: string; token: string; hasProfile: boolean }> {
    if (!/^[6-9]\d{9}$/.test(params.mobileNumber) || !/^\d{6}$/.test(params.pin)) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = await userRepository.findByMobile(params.mobileNumber);
    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Check Lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new Error(`ACCOUNT_LOCKED:${waitMinutes}`);
    }

    const isPinValid = await this.verifyPin(params.pin, user.pinHash);
    if (!isPinValid) {
      const { isLocked, lockedUntil } = await userRepository.recordFailedAttempt(user.id);
      if (isLocked && lockedUntil) {
        throw new Error('ACCOUNT_LOCKED:15');
      }
      throw new Error('INVALID_CREDENTIALS');
    }

    // Successful login: reset failed counters
    await userRepository.resetFailedAttempts(user.id);

    const profile = await profileRepository.findByUserId(user.id);
    const token = this.generateJwt(user);

    return {
      userId: user.id,
      role: user.role,
      token,
      hasProfile: profile !== null
    };
  }

  async recoverPin(params: {
    mobileNumber: string;
    recoveryCode: string;
    newPin: string;
    confirmNewPin: string;
  }): Promise<{ newRecoveryCode: string; token: string }> {
    if (!/^[6-9]\d{9}$/.test(params.mobileNumber)) throw new Error('INVALID_MOBILE_NUMBER');
    if (!/^\d{6}$/.test(params.newPin)) throw new Error('INVALID_PIN_FORMAT');
    if (params.newPin !== params.confirmNewPin) throw new Error('PIN_MISMATCH');

    const user = await userRepository.findByMobile(params.mobileNumber);
    if (!user || !user.isActive) throw new Error('USER_NOT_FOUND');

    const isCodeValid = await this.verifyRecoveryCode(params.recoveryCode, user.recoveryCodeHash);
    if (!isCodeValid) throw new Error('INVALID_RECOVERY_CODE');

    // Invalidate old recovery code, set new PIN, generate new recovery code
    const newPinHash = await this.hashPin(params.newPin);
    const newRecoveryCode = this.generateRecoveryCode();
    const newRecoveryCodeHash = await this.hashRecoveryCode(newRecoveryCode);

    await userRepository.updatePinAndRecovery(user.id, newPinHash, newRecoveryCodeHash);

    const token = this.generateJwt(user);
    return {
      newRecoveryCode,
      token
    };
  }

  async deleteAccount(userId: string, pin: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    const isPinValid = await this.verifyPin(pin, user.pinHash);
    if (!isPinValid) throw new Error('INVALID_PIN');

    await userRepository.deactivateAndScrub(userId);
    await profileRepository.scrub(userId);
  }
}

export const authService = new AuthService();
