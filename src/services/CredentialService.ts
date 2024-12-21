import bcrypt from 'bcrypt'
export class CredentialService {
  async comparePassword(
    password: string,
    hashPassowrd: string,
  ): Promise<boolean> {
    const isValidPassword = await bcrypt.compare(password, hashPassowrd)
    return isValidPassword
  }
}
