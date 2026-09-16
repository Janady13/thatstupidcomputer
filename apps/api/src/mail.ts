import nodemailer from 'nodemailer';
import type { SmtpConfig } from './config.js';
import type { DemoInput } from './validation.js';

export interface MailMessage {
  from: string;
  to: string;
  replyTo: { name: string; address: string };
  envelope: { from: string; to: string[] };
  subject: string;
  text: string;
  headers: Record<string, string>;
  disableFileAccess: true;
  disableUrlAccess: true;
}
export interface MailResult {
  accepted?: Array<string | { address: string }>;
  rejected?: Array<string | { address: string }>;
  pending?: unknown[];
}
export interface MailTransport {
  sendMail(message: MailMessage): Promise<MailResult>;
  close?(): void | Promise<void>;
}
export function createMailTransport(config: SmtpConfig): MailTransport {
  const transporter = nodemailer.createTransport({
    host: config.host, port: config.port, secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    requireTLS: true, ignoreTLS: false,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true, servername: config.host },
    pool: false,
    connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 12_000, dnsTimeout: 5_000,
    logger: false, debug: false,
    disableFileAccess: true, disableUrlAccess: true,
  });
  return { sendMail: message => transporter.sendMail(message), close: () => transporter.close() };
}
export function messageFor(config: SmtpConfig, input: DemoInput, requestId: string): MailMessage {
  return {
    from: config.from, to: config.to,
    envelope: { from: config.from, to: [config.to] },
    replyTo: { name: input.name, address: input.email },
    subject: 'New demo request — That Stupid Computer',
    text: [
      'New demo request', `Reference: ${requestId}`, '',
      `Name: ${input.name}`, `Email: ${input.email}`, `Business: ${input.business}`,
      `Website: ${input.website || 'Not provided'}`, `Project type: ${input.projectType}`, '',
      'Project details:', input.message, '',
      'The sender agreed to contact about this request. This is not marketing consent.',
    ].join('\n'),
    headers: { 'X-TSC-Request-ID': requestId },
    disableFileAccess: true, disableUrlAccess: true,
  };
}
export function soleRecipientAccepted(result: MailResult, recipient: string): boolean {
  const accepted = result.accepted || [];
  return accepted.length === 1 &&
    (typeof accepted[0] === 'string' ? accepted[0] : accepted[0]?.address)?.toLowerCase() === recipient.toLowerCase() &&
    (result.rejected?.length || 0) === 0 && (result.pending?.length || 0) === 0;
}
