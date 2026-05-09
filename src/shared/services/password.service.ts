import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UtilService } from './util.service';

export interface PasswordVerifyResult {
  valid: boolean;
  needsRehash: boolean;
}

@Injectable()
export class PasswordService {
  constructor(private readonly util: UtilService) {}

  async hash(password: string, salt: string): Promise<string> {
    return argon2.hash(this.withSalt(password, salt));
  }

  async verify(
    hash: string,
    password: string,
    salt: string,
  ): Promise<PasswordVerifyResult> {
    if (this.isArgon2Hash(hash)) {
      return {
        valid: await argon2.verify(hash, this.withSalt(password, salt)),
        needsRehash: false,
      };
    }

    const valid = hash === this.util.md5(this.withSalt(password, salt));
    return {
      valid,
      needsRehash: valid,
    };
  }

  private withSalt(password: string, salt: string): string {
    return `${password}${salt}`;
  }

  private isArgon2Hash(hash: string): boolean {
    return hash.startsWith('$argon2');
  }
}
