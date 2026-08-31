import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { Organization } from '../models/Organization.js';
import { CustomerSubmission } from '../models/CustomerSubmission.js';

let genAI = null;

const getGenAI = () => {
  if (!genAI && ENV.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  }
  return genAI;
};

/**
 * Public Knowledge Base Fallback generator
 */
const getPublicFallbackResponse = (message) => {
  const lower = message.toLowerCase();

  if (lower.includes('qiimaha') || lower.includes('price') || lower.includes('subscription') || lower.includes('lacag')) {
    return `Nidaamka Compliance QR wuxuu bixiyaa qorshayaal subscription oo aad u jaban oo ku habboon dhammaan meheradaha iyo xarumaha (Isbitaallada, Hudheelada, Jaamacadaha, Maqaayadaha, iwm). Waxaa ku jira 30 maalmood oo tijaabo bilaash ah (Free Trial) marka xarunta la diiwaangeliyo. Wixii faahfaahin ah fadlan nagala soo xiriir bogga Contact-ka!`;
  }

  if (lower.includes('sidee') || lower.includes('how it works') || lower.includes('shaqeeyaa') || lower.includes('qr')) {
    return `Compliance QR waa nidaam casri ah oo meheradaha iyo xarumaha u sahla inay macaamiishooda ka helaan cabashooyinka iyo talooyinka tooska ah.
1. Xarunta waxaa loo sameeyaa QR Code gaar ah.
2. Macaamilku wuxuu kaamirada telefoonka ku qabanayaa QR Code-ka (Scan).
3. Wuxuu si fudud oo qarsoodi ah (Anonymous) ku gudbinayaa cabashadiisa ama taladiisa.
4. Maamulka xarunta ayaa isla markiiba dashboard-kooda ku arkaya cabashada una jawaabaya.`;
  }

  if (lower.includes('contact') || lower.includes('xiriir') || lower.includes('phone') || lower.includes('email')) {
    return `Waxaad nala soo xiriiri kartaa adigoo isticmaalaya bogga Contact-ka ee shabakadda, ama telefoonka iyo email-ka rasmiga ah ee maamulka platform-ka.`;
  }

  return `Ku soo dhowow Compliance QR! Waxaan ahay Kaaliyahaaga AI. Waxaan kaa caawin karaa faahfaahinta nidaamka QR-ka cabashada, sida loogu diiwaangeliyo xaruntaada, qiimayaasha, iyo dhammaan adeegyada aan bixino. Maxaan maanta kaa caawin karaa?`;
};

/**
 * Organization Copilot Fallback generator
 */
const getOrgFallbackResponse = (message, org) => {
  const lower = message.toLowerCase();

  if (lower.includes('jawaab') || lower.includes('reply') || lower.includes('draft') || lower.includes('cabasho')) {
    return `Tusaale jawaab xushmad leh oo aad u diri karto macaamilka:
"Mudan / Marwo, waad ku mahadsan tahay inaad nala wadaagto cabashadaada ku saabsan adeeggeena xarunta ${org?.name || 'Xarunta'}. Waxaan xaqiijinaynaa in arrintan aan baaris ku sameynay waxna ka qabanay si aysan mar dambe u dhicin. Waxaan mar kasta u taagannahay qancinta macaamiisheena."`;
  }

  return `Ku soo dhowow Kaaliyahaaga AI ee ${org?.name || 'Xarunta'}. Waxaan kaa caawin karaa falanqaynta cabashooyinka, qorista fariimo xallin ah oo loo diro macaamiisha, iyo talooyin ku saabsan tayaynta adeegga xaruntaada.`;
};

/**
 * Handle Chatbot Message
 */
export const handleChatbotMessage = async ({ message, history = [], mode = 'PUBLIC', orgId = null }) => {
  if (!message || !message.trim()) {
    return {
      reply: 'Fadlan qor fariin ama su\'aal.',
    };
  }

  const settings = (await PlatformSettings.findOne()) || {};
  const platformName = settings.platformName || 'Compliance QR';

  let org = null;
  let recentComplaintsSummary = '';

  if (mode === 'ORGANIZATION' && orgId) {
    org = await Organization.findById(orgId);
    if (org) {
      const recentSubs = await CustomerSubmission.find({ organizationId: org._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type category status message createdAt');
      
      if (recentSubs.length > 0) {
        recentComplaintsSummary = `Xogta cabashooyinkii / talooyinkii u dambeeyay ee xarunta: ` +
          recentSubs.map((s, i) => `${i + 1}. [${s.type} - ${s.category} - Status: ${s.status}]: "${s.message.slice(0, 100)}"`).join('; ');
      }
    }
  }

  // Define System Prompt based on Mode
  let systemInstruction = '';
  if (mode === 'PUBLIC') {
    systemInstruction = `You are the official AI Assistant for "${platformName}", a modern SaaS platform that enables organizations (Hospitals, Hotels, Universities, Restaurants, Companies, Banks, Government entities) to receive direct, anonymous or identified customer complaints and feedback through dynamic QR codes.

Key Knowledge Base:
- Platform Name: ${platformName}
- Key Value: Replaces slow suggestion boxes with instant digital QR scanning. Zero app download required for customers (works instantly in any mobile phone browser).
- Privacy: Customers can submit complaints 100% anonymously or provide a phone number for follow-up resolution SMS/WhatsApp updates.
- Analytics: Live charts, resolution rate tracking, complaint categorization, PDF poster generator for printing QR codes.
- Subscription: 30-day free trial on signup, affordable monthly & annual plans.
- Contact: Public contact form, support phone & email.
- Language: You must respond in the same language the user speaks (Somali or English). Be extremely helpful, polite, professional, concise, and format answers with clear bullet points when appropriate.`;
  } else {
    systemInstruction = `You are the AI Operations & Resolution Copilot for "${org?.name || 'Organization'}" on the ${platformName} Platform.
Organization Details:
- Name: ${org?.name || 'N/A'} (${org?.branch || 'Main'})
- Category/Type: ${org?.organizationType || 'Enterprise'}
- Complaint Categories: ${(org?.complaintCategories || []).join(', ')}
${recentComplaintsSummary ? `- Context: ${recentComplaintsSummary}` : ''}

Your Job:
1. Help staff and managers write empathetic, professional, polite, and constructive resolution responses to customer complaints.
2. Analyze customer feedback patterns and suggest actionable service improvements.
3. Guide users on how to use their dashboard (generating QR posters, managing complaints, renewing service).
4. Language: Respond in Somali by default unless addressed in English. Maintain an empowering, professional tone.`;
  }

  // Try Google Gemini AI first
  try {
    const ai = getGenAI();
    if (ai) {
      // Try gemini-1.5-flash or gemini-2.0-flash
      const model = ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      // Prepare conversation history
      const formattedHistory = (history || []).slice(-6).map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text || '' }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      if (reply && reply.trim()) {
        return {
          reply: reply.trim(),
          modelUsed: 'gemini-1.5-flash',
        };
      }
    }
  } catch (err) {
    console.warn('[Chatbot Gemini API Warning]', err.message);
  }

  // Fallback if AI service is temporarily unreachable
  const fallbackReply = mode === 'PUBLIC'
    ? getPublicFallbackResponse(message)
    : getOrgFallbackResponse(message, org);

  return {
    reply: fallbackReply,
    modelUsed: 'rule-engine-fallback',
  };
};
