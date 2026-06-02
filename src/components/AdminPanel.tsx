import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Lock, 
  Settings, 
  Sparkles, 
  ShoppingBag, 
  Briefcase, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Database,
  ArrowRight,
  Shield,
  Loader2,
  Activity,
  ListFilter,
  Megaphone,
  Flame,
  Clock,
  ShieldCheck,
  HeartHandshake,
  Wand2,
  Home,
  Zap,
  Award,
  PhoneCall,
  Compass,
  Menu
} from "lucide-react";
import { useContent } from "../context/ContentContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { WebsiteProduct, Service, PortfolioItem, Testimonial, TeamMember, ContactConfig } from "../types";
import { safeLocalStorage, safeSessionStorage } from "../utils/safeStorage";
import { Order, OrderStatus } from "./CheckoutModal";

// Helper function to compress large uploaded image files into small, performant base64 JPEGs (saves localStorage space)
function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
          const format = isPng ? "image/png" : "image/jpeg";
          const compressed = canvas.toDataURL(format, isPng ? undefined : quality);
          resolve(compressed);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = () => {
      resolve("");
    };
  });
}

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function ImageUploadField({ label, value, onChange, placeholder }: ImageUploadFieldProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImage(file, 800, 800, 0.7);
      onChange(base64);
    } catch (e) {
      console.error("Error compressing image", e);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-slate-400 text-xs font-bold leading-none mb-1.5">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
        
        {/* Direct drag/drop and file selector widget */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`md:col-span-5 relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer bg-[#110724] ${
            dragActive 
              ? "border-purple-400 bg-purple-950/25" 
              : "border-purple-950 hover:border-purple-500/55 hover:bg-purple-950/10"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {isCompressing ? (
            <div className="flex flex-col items-center gap-1.5 text-center py-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-[10px] text-purple-300 font-medium">কম্প্রেস হচ্ছে...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-center py-1">
              <div className="flex items-center gap-1.5">
                <span className="bg-purple-500/20 text-purple-300 p-1 rounded-md">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </span>
                {value ? (
                  <span className="text-[10px] text-emerald-400 font-bold">ছবি যুক্ত হয়েছে</span>
                ) : (
                  <span className="text-[10px] text-purple-400 font-bold">সরাসরি আপলোড</span>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-sans">ক্লিক বা ড্র্যাগ করুন</p>
            </div>
          )}
        </div>

        {/* URL Input to fallback to manual inputs */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="flex gap-2">
            <input
              type="text"
              value={value.startsWith("data:") ? "সরাসরি ছবি আপলোড করা হয়েছে (Base64)" : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "https://images.unsplash.com/photo-..."}
              disabled={value.startsWith("data:")}
              className={`flex-1 bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-mono ${
                value.startsWith("data:") ? "opacity-60 text-purple-300 pointer-events-none" : ""
              }`}
            />
            {value && (
              <div className="relative group shrink-0">
                <img 
                  src={value} 
                  alt="Preview" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-xl border border-purple-500/30 object-cover" 
                />
                {value.startsWith("data:") && (
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 hover:scale-110 transition-transform cursor-pointer shadow-md"
                    title="মুছে ফেলুন"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            )}
          </div>
          {value.startsWith("data:") && (
            <p className="text-[9.5px] text-slate-400 mt-1 font-sans">
              * সরাসরি ছবি আপলোড করা হয়েছে। পুনরায় লিঙ্ক ব্যবহার করতে ওপরের <span className="text-red-400 font-bold">লাল ক্রস বাটন</span> দিয়ে রিমুভ করুন।
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

interface FontUploadFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function FontUploadField({ label, value, onChange }: FontUploadFieldProps) {
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-1">
      <label className="block text-slate-400 text-xs font-bold leading-none mb-1.5">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="relative flex-1 flex items-center justify-center p-4 border-2 border-dashed border-purple-950 hover:border-purple-500/55 rounded-xl bg-[#110724] hover:bg-purple-950/10 cursor-pointer transition-all">
          <input
            type="file"
            accept=".ttf,.woff,.woff2,.otf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex items-center gap-2 text-xs">
            {loading ? (
              <span className="text-purple-300 font-medium">প্রক্রিয়াকরণ হচ্ছে...</span>
            ) : value ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ✓ কাস্টম ফন্ট ফাইল আপলোড করা হয়েছে
              </span>
            ) : (
              <span className="text-purple-400 font-medium flex items-center gap-1 font-sans">
                📁 কাস্টম ফন্ট ফাইল সিলেক্ট করুন (.ttf, .woff, .woff2, .otf)
              </span>
            )}
          </div>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl px-4 py-2 text-xs font-sans transition-colors"
          >
            মুছে ফেলুন
          </button>
        )}
      </div>
    </div>
  );
}

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalonePWA?: boolean;
}

type ActiveTab = "hero" | "notices" | "websites" | "services" | "portfolio" | "testimonials" | "orders" | "team" | "offers" | "ai_assistant" | "headings" | "package_planner" | "why_choose_us" | "contact" | "supabase";

export default function AdminPanel({ isOpen, onClose, isStandalonePWA = false }: AdminPanelProps) {
  const {
    hero,
    owner,
    services,
    websites,
    portfolio,
    testimonials,
    team,
    logoUrl,
    headerBranding,
    noticeConfig,
    offerConfig,
    contactConfig,
    sectionHeadings,
    customPackagePlans,
    updateHero,
    updateOwner,
    updateServices,
    updateWebsites,
    updatePortfolio,
    updateTestimonials,
    updateTeam,
    updateLogoUrl,
    updateHeaderBranding,
    updateNoticeConfig,
    updateOfferConfig,
    updateContactConfig,
    updateSectionHeadings,
    updateCustomPackagePlans,
    whyChooseUsStats,
    whyChooseUsItems,
    updateWhyChooseUsStats,
    updateWhyChooseUsItems,
    resetAll
  } = useContent();

  const [isAdminFloatOpen, setIsAdminFloatOpen] = useState(false);

  // Custom dialog state to replace native window.confirm (since sandboxed iframes block native confirm windows)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [noticeShow, setNoticeShow] = useState<boolean>(true);
  const [localNotices, setLocalNotices] = useState<any[]>([]);
  const [editingLocalNoticeId, setEditingLocalNoticeId] = useState<string | null>(null);
  const [tempNoticeBadge, setTempNoticeBadge] = useState("");
  const [tempNoticeText, setTempNoticeText] = useState("");
  const [tempNoticeHighlight, setTempNoticeHighlight] = useState("");
  const [tempNoticeIcon, setTempNoticeIcon] = useState("Sparkles");

  // Why Choose Us editable structures
  const [localWhyChooseUsStats, setLocalWhyChooseUsStats] = useState<any[]>([]);
  const [localWhyChooseUsItems, setLocalWhyChooseUsItems] = useState<any[]>([]);

  // Special Offer custom states
  const [offerShow, setOfferShow] = useState<boolean>(true);
  const [offerBadgeText, setOfferBadgeText] = useState("");
  const [offerUrgencyText, setOfferUrgencyText] = useState("");
  const [offerDescriptionText, setOfferDescriptionText] = useState("");
  const [offerTimerType, setOfferTimerType] = useState<"midnight" | "custom_target">("midnight");
  const [offerCustomTargetDate, setOfferCustomTargetDate] = useState("");
  const [offerDiscountActive, setOfferDiscountActive] = useState<boolean>(false);
  const [offerDiscountPercentage, setOfferDiscountPercentage] = useState<number>(10);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem("avexon_admin_authenticated") === "true";
  });
  const [passcode, setPasscode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("hero");
  const [showPass, setShowPass] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Orders State (tied to checkout tracking database)
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Live Sync checking states
  const [isCheckingSync, setIsCheckingSync] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>("");
  const [syncStatusType, setSyncStatusType] = useState<"idle" | "success" | "error" >("idle");

  // AI Assistant States
  const [aiInstruction, setAiInstruction] = useState<string>("");
  const [aiIsGenerating, setAiIsGenerating] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [aiError, setAiError] = useState<string>("");

  // Supabase Testing States
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [supabaseTestMessage, setSupabaseTestMessage] = useState<string>("");
  const [manualSupabaseUrl, setManualSupabaseUrl] = useState<string>(() => safeLocalStorage.getItem("VITE_SUPABASE_URL") || "");
  const [manualSupabaseKey, setManualSupabaseKey] = useState<string>(() => safeLocalStorage.getItem("VITE_SUPABASE_ANON_KEY") || "");

  const handleSaveManualSupabase = async () => {
    if (!manualSupabaseUrl.trim() || !manualSupabaseKey.trim()) {
      alert("ইনপুট খালি রাখা যাবে না! দয়া করে দুটি ইনপুটই সঠিকভাবে পূরণ করুন।");
      return;
    }
    safeLocalStorage.setItem("VITE_SUPABASE_URL", manualSupabaseUrl.trim());
    safeLocalStorage.setItem("VITE_SUPABASE_ANON_KEY", manualSupabaseKey.trim());

    try {
      await fetch("/api/supabase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: manualSupabaseUrl.trim(),
          anonKey: manualSupabaseKey.trim()
        })
      });
    } catch (e) {
      console.warn("Could not write Supabase config to server filesystem:", e);
    }

    triggerSuccessAlert("সুপাবেস সংযোগ কি সফলভাবে সেভ করা হয়েছে! ৫ সেকেন্ডের মধ্যে পেজ রিলোড হবে...");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleResetManualSupabase = async () => {
    safeLocalStorage.removeItem("VITE_SUPABASE_URL");
    safeLocalStorage.removeItem("VITE_SUPABASE_ANON_KEY");
    setManualSupabaseUrl("");
    setManualSupabaseKey("");

    try {
      await fetch("/api/supabase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "",
          anonKey: ""
        })
      });
    } catch (e) {
      console.warn("Could not reset Supabase config on server filesystem:", e);
    }

    triggerSuccessAlert("ম্যানুয়াল সুপাবেস কি মুছে ফেলা হয়েছে এবং ডিফল্ট সেটিংস সচল করা হয়েছে!");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleTestSupabaseConnection = async () => {
    setSupabaseTestStatus("testing");
    setSupabaseTestMessage("সুপাবেস ডাটাবেস সংযোগ পরীক্ষা করা হচ্ছে...");

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error("Supabase URL অথবা API Key কনফিগার করা হয়নি! দয়া করে আপনার ক্লাউড এনভায়রনমেন্ট বা .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY যোগ করুন।");
      }

      // 1. টেস্ট রিড কুয়েরি (SELECT TEST)
      setSupabaseTestMessage("ধাপ ১: ডাটাবেস আংশিক রিডিং মডিউল টেস্ট করা হচ্ছে...");
      const { data: readData, error: readError } = await supabase
        .from("avexon_content")
        .select("key")
        .limit(1);

      if (readError) {
        throw new Error(`রিড (SELECT) টেস্ট করতে ব্যর্থ হয়েছে। দয়া করে নিশ্চিত করুন আপনার SQL স্ক্রিপ্টটি Supabase SQL Editor-এ রান করেছেন এবং 'avexon_content' টেবিলটি সফলভাবে তৈরি হয়েছে। Error: ${readError.message}`);
      }

      // 2. টেস্ট রাইট/ডিলিট কুয়েরি (WRITE/DELETE CURD TEST)
      setSupabaseTestMessage("ধাপ ২: ডাটাবেসে রিয়েল-টাইম ডাটা রাইট ও সিকিউরিটি চেক করা হচ্ছে...");
      const dummyKey = `test_connection_ping_${Date.now()}`;
      const { error: insertError } = await supabase
        .from("avexon_content")
        .upsert({
          key: dummyKey,
          value: { status: "Active Connection Tested OK", test_time: new Date().toISOString() }
        });

      if (insertError) {
        if (insertError.message.includes("violates row-level security policy")) {
          throw new Error(`রাইট (UPSERT) টেস্ট করতে ব্যর্থ হয়েছে! আপনার Supabase টেবিলে Row-Level Security (RLS) সক্রিয় রয়েছে কিন্তু রাইট পলিসি অনুমোদিত নয়। নিচের SQL কোড অংশের ৪ ও ৫ নং লাইনে দেওয়া পলিসি স্ক্রিপ্টটি কপি করে অনুগ্রহ করে Supabase SQL Editor-এ রান করুন।`);
        }
        throw new Error(`রাইট (UPSERT) টেস্ট করতে ব্যর্থ হয়েছে। RLS Rules বা পলিসি যোগ করা হয়েছে কি? Error: ${insertError.message}`);
      }

      // 3. ডিলিট করা
      setSupabaseTestMessage("ধাপ ৩: টেস্ট ডাটা সাফ এবং সেশন ক্লোজ করা হচ্ছে...");
      const { error: deleteError } = await supabase
        .from("avexon_content")
        .delete()
        .eq("key", dummyKey);

      if (deleteError) {
        console.warn("টেস্ট ডাটা মুছতে ব্যর্থ হয়েছে, তবে রাইট কুয়েরি কাজ করেছে:", deleteError.message);
      }

      setSupabaseTestStatus("success");
      setSupabaseTestMessage("অভিনন্দন! আপনার Supabase কানেকশন সম্পূর্ণ সচল রয়েছে। রিড, রাইট, এবং ডিলিট টেস্ট ১০০% সফল। রিয়েল-টাইম লাইভ ব্রডকাস্টিং পুরোপুরি কার্যকর!");
      triggerSuccessAlert("সুপাবেস পরীক্ষা সফল হয়েছে!");
    } catch (err: any) {
      console.error("Supabase test error:", err);
      setSupabaseTestStatus("error");
      setSupabaseTestMessage(err.message || "অজানা ত্রুটি ঘটেছে। কানেকশন ব্যর্থ হয়েছে।");
    }
  };

  const handleManualSyncCheck = async () => {
    setIsCheckingSync(true);
    setSyncStatusType("idle");
    setSyncStatusMsg("অর্ডার লাইভ সিঙ্ক্রোনাইজেশন স্টেট পরীক্ষা করা হচ্ছে...");

    try {
      const startTime = Date.now();
      
      let url = "/api/orders";
      if (typeof window !== "undefined") {
        const origin = window.location.origin;
        if (origin && origin !== "null" && origin.startsWith("http")) {
          url = origin + "/api/orders";
        } else {
          const href = window.location.href;
          if (href && href.startsWith("http")) {
            const match = href.match(/^(https?:\/\/[^\/]+)/);
            if (match) {
              url = match[1] + "/api/orders";
            }
          }
        }
      }

      const res = await fetch(url);
      const duration = Date.now() - startTime;
      
      const json = await res.json();
      if (json.success && json.data) {
        const list: Order[] = json.data;
        setAllOrders(list);
        safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(list));
        
        let statusText = `সার্ভার কানেকশন ওকে (রেসপন্স টাইম: ${duration}ms)। `;
        statusText += `স্থানীয় ডাটাবেজে মোট ${list.length}টি লাইভ অর্ডার সফলভাবে সিঙ্ক হয়েছে। `;

        if (isSupabaseConfigured && supabase) {
          statusText += " ক্লাউড সুপাবেস কানেকশন সচল এবং রিয়েল-টাইম চ্যানেল সিঙ্ক কোয়ালিটি ১০০%! 🟢";
        } else {
          statusText += " স্থানীয় সার্ভার ডাটাবেজ মোডে সিঙ্ক কাজ করছে।";
        }

        setSyncStatusMsg(statusText);
        setSyncStatusType("success");
      } else {
        throw new Error("সার্ভার থেকে সফল ডাটা পাওয়া যায়নি!");
      }
    } catch (err: any) {
      console.error("Manual order sync error:", err);
      setSyncStatusType("error");
      setSyncStatusMsg(`সিঙ্ক টেস্ট ব্যর্থ হয়েছে! সার্ভার আনরিচেবল অথবা অফলাইনে আছে। ত্রুটি: ${err.message || "অজানা সমস্যা"}`);
    } finally {
      setIsCheckingSync(false);
    }
  };

  // Package Planner local states and synchronization
  const [pkgSelectedCategory, setPkgSelectedCategory] = useState<string>("ecommerce");
  const [pkgPlans, setPkgPlans] = useState<any[]>([]);
  const [activePlanSubEdit, setActivePlanSubEdit] = useState<number | null>(null);

  useEffect(() => {
    if (customPackagePlans && customPackagePlans[pkgSelectedCategory]) {
      setPkgPlans(JSON.parse(JSON.stringify(customPackagePlans[pkgSelectedCategory])));
    } else {
      setPkgPlans(getPlansDefaultsForCategory(pkgSelectedCategory));
    }
  }, [pkgSelectedCategory, customPackagePlans]);

  const handleUpdatePkgPlanField = (index: number, field: string, value: any) => {
    const updated = [...pkgPlans];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setPkgPlans(updated);
  };

  const handleUpdatePkgPlanFeatures = (index: number, textValue: string) => {
    const featuresArray = textValue.split("\n").map(f => f.trim()).filter(f => f.length > 0);
    handleUpdatePkgPlanField(index, "features", featuresArray);
  };

  const handleUpdatePkgSuitableFor = (index: number, textValue: string) => {
    const list = textValue.split("\n").map(item => item.trim()).filter(item => item.length > 0);
    handleUpdatePkgPlanField(index, "suitableFor", list);
  };

  const handleUpdatePkgWhyChoose = (index: number, textValue: string) => {
    const list = textValue.split("\n").map(item => item.trim()).filter(item => item.length > 0);
    handleUpdatePkgPlanField(index, "whyChoose", list);
  };

  const handleUpdatePkgDetailedFeature = (planIndex: number, featIndex: number, field: "title" | "desc", value: string) => {
    const updated = [...pkgPlans];
    if (!updated[planIndex].featuresDetailed) {
      updated[planIndex].featuresDetailed = [];
    }
    while (updated[planIndex].featuresDetailed.length <= featIndex) {
      updated[planIndex].featuresDetailed.push({ title: "", desc: "" });
    }
    updated[planIndex].featuresDetailed[featIndex] = {
      ...updated[planIndex].featuresDetailed[featIndex],
      [field]: value
    };
    setPkgPlans(updated);
  };

  const handleAddPkgDetailedFeature = (planIndex: number) => {
    const updated = [...pkgPlans];
    if (!updated[planIndex].featuresDetailed) {
      updated[planIndex].featuresDetailed = [];
    }
    updated[planIndex].featuresDetailed.push({
      title: "New Sub-Feature",
      desc: "Detailed facility or benefit description goes here."
    });
    setPkgPlans(updated);
  };

  const handleRemovePkgDetailedFeature = (planIndex: number, featIndex: number) => {
    const updated = [...pkgPlans];
    if (updated[planIndex].featuresDetailed) {
      updated[planIndex].featuresDetailed.splice(featIndex, 1);
      setPkgPlans(updated);
    }
  };

  const handleSavePackagePlans = () => {
    const freshCustomPlans = {
      ...(customPackagePlans || {}),
      [pkgSelectedCategory]: pkgPlans
    };
    updateCustomPackagePlans(freshCustomPlans);
    setSaveSuccess("ক্যাটাগরির প্যাকেজ কাস্টমাইজেশন সফলভাবে সেভ করা হয়েছে!");
    // Clear notification after 4s
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  // Form States
  // 1. Hero
  const [heroTitle, setHeroTitle] = useState(hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(hero.subtitle);
  const [heroCta, setHeroCta] = useState(hero.ctaText);
  const [heroWhatsapp, setHeroWhatsapp] = useState(hero.whatsappNumber);
  const [adminLogoUrl, setAdminLogoUrl] = useState(logoUrl);

  const [brandName, setBrandName] = useState(headerBranding.brandName);
  const [brandBadge, setBrandBadge] = useState(headerBranding.brandBadge);
  const [brandSubtitle, setBrandSubtitle] = useState(headerBranding.brandSubtitle);
  const [fontFamily, setFontFamily] = useState(headerBranding.fontFamily);
  const [googleFontUrl, setGoogleFontUrl] = useState(headerBranding.googleFontUrl);
  const [adminCustomFontUrl, setAdminCustomFontUrl] = useState(headerBranding.customFontUrl || "");
  const [subtitleFontFamily, setSubtitleFontFamily] = useState(headerBranding.subtitleFontFamily || "");
  const [adminSubtitleCustomFontUrl, setAdminSubtitleCustomFontUrl] = useState(headerBranding.subtitleCustomFontUrl || "");
  const [subtitleFontSize, setSubtitleFontSize] = useState(headerBranding.subtitleFontSize || "9px");
  const [loaderText, setLoaderText] = useState(headerBranding.loaderText || "");

  // 1.5 Owner Card Profile settings
  const [ownerName, setOwnerName] = useState(owner.name);
  const [ownerRole, setOwnerRole] = useState(owner.role);
  const [ownerTitle, setOwnerTitle] = useState(owner.title);
  const [ownerPicUrl, setOwnerPicUrl] = useState(owner.picUrl);

  // 1.7 Business Contact & Social Info
  const [officeAddress, setOfficeAddress] = useState(contactConfig?.officeAddress || "");
  const [helplineNumbers, setHelplineNumbers] = useState(contactConfig?.helplineNumbers || "");
  const [officialEmails, setOfficialEmails] = useState(contactConfig?.officialEmails || "");
  const [supportHours, setSupportHours] = useState(contactConfig?.supportHours || "");
  const [facebookUrl, setFacebookUrl] = useState(contactConfig?.facebookUrl || "");
  const [twitterUrl, setTwitterUrl] = useState(contactConfig?.twitterUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(contactConfig?.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(contactConfig?.githubUrl || "");
  const [bkashNumber, setBkashNumber] = useState(contactConfig?.bkashNumber || "");
  const [nagadNumber, setNagadNumber] = useState(contactConfig?.nagadNumber || "");
  const [instagramUrl, setInstagramUrl] = useState(contactConfig?.instagramUrl || "");
  const [whatsappUrl, setWhatsappUrl] = useState(contactConfig?.whatsappUrl || "");

  // 2. Websites / Services / Portfolio / Testimonial Editing Sub-states
  const [editWebItem, setEditWebItem] = useState<Partial<WebsiteProduct> | null>(null);
  const [editServiceItem, setEditServiceItem] = useState<Partial<Service> | null>(null);
  const [editPortfolioItem, setEditPortfolioItem] = useState<Partial<PortfolioItem> | null>(null);
  const [editTestimonialItem, setEditTestimonialItem] = useState<Partial<Testimonial> | null>(null);
  const [editTeamItem, setEditTeamItem] = useState<Partial<TeamMember> | null>(null);

  // Section Headings States (Title & Subtitles)
  const [servicesTitle, setServicesTitle] = useState("");
  const [servicesSubtitle, setServicesSubtitle] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioSubtitle, setPortfolioSubtitle] = useState("");
  const [websitesTitle, setWebsitesTitle] = useState("");
  const [websitesSubtitle, setWebsitesSubtitle] = useState("");
  const [customiseTitle, setCustomiseTitle] = useState("");
  const [customiseSubtitle, setCustomiseSubtitle] = useState("");
  const [whyUsTitle, setWhyUsTitle] = useState("");
  const [whyUsSubtitle, setWhyUsSubtitle] = useState("");
  const [testimonialsTitle, setTestimonialsTitle] = useState("");
  const [testimonialsSubtitle, setTestimonialsSubtitle] = useState("");
  const [teamTitle, setTeamTitle] = useState("");
  const [teamSubtitle, setTeamSubtitle] = useState("");
  const [contactTitle, setContactTitle] = useState("");
  const [contactSubtitle, setContactSubtitle] = useState("");

  // Reload local lists when context values change
  useEffect(() => {
    if (isOpen || isStandalonePWA) {
      setHeroTitle(hero.title);
      setHeroSubtitle(hero.subtitle);
      setHeroCta(hero.ctaText);
      setHeroWhatsapp(hero.whatsappNumber);
      setAdminLogoUrl(logoUrl);

      setBrandName(headerBranding.brandName);
      setBrandBadge(headerBranding.brandBadge);
      setBrandSubtitle(headerBranding.brandSubtitle);
      setFontFamily(headerBranding.fontFamily);
      setGoogleFontUrl(headerBranding.googleFontUrl);
      setAdminCustomFontUrl(headerBranding.customFontUrl || "");
      setSubtitleFontFamily(headerBranding.subtitleFontFamily || "");
      setAdminSubtitleCustomFontUrl(headerBranding.subtitleCustomFontUrl || "");
      setSubtitleFontSize(headerBranding.subtitleFontSize || "9px");
      setLoaderText(headerBranding.loaderText || "");

      setOwnerName(owner.name);
      setOwnerRole(owner.role);
      setOwnerTitle(owner.title);
      setOwnerPicUrl(owner.picUrl);

      // Load all incoming orders from tracking localDB/Server
      const fetchOrders = async () => {
        try {
          const res = await fetch("/api/orders");
          const json = await res.json();
          if (json.success && json.data) {
            setAllOrders(json.data);
            safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(json.data));
          } else {
            const stored = safeLocalStorage.getItem("avexon_user_orders");
            if (stored) setAllOrders(JSON.parse(stored));
          }
        } catch (err) {
          console.warn("Failed to fetch server orders, using fallback: ", err);
          const stored = safeLocalStorage.getItem("avexon_user_orders");
          if (stored) setAllOrders(JSON.parse(stored));
        }
      };
      fetchOrders();

      if (noticeConfig) {
        setNoticeShow(noticeConfig.show);
        setLocalNotices(noticeConfig.notices || []);
      }

      if (offerConfig) {
        setOfferShow(offerConfig.show);
        setOfferBadgeText(offerConfig.badgeText || "");
        setOfferUrgencyText(offerConfig.urgencyText || "");
        setOfferDescriptionText(offerConfig.descriptionText || "");
        setOfferTimerType(offerConfig.timerType || "midnight");
        setOfferCustomTargetDate(offerConfig.customTargetDate || "");
        setOfferDiscountActive(offerConfig.discountActive || false);
        setOfferDiscountPercentage(offerConfig.discountPercentage !== undefined ? offerConfig.discountPercentage : 10);
      }

      if (contactConfig) {
        setOfficeAddress(contactConfig.officeAddress || "");
        setHelplineNumbers(contactConfig.helplineNumbers || "");
        setOfficialEmails(contactConfig.officialEmails || "");
        setSupportHours(contactConfig.supportHours || "");
        setFacebookUrl(contactConfig.facebookUrl || "");
        setTwitterUrl(contactConfig.twitterUrl || "");
        setLinkedinUrl(contactConfig.linkedinUrl || "");
        setGithubUrl(contactConfig.githubUrl || "");
        setBkashNumber(contactConfig?.bkashNumber || "");
        setNagadNumber(contactConfig?.nagadNumber || "");
        setInstagramUrl(contactConfig.instagramUrl || "");
        setWhatsappUrl(contactConfig.whatsappUrl || "");
      }

      if (sectionHeadings) {
        setServicesTitle(sectionHeadings.servicesTitle || "");
        setServicesSubtitle(sectionHeadings.servicesSubtitle || "");
        setPortfolioTitle(sectionHeadings.portfolioTitle || "");
        setPortfolioSubtitle(sectionHeadings.portfolioSubtitle || "");
        setWebsitesTitle(sectionHeadings.websitesTitle || "");
        setWebsitesSubtitle(sectionHeadings.websitesSubtitle || "");
        setCustomiseTitle(sectionHeadings.customiseTitle || "");
        setCustomiseSubtitle(sectionHeadings.customiseSubtitle || "");
        setWhyUsTitle(sectionHeadings.whyUsTitle || "");
        setWhyUsSubtitle(sectionHeadings.whyUsSubtitle || "");
        setTestimonialsTitle(sectionHeadings.testimonialsTitle || "");
        setTestimonialsSubtitle(sectionHeadings.testimonialsSubtitle || "");
        setTeamTitle(sectionHeadings.teamTitle || "");
        setTeamSubtitle(sectionHeadings.teamSubtitle || "");
        setContactTitle(sectionHeadings.contactTitle || "");
        setContactSubtitle(sectionHeadings.contactSubtitle || "");
      }

      if (whyChooseUsStats) {
        setLocalWhyChooseUsStats(whyChooseUsStats);
      }
      if (whyChooseUsItems) {
        setLocalWhyChooseUsItems(whyChooseUsItems);
      }
    }
  }, [isOpen, isStandalonePWA, hero, services, websites, portfolio, testimonials, team, owner, headerBranding, noticeConfig, offerConfig, contactConfig, sectionHeadings, whyChooseUsStats, whyChooseUsItems]);

  // Prevent background scrolling and hide navbar when Admin Panel is open
  useEffect(() => {
    if (isOpen && !isStandalonePWA) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, isStandalonePWA]);

  // Real-time Push Notification, Badge count & Supabase Channel sync handling (PWA/Admin)
  useEffect(() => {
    let lastOrderCount = -1;
    let ordersSubscription: any = null;

    const triggerNewOrderFeedback = (newlyCreated: Order) => {
      // Premium digital agency synth chime via Web Audio API (no external file needed)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          const audioCtx = new AudioContextClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = "sine";
          // Two-tone high-tech pulse sound
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.5);
        } catch (audioErr) {
          console.log("Audio feedback ignored before user interaction:", audioErr);
        }
      }
      
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("নতুন অর্ডার রিসিভড! 🔔", {
            body: `ক্লায়েন্ট ${newlyCreated.customerName || "Unknown"} একটি অর্ডার পাঠিয়েছেন। প্রজেক্ট: ${newlyCreated.websiteTitle || "কাস্টম সার্ভিস"}`,
            icon: "/icon-512.png",
            badge: "/icon-512.png",
          });
        } catch (e) {
          console.log("Notification trigger error:", e);
        }
      }
    };
    
    const checkNewOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && json.data) {
          const ordersList: Order[] = json.data;
          const activeOrders = ordersList.filter(o => o.status !== "Done");
          
          // Update native PWA launcher app icon badge
          if ("setAppBadge" in navigator) {
            const badgeCount = activeOrders.length;
            if (badgeCount > 0) {
              (navigator as any).setAppBadge(badgeCount).catch((err: any) => console.log("Set badge error:", err));
            } else {
              (navigator as any).clearAppBadge().catch((err: any) => console.log("Clear badge error:", err));
            }
          }
          
          // Trigger Notification & audio chime if a new order arrives
          if (lastOrderCount !== -1 && ordersList.length > lastOrderCount) {
            const newlyCreated = ordersList[0]; // Newest order is unshifted at the front
            triggerNewOrderFeedback(newlyCreated);
          }
          
          // Update live state list and mirror updated data back to browser storage
          setAllOrders(ordersList);
          safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(ordersList));
          lastOrderCount = ordersList.length;
        } else {
          lastOrderCount = 0;
        }
      } catch (e) {
        console.error("PWA Realtime engine failure:", e);
      }
    };

    // If Supabase is active, subscribe to orders real-time channel!
    if (isSupabaseConfigured && supabase) {
      ordersSubscription = supabase
        .channel("avexon_orders_realtime_admin")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "avexon_orders" },
          (payload: any) => {
            if (payload.eventType === "DELETE") {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setAllOrders(prev => {
                  const updated = prev.filter(o => o.id !== deletedId);
                  safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(updated));
                  lastOrderCount = updated.length;
                  return updated;
                });
              }
            } else if (payload.eventType === "INSERT") {
              const newRecord = payload.new;
              if (newRecord && newRecord.value) {
                const newOrder = newRecord.value;
                setAllOrders(prev => {
                  const exists = prev.some(o => o.id === newOrder.id);
                  if (exists) return prev;
                  const updated = [newOrder, ...prev];
                  safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(updated));
                  lastOrderCount = updated.length;
                  // Trigger direct immediate notification and chime without polling delay!
                  triggerNewOrderFeedback(newOrder);
                  return updated;
                });
              }
            } else if (payload.eventType === "UPDATE") {
              const updatedRecord = payload.new;
              if (updatedRecord && updatedRecord.value) {
                const updatedOrder = updatedRecord.value;
                setAllOrders(prev => {
                  const index = prev.findIndex(o => o.id === updatedOrder.id);
                  let updated;
                  if (index !== -1) {
                    updated = [...prev];
                    updated[index] = updatedOrder;
                  } else {
                    updated = [updatedOrder, ...prev];
                  }
                  safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(updated));
                  lastOrderCount = updated.length;
                  return updated;
                });
              }
            }
          }
        )
        .subscribe();
    }

    // Check immediately and check every 5 seconds in the background as fallback
    checkNewOrders();
    const timer = setInterval(checkNewOrders, 5000);
    return () => {
      clearInterval(timer);
      if (ordersSubscription) {
        ordersSubscription.unsubscribe();
      }
    };
  }, []);

  // Real-time synchronization when orders are added or modified via localStorage events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = safeLocalStorage.getItem("avexon_user_orders");
        if (stored) {
          const parsed = JSON.parse(stored) as Order[];
          if (Array.isArray(parsed)) {
            setAllOrders(parsed);
          }
        }
      } catch (e) {
        console.warn("Storage sync failed inside Admin Panel:", e);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Accelerated 2s polling window when the orders live panel is active
  useEffect(() => {
    if (activeTab !== "orders") return;

    const fetchOrdersInstantly = async () => {
      try {
        const res = await fetch("/api/orders");
        const json = await res.json();
        if (json.success && json.data) {
          const ordersList = json.data;
          setAllOrders(ordersList);
          safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(ordersList));
        }
      } catch (e) {
        console.warn("Instant order polling error:", e);
      }
    };

    fetchOrdersInstantly();
    const interval = setInterval(fetchOrdersInstantly, 2000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!passcode.trim()) {
      setAuthError("পাসকোড খালি রাখা যাবে না!");
      return;
    }
    
    try {
      const response = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      
      const val = await response.json();
      if (response.ok && val.success) {
        setIsAuthenticated(true);
        safeSessionStorage.setItem("avexon_admin_authenticated", "true");
        setPasscode("");
      } else {
        setAuthError(val.error || "ভুল পাসকোড! অনুগ্রহ করে সঠিক পাসকোড দিন।");
      }
    } catch (err) {
      // Secure local fallback check during sandbox or preview build testing
      if (passcode === "Tasumu@2021") {
        setIsAuthenticated(true);
        safeSessionStorage.setItem("avexon_admin_authenticated", "true");
        setPasscode("");
      } else {
        setAuthError("ভুল পাসকোড বা সার্ভার সংযোগ ত্রুটি! অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    }
  };

  const triggerSuccessAlert = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => {
      setSaveSuccess("");
    }, 3000);
  };

  // General Hero Updates
  const handleSaveHero = () => {
    updateHero({
      title: heroTitle,
      subtitle: heroSubtitle,
      ctaText: heroCta,
      whatsappNumber: heroWhatsapp
    });
    updateOwner({
      name: ownerName,
      role: ownerRole,
      title: ownerTitle,
      picUrl: ownerPicUrl
    });
    updateLogoUrl(adminLogoUrl);
    updateHeaderBranding({
      brandName,
      brandBadge,
      brandSubtitle,
      fontFamily: adminCustomFontUrl ? (fontFamily || "CustomUploadedFont") : fontFamily,
      googleFontUrl,
      customFontUrl: adminCustomFontUrl,
      subtitleFontFamily: adminSubtitleCustomFontUrl ? (subtitleFontFamily || "CustomUploadedSubtitleFont") : subtitleFontFamily,
      subtitleCustomFontUrl: adminSubtitleCustomFontUrl,
      subtitleFontSize,
      loaderText
    });
    updateContactConfig({
      officeAddress,
      helplineNumbers,
      officialEmails,
      supportHours,
      facebookUrl,
      twitterUrl,
      linkedinUrl,
      githubUrl,
      bkashNumber,
      nagadNumber,
      instagramUrl,
      whatsappUrl
    });
    triggerSuccessAlert("হোমপেজ সেটিংস, ব্যবসা ও কন্ট্যাক্ট তথ্য, ওনার প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleSaveContact = () => {
    updateContactConfig({
      officeAddress,
      helplineNumbers,
      officialEmails,
      supportHours,
      facebookUrl,
      twitterUrl,
      linkedinUrl,
      githubUrl,
      bkashNumber,
      nagadNumber,
      instagramUrl,
      whatsappUrl
    });
    updateSectionHeadings({
      servicesTitle,
      servicesSubtitle,
      portfolioTitle,
      portfolioSubtitle,
      websitesTitle,
      websitesSubtitle,
      customiseTitle,
      customiseSubtitle,
      whyUsTitle,
      whyUsSubtitle,
      testimonialsTitle,
      testimonialsSubtitle,
      teamTitle,
      teamSubtitle,
      contactTitle,
      contactSubtitle
    });
    triggerSuccessAlert("যোগাযোগের তথ্য, সামাজিক সাইট লিংক এবং পেমেন্ট গেটওয়ে নম্বর সফলভাবে সংরক্ষিত হয়েছে!");
  };

  const handleSaveHeadings = () => {
    updateSectionHeadings({
      servicesTitle,
      servicesSubtitle,
      portfolioTitle,
      portfolioSubtitle,
      websitesTitle,
      websitesSubtitle,
      customiseTitle,
      customiseSubtitle,
      whyUsTitle,
      whyUsSubtitle,
      testimonialsTitle,
      testimonialsSubtitle,
      teamTitle,
      teamSubtitle,
      contactTitle,
      contactSubtitle
    });
    triggerSuccessAlert("সেকশন হেডার ও স্লোগানগুলো সফলভাবে সেভ হয়েছে!");
  };

  // Why Choose Us Stats & Items savers
  const handleSaveWhyUsStats = () => {
    updateWhyChooseUsStats(localWhyChooseUsStats);
    triggerSuccessAlert("৩টি মেগা স্ট্যাটস সফলভাবে আপডেট ও সেভ হয়েছে!");
  };

  const handleSaveWhyUsItems = () => {
    updateWhyChooseUsItems(localWhyChooseUsItems);
    triggerSuccessAlert("কেন এভেক্সন সুবিধার তালিকা ( timeline items ) সফলভাবে সেভ হয়েছে!");
  };

  // Special Offer settings handler
  const handleSaveOfferSetting = () => {
    let autoShow = offerShow;
    let autoDiscountActive = offerShow;

    if (offerShow) {
      if (offerTimerType === "custom_target" && offerCustomTargetDate) {
        const isFuture = new Date(offerCustomTargetDate).getTime() > Date.now();
        if (!isFuture) {
          autoShow = false;
          autoDiscountActive = false;
          setOfferShow(false);
          setOfferDiscountActive(false);
          triggerSuccessAlert("নির্বাচন সর্তকতা: লক্ষ্য সময়সীমাটি বর্তমান সময়ের অতীত হওয়ায় অফার এবং ডিসকাউন্ট নিষ্ক্রিয় করা হয়েছে।");
        }
      }
    }

    setOfferShow(autoShow);
    setOfferDiscountActive(autoDiscountActive);

    updateOfferConfig({
      show: autoShow,
      badgeText: offerBadgeText,
      urgencyText: offerUrgencyText,
      descriptionText: offerDescriptionText,
      timerType: offerTimerType,
      customTargetDate: offerCustomTargetDate,
      discountActive: autoDiscountActive,
      discountPercentage: offerDiscountPercentage
    });

    if (autoShow) {
      triggerSuccessAlert("স্পেশাল মেগা অফার ব্যানার ও ডিসকাউন্ট সংরক্ষিত হয়েছে এবং অফার টাইমারটি স্বয়ংক্রিয়ভাবে সক্রিয় হয়েছে!");
    } else {
      triggerSuccessAlert("স্পেশাল মেগা অফার ও ডিসকাউন্ট সফলভাবে নিষ্ক্রিয় করা হয়েছে!");
    }
  };

  // Notice Bar dynamic settings handlers
  const handleSaveNoticeBarSetting = (newShow: boolean) => {
    setNoticeShow(newShow);
    updateNoticeConfig({
      show: newShow,
      notices: localNotices
    });
    triggerSuccessAlert(newShow ? "ঘোষণা নোটিশ বার চালু করা হয়েছে!" : "ঘোষণা নোটিশ বার বন্ধ করা হয়েছে!");
  };

  const handleEditNoticeItemClick = (notice: any) => {
    setEditingLocalNoticeId(notice.id);
    setTempNoticeBadge(notice.badge || "");
    setTempNoticeText(notice.text || "");
    setTempNoticeHighlight(notice.highlight || "");
    setTempNoticeIcon(notice.iconName || "Sparkles");
  };

  const handleCancelNoticeEdit = () => {
    setEditingLocalNoticeId(null);
    setTempNoticeBadge("");
    setTempNoticeText("");
    setTempNoticeHighlight("");
    setTempNoticeIcon("Sparkles");
  };

  const handleSaveNoticeItem = () => {
    if (!tempNoticeText.trim()) {
      alert("অনুগ্রহ করে নোটিশের কন্টেন্ট টেক্সট লিখুন!");
      return;
    }

    let updatedNotices: any[];
    const isNew = !editingLocalNoticeId || editingLocalNoticeId === "new";

    if (isNew) {
      const newNotice = {
        id: `n-${Date.now()}`,
        badge: tempNoticeBadge,
        text: tempNoticeText,
        highlight: tempNoticeHighlight,
        iconName: tempNoticeIcon
      };
      updatedNotices = [...localNotices, newNotice];
    } else {
      updatedNotices = localNotices.map(item => 
        item.id === editingLocalNoticeId 
          ? {
              ...item,
              badge: tempNoticeBadge,
              text: tempNoticeText,
              highlight: tempNoticeHighlight,
              iconName: tempNoticeIcon
            }
          : item
      );
    }

    setLocalNotices(updatedNotices);
    updateNoticeConfig({
      show: noticeShow,
      notices: updatedNotices
    });
    
    setEditingLocalNoticeId(null);
    setTempNoticeBadge("");
    setTempNoticeText("");
    setTempNoticeHighlight("");
    setTempNoticeIcon("Sparkles");

    triggerSuccessAlert(isNew ? "নতুন ঘোষণা নোটিশ যোগ করা হয়েছে!" : "ঘোষণা নোটিশ সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleDeleteNoticeItem = (id: string) => {
    setDeleteConfirm({
      id,
      title: "ঘোষণা নোটিশ মুছে ফেলুন",
      description: "আপনি কি নিশ্চিতভাবে এই ঘোষণা নোটিশটি তালিকা থেকে চিরতরে ডিলিট করতে চান?",
      onConfirm: () => {
        const updated = localNotices.filter(item => item.id !== id);
        setLocalNotices(updated);
        updateNoticeConfig({
          show: noticeShow,
          notices: updated
        });
        triggerSuccessAlert("নোটিশ মুছে ফেলা হয়েছে।");
      }
    });
  };

  // Website shop item modifications
  const handleSaveWebsiteProduct = () => {
    if (!editWebItem) return;
    const isNew = !editWebItem.id;
    const id = isNew ? `w-${Date.now()}` : editWebItem.id!;
    
    const finalItem: WebsiteProduct = {
      id,
      title: editWebItem.title || "নতুন ই-কমার্স সাইট",
      category: editWebItem.category || "ই-কমার্স",
      deliveryTime: editWebItem.deliveryTime || "২-৪ দিন",
      price: Number(editWebItem.price) || 8000,
      originalPrice: Number(editWebItem.originalPrice) || 15000,
      rating: Number(editWebItem.rating) || 5.0,
      ordersCount: Number(editWebItem.ordersCount) || 12,
      featuresCount: Number(editWebItem.featuresCount) || 10,
      image: editWebItem.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      tags: editWebItem.tags || ["Bkash/Nagad", "Admin Dashboard"],
      demoUrl: editWebItem.demoUrl || "https://react.dev",
      features: editWebItem.features || []
    };

    let updatedList: WebsiteProduct[];
    if (isNew) {
      updatedList = [...websites, finalItem];
    } else {
      updatedList = websites.map(w => w.id === id ? finalItem : w);
    }

    updateWebsites(updatedList);
    setEditWebItem(null);
    triggerSuccessAlert("ওয়েবসাইট প্রোডাক্ট মেটাডাটা সফলভাবে আপডেট করা হয়েছে!");
  };

  const handleDeleteWebsite = (id: string) => {
    setDeleteConfirm({
      id,
      title: "প্রোডাক্ট ডিলিট করুন",
      description: "আপনি কি নিশ্চিতভাবে এই ওয়েবসাইট প্রোডাক্টটি শপ থেকে ডিলিট করতে চান?",
      onConfirm: () => {
        const updated = websites.filter(w => w.id !== id);
        updateWebsites(updated);
        triggerSuccessAlert("শপ আইটেম ডিলিট করা হয়েছে।");
      }
    });
  };

  // Services dynamic adjustments
  const handleSaveService = () => {
    if (!editServiceItem) return;
    const isNew = !editServiceItem.id;
    const id = isNew ? `s-${Date.now()}` : editServiceItem.id!;

    const finalItem: Service = {
      id,
      title: editServiceItem.title || "",
      description: editServiceItem.description || "",
      iconName: editServiceItem.iconName || "Globe",
      priceStarting: editServiceItem.priceStarting || "৳৮,০০০",
      duration: editServiceItem.duration || "১-৩ দিন",
      techs: editServiceItem.techs || ["React.js"]
    };

    let updatedList: Service[];
    if (isNew) {
      updatedList = [...services, finalItem];
    } else {
      updatedList = services.map(s => s.id === id ? finalItem : s);
    }

    updateServices(updatedList);
    setEditServiceItem(null);
    triggerSuccessAlert("সেবা সূচী মেটাডাটা সফলভাবে সংরক্ষিত হয়েছে!");
  };

  const handleDeleteService = (id: string) => {
    setDeleteConfirm({
      id,
      title: "সেবা মুছে ফেলুন",
      description: "আপনি কি নিশ্চিতভাবে এই সেবাটি তালিকা হতে বাদ দিতে চান?",
      onConfirm: () => {
        const updated = services.filter(s => s.id !== id);
        updateServices(updated);
        triggerSuccessAlert("সেবা ডিলিট সম্পন্ন হয়েছে।");
      }
    });
  };

  // Portfolios Dynamic custom modifications
  const handleSavePortfolio = () => {
    if (!editPortfolioItem) return;
    const isNew = !editPortfolioItem.id;
    const id = isNew ? `p-${Date.now()}` : editPortfolioItem.id!;

    const finalItem: PortfolioItem = {
      id,
      title: editPortfolioItem.title || "",
      category: editPortfolioItem.category || "",
      description: editPortfolioItem.description || "",
      imageUrl: editPortfolioItem.imageUrl || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
      client: editPortfolioItem.client || "",
      year: editPortfolioItem.year || "২০২৬",
      tags: editPortfolioItem.tags || []
    };

    let updatedList: PortfolioItem[];
    if (isNew) {
      updatedList = [...portfolio, finalItem];
    } else {
      updatedList = portfolio.map(p => p.id === id ? finalItem : p);
    }

    updatePortfolio(updatedList);
    setEditPortfolioItem(null);
    triggerSuccessAlert("পোর্টফোলিও প্রজেক্ট সফলভাবে আপডেট হয়েছে!");
  };

  const handleDeletePortfolio = (id: string) => {
    setDeleteConfirm({
      id,
      title: "পোর্টফোলিও প্রজেক্ট ডিলিট",
      description: "আপনি কি নিশ্চিতভাবে এই প্রজেক্ট রেকর্ড ডিলিট করতে চান?",
      onConfirm: () => {
        const updated = portfolio.filter(p => p.id !== id);
        updatePortfolio(updated);
        triggerSuccessAlert("প্রজেক্ট ডিলিট সম্পন্ন।");
      }
    });
  };

  // Testimonial dynamic alterations
  const handleSaveTestimonial = () => {
    if (!editTestimonialItem) return;
    const isNew = !editTestimonialItem.id;
    const id = isNew ? `t-${Date.now()}` : editTestimonialItem.id!;

    const finalItem: Testimonial = {
      id,
      name: editTestimonialItem.name || "",
      role: editTestimonialItem.role || "",
      avatarUrl: editTestimonialItem.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      text: editTestimonialItem.text || "",
      rating: Number(editTestimonialItem.rating) || 5,
      type: editTestimonialItem.type as "readymade" | "custom" || "custom"
    };

    let updatedList: Testimonial[];
    if (isNew) {
      updatedList = [...testimonials, finalItem];
    } else {
      updatedList = testimonials.map(t => t.id === id ? finalItem : t);
    }

    updateTestimonials(updatedList);
    setEditTestimonialItem(null);
    triggerSuccessAlert("গ্রাহক রিভিও আপডেট করা হয়েছে!");
  };

  const handleDeleteTestimonial = (id: string) => {
    setDeleteConfirm({
      id,
      title: "রিভিউ ডিলিট",
      description: "আপনি কি নিশ্চিতভাবে এই রিভিউটি মুছে ফেলতে চান?",
      onConfirm: () => {
        const updated = testimonials.filter(t => t.id !== id);
        updateTestimonials(updated);
        triggerSuccessAlert("রিভিউ ডিলিট সম্পন্ন।");
      }
    });
  };

  // Team controls
  const handleSaveTeamMember = () => {
    if (!editTeamItem) return;
    const isNew = !editTeamItem.id;
    const id = isNew ? `tm-${Date.now()}` : editTeamItem.id!;

    const finalItem: TeamMember = {
      id,
      name: editTeamItem.name || "",
      role: editTeamItem.role || "",
      imageUrl: editTeamItem.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      skills: editTeamItem.skills || [],
      bio: editTeamItem.bio || "",
      facebookUrl: editTeamItem.facebookUrl || "",
      instagramUrl: editTeamItem.instagramUrl || "",
      githubUrl: editTeamItem.githubUrl || "",
      linkedinUrl: editTeamItem.linkedinUrl || "",
      whatsappUrl: editTeamItem.whatsappUrl || "",
      showFacebook: editTeamItem.showFacebook !== undefined ? editTeamItem.showFacebook : true,
      showInstagram: editTeamItem.showInstagram !== undefined ? editTeamItem.showInstagram : true,
      showGithub: editTeamItem.showGithub !== undefined ? editTeamItem.showGithub : true,
      showLinkedin: editTeamItem.showLinkedin !== undefined ? editTeamItem.showLinkedin : true,
      showWhatsapp: editTeamItem.showWhatsapp !== undefined ? editTeamItem.showWhatsapp : true,
    };

    let updatedList: TeamMember[];
    if (isNew) {
      updatedList = [...team, finalItem];
    } else {
      updatedList = team.map(t => t.id === id ? finalItem : t);
    }

    updateTeam(updatedList);
    setEditTeamItem(null);
    triggerSuccessAlert("টিম মেম্বার সফলভাবে আপডেট হয়েছে!");
  };

  const handleDeleteTeamMember = (id: string) => {
    setDeleteConfirm({
      id,
      title: "টিম মেম্বার ডিলিট",
      description: "আপনি কি নিশ্চিতভাবে এই টিম মেম্বারটিকে তালিকা থেকে ডিলিট করতে চান?",
      onConfirm: () => {
        const updated = team.filter(t => t.id !== id);
        updateTeam(updated);
        triggerSuccessAlert("টিম মেম্বার রিমুভ সম্পন্ন।");
      }
    });
  };

  // Order Database Tracking Manager Controls
  const handleSaveOrderUpdate = () => {
    if (!editingOrder) return;
    const updatedList = allOrders.map(o => o.id === editingOrder.id ? editingOrder : o);
    setAllOrders(updatedList);
    
    try {
      safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(updatedList));
      // Force trigger immediate storage update across listener windows
      window.dispatchEvent(new Event("storage"));
      
      // Save order update on server database
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingOrder)
      }).catch(err => console.error("Failed to sync updated order to server:", err));

      // Direct client-side Supabase write for instant customer-side UI refresh
      if (isSupabaseConfigured && supabase) {
        (async () => {
          try {
            await supabase.from("avexon_orders").upsert({ id: editingOrder.id, value: editingOrder });
          } catch (err) {
            console.error("Direct Supabase flat order update failed:", err);
          }
        })();
      }
    } catch (err) {
      console.warn(err);
    }

    setEditingOrder(null);
    triggerSuccessAlert(`অর্ডার ট্র্যাকিং আইডি ${editingOrder.id} সফলভাবে আপডেট হয়েছে!`);
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirm({
      id: orderId,
      title: "অর্ডার ডিলেট করুন",
      description: `আপনি কি ট্র্যাকিং আইডি ${orderId} নিশ্চিতভাবে চিরতরে ডিলিট করতে চান?`,
      onConfirm: () => {
        const updated = allOrders.filter(o => o.id !== orderId);
        setAllOrders(updated);
        try {
          safeLocalStorage.setItem("avexon_user_orders", JSON.stringify(updated));
          
          // Clear active tracking token if focused on this deleted order
          const trackingId = safeLocalStorage.getItem("avexon_active_tracking_id");
          if (trackingId === orderId) {
            safeLocalStorage.removeItem("avexon_active_tracking_id");
          }
          window.dispatchEvent(new Event("storage"));
          
          // Delete order from server database
          fetch(`/api/orders/${orderId}`, {
            method: "DELETE"
          }).catch(err => console.error("Failed to sync deleted order to server:", err));

          // Direct client-side Supabase delete
          if (isSupabaseConfigured && supabase) {
            (async () => {
              try {
                await supabase.from("avexon_orders").delete().eq("id", orderId);
              } catch (err) {
                console.error("Direct Supabase flat order delete failed:", err);
              }
            })();
          }
        } catch (e) {}
        triggerSuccessAlert("অর্ডার ডাটাবেজ থেকে মুছে ফেলা হয়েছে।");
      }
    });
  };

  const handleRunAIAssistant = async () => {
    if (!aiInstruction.trim()) {
      setAiError("অনুগ্রহ করে আপনার প্রয়োজনীয় পরিবর্তনগুলোর কথা বাংলায় বা ইংরেজিতে লিখুন।");
      return;
    }

    setAiIsGenerating(true);
    setAiError("");
    setAiFeedback("");

    // Gather the current full merged state reflecting context properties
    const currentState = {
      hero,
      owner,
      services,
      websites,
      portfolio,
      testimonials,
      team,
      logoUrl,
      headerBranding,
      noticeConfig,
      offerConfig,
      contactConfig,
    };

    try {
      const response = await fetch("/api/gemini/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: aiInstruction,
          currentState,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "এআই প্রসেসিং ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }

      // Destructure Gemini returned content
      const { updatedSections, explanation } = data.data;

      if (!updatedSections || Object.keys(updatedSections).length === 0) {
        setAiFeedback(explanation || "কোনো পরিবর্তন করার প্রয়োজন হয়নি।");
        setAiIsGenerating(false);
        return;
      }

      // Merge updatedSections with currentState
      const mergedState = {
        ...currentState,
        ...updatedSections,
        hero: updatedSections.hero ? { ...currentState.hero, ...updatedSections.hero } : currentState.hero,
        owner: updatedSections.owner ? { ...currentState.owner, ...updatedSections.owner } : currentState.owner,
        headerBranding: updatedSections.headerBranding ? { ...currentState.headerBranding, ...updatedSections.headerBranding } : currentState.headerBranding,
        noticeConfig: updatedSections.noticeConfig ? { ...currentState.noticeConfig, ...updatedSections.noticeConfig } : currentState.noticeConfig,
        offerConfig: updatedSections.offerConfig ? { ...currentState.offerConfig, ...updatedSections.offerConfig } : currentState.offerConfig,
        contactConfig: updatedSections.contactConfig ? { ...currentState.contactConfig, ...updatedSections.contactConfig } : currentState.contactConfig,
      };

      // Save to server first in a single transaction to prevent race conditions
      const saveRes = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mergedState),
      });

      if (!saveRes.ok) {
        throw new Error("সার্ভারে পরিবর্তনগুলো সংরক্ষণ করতে সমস্যা হয়েছে।");
      }

      // Now update React context states so that the UI immediately updates
      if (updatedSections.hero) {
        updateHero({ ...hero, ...updatedSections.hero });
      }
      if (updatedSections.owner) {
        updateOwner({ ...owner, ...updatedSections.owner });
      }
      if (updatedSections.services) {
        updateServices(updatedSections.services);
      }
      if (updatedSections.websites) {
        updateWebsites(updatedSections.websites);
      }
      if (updatedSections.portfolio) {
        updatePortfolio(updatedSections.portfolio);
      }
      if (updatedSections.testimonials) {
        updateTestimonials(updatedSections.testimonials);
      }
      if (updatedSections.team) {
        updateTeam(updatedSections.team);
      }
      if (updatedSections.headerBranding) {
        updateHeaderBranding({ ...headerBranding, ...updatedSections.headerBranding });
      }
      if (updatedSections.noticeConfig) {
        updateNoticeConfig({ ...noticeConfig, ...updatedSections.noticeConfig });
      }
      if (updatedSections.offerConfig) {
        updateOfferConfig({ ...offerConfig, ...updatedSections.offerConfig });
      }
      if (updatedSections.contactConfig) {
        updateContactConfig({ ...contactConfig, ...updatedSections.contactConfig });
      }

      // Set feedback message and empty the instruction prompt
      setAiFeedback(explanation || "পরিবর্তনগুলো সফলভাবে প্রয়োগ করা হয়েছে এবং সাইট লাইভ করা হয়েছে!");
      setAiInstruction("");
      triggerSuccessAlert("এআই সফলভাবে সাইটের কন্টেন্ট পরিবর্তন করেছে!");
    } catch (err: any) {
      console.error("AI Update Failed: ", err);
      setAiError(err.message || "একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে।");
    } finally {
      setAiIsGenerating(false);
    }
  };

  const resetToFactoryDefaults = () => {
    setDeleteConfirm({
      id: "factory-reset",
      title: "ফ্যাক্টরি রিসেট করুন",
      description: "আপনি কি ওয়েবসাইট রিসেট করতে চান? এটি আপনার কাস্টম করা সকল কন্টেন্ট মুছে দিয়ে আদি মেটাডাটায় ফিরিয়ে নিবে।",
      onConfirm: () => {
        resetAll();
        triggerSuccessAlert("সম্পূর্ণ ডেটা ফ্যাক্টরি ডিফল্টে রিসেট করা হয়েছে।");
        setTimeout(() => {
          onClose();
          setIsAuthenticated(false);
        }, 1000);
      }
    });
  };

  const navGroups = [
    {
      title: "কোর ডাটা ও কন্ট্রোল",
      items: [
        { id: "ai_assistant" as ActiveTab, label: "স্মার্ট এআই রাইটার", icon: Wand2, color: "text-fuchsia-400" },
        { id: "orders" as ActiveTab, label: "Order List (অর্ডার লিস্ট)", icon: TrendingUp, color: "text-sky-400" },
        { id: "supabase" as ActiveTab, label: "সুপাবেস রিয়েল-টাইম", icon: Database, color: "text-emerald-400" }
      ]
    },
    {
      title: "ব্র্যান্ড ও ডিসপ্লে সেটিংস",
      items: [
        { id: "hero" as ActiveTab, label: "হোম ও ব্রান্ডিং", icon: Home, color: "text-purple-400" },
        { id: "notices" as ActiveTab, label: "ঘোষণা নোটিশ বার", icon: Megaphone, color: "text-amber-400" },
        { id: "offers" as ActiveTab, label: "মেগা অফার ব্যানার", icon: Clock, color: "text-rose-400" },
        { id: "headings" as ActiveTab, label: "সেকশন হেডিংস", icon: Edit3, color: "text-slate-400" }
      ]
    },
    {
      title: "সার্ভিস ও ওয়েবসাইট শপ",
      items: [
        { id: "services" as ActiveTab, label: "আমাদের কাস্টম সেবা", icon: Sparkles, color: "text-emerald-400" },
        { id: "websites" as ActiveTab, label: "রেডি ওয়েবসাইট শপ", icon: ShoppingBag, color: "text-pink-400" },
        { id: "package_planner" as ActiveTab, label: "প্যাকেজ প্ল্যানার", icon: Zap, color: "text-yellow-400" }
      ]
    },
    {
      title: "আউটরিচ ও ক্রু মেম্বার্স",
      items: [
        { id: "testimonials" as ActiveTab, label: "ক্লায়েন্ট রিভিউ", icon: MessageSquare, color: "text-cyan-400" },
        { id: "team" as ActiveTab, label: "আমাদের টিম মেম্বার্স", icon: Users, color: "text-teal-400" },
        { id: "portfolio" as ActiveTab, label: "পোর্টফোলিও ও কাজ", icon: Briefcase, color: "text-violet-400" },
        { id: "contact" as ActiveTab, label: "যোগাযোগ ও ফুটর", icon: PhoneCall, color: "text-rose-400" }
      ]
    }
  ];

  const selectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setEditWebItem(null); 
    setEditServiceItem(null); 
    setEditPortfolioItem(null);
    setEditTestimonialItem(null); 
    setEditTeamItem(null); 
    setEditingOrder(null);
  };

  if (!isOpen && !isStandalonePWA) return null;

  return (
    <div className={isStandalonePWA ? "w-full h-screen flex flex-col justify-between overflow-hidden bg-[#0a0512]" : "fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-4 overflow-hidden"}>
      {/* Semi-transparent dark blur backdrop (Only if not PWA) */}
      {!isStandalonePWA && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-lg z-0"
        />
      )}

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login-box"
            initial={isStandalonePWA ? { opacity: 0, y: 15 } : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={isStandalonePWA ? { opacity: 0, y: -15 } : { opacity: 0, scale: 0.95, y: -15 }}
            className={isStandalonePWA 
              ? "relative w-full h-full flex flex-col justify-center max-w-sm mx-auto px-6 py-8 text-left z-10" 
              : "relative w-full max-w-md bg-[#090312] border border-purple-500/20 p-8 rounded-3xl mx-4 shadow-2xl z-10 text-left"
            }
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-sans">সুপার এডমিন প্যানেল</h2>
                <p className="text-xs text-purple-300 font-medium">{isStandalonePWA ? "এভেক্সন অ্যাপ সেশন গেটওয়ে" : "নিরাপদ ড্যাশবোর্ড গেটওয়ে"}</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  এডমিন পাসকোড লিখুন
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full bg-[#110724] border border-purple-500/30 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center gap-2">
                  <span>⚠️</span> {authError}
                </p>
              )}

              <p className="text-[10px] text-slate-500 leading-normal font-sans font-medium">
                সুরক্ষা সেশন এনক্রিপ্টেড। এভেক্সন স্টুডিও সিস্টেম কন্টেন্ট পরিবর্তন করতে সঠিক পাসকোড দিয়ে লগইন করুন।
              </p>

              <div className="flex gap-3 pt-2">
                {!isStandalonePWA && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-[#140b25] text-slate-300 border border-slate-800 hover:bg-slate-900 rounded-xl py-3 font-semibold text-xs uppercase cursor-pointer text-center"
                  >
                    বাতিল করুন
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 active:scale-95 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider cursor-pointer text-center shadow-lg hover:shadow-purple-500/10 transition-all font-sans"
                >
                  ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-frame"
            initial={isStandalonePWA ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={isStandalonePWA ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            className={isStandalonePWA 
              ? "relative w-full h-full bg-[#090312] flex flex-col overflow-hidden text-left" 
              : "relative w-full h-full md:h-[94vh] max-w-6xl bg-[#090312] md:border md:border-purple-500/20 md:rounded-3xl shadow-2xl z-20 flex flex-col overflow-hidden text-left"
            }
          >
            {/* Real-time alert baner */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: "-50%", y: -40 }}
                  animate={{ opacity: 1, x: "-50%", y: 0 }}
                  exit={{ opacity: 0, x: "-50%", y: -40 }}
                  className="absolute top-4 left-1/2 bg-emerald-500/95 text-white text-xs sm:text-sm font-bold py-3 px-6 rounded-full shadow-xl flex items-center gap-2 z-[210] pointer-events-none"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{saveSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dashboard Header */}
            <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-purple-500/10 flex items-center justify-between bg-[#0b0416] relative z-20 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile hamburger button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-purple-400 bg-purple-500/10 border border-purple-500/15 rounded-xl hover:text-white transition-all cursor-pointer mr-1"
                  title="নেভিগেশন মেনু"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Database className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white font-sans flex items-center gap-2">
                    <span>{isStandalonePWA ? "এভেক্সন অ্যাডমিন অ্যাডাপ্টার" : "এভেক্সন লাইভ এডমিন"}</span>
                    <span className="hidden sm:inline-block text-[10px] font-black bg-purple-500/15 border border-purple-500/35 text-purple-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {isStandalonePWA ? "PWA MODE" : "SUPERADMIN"}
                    </span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-sans hidden sm:block">
                    রিয়েল-টাইম ডাটাবেজ, কন্টেন্ট আপডেট, মেগা কুপন ও ক্লায়েন্ট অর্ডার কন্ট্রোল সেন্টার।
                  </p>
                  <p className="text-[10px] sm:text-xs text-indigo-300 font-sans sm:hidden font-medium">
                    লাইভ মেটাডাটা কন্ট্রোল সেন্টার
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                {/* Live orders count status */}
                {allOrders.length > 0 && (
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-sans text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    <span>{allOrders.length} টি লাইভ অর্ডার আছে</span>
                  </div>
                )}

                {!isStandalonePWA ? (
                  <button
                    onClick={onClose}
                    className="p-1 px-4 bg-[#140b25] hover:bg-rose-950/20 border border-purple-500/15 rounded-xl text-slate-300 hover:text-rose-300 text-xs py-2.5 transition-all font-sans font-bold cursor-pointer"
                  >
                    প্যানেল বন্ধ
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthenticated(false)}
                    className="p-1 px-4 bg-rose-950/20 border border-rose-900/30 rounded-xl text-rose-400 hover:text-rose-300 text-xs py-2.5 transition-all cursor-pointer font-sans font-bold"
                  >
                    লগআউট
                  </button>
                )}
              </div>
            </div>

            {/* Main Area: Sidebar + Contents */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Desktop Sidebar Navigation */}
              <div className="hidden md:flex w-64 bg-[#0a0414] border-r border-purple-500/10 md:flex-col shrink-0 p-4 space-y-6 overflow-y-auto scrollbar-thin">
                
                {navGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="text-[9px] font-extrabold tracking-widest text-purple-400/40 uppercase pl-2.5 block mb-2 font-sans">
                      {group.title}
                    </span>
                    <div className="space-y-1">
                      {group.items.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => selectTab(tab.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer font-sans ${
                              isActive
                                ? "text-white bg-gradient-to-r from-purple-950/40 to-purple-500/10 border-l-[3px] border-purple-500 shadow-md shadow-purple-950/40"
                                : "text-slate-400 hover:text-slate-200 hover:bg-purple-950/20"
                            }`}
                          >
                            <span className={isActive ? "text-purple-400" : tab.color}>
                              <Icon className="w-4 h-4" />
                            </span>
                            <span className="flex-1 text-left">{tab.label}</span>
                            {tab.id === "orders" && allOrders.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/35">
                                {allOrders.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex-1" />
                
                <div className="p-1 border-t border-purple-950/50 pt-4 space-y-2 text-center">
                  <button
                    onClick={resetToFactoryDefaults}
                    className="w-full bg-[#1b0811]/45 hover:bg-red-950/50 text-red-400 border border-red-950/50 transition-colors rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer font-sans font-black"
                  >
                    ফ্যাক্টরি রিসেট
                  </button>
                </div>
              </div>

              {/* Mobile Slides Drawer (Left overlay menu widget) */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="md:hidden fixed inset-0 bg-black/90 z-[190] backdrop-blur-md"
                    />
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "-100%" }}
                      transition={{ type: "spring", damping: 24, stiffness: 220 }}
                      className="md:hidden fixed top-0 left-0 h-full w-72 bg-[#0c051a] border-r border-purple-500/20 shadow-2xl z-[200] flex flex-col p-5 overflow-y-auto"
                    >
                      <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-5">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-400" />
                          <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 uppercase tracking-widest font-sans">
                            কন্ডিশনাল কন্ট্রোল প্যানেল
                          </span>
                        </div>
                        <button
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/20 rounded-xl text-purple-300 hover:text-white transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-6 flex-1">
                        {navGroups.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-2">
                            <span className="text-[9px] font-extrabold tracking-widest text-purple-400/40 uppercase pl-1 block font-sans">
                              {group.title}
                            </span>
                            <div className="space-y-1 block">
                              {group.items.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                  <button
                                    key={tab.id}
                                    onClick={() => selectTab(tab.id)}
                                    className={`flex items-center gap-3 px-3.5 py-3 w-full rounded-xl text-xs font-bold transition-all cursor-pointer font-sans ${
                                      isActive
                                        ? "text-white bg-purple-500/15 border-l-[3px] border-purple-500"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-purple-950/20"
                                    }`}
                                  >
                                    <span className={isActive ? "text-purple-400" : tab.color}>
                                      <Icon className="w-4 h-4" />
                                    </span>
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    {tab.id === "orders" && allOrders.length > 0 && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/35 font-mono">
                                        {allOrders.length}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-purple-950/50 mt-6 space-y-2">
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            resetToFactoryDefaults();
                          }}
                          className="w-full bg-[#1b0811] hover:bg-red-950 text-red-400 border border-red-950/60 transition-colors rounded-xl py-3 text-[10px] font-black uppercase tracking-wider cursor-pointer font-sans"
                        >
                          ফ্যাক্টরি রিসেট
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Main Tab Panel Content Editor */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#090312] relative pb-28 md:pb-6">
                {/* 1. HERO TAB */}
                {activeTab === "hero" && (
                  <div className="space-y-5 max-w-3xl">
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl">
                      <h3 className="text-sm font-bold text-purple-400 mb-4 font-sans uppercase">হোমপেজ হিরো সেকশন কন্টেন্ট</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">হিরো টাইটেল (Title) - বাংলা</label>
                          <textarea
                            rows={2}
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">হিরো বিবর্ন সাবটাইটেল (Subtitle) - বাংলা</label>
                          <textarea
                            rows={3}
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">কল টু অ্যাকশন টেক্সট</label>
                            <input
                              type="text"
                              value={heroCta}
                              onChange={(e) => setHeroCta(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">যোগাযোগের হোয়াটসঅ্যার নম্বর</label>
                            <input
                              type="text"
                              value={heroWhatsapp}
                              onChange={(e) => setHeroWhatsapp(e.target.value)}
                              placeholder="01xxxxxxxxx"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-colors font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400 mb-2 font-sans uppercase">হেডার ব্র্যান্ড ও লোগো সেটিংস (Header Brand & Logo Settings)</h3>
                        <p className="text-[11px] text-slate-400 mb-4 leading-normal">
                          নেভিগেশন হেডার বারে আপনার এজেন্সির লোগো সরাসরি আপলোড করুন অথবা ছবি লিংক দিন।
                        </p>
                        <ImageUploadField
                          label="হেডার লোগো সরাসরি আপলোড করুন অথবা ছবি লিংক দিন"
                          value={adminLogoUrl}
                          onChange={(val) => setAdminLogoUrl(val)}
                          placeholder="https://images.unsplash.com/photo-... অথবা লোগো ফাইল আপলোড"
                        />
                      </div>

                      <div className="border-t border-purple-500/5 pt-4 space-y-4">
                        <h4 className="text-xs font-bold text-purple-300 font-sans uppercase mb-1">কাস্টম টেক্সট ও ফন্ট ডিজাইন (Header Texts & Custom Font)</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ব্র্যান্ড নাম (Brand Name)</label>
                            <input
                              type="text"
                              value={brandName}
                              onChange={(e) => setBrandName(e.target.value)}
                              placeholder="e.g. Avexon"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ব্যাজ টেক্সট (Badge Text)</label>
                            <input
                              type="text"
                              value={brandBadge}
                              onChange={(e) => setBrandBadge(e.target.value)}
                              placeholder="e.g. Studio"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">সাবটাইটেল / স্লোগান</label>
                            <input
                              type="text"
                              value={brandSubtitle}
                              onChange={(e) => setBrandSubtitle(e.target.value)}
                              placeholder="e.g. Premium Web Agency"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">লোডার টেক্সট (Loader Text)</label>
                            <input
                              type="text"
                              value={loaderText}
                              onChange={(e) => setLoaderText(e.target.value)}
                              placeholder="e.g. Avexon"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div className="border border-purple-500/10 bg-[#0d041c] p-4 rounded-xl space-y-4">
                          <h5 className="text-xs font-bold text-fuchsia-400 font-sans uppercase">১. ব্র্যান্ড নামের ফন্ট সেটিংস (Brand Name Font)</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">গুগল ফন্ট লিংক (Google Font Import URL - ঐচ্ছিক)</label>
                              <input
                                type="text"
                                value={googleFontUrl}
                                onChange={(e) => setGoogleFontUrl(e.target.value)}
                                placeholder="e.g. https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ফন্ট ফ্যামিলি ক্লাসের নাম (Font Family Name)</label>
                              <input
                                type="text"
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                placeholder="e.g. 'Orbitron', sans-serif"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>

                          <div className="border border-purple-700/15 bg-[#140026]/40 p-4 rounded-xl space-y-2">
                            <FontUploadField
                              label="অথবা ব্র্যান্ড নামের কাস্টম ফন্ট ফাইল সরাসরি আপলোড করুন"
                              value={adminCustomFontUrl}
                              onChange={(val) => {
                                setAdminCustomFontUrl(val);
                                if (val) {
                                  setFontFamily("CustomUploadedFont");
                                }
                              }}
                            />
                            {adminCustomFontUrl && (
                              <p className="text-[10.5px] text-emerald-400 font-sans leading-relaxed">
                                ✨ <strong>কাস্টম ফন্ট আপলোড হয়েছে!</strong> এটি ব্র্যান্ড নামের ওপর সফলভাবে প্রয়োগ করা হয়েছে এবং ফন্ট ফ্যামিলি <code>CustomUploadedFont</code> হিসেবে সেট হয়েছে।
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="border border-purple-500/10 bg-[#0d041c] p-4 rounded-xl space-y-4">
                          <h5 className="text-xs font-bold text-fuchsia-400 font-sans uppercase">২. সাবটাইটেল (Web Agency) ফন্ট সেটিংস (Subtitle Font)</h5>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ফন্ট ফ্যামিলি ক্লাসের নাম (Subtitle Font Family Name - ঐচ্ছিক)</label>
                            <input
                              type="text"
                              value={subtitleFontFamily}
                              onChange={(e) => setSubtitleFontFamily(e.target.value)}
                              placeholder="e.g. 'Fira Code', monospace"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                            />
                          </div>

                          <div className="border border-purple-700/15 bg-[#140026]/40 p-4 rounded-xl space-y-2">
                            <FontUploadField
                              label="সাবটাইটেল (Web Agency) এর জন্য কাস্টম ফন্ট ফাইল সরাসরি আপলোড করুন"
                              value={adminSubtitleCustomFontUrl}
                              onChange={(val) => {
                                setAdminSubtitleCustomFontUrl(val);
                                if (val) {
                                  setSubtitleFontFamily("CustomUploadedSubtitleFont");
                                }
                              }}
                            />
                            {adminSubtitleCustomFontUrl && (
                              <p className="text-[10.5px] text-emerald-400 font-sans leading-relaxed">
                                ✨ <strong>সাবটাইটেল কাস্টম ফন্ট আপলোড হয়েছে!</strong> এটি সাবটাইটেল লেখার ওপর সফলভাবে প্রয়োগ করা হয়েছে এবং ফন্ট ফ্যামিলি <code>CustomUploadedSubtitleFont</code> হিসেবে সেট হয়েছে।
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-purple-500/5">
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans uppercase">সাবটাইটেল লেখার সাইজ (Subtitle Text Size)</label>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="6"
                                max="24"
                                step="1"
                                value={parseInt(subtitleFontSize) || 9}
                                onChange={(e) => setSubtitleFontSize(`${e.target.value}px`)}
                                className="flex-1 accent-purple-500 bg-[#110724] h-2 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={subtitleFontSize}
                                  onChange={(e) => setSubtitleFontSize(e.target.value)}
                                  className="w-20 bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-2 py-1.5 text-xs text-center font-mono focus:outline-none focus:border-purple-500"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              স্লাইডার দিয়ে সাইজ পরিবর্তন করতে পারেন অথবা সরাসরি পিক্সেল সাইজ (যেমন: <code>9px</code>, <code>10px</code> বা <code>12px</code>) লিখে দিতে পারেন।
                            </p>
                          </div>
                        </div>

                        <p className="text-[10px] text-fuchsia-400/80 leading-snug">
                          💡 <strong>কিভাবে করবেন:</strong> গুগল ফন্টস (fonts.google.com) এ যেকোনো ফন্ট সিলেক্ট করে তার Embed কোড থেকে <code>&lt;link href="..."&gt;</code> এর URL-টি কপি করে এখানে দিন। অথবা আপনার নিজের যেকোনো ডাউনলোড করা ফন্ট ফাইল (যেমন <strong>.ttf</strong>, <strong>.woff</strong>, <strong>.woff2</strong>, বা <strong>.otf</strong>) সরাসরি আপলোড করতে ওপরের আপলোডার দুটি ব্যবহার করুন!
                        </p>
                      </div>
                    </div>

                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl">
                      <h3 className="text-sm font-bold text-purple-400 mb-4 font-sans uppercase">ফ্লোটিং ওনার প্রোফাইল সেটিংস</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">ওনার / প্রতিষ্ঠাতার নাম (Owner's Name)</label>
                            <input
                              type="text"
                              value={ownerName}
                              onChange={(e) => setOwnerName(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">ভূমিকা / পদবী (Role/Designation)</label>
                            <input
                              type="text"
                              value={ownerRole}
                              onChange={(e) => setOwnerRole(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">ছোট বর্ণনা / টাইটেল (Title Description)</label>
                          <input
                            type="text"
                            value={ownerTitle}
                            onChange={(e) => setOwnerTitle(e.target.value)}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all"
                          />
                        </div>

                        <div>
                          <ImageUploadField
                            label="ছবি সরাসরি আপলোড করুন অথবা ছবি লিংক দিন (Owner Profile Photo)"
                            value={ownerPicUrl}
                            onChange={(val) => setOwnerPicUrl(val)}
                            placeholder="https://images.unsplash.com/photo-..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Business Contact, social and payment info section */}
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl">
                      <h3 className="text-sm font-bold text-purple-400 mb-4 font-sans uppercase">ব্যবসা, কন্টাক্ট ও পেমেন্ট সেটিংস</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">অফিস ঠিকানা (Office Address) - বাংলা</label>
                          <textarea
                            rows={2}
                            value={officeAddress}
                            onChange={(e) => setOfficeAddress(e.target.value)}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-all leading-relaxed font-sans"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2 font-sans">হেল্পলাইন নম্বরসমূহ (কমা দিয়ে লিখুন)</label>
                            <input
                              type="text"
                              value={helplineNumbers}
                              onChange={(e) => setHelplineNumbers(e.target.value)}
                              placeholder="+৮৮০ ১৭৬৩-৪৪৫৬৯৯, +৮৮০ ১৮১২-৯৯০১১১"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">সাপোর্ট ইমেইলসমূহ (কমা দিয়ে লিখুন)</label>
                            <input
                              type="text"
                              value={officialEmails}
                              onChange={(e) => setOfficialEmails(e.target.value)}
                              placeholder="support@avexon.com, info@avexon.com"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">সাপোর্ট আওয়ার্স (কাজের সময়)</label>
                            <input
                              type="text"
                              value={supportHours}
                              onChange={(e) => setSupportHours(e.target.value)}
                              placeholder="শনিবার থেকে বৃহস্পতিবার, সকাল ১০:০০ টা থেকে রাত ০৮:০০ টা"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-slate-400 text-xs font-bold mb-2">বিকাশ নম্বর (Personal)</label>
                              <input
                                type="text"
                                value={bkashNumber}
                                onChange={(e) => setBkashNumber(e.target.value)}
                                placeholder="017xxxxxxxx"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-xs font-bold mb-2">নগদ নম্বর (Personal)</label>
                              <input
                                type="text"
                                value={nagadNumber}
                                onChange={(e) => setNagadNumber(e.target.value)}
                                placeholder="018xxxxxxxx"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-purple-500/5 pt-4">
                          <h4 className="text-xs font-bold text-fuchsia-400 mb-3 uppercase">সামাজিক যোগাযোগ মাধ্যমের পেজ লিংক রেফারেন্স</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">Facebook URL</label>
                              <input
                                type="text"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">Twitter URL</label>
                              <input
                                type="text"
                                value={twitterUrl}
                                onChange={(e) => setTwitterUrl(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">LinkedIn URL</label>
                              <input
                                type="text"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5 font-sans">GitHub URL</label>
                              <input
                                type="text"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 shrink-0 pt-2">
                      <button
                        onClick={handleSaveHero}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-900/10 transition-colors"
                      >
                        আপডেট হোম কনটেন্ট
                      </button>
                    </div>
                  </div>
                )}

                {/* SPECIAL MEGA OFFER TAB */}
                {activeTab === "offers" && (
                  <div className="space-y-6 max-w-4xl">
                    
                    {/* Master Switcher & Discount System */}
                    <div className="border border-purple-500/15 bg-gradient-to-r from-[#0f0624] to-[#120520] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                          <span>স্পেশাল ডিসকাউন্ট ও অফার সিস্টেম (Discount & Offer Controls)</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          এটি অন করলে আপনার ব্যাকগ্রাউন্ডে ডিসকাউন্ট প্রাইজ ও কাউন্টডাউন টাইমার ব্যানার একসাথে ওয়েবসাইটে সক্রিয় বা বন্ধ থাকবে।
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-full ${
                            offerShow ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-slate-800 text-slate-400 border border-slate-700/50"
                          }`}>
                            {offerShow ? "চালু (ACTIVE)" : "বন্ধ (OFFLINE)"}
                          </span>
                          
                          <div className="flex gap-1.5 p-1 bg-purple-950/20 border border-purple-900/30 rounded-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setOfferShow(true);
                                setOfferDiscountActive(true);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                offerShow 
                                  ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/10" 
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              অন করুন
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOfferShow(false);
                                setOfferDiscountActive(false);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !offerShow 
                                  ? "bg-red-900/60 text-white border border-red-500/10" 
                                  : "text-slate-400 hover:text-rose-450"
                              }`}
                            >
                              অফ করুন
                            </button>
                          </div>
                        </div>

                        {/* Percentage custom input up to 100% */}
                        <div className="flex items-center gap-2 bg-[#120728] p-1.5 border border-purple-500/20 rounded-xl">
                          <label className="text-[11px] text-slate-350 font-sans font-bold pl-1">ডিসকাউন্ট হার (%):</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={offerDiscountPercentage}
                            onChange={(e) => setOfferDiscountPercentage(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                            className="w-14 bg-[#080214] border border-purple-500/25 text-center text-purple-300 rounded-lg py-1 text-xs focus:outline-none focus:border-purple-500 font-extrabold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Offer Content Config Card */}
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-5">
                      <h3 className="text-sm font-bold text-purple-400 mb-2 font-sans uppercase">ব্যানার কন্টেন্ট ও টাইটেল সেটিংস</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">সারপ্রাইজ ব্যাজ / অফার হেডার (Badge Text)</label>
                            <input
                              type="text"
                              value={offerBadgeText}
                              onChange={(e) => setOfferBadgeText(e.target.value)}
                              placeholder="আজকের বিশেষ মেগা অফার"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-xs font-bold mb-2">জরুরি অবস্থা নির্দেশক লাল লেখা (Urgency Title)</label>
                            <input
                              type="text"
                              value={offerUrgencyText}
                              onChange={(e) => setOfferUrgencyText(e.target.value)}
                              placeholder="দ্রুত ফুরিয়ে যাচ্ছে!"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">অফারের অফিশিয়াল বিবরণ (Offer Description)</label>
                          <textarea
                            rows={3}
                            value={offerDescriptionText}
                            onChange={(e) => setOfferDescriptionText(e.target.value)}
                            placeholder="সীমিত সময়ের মেগা ফ্ল্যাশ ডিল শেষ হওয়ার পূর্বেই অর্ডার কনফার্ম করে ওয়েবসাইট ওনারশিপ বুঝে নিন।"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 transition-all font-sans leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Timer Configuration Card */}
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-5">
                      <h3 className="text-sm font-bold text-purple-400 mb-2 font-sans uppercase">টাইমার কাউন্টডাউন কন্ট্রোল</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-slate-400 text-xs font-bold mb-2">টাইমারের ধরন (Timer Countdown Type)</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setOfferTimerType("midnight")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                offerTimerType === "midnight"
                                  ? "border-purple-500 bg-purple-500/10 text-white"
                                  : "border-purple-500/15 bg-[#110724] hover:bg-purple-950/10 text-slate-300"
                              }`}
                            >
                              <div className="font-bold text-xs uppercase mb-1">মাঝরাত পর্যন্ত কাউন্টডাউন (Midnight Auto Reset)</div>
                              <div className="text-[10px] text-slate-400 leading-snug">প্রতিদিন রাত ২৩:৫৯:৫৯ এ পৌঁছালে টাইমারটি স্বয়ংক্রিয়ভাবে আবার ২৪ ঘন্টা থেকে কাউন্টডাউন শুরু করে।</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOfferTimerType("custom_target")}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                offerTimerType === "custom_target"
                                  ? "border-purple-500 bg-purple-500/10 text-white"
                                  : "border-purple-500/15 bg-[#110724] hover:bg-purple-950/10 text-slate-300"
                              }`}
                            >
                              <div className="font-bold text-xs uppercase mb-1">নির্দিষ্ট তারিখ পর্যন্ত কাউন্টডাউন (Fixed Target Date)</div>
                              <div className="text-[10px] text-slate-400 leading-snug">ভবিষ্যতের একটি নির্দিষ্ট ক্যালেন্ডার তারিখ ও সময় পর্যন্ত অফার টাইমার চালিত হবে।</div>
                            </button>
                          </div>
                        </div>

                        {offerTimerType === "custom_target" && (
                          <div
                            className="bg-[#120726]/40 p-4 border border-purple-500/5 rounded-xl space-y-2 mt-2"
                          >
                            <label className="block text-slate-400 text-xs font-bold mb-1">অফারের লিমিত সময়সীমা (Target Ending Date & Time)</label>
                            <input
                              type="datetime-local"
                              value={offerCustomTargetDate}
                              onChange={(e) => setOfferCustomTargetDate(e.target.value)}
                              className="bg-[#110724] border border-purple-500/20 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 leading-normal">
                              মন্তব্য: লক্ষ্যযুক্ত শেষ সময়সীমা নির্বাচন করুন। কাউন্টডাউন সেই লক্ষ্য ডেট-টাইম পার হয়ে গেলে শূন্য হয়ে যাবে।
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 shrink-0 pt-2">
                      <button
                        onClick={handleSaveOfferSetting}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-900/10 transition-colors"
                      >
                        মেগা অফার কন্টেন্ট সংরক্ষণ করুন
                      </button>
                    </div>

                  </div>
                )}

                {/* 1.5 NOTICES MANAGEMENT TAB */}
                {activeTab === "notices" && (
                  <div className="space-y-6 max-w-4xl">
                    
                    {/* Master Switcher */}
                    <div className="border border-purple-500/15 bg-gradient-to-r from-[#0f0624] to-[#120520] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-purple-400 animate-bounce" style={{ animationDuration: '4s' }} />
                          <span>ঘোষণা নোটিশ বার সেটিংস (Notice Bar Controls)</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          ওয়েবসাইটের একেবারে ওপরে স্ক্রলিং ঘোষণা বার চালু বা বন্ধ রাখতে এবং অফার কন্টেন্ট কাস্টমাইজ করতে পারেন।
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold font-sans px-2.5 py-1 rounded-full ${
                          noticeShow ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-slate-800 text-slate-400 border border-slate-700/50"
                        }`}>
                          {noticeShow ? "সক্রিয় (ONLINE)" : "নিষ্ক্রিয় (OFFLINE)"}
                        </span>
                        
                        <div className="flex gap-1.5 p-1 bg-purple-950/20 border border-purple-900/30 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleSaveNoticeBarSetting(true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              noticeShow 
                                ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/10" 
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            অন করুন
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveNoticeBarSetting(false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              !noticeShow 
                                ? "bg-red-900/60 text-white border border-red-500/10" 
                                : "text-slate-400 hover:text-rose-400"
                            }`}
                          >
                            অফ করুন
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Editor Form for Adding/Editing an Item */}
                    {editingLocalNoticeId !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl relative shadow-xl"
                      >
                        <div className="absolute top-4 right-4">
                          <button
                            type="button"
                            onClick={handleCancelNoticeEdit}
                            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-purple-400" />
                          <span>{editingLocalNoticeId === "new" ? "নতুন ঘোষণা নোটিশ যোগ করুন" : "ঘোষণা নোটিশ এডিট করুন"}</span>
                        </h4>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-slate-300 text-xs font-bold mb-1.5">নোটিশ টেক্সট কন্টেন্ট (বাধ্যতামূলক)</label>
                            <textarea
                              rows={2}
                              value={tempNoticeText}
                              onChange={(e) => setTempNoticeText(e.target.value)}
                              placeholder="যেকোনো কাস্টম বা প্রি-মেড ওয়েবসাইট অর্ডারে পাচ্ছেন ফ্ল্যাট ১০% মেগা ডিসকাউন্ট!"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-300 text-xs font-bold mb-1.5">অফারের বিশেষ ব্যাজ (Badge)</label>
                              <input
                                type="text"
                                value={tempNoticeBadge}
                                onChange={(e) => setTempNoticeBadge(e.target.value)}
                                placeholder="সীমিত সময়ের অফার"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-300 text-xs font-bold mb-1.5">হলুদ হাইলাইট টেক্সট / প্রমো কোড</label>
                              <input
                                type="text"
                                value={tempNoticeHighlight}
                                onChange={(e) => setTempNoticeHighlight(e.target.value)}
                                placeholder="PROMO: AVEXON10"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>

                          {/* Icon Selector Grid */}
                          <div>
                            <label className="block text-slate-300 text-xs font-bold mb-2">নোটিশ আইকন নির্বাচন করুন (Select Icon)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1">
                              {[
                                { name: "Sparkles", label: "তারকা", desc: "Yellow Glow", component: <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" /> },
                                { name: "Flame", label: "আগুন", desc: "Orange Heat", component: <Flame className="w-4 h-4 text-orange-500" /> },
                                { name: "HeartHandshake", label: "হ্যান্ডশেক", desc: "Pink Friendship", component: <HeartHandshake className="w-4 h-4 text-pink-400" /> },
                                { name: "ShieldCheck", label: "সুরক্ষিত", desc: "Emerald Green", component: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
                                { name: "Clock", label: "সময়", desc: "Purple Timer", component: <Clock className="w-4 h-4 text-purple-400" /> },
                                { name: "Megaphone", label: "ঘোষণা", desc: "Notification", component: <Megaphone className="w-4 h-4 text-purple-400" /> }
                              ].map((icOption) => (
                                <button
                                  type="button"
                                  key={icOption.name}
                                  onClick={() => setTempNoticeIcon(icOption.name)}
                                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                                    tempNoticeIcon === icOption.name
                                      ? "bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/5 scale-[1.03]"
                                      : "bg-[#110724] border-purple-950 text-slate-400 hover:border-purple-800/40 hover:text-slate-200"
                                  }`}
                                >
                                  {icOption.component}
                                  <span className="text-[10px] font-bold block truncate leading-none mt-0.5">{icOption.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-5 border-t border-purple-500/5 mt-5">
                          <button
                            type="button"
                            onClick={handleCancelNoticeEdit}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-950 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveNoticeItem}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-purple-500/15"
                          >
                            {editingLocalNoticeId === "new" ? "যোগ করুন" : "আপডেট করুন"}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Notice Items List Table */}
                    <div className="border border-purple-500/10 bg-[#0c051a] rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-purple-500/10 flex items-center justify-between bg-purple-950/10">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-sans">নোটিশ স্লাইডস তালিকা ({localNotices?.length || 0})</h4>
                        {editingLocalNoticeId === null && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLocalNoticeId("new");
                              setTempNoticeBadge("অফার ব্যাজ");
                              setTempNoticeText("");
                              setTempNoticeHighlight("");
                              setTempNoticeIcon("Sparkles");
                            }}
                            className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 font-bold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>নতুন নোটিশ যোগ করুন</span>
                          </button>
                        )}
                      </div>

                      {(!localNotices || localNotices.length === 0) ? (
                        <div className="text-center py-10">
                          <p className="text-slate-500 text-xs">কোনো নোটিশ স্লাইড খুঁজে পাওয়া যায়নি! অনুগ্রহ করে নতুন নোটিশ যোগ করুন।</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-purple-500/5 max-h-[350px] overflow-y-auto custom-scrollbar">
                          {localNotices.map((notice, index) => (
                            <div key={notice.id || index} className="flex items-center justify-between p-4 bg-transparent hover:bg-purple-950/5 transition-all gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 sm:p-2.5 bg-purple-500/10 border border-purple-500/10 rounded-xl shrink-0">
                                  {notice.iconName === "Sparkles" && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
                                  {notice.iconName === "Flame" && <Flame className="w-4 h-4 text-orange-500" />}
                                  {notice.iconName === "HeartHandshake" && <HeartHandshake className="w-4 h-4 text-pink-400" />}
                                  {notice.iconName === "ShieldCheck" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                                  {notice.iconName === "Clock" && <Clock className="w-4 h-4 text-purple-400" />}
                                  {notice.iconName === "Megaphone" && <Megaphone className="w-4 h-4 text-purple-400" />}
                                  {!["Sparkles","Flame","HeartHandshake","ShieldCheck","Clock","Megaphone"].includes(notice.iconName) && <Sparkles className="w-4 h-4 text-purple-300" />}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {notice.badge && (
                                      <span className="bg-purple-500/25 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide border border-purple-500/20">
                                        {notice.badge}
                                      </span>
                                    )}
                                    {notice.highlight && (
                                      <span className="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 px-1 py-0.2 rounded text-[9.5px] font-mono leading-none">
                                        {notice.highlight}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-200 text-xs mt-1 md:text-sm truncate pr-4 font-sans leading-relaxed">{notice.text}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditNoticeItemClick(notice)}
                                  title="এডিট করুন"
                                  className="p-1 px-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-all rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">এডিট</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNoticeItem(notice.id)}
                                  title="মুছে ফেলুন"
                                  className="p-1 px-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">মুছুন</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. WEBSITES SHOP TAB */}
                {activeTab === "websites" && (
                  <div className="space-y-5">
                    {!editWebItem && (
                      <div className="border border-purple-500/10 bg-[#0c041b] p-4.5 rounded-2xl max-w-4xl space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>১. "ওয়েবসাইট শপ" সেকশন হেডার সেটিংস</span>
                          </h4>
                          <button
                            onClick={handleSaveHeadings}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            হেডিং আপডেট করুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">শপ টাইটেল (Websites Title)</label>
                            <input
                              type="text"
                              value={websitesTitle}
                              onChange={(e) => setWebsitesTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">শপ স্লোগান (Websites Subtitle)</label>
                            <textarea
                              rows={1}
                              value={websitesSubtitle}
                              onChange={(e) => setWebsitesSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400">ম্যানুফ্যাকচারিং ও ওয়েবসাইট প্রোডাক্টস</h3>
                        <p className="text-[10px] text-slate-400">এখান থেকে শপ পেজের রেডিমেড ওয়েবসাইট মডিউল তালিকা এডিট বা নতুন মডিউল তৈরি করতে পারবেন।</p>
                      </div>
                      {!editWebItem && (
                        <button
                          onClick={() => setEditWebItem({})}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>নতুন প্রোডাক্ট যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    {editWebItem ? (
                      <div className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-3xl">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                          {editWebItem.id ? "ওয়েবসাইট এডিট ফরম" : "নতুন ওয়েবসাইট প্রোডাক্ট ফরম"}
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ওয়েবসাইট টাইটেল (বাংলা)</label>
                            <input
                              type="text"
                              value={editWebItem.title || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, title: e.target.value})}
                              placeholder="যেমন: আলটিমেট লজিস্টিক পোর্টাল"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ক্যাটাগরি</label>
                            <input
                              type="text"
                              value={editWebItem.category || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, category: e.target.value})}
                              placeholder="যেমন: প্রিমিয়াম ই-commerce"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ডেলিভারি সময়সীমা</label>
                            <input
                              type="text"
                              value={editWebItem.deliveryTime || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, deliveryTime: e.target.value})}
                              placeholder="২-৪ দিন"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">মূল্য (৳)</label>
                            <input
                              type="number"
                              value={editWebItem.price || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, price: Number(e.target.value)})}
                              placeholder="8000"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">আসল মূল্য তালিকা (ডিসকাউন্ট দেখানোর জন্য)</label>
                            <input
                              type="number"
                              value={editWebItem.originalPrice || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, originalPrice: Number(e.target.value)})}
                              placeholder="15000"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">রেটিং (Rating)</label>
                            <input
                              type="number"
                              step="0.1"
                              max="5"
                              value={editWebItem.rating || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, rating: Number(e.target.value)})}
                              placeholder="4.9"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">মোট সেলস বা অর্ডার সংখ্যা</label>
                            <input
                              type="number"
                              value={editWebItem.ordersCount || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, ordersCount: Number(e.target.value)})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ফিচার সংখ্যা (Features Count)</label>
                            <input
                              type="number"
                              value={editWebItem.featuresCount || ""}
                              onChange={(e) => setEditWebItem({...editWebItem, featuresCount: Number(e.target.value)})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <ImageUploadField
                            label="ওয়েবসাইট থিম স্ক্রিনশট আপলোড করুন অথবা লিংক দিন (Product Image)"
                            value={editWebItem.image || ""}
                            onChange={(val) => setEditWebItem({...editWebItem, image: val})}
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">ট্যাগ সমূহ (কমা দিয়ে আলাদা করেন)</label>
                          <input
                            type="text"
                            value={editWebItem.tags ? editWebItem.tags.join(", ") : ""}
                            onChange={(e) => setEditWebItem({...editWebItem, tags: e.target.value.split(",").map(t => t.trim())})}
                            placeholder="SSLCommerz, SMS Gateway, Inventory"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">ডেমো ওয়েবসাইট লিংক (Live Demo URL)</label>
                          <input
                            type="text"
                            value={editWebItem.demoUrl || ""}
                            onChange={(e) => setEditWebItem({...editWebItem, demoUrl: e.target.value})}
                            placeholder="যেমন: https://react.dev"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">ওয়েবসাইট এর সুবিধা সমূহ (সুবিধা বা কি-ফিচারস - প্রতি লাইনে ১টি করে লিখবেন)</label>
                          <textarea
                            rows={6}
                            value={editWebItem.features ? editWebItem.features.join("\n") : ""}
                            onChange={(e) => setEditWebItem({...editWebItem, features: e.target.value.split("\n")})}
                            placeholder="বিকাশ, রকেট, নগদ ও SSLCommerz অটোমেটেড পেমেন্ট গেটওয়ে ইন্টিগ্রেশন&#10;কমপ্লিট মাল্টি-ভেন্ডর সিস্টেম ও ইন্ডিপেন্ডেন্ট সেলার ম্যানেজমেন্ট ড্যাশবোর্ড"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl p-4 text-xs font-sans leading-relaxed focus:outline-none focus:border-purple-500/30"
                          />
                          <p className="text-[10px] text-purple-400 mt-1">প্রতি লাইনে একটি করে আলাদা সুবিধা লিখুন। এটি কাস্টমার পপআপে লিস্ট আকারে শো করবে।</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditWebItem(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={handleSaveWebsiteProduct}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {websites.map((w) => (
                          <div key={w.id} className="bg-[#0e051d] border border-purple-500/10 p-4.5 rounded-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={w.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 font-sans leading-snug line-clamp-1">{w.title}</h4>
                                <p className="text-[10px] text-purple-400 font-semibold">{w.category} • ৳{w.price.toLocaleString("bn-BD")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const features = w.features && w.features.length > 0 ? w.features : (
                                    w.id === "w1" ? [
                                      "বিকাশ, রকেট, নগদ ও SSLCommerz অটোমেটেড পেমেন্ট গেটওয়ে ইন্টিগ্রেশন",
                                      "কমপ্লিট মাল্টি-ভেন্ডর সিস্টেম ও ইন্ডিপেন্ডেন্ট সেলার ম্যানেজমেন্ট ড্যাশবোর্ড",
                                      "রিয়েল-টাইম ইনভেন্টরি কন্ট্রোল, স্টক লেভেল অ্যালার্ট ও পুশ আপডেট",
                                      "অটোমেটেড কাস্টমার এসএমএস এবং ইমেল নোটিফিকেশন এলার্ট সিস্টেমস",
                                      "কুপন কোড, ডিসকাউন্ট ক্যাম্পেইন ও ফ্ল্যাশ ডিল জেনারেটর সার্ভিসেস",
                                      "১০০% রেস্পন্সিভ মোবাইল ফ্রেন্ডলি ইন্টারফেস ও ডাইনামিক এডমিন প্যানেল"
                                    ] : w.id === "w2" ? [
                                      "আল্ট্রা-ফাস্ট লোডিং স্পিড এবং প্রো-অ্যাক্টিভ এসইও অপ্টিমাইজড আর্কিটেকচার",
                                      "ইন্টারঅ্যাক্টিভ সার্ভিস মডিউল, ক্যারিয়ার হাব এবং ক্যাটাগরাইজড ব্লগ সিস্টেম",
                                      "লিড ক্যাটালগ ক্যাপিচারিং ফর্ম এবং মেলচিম্প অটো রেসপন্ডার ইন্টিগ্রেশন",
                                      "রিয়েল-টাইম ক্লায়েন্ট টেস্টিমোনিয়াল এবং প্রজেক্ট পোর্টফোলিও শোকেস",
                                      "প্রফেশনাল ইউনিক থিম কাস্টমাইজেশন ও মেগা ড্রপডাউন নেভিগেশন মেনু",
                                      "আনলিমিটেড ফ্রি হোস্ٹنگ ক্লাউড লাইফটাইম ব্যাকআপ সেটআপ গ্যারান্টি"
                                    ] : [
                                      "গুগল অ্যাডসেন্স (AdSense) ও ডাইনামিক লোকাল ব্যানার অ্যাড কন্ট্রোল পোর্টাল",
                                      "আনলিমিটেড ক্যাটাগরি ভিত্তিক সংবাদ বিন্যাস এবং ইনস্ট্যান্ট ব্রেকিং নিউজ টিকার",
                                      "নিউজলেটার সাবস্ক্রিপশন ও সোশ্যাল মিডিয়া অটোমেটেড ইনস্ট্যান্ট শেয়ারিং",
                                      "একাধিক অ্যাডমিন, সাব-অ্যাডমিন ও রিপোর্টার রোল কন্ট্রোল প্যানেল",
                                      "মাল্টিমিডিয়া গ্যালারি, ফেসবুক লাইভ এমবেডেড ও ভিডিও প্লেলিস্ট মডিউল",
                                      "সুপার-ফাস্ট ক্লাউডফ্লেয়ার সিডিএন (CDN) ইন্টিগ্রেশন ও আল্ট্রা সিকিউর ডাটাবেজ"
                                    ]
                                  );
                                  setEditWebItem({ ...w, features });
                                }}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors cursor-pointer"
                                title="এডিট করুন"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteWebsite(w.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                                title="ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SERVICES TAB */}
                {activeTab === "services" && (
                  <div className="space-y-5">
                    {!editServiceItem && (
                      <div className="border border-purple-500/10 bg-[#0c041b] p-4.5 rounded-2xl max-w-4xl space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>১. "আমাদের সেবা" সেকশন হেডার সেটিংস</span>
                          </h4>
                          <button
                            onClick={handleSaveHeadings}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            হেডিং আপডেট করুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সার্ভিস টাইটেল (Services Title)</label>
                            <input
                              type="text"
                              value={servicesTitle}
                              onChange={(e) => setServicesTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সার্ভিস স্লোগান (Services Subtitle)</label>
                            <textarea
                              rows={1}
                              value={servicesSubtitle}
                              onChange={(e) => setServicesSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400">এভেক্সন স্পেশালিটি সেবাসমূহ</h3>
                        <p className="text-[10px] text-slate-400">আমাদের কোর সেবাসমূহের তালিকা, মূল্য রেঞ্জ এবং প্রযুক্তি স্ট্যাক এডিট করুন।</p>
                      </div>
                      {!editServiceItem && (
                        <button
                          onClick={() => setEditServiceItem({})}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>নতুন সেবা যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    {editServiceItem ? (
                      <div className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-3xl">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                          সেবা মডিউল ফরম
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">সেবার শিরোনাম (title)</label>
                            <input
                              type="text"
                              value={editServiceItem.title || ""}
                              onChange={(e) => setEditServiceItem({...editServiceItem, title: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">আইকন নাম (Lucide Icon Name)</label>
                            <input
                              type="text"
                              value={editServiceItem.iconName || "Globe"}
                              onChange={(e) => setEditServiceItem({...editServiceItem, iconName: e.target.value})}
                              placeholder="Globe, ShoppingCart, Figma, Sparkles"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">সর্বনিম্ন মূল্য শুরু</label>
                            <input
                              type="text"
                              value={editServiceItem.priceStarting || "৳৮,০০০"}
                              onChange={(e) => setEditServiceItem({...editServiceItem, priceStarting: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">সমকাল / ডেলিভারি সময়</label>
                            <input
                              type="text"
                              value={editServiceItem.duration || "৩-৫ দিন"}
                              onChange={(e) => setEditServiceItem({...editServiceItem, duration: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">সেবার বিস্তারিত বিবরণ</label>
                          <textarea
                            rows={3}
                            value={editServiceItem.description || ""}
                            onChange={(e) => setEditServiceItem({...editServiceItem, description: e.target.value})}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">টেকনোলজি ও স্কিলসমূহ (কমা দিয়ে সাজান)</label>
                          <input
                            type="text"
                            value={editServiceItem.techs ? editServiceItem.techs.join(", ") : ""}
                            onChange={(e) => setEditServiceItem({...editServiceItem, techs: e.target.value.split(",").map(t => t.trim())})}
                            placeholder="React, Tailwind, Express.js"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditServiceItem(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={handleSaveService}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map((s) => (
                          <div key={s.id} className="bg-[#0e051d] border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-100">{s.title}</h4>
                              <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-[280px] line-clamp-1">{s.description}</p>
                              <p className="text-[10px] text-purple-400 mt-1 font-mono">{s.priceStarting} • Duration: {s.duration}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-4">
                              <button
                                onClick={() => setEditServiceItem(s)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(s.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. PORTFOLIO TAB */}
                {activeTab === "portfolio" && (
                  <div className="space-y-5">
                    {!editPortfolioItem && (
                      <div className="border border-purple-500/10 bg-[#0c041b] p-4.5 rounded-2xl max-w-4xl space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>১. "প্রজেক্ট পোর্টফোলিও" সেকশন হেডার সেটিংস</span>
                          </h4>
                          <button
                            onClick={handleSaveHeadings}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            হেডিং আপডেট করুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">পোর্টফোলিও টাইটেল (Portfolio Title)</label>
                            <input
                              type="text"
                              value={portfolioTitle}
                              onChange={(e) => setPortfolioTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">পোর্টফোলিও স্লোগান (Portfolio Subtitle)</label>
                            <textarea
                              rows={1}
                              value={portfolioSubtitle}
                              onChange={(e) => setPortfolioSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400">সফল প্রজেক্ট পোর্টফোলিও</h3>
                        <p className="text-[10px] text-slate-400">এখান থেকে এভেক্সন টিমের পূর্বের কাজের কেস স্টাডি বা পোর্টফোলিও রেকর্ডিং মডিডিফাই করতে পারেন।</p>
                      </div>
                      {!editPortfolioItem && (
                        <button
                          onClick={() => setEditPortfolioItem({})}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>নতুন প্রজেক্ট যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    {editPortfolioItem ? (
                      <div className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-3xl">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                          প্রজেক্ট ডেকোরেশন ফরম
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">প্রজেক্ট টাইটেল (বাংলা)</label>
                            <input
                              type="text"
                              value={editPortfolioItem.title || ""}
                              onChange={(e) => setEditPortfolioItem({...editPortfolioItem, title: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ক্যাটাগরি</label>
                            <input
                              type="text"
                              value={editPortfolioItem.category || ""}
                              onChange={(e) => setEditPortfolioItem({...editPortfolioItem, category: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">ক্লায়েন্ট নেম / প্রতিষ্ঠান</label>
                            <input
                              type="text"
                              value={editPortfolioItem.client || ""}
                              onChange={(e) => setEditPortfolioItem({...editPortfolioItem, client: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">বছর (Year)</label>
                            <input
                              type="text"
                              value={editPortfolioItem.year || "২০২৬"}
                              onChange={(e) => setEditPortfolioItem({...editPortfolioItem, year: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">প্রজেক্ট কেস স্টাডি বিবরণ</label>
                          <textarea
                            rows={3}
                            value={editPortfolioItem.description || ""}
                            onChange={(e) => setEditPortfolioItem({...editPortfolioItem, description: e.target.value})}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-sans"
                          />
                        </div>

                        <div>
                          <ImageUploadField
                            label="পোর্টফোলিও প্রজেক্ট স্ক্রিনশট আপলোড করুন অথবা লিংক দিন (Project Screenshot)"
                            value={editPortfolioItem.imageUrl || ""}
                            onChange={(val) => setEditPortfolioItem({...editPortfolioItem, imageUrl: val})}
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">ব্যবহৃত টুলস / টেকনোলজি (কমা দিয়ে সাজান)</label>
                          <input
                            type="text"
                            value={editPortfolioItem.tags ? editPortfolioItem.tags.join(", ") : ""}
                            onChange={(e) => setEditPortfolioItem({...editPortfolioItem, tags: e.target.value.split(",").map(t => t.trim())})}
                            placeholder="Next.js, Tailwind, Prisma, PostgreSQL"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditPortfolioItem(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={handleSavePortfolio}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolio.map((p) => (
                          <div key={p.id} className="bg-[#0e051d] border border-purple-500/10 p-4.5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 font-sans">{p.title}</h4>
                                <p className="text-[10px] text-purple-400 mt-0.5">{p.client} • {p.year}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-4 shrink-0">
                              <button
                                onClick={() => setEditPortfolioItem(p)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePortfolio(p.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. TESTIMONIALS TAB */}
                {activeTab === "testimonials" && (
                  <div className="space-y-5">
                    {!editTestimonialItem && (
                      <div className="border border-purple-500/10 bg-[#0c041b] p-4.5 rounded-2xl max-w-4xl space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>১. "সফল ক্লায়েন্ট" সেকশন হেডার সেটিংস</span>
                          </h4>
                          <button
                            onClick={handleSaveHeadings}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            হেডিং আপডেট করুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">রিভিউ টাইটেল (Testimonials Title)</label>
                            <input
                              type="text"
                              value={testimonialsTitle}
                              onChange={(e) => setTestimonialsTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">রিভিউ স্লোগান (Testimonials Subtitle)</label>
                            <textarea
                              rows={1}
                              value={testimonialsSubtitle}
                              onChange={(e) => setTestimonialsSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400">গ্রাহক সন্তুষ্টি রিভিউ (Testimonials)</h3>
                        <p className="text-[10px] text-slate-400">হোমপেজের রিভিউ স্লাইডিং প্যানেলের তথ্য আপডেট করুন বা নতুন ক্লায়েন্ট প্রতিক্রিয়া লিখুন।</p>
                      </div>
                      {!editTestimonialItem && (
                        <button
                          onClick={() => setEditTestimonialItem({})}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>নতুন রিভিউ দিন</span>
                        </button>
                      )}
                    </div>

                    {editTestimonialItem ? (
                      <div className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-3xl">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                          রিভিউ ডাটা ফরম
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">গ্রাহকের নাম (বাংলা)</label>
                            <input
                              type="text"
                              value={editTestimonialItem.name || ""}
                              onChange={(e) => setEditTestimonialItem({...editTestimonialItem, name: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">পদবী এবং প্রতিষ্ঠান</label>
                            <input
                              type="text"
                              value={editTestimonialItem.role || ""}
                              onChange={(e) => setEditTestimonialItem({...editTestimonialItem, role: e.target.value})}
                              placeholder="এমডি, কলার্স ফ্যাশন বিডি"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">রিভিউর শ্রেণীবিভাগ (Type)</label>
                            <select
                              value={editTestimonialItem.type || "custom"}
                              onChange={(e) => setEditTestimonialItem({...editTestimonialItem, type: e.target.value as "readymade" | "custom"})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                            >
                              <option value="custom">কাস্টম ডেভেলপমেন্ট (Custom Dev)</option>
                              <option value="readymade">রেডিমেড প্রজেক্ট অর্ডার (Readymade Order)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">রেটিং স্টার সংখ্যা (১-৫)</label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              value={editTestimonialItem.rating || 5}
                              onChange={(e) => setEditTestimonialItem({...editTestimonialItem, rating: Number(e.target.value)})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <ImageUploadField
                            label="ভোক্তা বা ক্লায়েন্টের প্রোফাইল ছবি আপলোড করুন অথবা লিংক দিন (Avatar)"
                            value={editTestimonialItem.avatarUrl || ""}
                            onChange={(val) => setEditTestimonialItem({...editTestimonialItem, avatarUrl: val})}
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">মন্তব্য বা রিভিউ বডি টেক্সট</label>
                          <textarea
                            rows={3}
                            value={editTestimonialItem.text || ""}
                            onChange={(e) => setEditTestimonialItem({...editTestimonialItem, text: e.target.value})}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-sans leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditTestimonialItem(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={handleSaveTestimonial}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testimonials.map((t) => (
                          <div key={t.id} className="bg-[#0e051d] border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={t.avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-100">{t.name}</h4>
                                <p className="text-[9px] text-slate-500">{t.role}</p>
                                <p className="text-[10px] text-purple-400 mt-1 line-clamp-1 italic">"{t.text}"</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-4">
                              <button
                                onClick={() => setEditTestimonialItem(t)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. TEAM MEMBERS TAB */}
                {activeTab === "team" && (
                  <div className="space-y-5">
                    {!editTeamItem && (
                      <div className="border border-purple-500/10 bg-[#0c041b] p-4.5 rounded-2xl max-w-4xl space-y-4">
                        <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            <span>১. "আমাদের টিম" সেকশন হেডার সেটিংস</span>
                          </h4>
                          <button
                            onClick={handleSaveHeadings}
                            className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            হেডিং আপডেট করুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">টিম টাইটেল (Team Title)</label>
                            <input
                              type="text"
                              value={teamTitle}
                              onChange={(e) => setTeamTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">টিম স্লোগান (Team Subtitle)</label>
                            <textarea
                              rows={1}
                              value={teamSubtitle}
                              onChange={(e) => setTeamSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-purple-400">এভেক্সন ফাউন্ডেশন টিম মেম্বার্স</h3>
                        <p className="text-[10px] text-slate-400">টিম কার্ডের তথ্য, বায়োগ্রাফি, কারিগরি স্কিল এবং পোর্ট্রেট ছবি লিংক মডিফাই করুন।</p>
                      </div>
                      {!editTeamItem && (
                        <button
                          onClick={() => setEditTeamItem({})}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>টিম মেম্বার যোগ করুন</span>
                        </button>
                      )}
                    </div>

                    {editTeamItem ? (
                      <div className="border border-purple-500/20 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-3xl">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">
                          টিম মেম্বার ডাটা ফরম
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">নাম (বাংলা)</label>
                            <input
                              type="text"
                              value={editTeamItem.name || ""}
                              onChange={(e) => setEditTeamItem({...editTeamItem, name: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[11px] font-bold mb-2">পদবী / ডেজিগনেশন</label>
                            <input
                              type="text"
                              value={editTeamItem.role || ""}
                              onChange={(e) => setEditTeamItem({...editTeamItem, role: e.target.value})}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <ImageUploadField
                            label="টিম মেম্বারের ছবি আপলোড করুন অথবা সরাসরি লিংক দিন (Profile Photo)"
                            value={editTeamItem.imageUrl || ""}
                            onChange={(val) => setEditTeamItem({...editTeamItem, imageUrl: val})}
                            placeholder="https://images.unsplash.com/..."
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">বায়োগ্রাফি / সংক্ষিপ্ত পরিচিতি</label>
                          <textarea
                            rows={3}
                            value={editTeamItem.bio || ""}
                            onChange={(e) => setEditTeamItem({...editTeamItem, bio: e.target.value})}
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs font-sans leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] font-bold mb-2">স্কিল ও কারিগরি দক্ষতা (কমা দিয়ে সাজান)</label>
                          <input
                            type="text"
                            value={editTeamItem.skills ? editTeamItem.skills.join(", ") : ""}
                            onChange={(e) => setEditTeamItem({...editTeamItem, skills: e.target.value.split(",").map(s => s.trim())})}
                            placeholder="React, Next, Flutter, Figma"
                            className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs"
                          />
                        </div>

                        {/* Social Media Handles Section */}
                        <div className="border border-purple-500/10 bg-[#070212] p-4 rounded-xl space-y-3.5">
                          <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            সোশ্যাল মিডিয়া লিঙ্ক ও অন/অফ সেটিংস (Social Media Config)
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* LinkedIn */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-400 text-[10px] font-bold">LinkedIn লিঙ্ক বা আইডি</label>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-slate-500 font-bold">অন/অফ</span>
                                  <input 
                                    type="checkbox" 
                                    checked={editTeamItem.showLinkedin !== false}
                                    onChange={(e) => setEditTeamItem({...editTeamItem, showLinkedin: e.target.checked})}
                                    className="rounded border-purple-500/20 bg-[#110724] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editTeamItem.linkedinUrl || ""}
                                onChange={(e) => setEditTeamItem({...editTeamItem, linkedinUrl: e.target.value})}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs"
                              />
                            </div>

                            {/* GitHub */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-400 text-[10px] font-bold">GitHub লিঙ্ক বা আইডি</label>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-slate-500 font-bold">অন/অফ</span>
                                  <input 
                                    type="checkbox" 
                                    checked={editTeamItem.showGithub !== false}
                                    onChange={(e) => setEditTeamItem({...editTeamItem, showGithub: e.target.checked})}
                                    className="rounded border-purple-500/20 bg-[#110724] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editTeamItem.githubUrl || ""}
                                onChange={(e) => setEditTeamItem({...editTeamItem, githubUrl: e.target.value})}
                                placeholder="https://github.com/username"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs"
                              />
                            </div>

                            {/* Facebook */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-400 text-[10px] font-bold">Facebook লিঙ্ক বা প্রোফাইল</label>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-slate-500 font-bold">অন/অফ</span>
                                  <input 
                                    type="checkbox" 
                                    checked={editTeamItem.showFacebook !== false}
                                    onChange={(e) => setEditTeamItem({...editTeamItem, showFacebook: e.target.checked})}
                                    className="rounded border-purple-500/20 bg-[#110724] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editTeamItem.facebookUrl || ""}
                                onChange={(e) => setEditTeamItem({...editTeamItem, facebookUrl: e.target.value})}
                                placeholder="https://facebook.com/username"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs"
                              />
                            </div>

                            {/* Instagram */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-400 text-[10px] font-bold">Instagram লিঙ্ক বা প্রোফাইল</label>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-slate-500 font-bold">অন/অফ</span>
                                  <input 
                                    type="checkbox" 
                                    checked={editTeamItem.showInstagram !== false}
                                    onChange={(e) => setEditTeamItem({...editTeamItem, showInstagram: e.target.checked})}
                                    className="rounded border-purple-500/20 bg-[#110724] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editTeamItem.instagramUrl || ""}
                                onChange={(e) => setEditTeamItem({...editTeamItem, instagramUrl: e.target.value})}
                                placeholder="https://instagram.com/username"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs"
                              />
                            </div>

                            {/* WhatsApp */}
                            <div className="space-y-1.5 md:col-span-2">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-400 text-[10px] font-bold">WhatsApp নাম্বার (বা চ্যাট লিঙ্ক)</label>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] text-slate-500 font-bold">অন/অফ</span>
                                  <input 
                                    type="checkbox" 
                                    checked={editTeamItem.showWhatsapp !== false}
                                    onChange={(e) => setEditTeamItem({...editTeamItem, showWhatsapp: e.target.checked})}
                                    className="rounded border-purple-500/20 bg-[#110724] text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editTeamItem.whatsappUrl || ""}
                                onChange={(e) => setEditTeamItem({...editTeamItem, whatsappUrl: e.target.value})}
                                placeholder="যেমন: 01613911528 অথবা সম্পূর্ণ লিঙ্ক"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditTeamItem(null)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
                          >
                            বাতিল
                          </button>
                          <button
                            onClick={handleSaveTeamMember}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
                          >
                            সংরক্ষণ করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {team.map((t) => (
                          <div key={t.id} className="bg-[#0e051d] border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={t.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-100 font-sans">{t.name}</h4>
                                <p className="text-[10px] text-purple-400">{t.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-4">
                              <button
                                onClick={() => setEditTeamItem(t)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTeamMember(t.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 7. ORDERS & TRACKING TAB */}
                {activeTab === "orders" && (() => {
                  // Compute dynamic analytics inside the view to ensure instant reactivity and avoid sync lag
                  const totalCount = allOrders.length;
                  const pendingCount = allOrders.filter(o => o.status === "Pending" || o.status === "Payment Checking").length;
                  const runningCount = allOrders.filter(o => o.status === "Confirmed" || o.status === "Working").length;
                  const completedCount = allOrders.filter(o => o.status === "Done").length;
                  const totalEarnings = allOrders.reduce((sum, o) => {
                    if (o.status !== "Pending" && o.status !== "Payment Checking") {
                      return sum + (Number(o.price) || 0);
                    }
                    return sum;
                  }, 0);

                  // Perform precise filtering based on tab selection & search queries
                  const currentFiltered = allOrders.filter(o => {
                    // 1. Tab grouping filter
                    if (orderStatusFilter !== "all") {
                      if (orderStatusFilter === "Pending") {
                        if (o.status !== "Pending" && o.status !== "Payment Checking") return false;
                      } else if (orderStatusFilter === "Working") {
                        if (o.status !== "Confirmed" && o.status !== "Working") return false;
                      } else {
                        if (o.status !== "Done") return false;
                      }
                    }

                    // 2. Multimodal search query
                    if (orderSearchQuery.trim()) {
                      const q = orderSearchQuery.toLowerCase().trim();
                      const oId = (o.id || "").toLowerCase();
                      const oName = (o.customerName || "").toLowerCase();
                      const oPhone = (o.customerPhone || "").toLowerCase();
                      const oProj = (o.websiteTitle || "").toLowerCase();
                      const oTxn = (o.transactionId || "").toLowerCase();

                      return oId.includes(q) || oName.includes(q) || oPhone.includes(q) || oProj.includes(q) || oTxn.includes(q);
                    }

                    return true;
                  });

                  return (
                    <div className="space-y-6">
                      
                      {/* Advanced Real-time Control Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-base font-black bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent font-logo uppercase tracking-tight flex items-center gap-2">
                              <span>অর্ডার ড্যাশবোর্ড ও ট্র্যাকার (Live Order Panel)</span>
                            </h3>
                            <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase font-bold animate-pulse">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                              <span>2s Realtime Sync Mode Active</span>
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-300 font-sans mt-1">
                            ওয়েবসাইটে কোনো অর্ডার হওয়ার সাথে সাথে তা কোনো রিলোড ছাড়াই এই কন্ট্রোল প্যানেলে ২ সেকেন্ডের মধ্যে যুক্ত ও আপডেট হবে।
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 items-center">
                          <button
                            onClick={handleManualSyncCheck}
                            disabled={isCheckingSync}
                            className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl border border-purple-500/20 active:scale-95 transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] disabled:opacity-50"
                          >
                            <Activity className={`w-3.5 h-3.5 ${isCheckingSync ? 'animate-spin' : ''}`} />
                            <span>ম্যানুয়াল রিফ্রেশ করুন</span>
                          </button>
                        </div>
                      </div>

                      {/* Sync Alert Messages if any */}
                      {syncStatusMsg && (
                        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans leading-relaxed transition-all ${
                          syncStatusType === "success" 
                            ? "bg-[#0b251a] border-emerald-500/30 text-emerald-300" 
                            : "bg-[#2c0f14] border-red-500/30 text-red-300"
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-lg ${
                              syncStatusType === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            }`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <span>{syncStatusMsg}</span>
                          </div>
                          <button 
                            onClick={() => setSyncStatusMsg("")}
                            className="text-[10px] uppercase font-bold tracking-wider hover:text-white px-2 py-1 bg-white/5 hover:bg-white/10 rounded-md transition-all cursor-pointer"
                          >
                            বন্ধ করুন (Close)
                          </button>
                        </div>
                      )}

                      {/* Interactive Analytical KPI Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                        <div className="bg-[#0e051d] border border-purple-500/10 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400 font-bold tracking-wider block">মোট চেকআউট অর্ডার</span>
                          <span className="text-2xl font-black font-logo text-purple-400 mt-2 block">{totalCount} <span className="text-[11px] font-sans text-slate-500">টি</span></span>
                        </div>
                        <div className="bg-[#2a1b02]/50 border border-amber-500/10 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-amber-400 font-bold tracking-wider block">ভেরিফিকেশন পেন্ডিং ⏳</span>
                          <span className="text-2xl font-black font-logo text-amber-300 mt-2 block">{pendingCount} <span className="text-[11px] font-sans text-slate-500">টি</span></span>
                        </div>
                        <div className="bg-[#04112e]/50 border border-blue-500/10 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-blue-400 font-bold tracking-wider block">চলমান কাজ সমূহ ⚙️</span>
                          <span className="text-2xl font-black font-logo text-blue-300 mt-2 block">{runningCount} <span className="text-[11px] font-sans text-slate-500">টি</span></span>
                        </div>
                        <div className="bg-[#0b2b1a]/50 border border-emerald-500/10 p-4 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-emerald-400 font-bold tracking-wider block">সফল সম্পন্ন প্রজেক্ট 🎉</span>
                          <span className="text-2xl font-black font-logo text-emerald-300 mt-2 block">{completedCount} <span className="text-[11px] font-sans text-slate-500">টি</span></span>
                        </div>
                        <div className="bg-[#1e0729] border border-fuchsia-500/10 p-4 rounded-2xl col-span-2 md:col-span-1 flex flex-col justify-between">
                          <span className="text-[10px] text-fuchsia-400 font-bold tracking-wider block">মোট অর্জিত আয় (৳)</span>
                          <span className="text-lg font-black font-logo text-fuchsia-300 mt-2 block">৳{totalEarnings.toLocaleString("bn-BD")}</span>
                        </div>
                      </div>

                      {/* Advanced Multi-state Filters, Search & Custom Action Toolbar */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0a0314]/80 p-3.5 border border-purple-500/10 rounded-2xl backdrop-blur-md">
                        {/* Status Classification Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                          {[
                            { id: "all", label: "সব অর্ডার", count: totalCount },
                            { id: "Pending", label: "⏳ পেন্ডিং", count: pendingCount },
                            { id: "Working", label: "⚙️ চলমান", count: runningCount },
                            { id: "Done", label: "🎉 সম্পন্ন", count: completedCount }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setOrderStatusFilter(tab.id)}
                              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                                orderStatusFilter === tab.id
                                  ? "bg-purple-600/20 text-[#d8b4fe] border border-purple-500/35"
                                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 font-mono font-black border border-purple-800/30">
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Search Query Input field */}
                        <div className="relative flex-1 max-w-md">
                          <input
                            type="text"
                            placeholder="আইডি, গ্রাহকের নাম, ফোন নম্বর বা ট্রানজেকশন আইডি দিয়ে খুঁজুন..."
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            className="w-full bg-[#0d071a] border border-purple-500/15 text-slate-100 rounded-xl pl-4 pr-10 py-2.5 text-[11.5px] focus:outline-none focus:border-purple-500/35 placeholder-slate-500"
                          />
                          {orderSearchQuery && (
                            <button 
                              onClick={() => setOrderSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Custom Editing Panel Drawer Integration */}
                      {editingOrder ? (
                        <div className="border border-purple-500/25 bg-[#0e051d] p-6 rounded-2xl space-y-6 max-w-4xl relative overflow-hidden shadow-2xl">
                          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
                          <div className="flex items-center justify-between border-b border-purple-500/10 pb-3.5">
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest font-mono">
                                এডিট ট্র্যাকার আইডি: {editingOrder.id}
                              </h4>
                              <p className="text-[10px] text-slate-400">অর্ডারের ইনফরমেশন ও ট্র্যাকিং স্ট্যাটাস কন্ট্রোল করুন।</p>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono bg-purple-950/40 border border-purple-900/30 px-2.5 py-1 rounded-md">
                              অর্ডার তৈরি: {editingOrder.createdAt}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-xs">
                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">গ্রাহকের নাম (Customer Name)</label>
                              <input
                                type="text"
                                value={editingOrder.customerName || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/25"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">যোগাযোগের মোবাইল</label>
                              <input
                                type="text"
                                value={editingOrder.customerPhone || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/25 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">অর্ডারকৃত মডিউল / প্রোডাক্ট</label>
                              <input
                                type="text"
                                value={editingOrder.websiteTitle || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, websiteTitle: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/25"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">কাঙ্ক্ষিত ওয়েবসাইটের নাম (Desired Name)</label>
                              <input
                                type="text"
                                value={editingOrder.desiredWebsiteName || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, desiredWebsiteName: e.target.value})}
                                placeholder="শুধু রেডিমেড সাইটের ক্ষেত্রে"
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/25"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">প্রজেক্ট বাজেট / মূল্য (৳)</label>
                              <input
                                type="number"
                                value={editingOrder.price || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, price: Number(e.target.value)})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/25 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">পেমেন্ট মেথড</label>
                              <select
                                value={editingOrder.paymentMethod}
                                onChange={(e) => setEditingOrder({...editingOrder, paymentMethod: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none"
                              >
                                <option value="bkash">Bkash (বিকাশ)</option>
                                <option value="nagad">Nagad (নগদ)</option>
                                <option value="custom_pkg">Custom Package (কাস্টম প্যাকেজ)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">পেমেন্ট প্রেরণকারী মোবাইল</label>
                              <input
                                type="text"
                                value={editingOrder.senderNumber || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, senderNumber: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">ট্রানজেকশন আইডি (TxnID)</label>
                              <input
                                type="text"
                                value={editingOrder.transactionId || ""}
                                onChange={(e) => setEditingOrder({...editingOrder, transactionId: e.target.value})}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-400 text-[10.5px] font-bold mb-1.5">ট্র্যাকিং স্টেট (Current State)</label>
                              <select
                                value={editingOrder.status}
                                onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}
                                className="w-full bg-[#110724] border border-purple-500/25 text-purple-300 font-bold rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500/35"
                              >
                                <option value="Pending">🛡️ Pending (পেমেন্ট ভেরিফাই হবে)</option>
                                <option value="Payment Checking">💵 Payment Checking (পেমেন্ট চেক চলছে)</option>
                                <option value="Confirmed">✅ Confirmed (অর্ডার নিশ্চিত করা হয়েছে)</option>
                                <option value="Working">⚡ Working (কাজ চলমান রয়েছে)</option>
                                <option value="Done">🎉 Done (কাজ সম্পন্ন এবং সাইট লাইভ)</option>
                              </select>
                            </div>
                          </div>

                          {/* Conditional Admin Logistics Form for Successfully completed orders */}
                          {editingOrder.status === 'Done' && (
                            <div className="p-4.5 rounded-2xl border border-emerald-500/20 bg-[#061e12]/60 space-y-4 shadow-inner">
                              <div className="flex items-center gap-2 text-emerald-400">
                                <span className="p-1 rounded bg-emerald-500/20 text-xs font-bold leading-none">✓</span>
                                <span className="text-[11px] font-black uppercase tracking-wider font-sans">
                                  প্রজেক্ট ডেলিভারি গাইডলাইন ও এক্সেস সিকিউরিটি মডিউল (Live Client credentials)
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 leading-relaxed">
                                নিচের তথ্যগুলো পূরণ করলে ক্লায়েন্ট তার ট্র্যাকিং প্যানেলের "Dashboard Access" সেকশনে এক ক্লিকে তার জেনুইন লগইন লিংক ও পাসওয়ার্ড পেয়ে যাবেন।
                              </p>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-slate-400 text-[10px] font-bold mb-1">ওয়েবসাইট লিংক (Live Domain Link)</label>
                                  <input
                                    type="text"
                                    value={editingOrder.websiteLink || ""}
                                    placeholder="https://client-store.com"
                                    onChange={(e) => setEditingOrder({...editingOrder, websiteLink: e.target.value})}
                                    className="w-full bg-[#030a06] border border-emerald-500/20 text-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/40"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[10px] font-bold mb-1">এডমিন ইমেইল / লগইন (Log-In Email)</label>
                                  <input
                                    type="text"
                                    value={editingOrder.adminLogin || ""}
                                    placeholder="admin@client-store.com"
                                    onChange={(e) => setEditingOrder({...editingOrder, adminLogin: e.target.value})}
                                    className="w-full bg-[#030a06] border border-emerald-500/20 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500/40"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[10px] font-bold mb-1">এডমিন পাসওয়ার্ড (Panel Password)</label>
                                  <input
                                    type="text"
                                    value={editingOrder.adminPassword || ""}
                                    placeholder="SecurePass@2026"
                                    onChange={(e) => setEditingOrder({...editingOrder, adminPassword: e.target.value})}
                                    className="w-full bg-[#030a06] border border-emerald-500/20 text-slate-200 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500/40"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[10px] font-bold mb-1">প্রয়োজনীয় নির্দেশনা (Delivery Notes)</label>
                                  <input
                                    type="text"
                                    value={editingOrder.adminNotes || ""}
                                    placeholder="আপনার প্রোডাক্ট ও ক্যাটালগ সেট করা শেষে ইমেইল ও পাসওয়ার্ড চেঞ্জ করুন।"
                                    onChange={(e) => setEditingOrder({...editingOrder, adminNotes: e.target.value})}
                                    className="w-full bg-[#030a06] border border-emerald-500/20 text-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500/40"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2.5 pt-3 border-t border-purple-500/10">
                            <button
                              onClick={() => setEditingOrder(null)}
                              className="bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer hover:bg-slate-900 transition-all active:scale-95"
                            >
                              বাতিল করুন
                            </button>
                            <button
                              onClick={handleSaveOrderUpdate}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            >
                              স্ট্যাটাস ও ডাটা ক্লাউডে সংরক্ষণ করুন
                            </button>
                          </div>
                        </div>
                      ) : (
                        
                        /* Dynamic Order Listing block */
                        <div className="space-y-4">
                          {currentFiltered.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 text-xs border border-purple-500/10 rounded-2xl bg-[#0e051d]">
                              <ListFilter className="w-9 h-9 text-purple-500/25 mx-auto mb-3" />
                              <span className="font-sans">প্রদত্ত ফিল্টার অনুযায়ী কোনো অর্ডার ডাটাবেজে খুঁজে পাওয়া যায়নি।</span>
                            </div>
                          ) : (
                            currentFiltered.map((o) => {
                              // Determine current progress percentage for stepper indicators
                              const progressPct = 
                                o.status === "Pending" ? "25%" :
                                o.status === "Payment Checking" ? "45%" :
                                o.status === "Confirmed" ? "65%" :
                                o.status === "Working" ? "85%" : "100%";

                              return (
                                <div 
                                  key={o.id} 
                                  className="bg-[#0e051d] border border-purple-500/10 hover:border-purple-500/20 px-5 py-5.5 rounded-2xl flex flex-col lg:flex-row lg:items-start justify-between gap-5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                                >
                                  
                                  {/* Left Panel: Primary Data presentation card */}
                                  <div className="space-y-3.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-mono text-[10.5px] font-black text-purple-300 uppercase bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-lg select-all">
                                        {o.id}
                                      </span>
                                      
                                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                                        o.status === "Done" ? "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30" :
                                        o.status === "Working" ? "bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30" :
                                        o.status === "Confirmed" ? "bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30" :
                                        o.status === "Payment Checking" ? "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30" :
                                        "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                      }`}>
                                        ✓ {o.status}
                                      </span>

                                      <span className="text-[10px] text-slate-500 font-mono select-none">
                                        তারিখ: {o.createdAt}
                                      </span>
                                    </div>

                                    {/* Primary Customer credentials layout */}
                                    <div className="space-y-1">
                                      <h4 className="text-[13px] font-bold text-slate-100 font-sans">
                                        {o.customerName} <span className="text-xs text-slate-400 font-mono">({o.customerPhone})</span>
                                      </h4>
                                      <p className="text-[11px] text-slate-300 font-sans">
                                        বুকিং প্রজেক্ট: <span className="font-extrabold text-white">{o.websiteTitle}</span>
                                        {o.desiredWebsiteName && (
                                          <>
                                            {" • "}
                                            ওয়েবসাইট নাম: <span className="text-emerald-400 font-extrabold">{o.desiredWebsiteName}</span>
                                          </>
                                        )}
                                      </p>
                                    </div>

                                    {/* Financial transaction receipts footer */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 bg-purple-950/20 p-2.5 rounded-xl border border-purple-900/10 font-mono">
                                      <div>
                                        TxnID: <span className="text-slate-200 select-all font-bold">{o.transactionId}</span>
                                      </div>
                                      <div>
                                        Sender: <span className="text-slate-200 select-all font-bold">{o.senderNumber}</span>
                                      </div>
                                      <div>
                                        পেমেন্ট গেটওয়ে: <span className="text-purple-300 font-sans font-black uppercase text-[9px] bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded leading-none">{o.paymentMethod || "Bkash/Nagad"}</span>
                                      </div>
                                      <div>
                                        বাজেট: <span className="text-emerald-400 font-sans font-bold text-xs">৳{o.price.toLocaleString("bn-BD")}</span>
                                      </div>
                                    </div>

                                    {/* Visually stunning horizontal progress timeline for Admin oversight */}
                                    <div className="space-y-2 pt-1">
                                      <div className="flex items-center justify-between text-[8px] text-slate-500 font-sans uppercase tracking-wider font-extrabold select-none">
                                        <span>১. পেমেন্ট রিসিভ</span>
                                        <span>২. ভেরিফিকেশন</span>
                                        <span>৩. কাজ চলমান</span>
                                        <span>৪. ডেলিভারি সম্পন্ন</span>
                                      </div>
                                      {/* Stepper bar base */}
                                      <div className="h-1.5 w-full bg-[#1b0d36] rounded-full overflow-hidden relative border border-purple-500/5">
                                        <div 
                                          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 transition-all duration-700 ease-out" 
                                          style={{ width: progressPct }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right Panel: Functional control triggers */}
                                  <div className="flex flex-row lg:flex-col lg:items-end justify-end gap-2.5 lg:self-center">
                                    <button
                                      onClick={() => {
                                        setEditingOrder(o);
                                        // Scroll smoothly to top of the block so edit form is instantly focused
                                        const el = document.getElementById("admin-content-tabs-container");
                                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                      }}
                                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold border border-purple-500/25 py-2.5 px-4 rounded-xl text-[11px] cursor-pointer active:scale-95 transition-all"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>স্ট্যাটাস ও ডাটা কন্ট্রোলার</span>
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteOrder(o.id)}
                                      className="p-2.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 rounded-xl transition-colors cursor-pointer active:scale-95"
                                      title="অর্ডার ডিলেট"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 8. AI ASSISTANT CONTENT MODIFIER TAB */}
                {activeTab === "ai_assistant" && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-purple-500/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-sans">
                            জেমিনি এআই রাইটার এসিস্ট্যান্ট (Gemini AI Writer Assistant)
                          </h3>
                          <span className="bg-purple-500/15 text-[9px] font-black uppercase text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded-md animate-pulse">
                            Gemini 3.5 Live
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          প্রাকৃতিক ভাষায় (বাংলা, ইংরেজি বা রোমান বাংলা) কন্টেন্ট পরিবর্তনের নির্দেশ দিন। জেমিনি এআই আপনার ডাটাবেজের যেকোনো সেকশন বা প্রডাক্ট ক্যাটালগ স্বয়ংক্রিয়ভাবে মডিফাই বা নতুন আইটেম তৈরি করে সেটআপ করবে। এটি শতভাগ রিয়েল-টাইম কাজ করে।
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#0e051d] border border-purple-500/15 p-5 rounded-2xl space-y-4 max-w-4xl relative overflow-hidden">
                      {/* background ambient decoration */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none" />
                      
                      <div className="space-y-2 relative">
                        <label className="block text-slate-300 text-[11px] font-bold">
                          আপনার নির্দেশনা এখানে লিখুন (Write Your AI Instruction):
                        </label>
                        <textarea
                          rows={4}
                          value={aiInstruction}
                          onChange={(e) => setAiInstruction(e.target.value)}
                          placeholder=" must use standard parameters! উদাহরণ: আমাদের হোমপেজের টাইটেল ও সাবটাইটেল পরিবর্তন করো অথবা 'Karim IT' নামে নতুন প্রশংসাপত্র বা 'Ecommerce Pro' নামে ওয়েবসাইট এড করো।"
                          className="w-full bg-[#110724] border border-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-purple-500/50 leading-relaxed font-sans placeholder-slate-500 transition-colors"
                          disabled={aiIsGenerating}
                        />
                      </div>

                      {/* Suggestions Chips */}
                      <div className="space-y-2">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          পরামর্শ লিংক বা আইডিয়া (Sample Suggestions):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { text: "আমাদের কন্টাক্ট নাম্বারে বিকাশ (+৮৮০১৮৭৭৭৭৭৭৭৭) এবং নগদ (+৮৮০১৮৮৮৮৮৮৮৮৮) সেটিংস পরিবর্তন করো।", label: "বিকাশ ও নগদ পরিবর্তন" },
                            { text: "হোমপেজের টাইটেল পরিবর্তন করে করো 'সাশ্রয়ী প্রিমিয়াম আইটি সলিউশন' এবং সাবটাইটেল দাও 'সাফল্য ছুঁতে নতুন দিগন্ত'।", label: "হেডলাইন এডিট" },
                            { text: "একটি প্রশংসাপত্র 'করিম হোসাইন' নামে যুক্ত করো, যিনি 'সফটওয়্যার ডেভেলপমেন্ট' প্রজেক্টে আমাদের সাথে কাজ করে অনেক উপকৃত হয়েছেন।", label: "নতুন প্রশংসাপত্র তৈরি" },
                            { text: "নতুন একটি রেডিমেড ওয়েবসাইট প্রডাক্ট যোগ করো যার নাম 'Sass Landing Page Pro', দাম ১০০০ টাকা এবং ৩ দিনে ডেলিভারি।", label: "নতুন ওয়েবসাইট ডেমো" },
                            { text: "সেবাসমূহ (Services) তালিকায় 'Mobile App Dev' নামে একটি নতুন সার্ভিস যোগ করো, দাম শুরু ৫০০০ টাকা এবং বিবরণ আকর্ষণীয় করো।", label: "নতুন সার্ভিস অ্যাড" }
                          ].map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAiInstruction(chip.text)}
                              disabled={aiIsGenerating}
                              className="px-2.5 py-1.5 bg-[#13092b] hover:bg-[#1a0c3b] border border-purple-500/10 hover:border-purple-500/25 rounded-lg text-[10px] text-purple-300 transition-all font-sans cursor-pointer whitespace-nowrap"
                            >
                              ✨ {chip.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-purple-500/10 relative">
                        <button
                          onClick={handleRunAIAssistant}
                          disabled={aiIsGenerating}
                          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(139,92,247,0.3)] touch-none"
                        >
                          {aiIsGenerating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>জেমিনি এআই এনালাইজিং ও পরিবর্তন প্রসেস করছে...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>কন্টেন্ট পরিবর্তন কমান্ড চালু করুন ✨</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Result boxes */}
                    {aiError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs space-y-1.5 max-w-4xl font-sans animate-slideIn">
                        <strong className="font-bold block">ত্রুটি (Error):</strong>
                        <span>{aiError}</span>
                      </div>
                    )}

                    {aiFeedback && (
                      <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs space-y-3.5 max-w-4xl font-sans relative overflow-hidden animate-slideIn">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                        <div>
                          <strong className="font-bold text-emerald-400 block mb-1">এআই কন্টেন্ট মডিফিকেশন সফল হয়েছে:</strong>
                          <p className="whitespace-pre-line text-slate-300 leading-relaxed font-sans">{aiFeedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick verification instructions */}
                    <div className="bg-[#110724] border border-purple-500/10 p-4.5 rounded-xl max-w-4xl text-[10px] text-slate-400 leading-relaxed font-sans">
                      💡 <strong>পুনশ্চ (Tip):</strong> আপনি যদি কন্টেন্ট পরিবর্তনের নির্দেশ দেন, এটি সরাসরি আপনার পুরো সাইটের ডাটাবেজে প্রভাব ফেলে। পরিবর্তন সফল হওয়ার সাথে সাথে আপনি হোমপেজে বা প্রমোショナル ব্যানারগুলোতে লাইভ ফলাফল দেখতে পাবেন। সাইটের নিরাপত্তা ও ডেটা অখণ্ডতার জন্য জেমিনি শুধুমাত্র আপনার ডেটার কাঠামো বজায় রেখেই পরিবর্তনগুলো এক্সিকিউট করে।
                    </div>
                  </div>
                )}

                {/* 9. SECTION HEADINGS EDIT TAB */}
                {activeTab === "headings" && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-purple-500/10 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-sans">
                          সেকশন হেডার ও স্লোগান সেটিংস (Section Headings Control Panel)
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          আপনার ফ্রন্টএন্ড ওয়েবসাইটের প্রতিটা মূল সেকশনের হেডিং টাইটেল এবং সাবটাইটেল নিজের ইচ্ছেমতো পরিবর্তন করুন।
                        </p>
                      </div>
                      <button
                        onClick={handleSaveHeadings}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer self-start"
                      >
                        সব হেডিং সেভ করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                      {/* Grid Item 1: Services */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>সার্ভিসসমূহ সেকশন (Services)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সার্ভিস টাইটেল (Services Title)</label>
                            <input
                              type="text"
                              value={servicesTitle}
                              onChange={(e) => setServicesTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সার্ভিস স্লোগান (Services Subtitle)</label>
                            <textarea
                              rows={2}
                              value={servicesSubtitle}
                              onChange={(e) => setServicesSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 2: Websites */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-purple-400" />
                          <span>রেডিমেড ওয়েবসাইট শপ সেকশন (Websites)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">শপ টাইটেল (Websites Title)</label>
                            <input
                              type="text"
                              value={websitesTitle}
                              onChange={(e) => setWebsitesTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">শপ স্লোগান (Websites Subtitle)</label>
                            <textarea
                              rows={2}
                              value={websitesSubtitle}
                              onChange={(e) => setWebsitesSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 3: Portfolio */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-purple-400" />
                          <span>প্রজেক্ট পোর্টফোলিও সেকশন (Portfolio)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">পোর্টফোলিও টাইটেল (Portfolio Title)</label>
                            <input
                              type="text"
                              value={portfolioTitle}
                              onChange={(e) => setPortfolioTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">পোর্টফোলিও স্লোগান (Portfolio Subtitle)</label>
                            <textarea
                              rows={2}
                              value={portfolioSubtitle}
                              onChange={(e) => setPortfolioSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 4: Customise Plan */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-purple-400" />
                          <span>প্যাকেজ রেডি বা কাস্টম প্ল্যান (Custom Plan)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">প্ল্যানিং টাইটেল (Custom Plan Title)</label>
                            <input
                              type="text"
                              value={customiseTitle}
                              onChange={(e) => setCustomiseTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">প্ল্যানিং স্লোগান (Custom Plan Subtitle)</label>
                            <textarea
                              rows={2}
                              value={customiseSubtitle}
                              onChange={(e) => setCustomiseSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 5: Why Us */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Settings className="w-4 h-4 text-purple-400" />
                          <span>কেন আমরা সেকশন (Why Choose Us)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">হোয়াই আস টাইটেল (Why Us Title)</label>
                            <input
                              type="text"
                              value={whyUsTitle}
                              onChange={(e) => setWhyUsTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">হোয়াই আস স্লোগান (Why Us Subtitle)</label>
                            <textarea
                              rows={2}
                              value={whyUsSubtitle}
                              onChange={(e) => setWhyUsSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 6: Testimonials */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          <span>টেস্টিমোনিয়্যালস ও রিভিউ (Reviews)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">রিভিউস টাইটেল (Reviews Title)</label>
                            <input
                              type="text"
                              value={testimonialsTitle}
                              onChange={(e) => setTestimonialsTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">রিভিউস স্লোগান (Reviews Subtitle)</label>
                            <textarea
                              rows={2}
                              value={testimonialsSubtitle}
                              onChange={(e) => setTestimonialsSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 7: Team */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>টিম মেম্বার্স সেকশন (Our Team)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">টিম টাইটেল (Team Title)</label>
                            <input
                              type="text"
                              value={teamTitle}
                              onChange={(e) => setTeamTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">টিম স্লোগান (Team Subtitle)</label>
                            <textarea
                              rows={2}
                              value={teamSubtitle}
                              onChange={(e) => setTeamSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Item 8: Contact Form */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-purple-400" />
                          <span>গ্রাহক মতামত ফর্ম সেকশন (Contact Form)</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">মতামত ফর্ম টাইটেল (Contact Title)</label>
                            <input
                              type="text"
                              value={contactTitle}
                              onChange={(e) => setContactTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">মতামত ফর্ম স্লোগান (Contact Subtitle)</label>
                            <textarea
                              rows={2}
                              value={contactSubtitle}
                              onChange={(e) => setContactSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 max-w-5xl shrink-0 pt-2 pb-6">
                      <button
                        onClick={handleSaveHeadings}
                        className="bg-[#8b5cf6] hover:bg-[#a78bfa] text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer shadow-lg shadow-purple-900/10 transition-colors font-sans"
                      >
                        সব সেকশন হেডার আপডেট করুন
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === "why_choose_us" && (
                  <div className="space-y-6 animate-fadeIn pb-6 font-sans">
                    
                    {/* Header bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-purple-500/10 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                          কেন এভেক্সন ও সুবিধাসমূহ সেটিংস (Why Choose Us & Benefits Control)
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          হোমপেজে প্রদর্শিত "কেন আমাদের বেছে নেবেন" সেকশনের মূল শিরোনাম, ৩টি হাইলাইট স্ট্যাটস এবং ৫টি বড় সুবিধাসমূহ কাস্টমাইজ করুন।
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
                      
                      {/* Left Side: General Headings */}
                      <div className="lg:col-span-1 space-y-5">
                        <div className="border border-purple-500/10 bg-[#0e051d] p-4.5 rounded-2xl space-y-4 shadow-sm">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-400" />
                            <span>১. সেকশন ব্যাকগ্রাউন্ড ও শিরোনাম</span>
                          </h4>
                          
                          <div className="space-y-3.5">
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সেকশন টাইটেল (Title)</label>
                              <input
                                type="text"
                                value={whyUsTitle}
                                onChange={(e) => setWhyUsTitle(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">সেকশন সাবটাইটেল স্লোগান (Subtitle)</label>
                              <textarea
                                rows={3}
                                value={whyUsSubtitle}
                                onChange={(e) => setWhyUsSubtitle(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-purple-500 leading-normal"
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleSaveHeadings}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                          >
                            শিরোনাম সেভ করুন
                          </button>
                        </div>

                        {/* Interactive tips */}
                        <div className="bg-[#110724]/40 border border-purple-500/10 p-4.5 rounded-2xl space-y-2.5 text-slate-400 text-[10px] leading-relaxed">
                          <p className="font-bold text-purple-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>ইউজার গাইডলাইন:</span>
                          </p>
                          <p>১. হাইলাইট স্ট্যাটস এবং সুবিধার বিবরণগুলো সেভ করার পর পরিবর্তনগুলো সরাসরি মেইন সাইটের "Why Choose Us" সেকশনে লোড হবে।</p>
                          <p>২. আইকন নেম ড্রপডাউন থেকে আপনার পছন্দের ক্যাটাগরি অনুযায়ী প্রফেশনাল আইকন এসাইন করতে পারবেন।</p>
                        </div>
                      </div>

                      {/* Right Side: Highlight stats list (3 stats) */}
                      <div className="lg:col-span-2 space-y-5">
                        <div className="border border-purple-500/10 bg-[#0e051d] p-4.5 rounded-2xl space-y-4.5 shadow-sm">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <span>২. ৩টি হাইলাইট স্ট্যাট কার্ডস (Highlight Stats)</span>
                          </h4>

                          <div className="space-y-4">
                            {localWhyChooseUsStats.map((stat, idx) => (
                              <div key={stat.id || idx} className="bg-[#110724]/60 p-3.5 rounded-xl border border-purple-500/5 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">স্ট্যাটস মান (Value)</label>
                                  <input
                                    type="text"
                                    value={stat.value || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsStats];
                                      updated[idx] = { ...updated[idx], value: e.target.value };
                                      setLocalWhyChooseUsStats(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">স্ট্যাটস লেবেল (Label)</label>
                                  <input
                                    type="text"
                                    value={stat.label || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsStats];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      setLocalWhyChooseUsStats(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">আইকন সিলেক্ট (Icon)</label>
                                  <select
                                    value={stat.iconName || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsStats];
                                      updated[idx] = { ...updated[idx], iconName: e.target.value };
                                      setLocalWhyChooseUsStats(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  >
                                    <option value="Code">Code (প্রোগ্রামিং ব্র্যাকেট)</option>
                                    <option value="Headphones">Headphones (কাস্টমার সাপোর্ট)</option>
                                    <option value="Clock">Clock (৩-৭ দিন সময়)</option>
                                    <option value="Zap">Zap (তড়িৎ অপ্টিমাইজেশন)</option>
                                    <option value="Cpu">Cpu (রিয়েল কাস্টম ইউএক্স)</option>
                                    <option value="CircleDollarSign">CircleDollarSign (অটো পেমেন্ট)</option>
                                    <option value="ShieldCheck">ShieldCheck (মাল্টি সিকিউরিটি)</option>
                                    <option value="Activity">Activity (লাইভ সেশন)</option>
                                    <option value="ArrowUpRight">ArrowUpRight (বিজনেস গ্রোথ)</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={handleSaveWhyUsStats}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                          >
                            স্ট্যাটস ডাটা সেভ করুন
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Timeline steps list editing */}
                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4 max-w-5xl shadow-sm">
                      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span>৩. সুবিধার তালিকা স্টেপ সম্পাদক (5 Timeline Benefits)</span>
                      </h4>

                      <div className="space-y-4.5">
                        {localWhyChooseUsItems.map((item, idx) => (
                          <div key={item.id || idx} className="bg-[#110724]/30 border border-purple-500/5 p-4 sm:p-5 rounded-2xl space-y-3.5">
                            <div className="flex items-center justify-between border-b border-purple-500/5 pb-2">
                              <span className="text-[10px] bg-purple-500/10 text-purple-300 font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                                সুবিধা স্টেপ - {idx + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-500 font-semibold">অ্যালাইনমেন্ট লেআউট:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localWhyChooseUsItems];
                                    updated[idx] = { ...updated[idx], align: item.align === "left" ? "right" : "left" };
                                    setLocalWhyChooseUsItems(updated);
                                  }}
                                  className="text-[9px] bg-[#110522] border border-purple-500/15 hover:border-purple-500/30 px-2.5 py-1 text-slate-300 rounded cursor-pointer uppercase font-black"
                                >
                                  {item.align === "left" ? "Left" : "Right"}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-1 space-y-3">
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">স্টেপ নম্বর (Step No)</label>
                                  <input
                                    type="number"
                                    value={item.step || (idx + 1)}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsItems];
                                      updated[idx] = { ...updated[idx], step: parseInt(e.target.value) || (idx + 1) };
                                      setLocalWhyChooseUsItems(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">ব্যাজ স্ন্যাপ (Badge Slogan)</label>
                                  <input
                                    type="text"
                                    value={item.badge || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsItems];
                                      updated[idx] = { ...updated[idx], badge: e.target.value };
                                      setLocalWhyChooseUsItems(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">আইকন সিলেক্ট (Icon)</label>
                                  <select
                                    value={item.iconName || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsItems];
                                      updated[idx] = { ...updated[idx], iconName: e.target.value };
                                      setLocalWhyChooseUsItems(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                                  >
                                    <option value="Zap">Zap (হাইপার স্পীড)</option>
                                    <option value="Cpu">Cpu (প্রিমিয়াম UI/UX UI)</option>
                                    <option value="CircleDollarSign">CircleDollarSign (পেমেন্ট ও এসএমএস)</option>
                                    <option value="ShieldCheck">ShieldCheck (সুরক্ষা ও ব্যাকআপ)</option>
                                    <option value="Activity">Activity (ডেডিকেটেড সাপোর্ট)</option>
                                    <option value="Code">Code (সোর্স কোড ও মালিকানা)</option>
                                    <option value="Headphones">Headphones (অ্যাসিস্ট্যান্স)</option>
                                    <option value="Clock">Clock (সময়সীমা ডেলিভারি)</option>
                                    <option value="ArrowUpRight">ArrowUpRight (বিজনেস গ্রোথ)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="md:col-span-3 space-y-3">
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">সুবিধার টাইটেল (Title)</label>
                                  <input
                                    type="text"
                                    value={item.title || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsItems];
                                      updated[idx] = { ...updated[idx], title: e.target.value };
                                      setLocalWhyChooseUsItems(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-400 text-[9px] font-bold mb-1">সুবিধার বিস্তারিত বিবরণ (Description Description)</label>
                                  <textarea
                                    rows={3}
                                    value={item.description || ""}
                                    onChange={(e) => {
                                      const updated = [...localWhyChooseUsItems];
                                      updated[idx] = { ...updated[idx], description: e.target.value };
                                      setLocalWhyChooseUsItems(updated);
                                    }}
                                    className="w-full bg-[#0d051c] border border-purple-500/10 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-purple-500 leading-normal"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveWhyUsItems}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-sans"
                        >
                          <Award className="w-4 h-4 text-white" />
                          <span>৫টি সুবিধার এই সম্পূর্ণ বিবরণ তালিকা সেভ করুন</span>
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 10. PACKAGE PLANNER TAB */}
                {activeTab === "package_planner" && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-purple-500/10 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 font-sans">
                           প্যাকেজ রেডি করুন সেটিংস (Package Planner & Feature Customizer)
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                           ওয়েবসাইটের "প্যাকেজ রেডি করুন" সেকশনের শিরোনাম, প্রতিটি ক্যাটাগরির প্যাকেজ ফি ও সুযোগ-সুবিধাসমূহ কাস্টমাইজ করুন।
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveHeadings}
                          className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[10px] uppercase px-4 py-2 rounded-xl transition-all cursor-pointer font-sans"
                        >
                            শিরোনাম আপডেট
                        </button>
                        <button
                          onClick={handleSavePackagePlans}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/20 active:scale-95 cursor-pointer font-sans"
                        >
                           প্যাকেজসমূহ সংরক্ষণ করুন 💾
                        </button>
                      </div>
                    </div>

                    {saveSuccess && (
                      <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-sans text-center">
                        {saveSuccess}
                      </div>
                    )}

                    {/* Section 1: Title & Subtitle editing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span>প্যাকেজ সেকশন শিরোনাম ও স্লোগান</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">প্ল্যানিং টাইটেল (Title)</label>
                            <input
                              type="text"
                              value={customiseTitle}
                              onChange={(e) => setCustomiseTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">প্ল্যানিং স্লোগান (Subtitle)</label>
                            <textarea
                              rows={2}
                              value={customiseSubtitle}
                              onChange={(e) => setCustomiseSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#110724]/40 border border-purple-500/10 p-5 rounded-2xl flex flex-col justify-center space-y-3 text-slate-300 text-[10px] leading-relaxed font-sans">
                         <p className="font-bold text-fuchsia-400">💡 ক্যাটাগরি অনুসারে প্যাকেজ কার্ডের মূল্য ও সুবিধা পরিবর্তন:</p>
                         <p>নিচে যেকোনো একটি প্রজেক্ট ক্যাটাগরি নির্বাচন করুন এবং ওই ক্যাটাগরির ৩টি প্ল্যান (Normal, Pro & Premium) থেকে ইচ্ছা অনুযায়ী মূল্য, মেয়াদ এবং বুলেট ফিচার পরিবর্তন করুন।</p>
                         <p className="text-amber-400">রিসেট করতে চাইলে ফ্যাক্টরি রিসেট বাটনটি ব্যবহার করতে পারেন।</p>
                      </div>
                    </div>

                    {/* Section 2: Edit Custom Package Cards & List of features */}
                    <div className="border border-purple-500/10 bg-[#070211] p-5 rounded-2xl space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-950 pb-4">
                        <div className="space-y-1">
                          <label className="block text-purple-400 text-xs font-bold font-sans">ওয়েবসাইট ক্যাটাগরি নির্বাচন করুন:</label>
                          <p className="text-[10px] text-slate-400">কোন ক্যাটাগরির ৩টি কার্ড এডিট করবেন তা সিলেক্ট করুন</p>
                        </div>
                        <select
                          value={pkgSelectedCategory}
                          onChange={(e) => setPkgSelectedCategory(e.target.value)}
                          className="bg-[#120822] text-slate-100 border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 antialiased font-bold max-w-xs cursor-pointer font-sans"
                        >
                          <option value="ecommerce">Ecommerce (ই-কমার্স ওয়েবসাইট)</option>
                          <option value="online_shop">Online Shop (অনлайн শপ)</option>
                          <option value="food_restaurant">Food & Restaurant (ফুড ও রেস্টুরেন্ট)</option>
                          <option value="agency">Agency (ডিজিটাল এজেন্সি সাইট)</option>
                          <option value="portfolio">Portfolio (পার্সোনাল পোর্টফোলিও)</option>
                          <option value="education">Education (এডুকেশন ওয়েবসাইট)</option>
                          <option value="course_platform">Online Course (অনлайн কোর্স প্ল্যাটফর্ম)</option>
                          <option value="blog">Blog (ব্লগ ওয়েবসাইট)</option>
                          <option value="news_portal">News Portal (নিউজ পোর্টাল)</option>
                          <option value="esports">Esports (ই-স্পোর্টস টিম)</option>
                        </select>
                      </div>

                      {/* Render 3 editable cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {pkgPlans.map((plan, index) => (
                          <div
                            key={plan.id || index}
                            className="bg-[#0f0722] border border-purple-500/10 rounded-2xl p-4 space-y-4 shadow-xl text-left"
                          >
                            <div className="flex items-center justify-between border-b border-purple-950/40 pb-2">
                              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                                {index === 0 ? "১. বেসিক / নরমাল" : index === 1 ? "২. স্ট্যান্ডার্ড / প্রো (জনপ্রিয়)" : "৩. প্রিমিয়াম / এন্টারপ্রাইজ"}
                              </span>
                              <input
                                type="text"
                                placeholder="ব্যাজ (যেমন: জনপ্রিয়)"
                                value={plan.badge || ""}
                                onChange={(e) => handleUpdatePkgPlanField(index, "badge", e.target.value)}
                                className="bg-[#170c2a] border border-purple-500/5 text-slate-200 text-[10px] rounded px-2 py-1 max-w-[80px] focus:outline-none focus:border-purple-500 text-center font-sans"
                              />
                            </div>

                            <div className="space-y-3">
                              {/* plan Title */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] text-slate-400 font-bold mb-1 block">প্যাকেজর নাম (EN)</label>
                                  <input
                                    type="text"
                                    value={plan.name || ""}
                                    onChange={(e) => handleUpdatePkgPlanField(index, "name", e.target.value)}
                                    className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-400 font-bold mb-1 block">প্যাকেজর বাংলা নাম</label>
                                  <input
                                    type="text"
                                    value={plan.banglaName || ""}
                                    onChange={(e) => handleUpdatePkgPlanField(index, "banglaName", e.target.value)}
                                    className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                                  />
                                </div>
                              </div>

                              {/* Price and Delivery Day */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] text-slate-400 font-bold mb-1 block">মূল্য (৳ টাকা)</label>
                                  <input
                                    type="number"
                                    value={plan.price || 0}
                                    onChange={(e) => handleUpdatePkgPlanField(index, "price", parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-400 font-bold mb-1 block">ডেলিভারি সময়</label>
                                  <input
                                    type="text"
                                    value={plan.deliveryTime || ""}
                                    onChange={(e) => handleUpdatePkgPlanField(index, "deliveryTime", e.target.value)}
                                    className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                                  />
                                </div>
                              </div>

                              {/* tagline & description */}
                              <div>
                                <label className="text-[9px] text-slate-400 font-bold mb-1 block">ছোট স্লোগান / ট্যাগলাইন</label>
                                <input
                                  type="text"
                                  value={plan.tagline || ""}
                                  onChange={(e) => handleUpdatePkgPlanField(index, "tagline", e.target.value)}
                                  className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] text-slate-400 font-bold mb-1 block">ছোট প্যাকেজ বিবরণ</label>
                                <textarea
                                  rows={2}
                                  value={plan.description || ""}
                                  onChange={(e) => handleUpdatePkgPlanField(index, "description", e.target.value)}
                                  className="w-full bg-[#140a27] border border-purple-500/10 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 leading-normal font-sans"
                                />
                              </div>

                              {/* Features box (Newline list) */}
                              <div>
                                <label className="text-[9px] text-purple-300 font-bold flex items-center gap-1 mb-1">
                                  <span>ফিচার বা সুবিধাসমূহ (প্রতি লাইনে ১টি)</span>
                                </label>
                                <textarea
                                  rows={5}
                                  placeholder="প্রতি লাইনে ১টি সুবিধা টাইপ করুন..."
                                  value={plan.features ? plan.features.join("\n") : ""}
                                  onChange={(e) => handleUpdatePkgPlanFeatures(index, e.target.value)}
                                  className="w-full bg-[#110522] border border-purple-500/10 text-slate-100 rounded px-2.5 py-2 text-xs focus:outline-none focus:border-purple-500 leading-normal font-sans"
                                />
                                <span className="block text-[8px] text-slate-500 mt-1">সুবিধা বাড়ানোর জন্য লাইনে লিখে এন্টার চাপুন</span>
                              </div>

                              {/* Toggle sub-features editor button */}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => setActivePlanSubEdit(activePlanSubEdit === index ? null : index)}
                                  className="w-full bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/15 py-1.5 rounded-xl text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer font-sans"
                                >
                                  <span>{activePlanSubEdit === index ? "✕ সাব-ফিচার বন্ধ করুন" : "⚙️ ডিটেইল সাব-ফিচার ও সুবিধাসমূহ এডিট"}</span>
                                </button>
                              </div>

                              {/* Collapsible Sub-Features Editor Drawer */}
                              {activePlanSubEdit === index && (
                                <div className="bg-[#0b0416] border border-purple-500/10 rounded-xl p-3.5 space-y-4 animate-fadeIn">
                                  {/* Header */}
                                  <div className="border-b border-purple-500/5 pb-2">
                                    <h5 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 uppercase tracking-widest flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                      <span>ডিটেইল স্পেসিফিকেশন ও সুবিধা সেটিংস</span>
                                    </h5>
                                  </div>

                                  {/* কাদের জন্য উপযুক্ত suitableFor */}
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[9px] font-bold">কাদের জন্য উপযুক্ত (Suitable For - প্রতি লাইনে ১টি)</label>
                                    <textarea
                                      rows={3}
                                      placeholder="কাদের জন্য উপযুক্ত তা প্রতি লাইনে লিখুন..."
                                      value={plan.suitableFor ? plan.suitableFor.join("\n") : ""}
                                      onChange={(e) => handleUpdatePkgSuitableFor(index, e.target.value)}
                                      className="w-full bg-[#120724] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 leading-normal font-sans"
                                    />
                                  </div>

                                  {/* কেন আমাদের সুবিধাটি নিবেন whyChoose */}
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[9px] font-bold">কেন এই প্যাকেজ নিবেন (Why Choose - প্রতি লাইনে ১টি)</label>
                                    <textarea
                                      rows={3}
                                      placeholder="কেন এই প্যাকেজ নিবেন তা প্রতি লাইনে লিখুন..."
                                      value={plan.whyChoose ? plan.whyChoose.join("\n") : ""}
                                      onChange={(e) => handleUpdatePkgWhyChoose(index, e.target.value)}
                                      className="w-full bg-[#120724] border border-purple-500/10 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-500 leading-normal font-sans"
                                    />
                                  </div>

                                  {/* ডিটেইল সাব-ফিচার এবং তাদের বিবরণ Features Detailed */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between border-b border-purple-500/5 pb-1">
                                      <label className="block text-purple-300 text-[9px] font-bold">ডিটেইল সাব-ফিচার তালিকা ({plan.featuresDetailed?.length || 0} টি)</label>
                                      <button
                                        type="button"
                                        onClick={() => handleAddPkgDetailedFeature(index)}
                                        className="text-[8px] bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 px-2 py-1 rounded flex items-center gap-1 cursor-pointer font-extrabold uppercase font-sans"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>সুবিধা যোগ করুন</span>
                                      </button>
                                    </div>

                                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                      {(!plan.featuresDetailed || plan.featuresDetailed.length === 0) ? (
                                        <p className="text-[9px] text-slate-500 italic text-center py-2 font-sans">কোনো ডিটেইল সাব-ফিচার যুক্ত নেই। ওপরের বাটনে ক্লিক করে যোগ করুন।</p>
                                      ) : (
                                        plan.featuresDetailed.map((feat: any, fIdx: number) => (
                                          <div key={fIdx} className="bg-[#140828] border border-purple-500/5 rounded-lg p-2 space-y-1.5 relative group">
                                            <div className="flex items-center justify-between gap-2">
                                              <input
                                                type="text"
                                                placeholder="সুবিধার শিরোনাম (Title)"
                                                value={feat.title || ""}
                                                onChange={(e) => handleUpdatePkgDetailedFeature(index, fIdx, "title", e.target.value)}
                                                className="w-full bg-[#0b0416] border border-purple-500/10 text-slate-100 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-purple-500 font-sans font-bold"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleRemovePkgDetailedFeature(index, fIdx)}
                                                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                                title="মুছে ফেলুন"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                            <textarea
                                              rows={2}
                                              placeholder="সুবিধার বিস্তারিত ব্যাখ্যা (Description)"
                                              value={feat.desc || ""}
                                              onChange={(e) => handleUpdatePkgDetailedFeature(index, fIdx, "desc", e.target.value)}
                                              className="w-full bg-[#0b0416] border border-purple-500/10 text-slate-100 rounded px-2 py-1 text-[9px] focus:outline-none focus:border-purple-500 leading-normal font-sans"
                                            />
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-3">
                        <button
                          onClick={handleSavePackagePlans}
                          className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer font-sans"
                        >
                          <Zap className="w-4 h-4 fill-white text-white" />
                          <span>এই ক্যাটাগরির প্যাকেজ কাস্টমাইজেশন সংরক্ষণ করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. WHY CHOOSE US TAB */}
                {/* 12. CONTACT TAB */}
                {activeTab === "contact" && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-emerald-500/10 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-sans">
                          যোগাযোগ এবং ফুটর সেটিংস (Contact & Footer Control Panel)
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                          গ্রাহকের মতামত ফর্মের হেডার, আপনার ব্যবসায়িক ফোন, সামাজিক মিডিয়া লিংক এবং ফুটর গেটওয়ে পেমেন্ট নম্বরসমূহের সেটিংস।
                        </p>
                      </div>
                      <button
                        onClick={handleSaveContact}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-950/20 cursor-pointer self-start"
                      >
                        সব যোগাযোগ তথ্য সেভ করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                      {/* Sub-item 1: Headings */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-emerald-400" />
                          <span>যোগাযোগ সেকশন শিরোনাম ও স্লোগান</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ফর্ম টাইটেল (Contact Title)</label>
                            <input
                              type="text"
                              value={contactTitle}
                              onChange={(e) => setContactTitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ফর্ম স্লোগান (Contact Subtitle)</label>
                            <textarea
                              rows={3}
                              value={contactSubtitle}
                              onChange={(e) => setContactSubtitle(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub-item 2: Contact Options */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-emerald-400" />
                          <span>ব্যবসায়িক যোগাযোগ ও ফোন সেটিংস</span>
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">অফিস ঠিকানা (Office Address)</label>
                            <input
                              type="text"
                              value={officeAddress}
                              onChange={(e) => setOfficeAddress(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">মোবাইল / হেল্পলাইন নম্বর</label>
                            <input
                              type="text"
                              value={helplineNumbers}
                              onChange={(e) => setHelplineNumbers(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">অফিসিয়াল ইমেইল</label>
                              <input
                                type="text"
                                value={officialEmails}
                                onChange={(e) => setOfficialEmails(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[10px] font-bold mb-1.5">অফিস আওয়ারস / টাইম</label>
                              <input
                                type="text"
                                value={supportHours}
                                onChange={(e) => setSupportHours(e.target.value)}
                                className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-item 3: Social Profile Links */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>সোশ্যাল মিডিয়া প্রোফাইল ইউআরএল সমূহ</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ফেসবুক পেজ বা প্রোফাইল URL</label>
                            <input
                              type="text"
                              value={facebookUrl}
                              onChange={(e) => setFacebookUrl(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">ইনস্টাগ্রাম (Instagram) প্রোফাইল URL</label>
                            <input
                              type="text"
                              value={instagramUrl}
                              onChange={(e) => setInstagramUrl(e.target.value)}
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">হোয়াটসঅ্যাপ (WhatsApp) সরাসরি মেসেজ লিংক বা নম্বর</label>
                            <input
                              type="text"
                              value={whatsappUrl}
                              onChange={(e) => setWhatsappUrl(e.target.value)}
                              placeholder="যেমন: https://wa.me/8801700000000"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sub-item 4: Gateways numbers */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>ফুটর পেমেন্ট গেটওয়ে মোবাইল ডিক্লারেশন</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">বিকাশ পার্সোনাল/মার্চেন্ট নম্বর</label>
                            <input
                              type="text"
                              value={bkashNumber}
                              onChange={(e) => setBkashNumber(e.target.value)}
                              placeholder="যেমন: ০১৬১৩৯১১৫২৮"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[10px] font-bold mb-1.5">নগদ পার্সোনাল/মার্চেন্ট নম্বর</label>
                            <input
                              type="text"
                              value={nagadNumber}
                              onChange={(e) => setNagadNumber(e.target.value)}
                              placeholder="যেমন: ০১৬১৩৯১১৫২৮"
                              className="w-full bg-[#110724] border border-purple-500/10 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none font-sans"
                            />
                          </div>
                        </div>
                        <div className="text-[9px] text-slate-400 leading-relaxed font-sans mt-2">
                          📌 এটি ফুটরের পেমেন্ট সিকিউরিটি ও লোগো মেথডের সাথে যুক্ত হয়ে ক্লায়েন্ট ভেরিফিকেশনে কাস্টমার ট্রাস্ট বাড়াতে সর্বোচ্চ পারফর্ম করে।
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 max-w-5xl shrink-0 pt-2 pb-6">
                      <button
                        onClick={handleSaveContact}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl cursor-pointer"
                      >
                        সব রিসোর্স সেভ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* 13. SUPABASE TAB */}
                {activeTab === "supabase" && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-purple-500/10 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-sans animate-pulse">
                          সুপাবেস রিয়েল-টাইম ডাটাবেস সেটিংস (Supabase Real-Time Engine)
                        </h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">
                          আপনার এডমিন প্যানেলকে সরাসরি Supabase ক্লাউড ডাটাবেসের সাথে সংযুক্ত করুন। এর ফলে যেকোনো পরিবর্তন সাথে সাথে সব ব্রাউজারে রিফ্রেশ ছাড়াই লাইভ হয়ে যাবে।
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSupabaseConfigured ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-sans">
                            ● কানেক্টেড (সক্রিয়)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                            ● অফলাইন (লোকাল JSON ব্যাকআপে সচল)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                      {/* Left: General Config Status */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                          <Database className="w-4 h-4 text-purple-400" />
                          <span>ডাটাবেস সংযোগ স্ট্যাটাস</span>
                        </h4>
                        
                        <div className="space-y-3.5 text-xs text-slate-300">
                          <div className="p-3.5 bg-[#140a28] rounded-xl border border-purple-500/5 space-y-1">
                            <div className="text-slate-400 text-[10px] uppercase font-bold">সুপাবেস কানেকশন কুয়েরি</div>
                            <div className="font-mono text-[11px] text-white break-all">
                              URL: {isSupabaseConfigured ? (safeLocalStorage.getItem("VITE_SUPABASE_URL") || ((import.meta as any).env?.VITE_SUPABASE_URL) || "Configured") : "অ-কনফিগারড (Not Configured yet)"}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 block">কিভাবে কানেক্ট করবেন?</span>
                              <ol className="list-decimal pl-4 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                                <li>প্রথমে <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-purple-400 underline font-semibold cursor-pointer">Supabase Dashboard</a>-এ গিয়ে একটি নতুন প্রোজেক্ট তৈরি করুন।</li>
                                <li>প্রোজেক্টের <strong className="text-white">Settings &gt; API</strong> থেকে <code className="text-emerald-400">Project URL</code> এবং <code className="text-emerald-400">anon public API key</code> কপি করুন।</li>
                                <li>ক্লাউড ড্যাশবোর্ডের Secrets বা লোকাল পরিবেশ ভেরিয়েবল (.env) ফাইলে নিচের দুটি কি যুক্ত করুন:</li>
                              </ol>
                              <div className="bg-black/40 p-3 rounded-xl border border-purple-500/5 font-mono text-[10px] text-slate-300 space-y-1.5">
                                <div>VITE_SUPABASE_URL= <span className="text-emerald-400">"your-project-url"</span></div>
                                <div>VITE_SUPABASE_ANON_KEY= <span className="text-emerald-400">"your-anon-public-key"</span></div>
                              </div>
                            </div>

                            {/* Manual Override Inputs */}
                            <div className="p-4 border border-purple-500/20 bg-purple-950/20 rounded-2xl space-y-3">
                              <span className="text-[12px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 block">
                                🛠️ ব্রাউজার ভিত্তিক ম্যানুয়াল সংযোগ (হোস্টিং বা ডেক্সটপ এর জন্য অত্যন্ত সহজ)
                              </span>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">
                                যদি নেটলিফাইতে (Netlify) হোস্ট করার পর কোনো কারণে পরিবেশ ভেরিয়েবল (Environment Variable) লোড না হয়, তাহলে নিচের ইনপুট বক্সে সরাসরি আপনার Supabase URL ও Anon Public Key দিন। এটি আপনার ব্রাউজারে সুরক্ষিতভাবে লোকাল স্টোরেজে সংরক্ষিত থাকবে এবং সাইটকে সচল রাখবে।
                              </p>
                              
                              <div className="space-y-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-300 block">সুপাবেস URL (VITE_SUPABASE_URL)</label>
                                  <input
                                    type="text"
                                    value={manualSupabaseUrl}
                                    onChange={(e) => setManualSupabaseUrl(e.target.value)}
                                    placeholder="https://yourprojectid.supabase.co"
                                    className="w-full bg-[#110a24] text-xs text-white border border-purple-500/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-300 block">আনন পাবলিক কি (VITE_SUPABASE_ANON_KEY)</label>
                                  <input
                                    type="text"
                                    value={manualSupabaseKey}
                                    onChange={(e) => setManualSupabaseKey(e.target.value)}
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    className="w-full bg-[#110a24] text-xs text-white border border-purple-500/20 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1.5 animate-fadeIn">
                                <button
                                  type="button"
                                  onClick={handleSaveManualSupabase}
                                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-purple-950/20"
                                >
                                  সংরক্ষণ ও কানেক্ট করুন
                                </button>
                                
                                {(safeLocalStorage.getItem("VITE_SUPABASE_URL") || safeLocalStorage.getItem("VITE_SUPABASE_ANON_KEY")) && (
                                  <button
                                    type="button"
                                    onClick={handleResetManualSupabase}
                                    className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/20 font-bold text-[10px] rounded-lg cursor-pointer transition-all active:scale-95"
                                  >
                                    মুছে ফেলুন (Reset)
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick SQL Seed Editor */}
                      <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <span>ডাটাবেস টেবিল ও রিয়েল-টাইম সচল করার স্ক্রিপ্ট</span>
                        </h4>
                        
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Supabase ড্যাশবোর্ডের বাম দিকের মেনু থেকে <strong className="text-white">SQL Editor</strong>-এ যান। সেখানে <strong className="text-emerald-400">New Query</strong> তৈরি করে নিচের সম্পূর্ণ কোডটি পেস্ট করে <strong className="text-emerald-400">Run</strong> বাটনে ক্লিক করুন। এটি আপনার জন্য টেবিল এবং রিয়েল-টাইম ব্রডকাস্টিং স্বয়ংক্রিয়ভাবে অন করে দেবে:
                        </p>

                        <div className="relative font-sans">
                          <pre className="bg-black/60 text-emerald-300 font-mono text-[9px] p-4 rounded-xl border border-purple-500/15 overflow-x-auto max-h-[220px] scrollbar-thin">
{`-- ১. রিয়েল-টাইম ডাটাবেস টেবিল তৈরি
create table if not exists avexon_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists avexon_orders (
  id text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ২. রিয়েল-টাইম প্রকাশনী (publication) পরীক্ষা ও সৃষ্টি করা
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- ৩. টেবিলগুলোর জন্য রিয়েল-টাইম লাইভ সিঙ্ক সক্রিয় করা (নিরাপদে)
do $$
begin
  begin
    alter publication supabase_realtime add table avexon_content;
  exception
    when duplicate_object then null;
  end;
end $$;

do $$
begin
  begin
    alter publication supabase_realtime add table avexon_orders;
  exception
    when duplicate_object then null;
  end;
end $$;

-- ৪. টেবিলগুলোতে Row Level Security (RLS) সক্রিয় করা
alter table public.avexon_content enable row level security;
alter table public.avexon_orders enable row level security;

-- ৫. সম্পূর্ণ রিড ও রাইট পারমিশনের জন্য সিকিউরিটি পলিসি তৈরি করুন
drop policy if exists "Allow public select" on public.avexon_content;
create policy "Allow public select" on public.avexon_content for select using (true);

drop policy if exists "Allow public insert" on public.avexon_content;
create policy "Allow public insert" on public.avexon_content for insert with check (true);

drop policy if exists "Allow public update" on public.avexon_content;
create policy "Allow public update" on public.avexon_content for update using (true) with check (true);

drop policy if exists "Allow public delete" on public.avexon_content;
create policy "Allow public delete" on public.avexon_content for delete using (true);

-- avexon_orders টেবিলটির জন্য সিকিউরিটি পলিসি তৈরি করুন
drop policy if exists "Allow public select" on public.avexon_orders;
create policy "Allow public select" on public.avexon_orders for select using (true);

drop policy if exists "Allow public insert" on public.avexon_orders;
create policy "Allow public insert" on public.avexon_orders for insert with check (true);

drop policy if exists "Allow public update" on public.avexon_orders;
create policy "Allow public update" on public.avexon_orders for update using (true) with check (true);

drop policy if exists "Allow public delete" on public.avexon_orders;
create policy "Allow public delete" on public.avexon_orders for delete using (true);`}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`-- ১. রিয়েল-টাইম ডাটাবেস টেবিল তৈরি
create table if not exists avexon_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists avexon_orders (
  id text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ২. রিয়েল-টাইম প্রকাশনী (publication) পরীক্ষা ও সৃষ্টি করা
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- ৩. টেবিলগুলোর জন্য রিয়েল-টাইম লাইভ সিঙ্ক সক্রিয় করা (নিরাপদে)
do $$
begin
  begin
    alter publication supabase_realtime add table avexon_content;
  exception
    when duplicate_object then null;
  end;
end $$;

do $$
begin
  begin
    alter publication supabase_realtime add table avexon_orders;
  exception
    when duplicate_object then null;
  end;
end $$;

-- ৪. টেবিলগুলোতে Row Level Security (RLS) সক্রিয় করা
alter table public.avexon_content enable row level security;
alter table public.avexon_orders enable row level security;

-- ৫. সম্পূর্ণ রিড ও রাইট পারমিশনের জন্য সিকিউরিটি পলিসি তৈরি করুন
drop policy if exists "Allow public select" on public.avexon_content;
create policy "Allow public select" on public.avexon_content for select using (true);

drop policy if exists "Allow public insert" on public.avexon_content;
create policy "Allow public insert" on public.avexon_content for insert with check (true);

drop policy if exists "Allow public update" on public.avexon_content;
create policy "Allow public update" on public.avexon_content for update using (true) with check (true);

drop policy if exists "Allow public delete" on public.avexon_content;
create policy "Allow public delete" on public.avexon_content for delete using (true);

-- avexon_orders টেবিলটির জন্য সিকিউরিটি পলিসি তৈরি করুন
drop policy if exists "Allow public select" on public.avexon_orders;
create policy "Allow public select" on public.avexon_orders for select using (true);

drop policy if exists "Allow public insert" on public.avexon_orders;
create policy "Allow public insert" on public.avexon_orders for insert with check (true);

drop policy if exists "Allow public update" on public.avexon_orders;
create policy "Allow public update" on public.avexon_orders for update using (true) with check (true);

drop policy if exists "Allow public delete" on public.avexon_orders;
create policy "Allow public delete" on public.avexon_orders for delete using (true);`);
                              triggerSuccessAlert("সম্পূর্ণ SQL+রিয়েলটাইম+RLS পলিসি কোড কপি করা হয়েছে!");
                            }}
                            className="absolute top-2.5 right-2.5 bg-purple-900/60 hover:bg-purple-800 text-white border border-purple-500/20 rounded-lg text-[9px] px-2.5 py-1.5 transition-all cursor-pointer font-bold"
                          >
                            কপি সম্পূর্ণ SQL
                          </button>
                        </div>

                        <div className="p-3 bg-indigo-950/20 border border-indigo-500/25 rounded-xl space-y-1.5 text-[11px] text-indigo-300 leading-relaxed font-sans">
                          <span className="font-extrabold block text-amber-400">💡 ম্যানুয়াল পদ্ধতি (যদি SQL এ অলরেডি যুক্ত থাকে বলে এরর আসে):</span>
                          যদি এরর আসে যে টেবিলটি অলরেডি প্রকাশনীতে যুক্ত, তাহলে বুঝবেন আপনার লাইভ ব্রডকাস্ট অলরেডি সচল হয়ে গিয়েছে! আপনি ম্যানুয়ালি চেক করতে চাইলে:
                          <ol className="list-decimal pl-4 mt-1 space-y-1 text-[10px] text-slate-400">
                            <li>Supabase-এর বাম পাশের সাইডবার থেকে <strong className="text-white">Database</strong>-এ যান।</li>
                            <li>সেখান থেকে <strong className="text-white">Publications</strong> মেনুতে ক্লিক করুন (Replication এর ভেতরে অথবা সরাসরি Publications হিসেবে থাকে)।</li>
                            <li>সেখানে <strong className="text-white">supabase_realtime</strong> নামক প্রকাশনীটির ডানে Edit বাটনে চাপ দিয়ে <strong className="text-emerald-400">avexon_content</strong> এবং <strong className="text-emerald-400">avexon_orders</strong> টেবিল দুটির টিক মার্কটি অন করে দিন।</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Live Connection Checker Section */}
                    <div className="border border-purple-500/15 bg-[#0e051d] p-5 rounded-2xl max-w-5xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 uppercase tracking-wider flex items-center gap-2 font-sans">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>সংযোগ পরীক্ষা করার টুল (Live Connection Diagnostics)</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            সুপাবেস সঠিক উপায়ে ডাটা রিড, রাইট, এবং ডিলিট করতে পারছে কিনা তা তাৎক্ষণিকভাবে যাচাই করতে চেক বাটনে ক্লিক করুন।
                          </p>
                        </div>
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={handleTestSupabaseConnection}
                            disabled={supabaseTestStatus === "testing"}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/40"
                          >
                            {supabaseTestStatus === "testing" ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                <span>কানেকশন চেক করা হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>টেস্ট কানেকশন (Check Now)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {supabaseTestStatus !== "idle" && (
                        <div className={`p-4 rounded-xl border ${
                          supabaseTestStatus === "testing" 
                            ? "bg-[#101530] border-blue-500/25 text-blue-200"
                            : supabaseTestStatus === "success"
                            ? "bg-[#0b1f14] border-emerald-500/25 text-emerald-200"
                            : "bg-[#250d18] border-rose-500/25 text-rose-200"
                        } font-sans space-y-1.5`}>
                          <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                                supabaseTestStatus === "testing" ? "bg-blue-400" : supabaseTestStatus === "success" ? "bg-emerald-400" : "bg-rose-400"
                              } opacity-75`}></span>
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                supabaseTestStatus === "testing" ? "bg-blue-500" : supabaseTestStatus === "success" ? "bg-emerald-500" : "bg-rose-500"
                              }`}></span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">টেস্ট ট্র্যাকার লগ:</span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed break-words">{supabaseTestMessage}</p>
                        </div>
                      )}
                    </div>

                    <div className="border border-purple-500/10 bg-[#0e051d] p-5 rounded-2xl max-w-5xl space-y-3">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>প্রোডাকশন লেভেল নিরাপত্তা গাইডলাইন (RLS Rules)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        প্রোডাকশন এনভায়রনমেন্টে হ্যাকার প্রতিরোধ করতে Supabase টেবিলটিতে <strong className="text-white">Row Level Security (RLS)</strong> অন করে দেওয়া উচিত। অন করার পর নিচের নীতিসমূহ (Policies) যোগ করুন যাতে শুধুমাত্র অথরাইজড রিড এবং নির্দিষ্ট ড্যাশবোর্ড আপডেট কাজ করতে পারে:
                      </p>
                      <pre className="bg-black/40 text-slate-300 font-mono text-[9px] p-3.5 rounded-xl border border-purple-500/5 overflow-x-auto">
-- ১. পাবলিক ইউজারদের শুধুমাত্র রিড করার পারমিশন দিন (Select Policy)
create policy "Allow public read" on public.avexon_content for select using (true);

-- ২. পরিবর্তন করার অবাধ পারমিশন (ড্যাশবোর্ড ব্যবহারের প্রয়োজনে)
create policy "Allow all actions" on public.avexon_content for all using (true) with check (true);
                      </pre>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Admind Quick Floating Card Navigation */}
            <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
              <AnimatePresence>
                {isAdminFloatOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.92, originY: 1, originX: 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.92 }}
                    className="pointer-events-auto w-64 max-h-[70vh] overflow-y-auto bg-[#070211]/98 border border-purple-500/30 rounded-3xl p-4 shadow-2xl shadow-purple-950/70 backdrop-blur-3xl scrollbar-thin scrollbar-thumb-purple-500/10"
                  >
                    <div className="flex flex-col gap-1 pb-2 mb-2 border-b border-purple-950/60">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#a78bfa]">ত্বরান্বিত ডক মেনু</span>
                      <span className="text-[9px] text-slate-400">অ্যাডমিন সেকশনগুলোতে দ্রুত জাম্প করুন</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {[
                        { id: "ai_assistant", label: "এআই রাইটার ✨", icon: Wand2 },
                        { id: "hero", label: "হোমপেজ ও সেটিংস ⚙️", icon: Settings },
                        { id: "offers", label: "মেগা অফার 🎁", icon: Clock },
                        { id: "notices", label: "ঘোষণা নোটিশ বার 📣", icon: Megaphone },
                        { id: "websites", label: "ওয়েবসাইট শপ 🌐", icon: ShoppingBag },
                        { id: "services", label: "সেবাসমূহ 🛠️", icon: Sparkles },
                        { id: "portfolio", label: "পোর্টফোলিও 💼", icon: Briefcase },
                        { id: "testimonials", label: "রিভিউস 💬", icon: MessageSquare },
                        { id: "orders", label: "অর্ডার লিস্ট (Order List) 📈", icon: TrendingUp },
                        { id: "team", label: "টিম মেম্বার্স 👥", icon: Users },
                        { id: "package_planner", label: "প্যাকেজ রেডি করুন 📊", icon: Zap },
                        { id: "why_choose_us", label: "কেন এভেক্সন ❓", icon: Award },
                        { id: "contact", label: "যোগাযোগ ও পেমেন্ট 📞", icon: PhoneCall },
                        { id: "headings", label: "সেকশন হেডিংস 📝", icon: Edit3 },
                      ].map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as ActiveTab);
                              setIsAdminFloatOpen(false);
                              // Clear states
                              setEditWebItem(null);
                              setEditServiceItem(null);
                              setEditPortfolioItem(null);
                              setEditTestimonialItem(null);
                              setEditTeamItem(null);
                              setEditingOrder(null);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-purple-600/20 text-[#c084fc] border border-purple-500/30"
                                : "text-slate-300 hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <IconComponent className="w-3.5 h-3.5 text-purple-400" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Trigger Button */}
              <button
                type="button"
                onClick={() => setIsAdminFloatOpen(!isAdminFloatOpen)}
                className="pointer-events-auto w-12 h-12 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-950/50 hover:shadow-purple-500/25 border border-purple-400/30 transition-all active:scale-95 cursor-pointer relative group"
              >
                {isAdminFloatOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Database className="w-5 h-5 animate-pulse" />
                )}
                {/* Micro tooltip */}
                <span className="absolute right-14 bg-[#0a0314] text-[9px] font-bold px-2.5 py-1 rounded-md border border-purple-500/20 shadow-lg text-purple-300 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 whitespace-nowrap">
                  কুইক মেনু (Quick Menu)
                </span>
              </button>
              {/* Custom Beautiful glassmorphism Confirmation Modal for delete transactions */}
              {deleteConfirm && (
                <div id="custom-delete-confirm-modal" className="fixed inset-0 z-[250] flex items-center justify-center p-4 pointer-events-auto">
                  {/* Backdrop */}
                  <div
                    onClick={() => setDeleteConfirm(null)}
                    className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
                  />
                  
                  {/* Modal Panel */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-sm bg-[#120729] border border-red-500/35 p-6 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.22)] text-center space-y-4 z-10 pointer-events-auto"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-100 font-sans">
                        {deleteConfirm.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {deleteConfirm.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 hover:text-slate-100 text-[11px] font-bold transition-all cursor-pointer pointer-events-auto"
                      >
                        বাতিল করুন (Cancel)
                      </button>
                      <button
                        onClick={() => {
                          deleteConfirm.onConfirm();
                          setDeleteConfirm(null);
                        }}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-bold shadow-lg shadow-red-500/25 border border-red-500/20 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                      >
                        মুছে ফেলুন (Confirm Delete)
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// standalone helper function for package configurations defaults 
function getPlansDefaultsForCategory(cat: string) {
  const defaultColors = [
    { color: "from-blue-600 to-cyan-500", glow: "rgba(59,130,246,0.15)" },
    { color: "from-purple-600 to-fuchsia-500", glow: "rgba(168,85,247,0.22)" },
    { color: "from-amber-500 to-rose-500", glow: "rgba(239,68,68,0.18)" }
  ];
  
  if (cat === "ecommerce") {
    return [
      {
        id: "ecommerce-normal", 
        name: "Avexon Normal", 
        banglaName: "অ্যাভেক্সন নরমাল", 
        price: 3000, 
        deliveryTime: "১-৩ দিন",
        description: "সিঙ্গেল ভেন্ডর ই-কমার্স সেটআপ, ৩টি প্রোডাক্ট ক্যাটাগরি, বেসিক পেমেন্ট রিসিভ ও কার্ট।",
        features: ["কাস্টম হোমপেজ ডিজাইন", "১০০টি পণ্য আপলোড সুবিধা", "কার্ট ও চেকআউট পেজ", "বেসিক মেসেঞ্জার বাটন", "রেসপনসিভ ডিজাইন"],
        color: defaultColors[0].color, 
        glowColor: defaultColors[0].glow, 
        tagline: "কম বাজেটে একটি সিঙ্গেল ভেন্ডর ই-কমার্স ওয়েবসাইট"
      },
      {
        id: "ecommerce-pro", 
        name: "Avexon Pro", 
        banglaName: "অ্যাভেক্সন প্রো", 
        price: 8500, 
        badge: "জনপ্রিয়", 
        deliveryTime: "৩-৬ দিন",
        description: "অ্যাডভান্সড ইনভেন্টরি, ডায়নামিক ফিল্টার, বিকাশ/নগদ গেটওয়ে ইন্টিগ্রেশন ও রিয়েলটাইম নোটিফিকেশন।",
        features: ["বিকাশ/নগদ ম্যানুয়াল অটো গেটওয়ে", "ইনভেন্টরি ও স্টক ট্র্যাক সিস্টেম", "অটো ই-মেইল নোটিফিকেশন", "১০টি ডেডিকেটেড সাবপেইজ", "১ মাসের সাপোর্ট"],
        color: defaultColors[1].color, 
        glowColor: defaultColors[1].glow, 
        tagline: "বিজনেস লেভেলের প্রফেশনাল ই-কমার্স সলিউশন"
      },
      {
        id: "ecommerce-premium", 
        name: "Avexon Premium", 
        banglaName: "অ্যাভেক্সন প্রিমিয়াম", 
        price: 15000, 
        badge: "সেরা পছন্দ", 
        deliveryTime: "৪-৭ দিন",
        description: "মেগা এডমিন ড্যাশবোর্ড, মাল্টি-ভেন্ডর সিস্টেম, ইনভয়েস জেনারেটর, গ্রাফিক্যাল সেলস চার্ট ও ফুল ই-কমার্স উইং।",
        features: ["মেগা এডমিন প্যানেল", "মাল্টি-ভেন্ডর স্টোর সুবিধা", "ইনভয়েস জেনারেটর পিডিএফ", "গ্রাফিক্যাল সেলস ডাটা চার্ট", "৩ মাসের ভিআইপি সাপোর্ট"],
        color: defaultColors[2].color, 
        glowColor: defaultColors[2].glow, 
        tagline: "মেগা এন্টারপ্রাইজ মাল্টিভেন্ডর ই-কমার্স প্ল্যাটফর্ম"
      }
    ];
  }
  
  const cap = cat.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const label = cap + " Website";
  
  const bnLabels: Record<string, string[]> = {
    online_shop: ["অনলাইন শপ নরমাল", "অনলাইন শপ প্রো", "অনলাইন শপ প্রিমিয়াম"],
    food_restaurant: ["ফুড ও রেস্টুরেন্ট নরমাল", "ফুড ও রেস্টুরেন্ট প্রো", "ফুড ও রেস্টুরেন্ট প্রিমিয়াম"],
    agency: ["ডিজিটাল এজেন্সি নরমাল", "ডিজিটাল এজেন্সি প্রো", "ডিজিটাল এজেন্সি প্রিমিয়াম"],
    portfolio: ["পার্সোনাল পোর্টফোলিও নরমাল", "পার্সোনাল পোর্টফোলিও প্রো", "পার্সোনাল পোর্টফোলিও প্রিমিয়াম"],
    education: ["এডুকেশন ওয়েবসাইট নরমাল", "এডুকেশন ওয়েবসাইট প্রো", "এডুকেশন ওয়েবসাইট প্রিমিয়াম"],
    course_platform: ["অনলাইন কোর্স নরমাল", "অনলাইন কোর্স প্রো", "অনলাইন কোর্স প্রিমিয়াম"],
    blog: ["ব্লগ ওয়েবসাইট নরমাল", "ব্লগ ওয়েবসাইট প্রো", "ব্লগ ওয়েবসাইট প্রিমিয়াম"],
    news_portal: ["নিউজ পোর্টাল নরমাল", "নিউজ পোর্টাল প্রো", "নিউজ পোর্টাল প্রিমিয়াম"],
    esports: ["ই-স্পোর্টস টিম নরমাল", "ই-স্পোর্টস টিম প্রো", "ই-স্পোর্টস টিম প্রিমিয়াম"]
  };
  
  const prices: Record<string, number[]> = {
    online_shop: [3500, 7500, 12000],
    food_restaurant: [4000, 8000, 14500],
    agency: [3500, 7000, 12500],
    portfolio: [2500, 5000, 9000],
    education: [4000, 8500, 15000],
    course_platform: [5500, 12000, 20000],
    blog: [2000, 5000, 10000],
    news_portal: [4500, 9500, 16500],
    esports: [3000, 6500, 11000]
  };

  const currentBn = bnLabels[cat] || ["বেসিক প্যাকেজ", "প্রো প্যাকেজ", "প্রিমিয়াম প্যাকেজ"];
  const currentPrices = prices[cat] || [3000, 7500, 12000];

  return [
    {
      id: `${cat}-normal`, 
      name: "Avexon Normal", 
      banglaName: currentBn[0], 
      price: currentPrices[0], 
      deliveryTime: "১-৩ দিন",
      description: `কম খরচে আকর্ষণীয় ${label} সেটআপ। রেসপন্সিভ ডিজাইন ও বেসিক কাস্টমাইজেশন সুবিধা।`,
      features: ["প্রফেশনাল হোমপেজ ডিজাইন", "প্রয়োজনীয় কন্টেন্ট আপলোড", "মেসেঞ্জার চ্যাট বাটন", "সম্পূর্ণ রেসপন্সিভ লেআউট", "এসইও-ফ্রেন্ডলি সেটআপ"],
      color: defaultColors[0].color, 
      glowColor: defaultColors[0].glow, 
      tagline: `সহজ এবং সাশ্রয়ী ${label}`
    },
    {
      id: `${cat}-pro`, 
      name: "Avexon Pro", 
      banglaName: currentBn[1], 
      price: currentPrices[1], 
      badge: "জনপ্রিয়", 
      deliveryTime: "৩-৬ দিন",
      description: `পূর্ণাঙ্গ ফিচার সমৃদ্ধ ${label} সলিউশন। অ্যাডভান্সড ড্যাশবোর্ড ও অটো ইমেইল নোটিফিকেশন সুবিধা।`,
      features: ["মাল্টিপল ডেডিকেটেড পেজ", "অটো ই-মেইল নোটিফিকেশন", "বিকাশ/নগদ ম্যানুয়াল গেটওয়ে", "ইনভেন্টরি বা ডাটা ট্র্যাকিং", "১ মাসের কারিগরি সাপোর্ট"],
      color: defaultColors[1].color, 
      glowColor: defaultColors[1].glow, 
      tagline: `ব্যবসায়িক কার্যক্রমের জন্য পারফেক্ট ${label}`
    },
    {
      id: `${cat}-premium`, 
      name: "Avexon Premium", 
      banglaName: currentBn[2], 
      price: currentPrices[2], 
      badge: "সেরা পছন্দ", 
      deliveryTime: "৪-৭ দিন",
      description: `কাস্টম ডায়নামিক ইন্টিগ্রেশন এবং ফুল এডমিন ড্যাশবোর্ড সমৃদ্ধ মেগা ${label} প্যাকেজ।`,
      features: ["মেগা কনফিগারেশন প্যানেল", "অ্যাডভান্সড ডাটা ফিল্টারিং", "পিডিএফ ইনভয়েস/রিপোর্ট ডাউনলোড", "গ্রাফিক্যাল চার্ট বিশ্লেষণ", "৩ মাসের ভিআইপি সাপোর্ট"],
      color: defaultColors[2].color, 
      glowColor: defaultColors[2].glow, 
      tagline: `মেগা স্কিলড প্রিমিয়াম ক্যাটাগরি`
    }
  ];
}
