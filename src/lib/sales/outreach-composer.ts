/**
 * Multi-Lingual Outreach Composer (FR / EN / AR)
 * Baseline: REQ-016 and TEST-023
 */

export type OutreachLanguage = 'fr' | 'en' | 'ar';

export interface OutreachContext {
  partnerName: string;
  contactName: string;
  sdgTarget: string;
  city: string;
  senderName: string;
  senderRole: string;
  lcName: string;
}

export interface OutreachTemplate {
  id: string;
  language: OutreachLanguage;
  subject: string;
  body: string;
}

export const OUTREACH_TEMPLATES: Record<OutreachLanguage, OutreachTemplate> = {
  fr: {
    id: 'tpl_fr_initial',
    language: 'fr',
    subject: 'Partenariat d’Impact Social — AIESEC à {{city}} & {{partnerName}}',
    body: `Bonjour {{contactName}},

J'espère que vous allez bien.

Je m'appelle {{senderName}}, {{senderRole}} au sein d'{{lcName}}. Nous suivons de près l'impact remarquable de {{partnerName}} dans la région de {{city}}.

Dans le cadre de nos programmes d'échanges internationaux (Incoming Global Volunteer) alignés sur les Objectifs de Développement Durable (notamment l'{{sdgTarget}}), nous mobilisons des talents universitaires internationaux engagés pour soutenir des initiatives à fort impact communautaire.

Seriez-vous disponible cette semaine pour un échange de 20 minutes afin d'explorer une synergie concrète pour la saison à venir ?

Bien cordialement,
{{senderName}}
{{senderRole}} · {{lcName}}`,
  },
  en: {
    id: 'tpl_en_initial',
    language: 'en',
    subject: 'Global Volunteer Partnership — AIESEC in {{city}} & {{partnerName}}',
    body: `Dear {{contactName}},

I hope this message finds you well.

My name is {{senderName}}, serving as {{senderRole}} at {{lcName}}. We have been closely following the commendable work of {{partnerName}} in {{city}}.

Through our Incoming Global Volunteer initiatives aligned with the UN Sustainable Development Goals (especially {{sdgTarget}}), we connect dedicated international young leaders to local community projects.

Would you be open for a brief 20-minute introductory meeting this week to explore how we can collaborate for our upcoming realization cycle?

Warm regards,
{{senderName}}
{{senderRole}} · {{lcName}}`,
  },
  ar: {
    id: 'tpl_ar_initial',
    language: 'ar',
    subject: 'شراكة تطوعية دولية — آيزك في {{city}} مع {{partnerName}}',
    body: `السلام عليكم ورحمة الله {{contactName}}،

أتمنى أن تكونوا في أفضل حال.

معكم {{senderName}}، {{senderRole}} بـ {{lcName}}. نحن نقدر عالياً العمل الاجتماعي المميز الذي تقوم به مؤسسة {{partnerName}} في مدينة {{city}}.

من خلال برامج التبادل الشبابي الدولي التابعة لمنظمة آيزك، والموجهة لدعم أهداف التنمية المستدامة (وخاصة {{sdgTarget}})، نود بحث سبل التعاون لاستقبال متطوعين دوليين للمساهمة في مشاريعكم الميدانية.

هل يناسبكم موعد قصير لمدة 20 دقيقة خلال هذا الأسبوع لمناقشة التفاصيل وفرص التعاون المشترك؟

مع خالص التحيات والتقدير،
{{senderName}}
{{senderRole}} · {{lcName}}`,
  },
};

/**
 * Interpolates variables into an outreach template with strict check for un-substituted tags.
 */
export function composeOutreachMessage(
  language: OutreachLanguage,
  context: OutreachContext
): { subject: string; body: string; missingTags: string[] } {
  const template = OUTREACH_TEMPLATES[language];
  const tagMap: Record<string, string> = {
    partnerName: context.partnerName || '',
    contactName: context.contactName || '',
    sdgTarget: context.sdgTarget || '',
    city: context.city || '',
    senderName: context.senderName || '',
    senderRole: context.senderRole || '',
    lcName: context.lcName || '',
  };

  const missingTags: string[] = [];

  const replaceTags = (text: string): string => {
    return text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (_, key) => {
      if (tagMap[key] !== undefined && tagMap[key].trim() !== '') {
        return tagMap[key];
      }
      missingTags.push(key);
      return `{{${key}}}`;
    });
  };

  const subject = replaceTags(template.subject);
  const body = replaceTags(template.body);

  return {
    subject,
    body,
    missingTags: Array.from(new Set(missingTags)),
  };
}
