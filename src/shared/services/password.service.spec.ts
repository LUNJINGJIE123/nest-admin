import * as CryptoJS from 'crypto-js';
import { PasswordService } from './password.service';
import { UtilService } from './util.service';

describe('PasswordService', () => {
  const util = {
    md5: (msg: string) => CryptoJS.MD5(msg).toString(),
  } as UtilService;
  const service = new PasswordService(util);

  it('hashes and verifies new passwords with argon2', async () => {
    const hash = await service.hash('123456', 'salt-value');

    expect(hash).toMatch(/^\$argon2/);
    await expect(service.verify(hash, '123456', 'salt-value')).resolves.toEqual({
      valid: true,
      needsRehash: false,
    });
  });

  it('verifies legacy md5 passwords and marks them for rehash', async () => {
    const legacyHash = util.md5('123456salt-value');

    await expect(
      service.verify(legacyHash, '123456', 'salt-value'),
    ).resolves.toEqual({
      valid: true,
      needsRehash: true,
    });
  });

  it('rejects invalid passwords for both formats', async () => {
    const modernHash = await service.hash('123456', 'salt-value');
    const legacyHash = util.md5('123456salt-value');

    await expect(service.verify(modernHash, 'wrong', 'salt-value')).resolves.toEqual(
      {
        valid: false,
        needsRehash: false,
      },
    );
    await expect(service.verify(legacyHash, 'wrong', 'salt-value')).resolves.toEqual(
      {
        valid: false,
        needsRehash: false,
      },
    );
  });
});
