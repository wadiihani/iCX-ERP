/**
 * AIESEC iCX ERP — Communication Copilot & Template Engine
 * Generates automated, statutory-compliant outreach messages for WhatsApp & Email
 * Aligned with AIESEC in Rabat 26.2 operational standards.
 */

import type { EPRecord } from '@/lib/ep/ep-data';

export type EpCommunicationTemplate =
  | 'INTERVIEW_INVITE'
  | 'VISA_AEVM_INSTRUCTIONS'
  | 'AIRPORT_PICKUP_BRIEFING'
  | 'STANDARDS_DISCREPANCY';

export interface CommunicationMessage {
  subject: string;
  body: string;
}

export function generateEpMessage(
  ep: EPRecord,
  template: EpCommunicationTemplate,
  senderName: string = 'AIESEC in Rabat Operations Team'
): CommunicationMessage {
  const firstName = ep.full_name.split(' ')[0] || ep.full_name;
  const oppTitle = ep.opportunity_title || 'iCX Professional Exchange';

  switch (template) {
    case 'INTERVIEW_INVITE':
      return {
        subject: `[AIESEC in Rabat] Interview Invitation for ${oppTitle} (${ep.product})`,
        body: `Dear ${firstName},

Greetings from AIESEC in Rabat, Morocco!

We have reviewed your application for "${oppTitle}" under the ${ep.product} program and are impressed by your profile. We would like to schedule an operational interview (approx. 25 minutes) to discuss your role, project deliverables, and exchange expectations.

Please choose your preferred interview slot here:
https://calendly.com/aiesec-rabat-icx/interview-${ep.product.toLowerCase()}

Looking forward to connecting with you soon!

Warm regards,
${senderName}
AIESEC in Rabat, Morocco`,
      };

    case 'VISA_AEVM_INSTRUCTIONS':
      return {
        subject: `[AIESEC in Rabat] Mandatory Consular & Visa Guidelines (${ep.nationality})`,
        body: `Dear ${firstName},

Congratulations on your approval for "${oppTitle}"!

To ensure your seamless entry into the Kingdom of Morocco, our CXP & Legal team has initiated your official dossier. Under Moroccan statutory regulations, please prepare and upload the following 4 mandatory documents:

1. High-resolution scan of your passport biodata page (valid at least 6 months past return date).
2. Certified copy of your university enrollment or graduation degree.
3. Proof of comprehensive international health & emergency repatriation insurance.
4. Clean police record (issued within the last 90 days).

Access your secure dossier upload portal:
https://portal.aiesec.ma/ep-intake/${ep.id}

If you have questions regarding consular visa procedures or AEVM electronic authorization, reply directly to this thread.

Warm regards,
${senderName}
AIESEC in Rabat, Morocco`,
      };

    case 'AIRPORT_PICKUP_BRIEFING':
      return {
        subject: `[AIESEC in Rabat] Arrival Briefing & Airport Reception (${ep.arrivalPort || 'CMN Airport'})`,
        body: `Dear ${firstName},

Your arrival in Morocco is approaching! Our team is preparing for your arrival reception under Standard #6.

Arrival Summary:
- Destination Port: ${ep.arrivalPort || 'Casablanca CMN / Rabat RBA'}
- Date & Flight: ${ep.arrivalDate || 'TBD'} ${ep.flightNumber ? `(${ep.flightNumber})` : ''}
- Assigned Reception Volunteer: ${ep.pickupBuddyUserId || 'CXP Buddy'}
- Emergency Hotline: +212 661-000000

When you exit the luggage reclaim area, look for our team holding the blue AIESEC Rabat banner. We will assist you with buying a local SIM card, currency exchange (MAD), and escort you directly to your accommodation.

Safe travels!

Warm regards,
${senderName}
AIESEC in Rabat, Morocco`,
      };

    case 'STANDARDS_DISCREPANCY':
      return {
        subject: `[Urgent Action] Quality Standard Check-in — ${oppTitle}`,
        body: `Dear ${firstName},

During our operational audit, a quality delivery discrepancy was identified regarding your exchange standards.

Your satisfaction and safety in Rabat are our highest statutory priorities. Our VP CXP and Operations Manager have scheduled an immediate resolution review to rectify this issue within 24 hours.

Please reach out directly on WhatsApp at +212 661-000000 or reply to this email so we can address your feedback right away.

Sincerely,
${senderName}
AIESEC in Rabat, Morocco`,
      };

    default:
      return {
        subject: `[AIESEC in Rabat] Operational Update`,
        body: `Hello ${firstName},\n\nWe are following up regarding your exchange in Rabat.\n\nBest regards,\n${senderName}`,
      };
  }
}

/**
 * Generates an instant WhatsApp click-to-chat URL with pre-filled encoded text
 */
export function generateEpWhatsAppUrl(
  ep: EPRecord,
  template: EpCommunicationTemplate,
  senderName?: string
): string {
  // Strip non-numeric characters except leading '+'
  const cleanPhone = ep.phone ? ep.phone.replace(/[^0-9]/g, '') : '';
  const message = generateEpMessage(ep, template, senderName);
  const encodedText = encodeURIComponent(message.body);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Generates a mailto: URL with subject and encoded body
 */
export function generateEpEmailUrl(
  ep: EPRecord,
  template: EpCommunicationTemplate,
  senderName?: string
): string {
  const message = generateEpMessage(ep, template, senderName);
  const subject = encodeURIComponent(message.subject);
  const body = encodeURIComponent(message.body);
  const email = ep.email ? encodeURIComponent(ep.email) : '';

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/**
 * Generates an overdue invoice notification for B2B partners
 */
export function generateInvoiceEmailUrl(inv: {
  invoiceNumber: string;
  organizationName: string;
  amountMad: number;
  dueDate: string;
}): string {
  const subject = encodeURIComponent(
    `[AIESEC in Rabat] Operational Invoice Notice: ${inv.invoiceNumber} (${inv.organizationName})`
  );
  const body = encodeURIComponent(`Dear Accounting Department at ${inv.organizationName},

Greetings from AIESEC in Rabat.

This is a courteous reminder that invoice ${inv.invoiceNumber} in the amount of ${inv.amountMad.toLocaleString()} MAD was scheduled for settlement on ${inv.dueDate}.

Please provide an update or proof of bank transfer at your earliest convenience to maintain partnership accreditation and student intern placement.

Bank Details:
Bank: BMCE Bank of Africa, Agence Rabat Hassan
Account Name: Association AIESEC Maroc (LC Rabat)
RIB: 011 810 0000 1234567890 12

Thank you for your continuous partnership.

Warm regards,
Vice President Finance & Legal
AIESEC in Rabat, Morocco`);

  return `mailto:finance@${inv.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma?subject=${subject}&body=${body}`;
}
