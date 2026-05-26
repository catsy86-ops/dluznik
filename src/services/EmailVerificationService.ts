import crypto from 'crypto';
import { MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../config/database-init';
import { EmailVerificationToken } from '../models/EmailVerificationToken';
import { ResendRateLimit } from '../models/ResendRateLimit';
import { User } from '../models/User';
import { ApiError } from '../middleware/errorHandler';

/**
 * Email Verification Service
 * Handles sending verification emails, validating tokens, resending,
 * and rate limiting for the email verification flow.
 *
 * Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9
 */
export class EmailVerificationService {
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly MAX_RESENDS_PER_HOUR = 5;
  private readonly MIN_RESEND_INTERVAL_SECONDS = 60;

  private get tokenRepository() {
    return AppDataSource.getRepository(EmailVerificationToken);
  }

  private get rateLimitRepository() {
    return AppDataSource.getRepository(ResendRateLimit);
  }

  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Generate a cryptographically secure verification token
   * @returns 64-character hex string
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send a verification email to the user.
   * Creates a new token, invalidates previous ones, and dispatches the email.
   *
   * @param userId - The user's ID
   * @param email - The user's email address
   * @throws ApiError if user not found
   *
   * Requirements: 2.1
   */
  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    // Invalidate any previous tokens for this user
    await this.invalidatePreviousTokens(userId);

    // Generate new token
    const token = this.generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Save token to database
    const verificationToken = new EmailVerificationToken();
    verificationToken.id = uuidv4();
    verificationToken.userId = userId;
    verificationToken.token = token;
    verificationToken.expiresAt = expiresAt;
    verificationToken.usedAt = null;

    await this.tokenRepository.save(verificationToken);

    // Send email (abstracted - in production this would use nodemailer/SMTP)
    await this.dispatchEmail(email, token);
  }

  /**
   * Verify a token submitted by the user.
   * Checks that the token exists, is not expired, and has not been used.
   * On success, marks the user's email as verified and invalidates the token.
   *
   * @param token - The verification token string
   * @returns Object with success status and userId
   * @throws ApiError if token is invalid, expired, or already used
   *
   * Requirements: 2.3, 2.5
   */
  async verifyToken(token: string): Promise<{ success: boolean; userId: string }> {
    // Validate token format (must be 64-char hex)
    if (!this.isValidTokenFormat(token)) {
      throw new ApiError(400, 'INVALID_TOKEN', 'Link jest nieprawidłowy');
    }

    // Find the token in the database
    const verificationToken = await this.tokenRepository.findOne({
      where: { token },
    });

    if (!verificationToken) {
      throw new ApiError(400, 'INVALID_TOKEN', 'Link jest nieprawidłowy');
    }

    // Check if token has already been used
    if (verificationToken.usedAt !== null) {
      throw new ApiError(400, 'INVALID_TOKEN', 'Link jest nieprawidłowy');
    }

    // Check if token has expired
    const now = new Date();
    if (now > verificationToken.expiresAt) {
      throw new ApiError(400, 'TOKEN_EXPIRED', 'Link wygasł');
    }

    // Mark token as used
    verificationToken.usedAt = now;
    await this.tokenRepository.save(verificationToken);

    // Mark user's email as verified
    const user = await this.userRepository.findOne({
      where: { id: verificationToken.userId },
    });

    if (user) {
      user.emailVerified = true;
      user.emailVerifiedAt = now;
      await this.userRepository.save(user);
    }

    return { success: true, userId: verificationToken.userId };
  }

  /**
   * Resend a verification email to the user.
   * Checks rate limits, invalidates previous tokens, and sends a new one.
   *
   * @param userId - The user's ID
   * @throws ApiError if rate limited or user not found
   *
   * Requirements: 2.6, 2.9
   */
  async resendVerification(userId: string): Promise<void> {
    // Check rate limit
    const rateLimitResult = await this.checkRateLimit(userId);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.nextAllowedAt
        ? Math.ceil((rateLimitResult.nextAllowedAt.getTime() - Date.now()) / 1000)
        : 60;
      throw new ApiError(429, 'RATE_LIMITED', 'Zbyt wiele prób. Spróbuj ponownie później.', {
        retryAfter,
      });
    }

    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'Użytkownik nie znaleziony');
    }

    // Record this resend request for rate limiting
    const rateLimitEntry = new ResendRateLimit();
    rateLimitEntry.id = uuidv4();
    rateLimitEntry.userId = userId;
    rateLimitEntry.requestedAt = new Date();
    await this.rateLimitRepository.save(rateLimitEntry);

    // Send new verification email (invalidates previous tokens internally)
    await this.sendVerificationEmail(userId, user.email);
  }

  /**
   * Invalidate all previously issued tokens for a user.
   * Sets usedAt to current time for all unused tokens belonging to the user.
   *
   * @param userId - The user's ID
   *
   * Requirements: 2.9
   */
  async invalidatePreviousTokens(userId: string): Promise<void> {
    const now = new Date();
    await this.tokenRepository
      .createQueryBuilder()
      .update(EmailVerificationToken)
      .set({ usedAt: now })
      .where('userId = :userId', { userId })
      .andWhere('usedAt IS NULL')
      .execute();
  }

  /**
   * Check if the user is within rate limits for resend requests.
   * Rules:
   * - Max 5 requests per rolling hour window
   * - Min 60 seconds between consecutive requests
   *
   * @param userId - The user's ID
   * @returns Object indicating if request is allowed and when next request is permitted
   *
   * Requirements: 2.6
   */
  async checkRateLimit(userId: string): Promise<{ allowed: boolean; nextAllowedAt: Date | null }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get all resend requests in the last hour
    const recentRequests = await this.rateLimitRepository.find({
      where: {
        userId,
        requestedAt: MoreThan(oneHourAgo),
      },
      order: { requestedAt: 'DESC' },
    });

    // Check max requests per hour (5)
    if (recentRequests.length >= this.MAX_RESENDS_PER_HOUR) {
      // Find the oldest request in the window - next allowed is when it falls out of the hour window
      const oldestInWindow = recentRequests[recentRequests.length - 1];
      const nextAllowedAt = new Date(
        oldestInWindow.requestedAt.getTime() + 60 * 60 * 1000
      );
      return { allowed: false, nextAllowedAt };
    }

    // Check minimum interval (60 seconds between requests)
    if (recentRequests.length > 0) {
      const lastRequest = recentRequests[0];
      const timeSinceLastRequest = now.getTime() - lastRequest.requestedAt.getTime();

      if (timeSinceLastRequest < this.MIN_RESEND_INTERVAL_SECONDS * 1000) {
        const nextAllowedAt = new Date(
          lastRequest.requestedAt.getTime() + this.MIN_RESEND_INTERVAL_SECONDS * 1000
        );
        return { allowed: false, nextAllowedAt };
      }
    }

    return { allowed: true, nextAllowedAt: null };
  }

  /**
   * Validate that a token string matches the expected format (64-char hex).
   *
   * @param token - The token string to validate
   * @returns true if format is valid
   */
  isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Dispatch the verification email.
   * In production, this would use nodemailer or an email service provider.
   * Currently logs the verification link for development.
   *
   * @param email - Recipient email address
   * @param token - Verification token to include in the link
   */
  private async dispatchEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.APP_URL || 'http://localhost:5173';
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;

    // In production, this would send an actual email via SMTP/service
    // For now, log the link for development purposes
    console.log(`[EmailVerification] Sending verification email to ${email}`);
    console.log(`[EmailVerification] Verification link: ${verificationLink}`);

    // TODO: Integrate with nodemailer or email service provider
    // Example:
    // await transporter.sendMail({
    //   to: email,
    //   subject: 'Zweryfikuj swój adres email - Dłużnik',
    //   html: `<p>Kliknij link aby zweryfikować email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    // });
  }
}

// Export singleton instance
export const emailVerificationService = new EmailVerificationService();
