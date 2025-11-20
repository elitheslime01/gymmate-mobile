import { Buffer } from "buffer";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5001";
const DEFAULT_COUNT = Number.parseInt(process.env.FEEDBACK_COUNT || process.argv[2] || "16", 10);
const FEEDBACK_COUNT = Number.isNaN(DEFAULT_COUNT) || DEFAULT_COUNT <= 0 ? 16 : DEFAULT_COUNT;
const LANGUAGE_MODE = (process.env.FEEDBACK_LANGUAGE_MODE || "mixed").toLowerCase();
const SENTIMENT_MODE = (process.env.FEEDBACK_SENTIMENT_MODE || "balanced").toLowerCase();

const englishSamples = {
  positive: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Other booking concern",
      message: "Auto-filled participant info saved me from retyping everyone's names.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Queue reminder pinged right before my slot—perfect timing.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Password reset",
      message: "Backup codes synced to my email instantly; super reassuring.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Image quality",
      message: "New lighting guide ensured every AR badge looked studio-ready.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "Dark mode looks slick and keeps my battery cool.",
    },
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Booking confirmation issue",
      message: "Confirmation PDF now lists equipment needs—super helpful reminder.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time in",
      message: "The nudge to stretch while waiting actually made the queue fun.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Other login concern",
      message: "Biometric login never misses—it unlocks faster than my laptop.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Other AR concern",
      message: "Layer previews let me stack milestones like trading cards—love it.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Notifications",
      message: "Smart digest rolls multiple alerts into one tidy summary.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Layout issue",
      message: "Resizable text sliders mean my dad can finally read the app easily.",
    },
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Scheduling conflict",
      message: "Conflict resolver suggested a coach swap that fit perfectly.",
    },
  ],
  neutral: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Scheduling conflict",
      message: "Conflict warning pops up reliably, though I still confirm manually.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time in",
      message: "Time-in works most mornings but occasionally needs a second tap.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Profile information",
      message: "Profile editor saves changes, yet the reload animation feels long.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Uploads usually succeed, though weak signal forces a retry.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Notifications",
      message: "Notifications arrive in batches—acceptable, just slightly delayed.",
    },
  ],
  negative: [
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Cannot reserve a slot",
      message: "Waitlist auto-assign grabbed the wrong timeslot again.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Still staring at a \"calculating\" spinner whenever the queue spikes.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Other login concern",
      message: "Session expires mid-form and dumps every detail I typed.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Other AR concern",
      message: "AR marker drifts after placement so I can't trust alignment.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "App overheats my phone whenever I multitask.",
    },
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Scheduling conflict",
      message: "Conflict alerts fire too late—I'm already double-booked by then.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time in",
      message: "Scanner misses my QR code half the time and holds up the line.",
    },
    {
      language: "English",
      category: "Account & Login",
      subcategory: "Password reset",
      message: "Reset email links expire in minutes; I had to request four times.",
    },
    {
      language: "English",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Uploads silently fail when I attach more than one photo.",
    },
    {
      language: "English",
      category: "Mobile Experience",
      subcategory: "Layout issue",
      message: "Buttons jump when the keyboard opens, so I keep tapping the wrong action.",
    },
    {
      language: "English",
      category: "Walk-in Booking",
      subcategory: "Other booking concern",
      message: "Saved templates randomly disappear, forcing me to rebuild sessions.",
    },
    {
      language: "English",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Push alerts arrive after I've already been called—what's the point?",
    },
  ],
};

const tagalogSamples = {
  positive: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Other booking concern",
      message: "Yung auto-suggested na coach names ang dali sundan kaya mabilis pumili ng slot.",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time in",
      message: "One tap lang talaga ngayon ang time-in; sakto sa mabilisang days.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Password reset",
      message: "May SMS code na agad, hindi ko na kailangang maghintay ng email.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Other AR concern",
      message: "Ang bagong grid guide tumutulong para pantay ang badge.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Notifications",
      message: "Tahimik ang notifications pero sakto ang timing nila.",
    },
  ],
  neutral: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Scheduling conflict",
      message: "Nakakatulong ang conflict alert kahit kailangan ko pa ring mag-double check.",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Delayed updates",
      message: "Paminsan-minsan delayed ang count pero bumabawi naman.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Profile information",
      message: "Pwede naman ma-edit ang profile, medyo mabagal lang mag-save.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Image quality",
      message: "Sapat ang quality kahit may bahagyang grain kapag gabi ako nag-a-upload.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Layout issue",
      message: "Maayos ang layout pero may ilang button na sobrang lapit sa edge.",
    },
  ],
  negative: [
    {
      language: "Tagalog",
      category: "Walk-in Booking",
      subcategory: "Cannot reserve a slot",
      message: "Lumolobo pa rin ang waitlist kahit may bakanteng slot sa calendar.",
    },
    {
      language: "Tagalog",
      category: "Queue & Time In/Out",
      subcategory: "Unable to time out",
      message: "Nai-stuck ang time-out button kapag nawalan ng data.",
    },
    {
      language: "Tagalog",
      category: "Account & Login",
      subcategory: "Other login concern",
      message: "Nagla-log out ako bigla kapag nag-switch ng Wi-Fi.",
    },
    {
      language: "Tagalog",
      category: "AR Image Upload",
      subcategory: "Upload failed",
      message: "Nawawala ang attachment kapag sabay ko silang ina-upload.",
    },
    {
      language: "Tagalog",
      category: "Mobile Experience",
      subcategory: "Performance",
      message: "Lag pa rin kapag naka-low power mode ang phone ko.",
    },
  ],
};

const sentiments = ["positive", "neutral", "negative"];

const resolveSentimentTargets = () => {
  if (SENTIMENT_MODE === "positive-only") {
    return ["positive"];
  }
  if (SENTIMENT_MODE === "negative-only") {
    return ["negative"];
  }
  if (SENTIMENT_MODE === "neutral-only") {
    return ["neutral"];
  }
  return sentiments;
};

const shouldUseEnglish = () => {
  if (LANGUAGE_MODE === "english-only") {
    return true;
  }
  if (LANGUAGE_MODE === "tagalog-only") {
    return false;
  }
  return Math.random() < 0.5;
};

const pickRandomSample = (sentiment) => {
  const useEnglish = shouldUseEnglish();
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

    const sentimentTargets = resolveSentimentTargets();
    const baseCount = Math.floor(FEEDBACK_COUNT / sentimentTargets.length);
    const remainder = FEEDBACK_COUNT % sentimentTargets.length;

    const sentimentSequence = sentimentTargets.flatMap((sentiment, index) => {
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
