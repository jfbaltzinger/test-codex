import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

type PasswordResetContext = {
  resetLink: string;
};

const templatePath = path.resolve(__dirname, '../templates/reset-password-email.html');

const loadTemplate = () => {
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    logger.error({ err: error }, 'Unable to load password reset email template');
    return '<p>Veuillez utiliser le lien suivant pour réinitialiser votre mot de passe : {{resetLink}}</p>';
  }
};

const templateCache = loadTemplate();

export class EmailService {
  async sendPasswordResetEmail(to: string, context: PasswordResetContext) {
    const html = templateCache.replace(/{{\s*resetLink\s*}}/g, context.resetLink);
    logger.info({ to, resetLink: context.resetLink }, 'Password reset email prepared');
    // Here you would integrate with your email provider (SendGrid, Mailgun, etc.)
    logger.debug({ html }, 'Password reset email body');
  }
}
