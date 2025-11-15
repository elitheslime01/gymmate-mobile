import { Buffer } from "buffer";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5001";
const DEFAULT_COUNT = Number.parseInt(process.env.FEEDBACK_COUNT || process.argv[2] || "16", 10);
const FEEDBACK_COUNT = Number.isNaN(DEFAULT_COUNT) || DEFAULT_COUNT <= 0 ? 16 : DEFAULT_COUNT;

const englishSamples = {
  positive: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Scheduling conflict",
      message: "Smart suggestions helped me rearrange my booking without stress.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time out",
      message: "Loved seeing the live timer—clocking out felt instant.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Other login concern",
      message: "Single sign-on integration is fantastic; saves me so many steps.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Other AR concern",
      message: "The preview overlay is brilliant. I can line up shots perfectly.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Notifications",
      message: "Push alerts are timely and never spammy—great balance.",
    },
  ],
  neutral: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Other booking concern",
      message: "Booking flow is okay, though I still double-check slot details.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Queue updates arrive on schedule most days, except around lunch.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Password reset",
      message: "Password reset email arrived, but the link expires a bit fast.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Layout issue",
      message: "Tablet layout is serviceable, yet some buttons feel large.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Image quality",
      message: "Image quality is consistent, although thumbnails appear slightly dim.",
    },
  ],
  negative: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Cannot reserve a slot",
      message: "Recurring slots still clash with class schedule—needs smarter conflict checks.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time in",
      message: "Time-in button froze twice this morning; I had to restart the app.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Profile information",
      message: "Profile auto-fill wiped my contact info; frustrating to retype everything.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Uploads hung at 99% and never completed—even on Wi-Fi.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "App drained my battery during a long queue session.",
    },
  ],
};

const tagalogSamples = {
  positive: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Booking confirmation issue",
      message: "May kasamang helpful tips ang confirmation email—salamat!",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Real-time ang countdown ngayon; hindi na ako nabibigla.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Profile information",
      message: "Ang ganda ng bagong avatar picker, sakto sa gusto kong kulay.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Image quality",
      message: "Ang linaw ng preview, kaya confident ako bago mag-submit.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "Smooth ang transitions kahit naka-low signal lang ako.",
    },
  ],
  neutral: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Other booking concern",
      message: "Maayos naman ang schedule view, pero medyo crowded ang text.",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time out",
      message: "Nagwo-work ang time-out pero minsan may half-second delay.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Password reset",
      message: "Kaya naman sundan ang instructions, pero medyo mahaba basahin.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Layout issue",
      message: "Okay ang bagong buttons, pero sana mas contrasty ang labels.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Minsan kailangan ulitin ang upload, pero bumabalik naman agad.",
    },
  ],
  negative: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Cannot reserve a slot",
      message: "Hanggang ngayon hindi pa rin stable ang waitlist, sayang ang oras.",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Na-late ako kasi walang update sa queue; hindi ko agad nalaman.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Other login concern",
      message: "Nagdi-disconnect ang login kapag nagpalit ako ng network.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Labo ng final render kahit malinaw ang original photo ko.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "Nagha-hang ang app kapag sabay bukas ang feedback at booking page.",
    },
  ],
};

const sentiments = ["positive", "neutral", "negative"];

const pickRandomSample = (sentiment) => {
  const useEnglish = Math.random() < 0.5;
  const pool = useEnglish ? englishSamples[sentiment] : tagalogSamples[sentiment];
  if (!pool || pool.length === 0) {
    throw new Error(`No samples available for ${useEnglish ? "English" : "Tagalog"} sentiment: ${sentiment}`);
  }
  const sample = pool[Math.floor(Math.random() * pool.length)];
  return { ...sample, sentiment };
};
const pngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAKUlEQVR42mNgoBvgPwMQwESMAnE0SCKhQREYFkwDWQqiGYyCQBiKwAAPhdA4Jt9nAdAAAAAElFTkSuQmCC";
const sampleImageBuffer = Buffer.from(pngBase64, "base64");

const createAttachmentBlob = () => new Blob([sampleImageBuffer], { type: "image/png" });

const sendFeedback = async (entry, includeAttachment = false) => {
  const formData = new FormData();

  if (entry.studentId) {
    formData.append("studentId", entry.studentId);
  }

  formData.append("category", entry.category);
  formData.append("subcategory", entry.subcategory);
  formData.append("message", entry.message);

  if (includeAttachment) {
    formData.append("attachments", createAttachmentBlob(), "feedback-sample.png");
  }

  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unknown error");
  }
  return result.data;
};

const run = async () => {
  try {
    console.log(`Sending ${FEEDBACK_COUNT} random feedback entries...`);

    const baseCount = Math.floor(FEEDBACK_COUNT / sentiments.length);
    const remainder = FEEDBACK_COUNT % sentiments.length;

    const sentimentSequence = sentiments.flatMap((sentiment, index) => {
      const count = baseCount + (index < remainder ? 1 : 0);
      return Array.from({ length: count }, () => sentiment);
    });

    for (let i = sentimentSequence.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentimentSequence[i], sentimentSequence[j]] = [sentimentSequence[j], sentimentSequence[i]];
    }

    for (let i = 0; i < FEEDBACK_COUNT; i += 1) {
      const sentiment = sentimentSequence[i];
      const sample = { ...pickRandomSample(sentiment), studentId: null };
      const includeAttachment = Math.random() < 0.4;
      await sendFeedback(sample, includeAttachment);
      console.log(
        `✔️  Feedback ${i + 1} submitted (category: ${sample.category}, language: ${sample.language}, sentiment: ${sample.sentiment}${includeAttachment ? ", with image" : ""})`
      );
    }

    console.log("All feedback entries submitted successfully.");
  } catch (error) {
    console.error("Failed to submit feedback samples:", error.message);
    process.exitCode = 1;
  }
};

run();
