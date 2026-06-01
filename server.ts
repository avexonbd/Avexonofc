import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable large JSON body parsing to support passing the full current state
app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client server-side securely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API endpoint for AI content updates
app.post("/api/gemini/update", async (req, res): Promise<any> => {
  try {
    if (!ai) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is not configured on the server. Please add it in Settings > Secrets.",
      });
    }

    const { instruction, currentState } = req.body;

    if (!instruction || !currentState) {
      return res.status(400).json({
        success: false,
        error: "Missing instruction or currentState in request body.",
      });
    }

    const systemPrompt = `You are an expert full-stack web administrator for the Avexon Digital Agency platform.
Your task is to update or modify the website content based on the user's natural language request (instruction).
You will receive the 'currentState' which is the current content of the website. Your output MUST be the modified 'updatedSections' in the specified JSON structure.

Guidelines:
1. Understand the instruction (can be in Bengali, English, or mixed Banglish).
2. Spot which sections need to be updated. The fields can be:
   - 'hero': HomePage headline, subtitle, ctaText, whatsappNumber.
   - 'owner': Owner profile name, role, title, picUrl.
   - 'headerBranding': brandName, brandBadge, brandSubtitle, fontFamily, googleFontUrl, customFontUrl, subtitleFontFamily, subtitleCustomFontUrl, subtitleFontSize.
   - 'noticeConfig': notices array or show status, notice items have id, iconName (e.g. Megaphone, Sparkles, Flame, ShieldCheck, HeartHandshake, Clock), text, badge, and optional highlight text.
   - 'offerConfig': Mega banner configs. (show, badgeText, urgencyText, descriptionText, timerType: "midnight"|"custom_target", customTargetDate, discountActive: boolean, discountPercentage: number).
   - 'services': Services lists. (id, title, description, iconName (Lucide icon name like Globe, ShoppingCart, Figma, Server, Monitor, Shield), priceStarting, duration, techs: array of strings).
   - 'websites': Ready-made websites product catalog. (id, title, category, deliveryTime, price: number, originalPrice: number, rating: number, ordersCount: number, featuresCount: number, image: string, tags: array of strings, demoUrl: string).
   - 'portfolio': Past work portfolio. (id, title, category, description, imageUrl, client, year, tags: array of strings, demoUrl: string).
   - 'testimonials': Client reviews. (id, name, role, avatarUrl, text, rating: number 1-5, type: "custom"|"readymade").
   - 'team': Agency staff members. (id, name, role, imageUrl, skills: array of strings, bio).
   - 'contactConfig': officeAddress, helplineNumbers, officialEmails, supportHours, facebookUrl, twitterUrl, linkedinUrl, githubUrl, bkashNumber, nagadNumber.

3. Handling Collections (services, websites, portfolio, testimonials, team):
   - EDIT: Match by 'id' or search for a matching 'title' or 'name' of the item. Update fields within that item. Always preserve unchanged items in the array.
   - ADD: Construct a new object with a unique random ID (e.g. 'pkg-99' or auto-generate) and append it to the specific array. Make sure you set realistic/appropriate default fields for not-specified parameters.
   - DELETE: Remove the item matching the visual key or name from the array.

4. Formulate an elegant feedback message in Bengali explanatory text for the 'explanation' property.
5. If the request is unrelated or you can't satisfy it, keep current states unchanged but write details in 'explanation'.
`;

const userPrompt = `
Instruction: "${instruction}"

Current State (currentState):
${JSON.stringify(currentState, null, 2)}
`;

    // Make Gemini structured generation call
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1, // low temperature for precise updates
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["explanation"],
          properties: {
            updatedSections: {
              type: Type.OBJECT,
              description: "Only include sections we want to update. Exclude any unchanged section keys completely.",
              properties: {
                hero: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    ctaText: { type: Type.STRING },
                    whatsappNumber: { type: Type.STRING },
                  },
                },
                owner: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    title: { type: Type.STRING },
                    picUrl: { type: Type.STRING },
                  },
                },
                headerBranding: {
                  type: Type.OBJECT,
                  properties: {
                    brandName: { type: Type.STRING },
                    brandBadge: { type: Type.STRING },
                    brandSubtitle: { type: Type.STRING },
                    fontFamily: { type: Type.STRING },
                    googleFontUrl: { type: Type.STRING },
                    customFontUrl: { type: Type.STRING },
                    subtitleFontFamily: { type: Type.STRING },
                    subtitleCustomFontUrl: { type: Type.STRING },
                    subtitleFontSize: { type: Type.STRING },
                  },
                },
                noticeConfig: {
                  type: Type.OBJECT,
                  properties: {
                    show: { type: Type.BOOLEAN },
                    notices: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          iconName: { type: Type.STRING },
                          text: { type: Type.STRING },
                          badge: { type: Type.STRING },
                          highlight: { type: Type.STRING },
                        },
                      },
                    },
                  },
                },
                offerConfig: {
                  type: Type.OBJECT,
                  properties: {
                    show: { type: Type.BOOLEAN },
                    badgeText: { type: Type.STRING },
                    urgencyText: { type: Type.STRING },
                    descriptionText: { type: Type.STRING },
                    timerType: { type: Type.STRING, description: "Must be Either 'midnight' or 'custom_target'" },
                    customTargetDate: { type: Type.STRING },
                    discountActive: { type: Type.BOOLEAN },
                    discountPercentage: { type: Type.INTEGER },
                  },
                },
                services: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      iconName: { type: Type.STRING },
                      priceStarting: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      techs: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                },
                websites: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      category: { type: Type.STRING },
                      deliveryTime: { type: Type.STRING },
                      price: { type: Type.INTEGER },
                      originalPrice: { type: Type.INTEGER },
                      rating: { type: Type.NUMBER },
                      ordersCount: { type: Type.INTEGER },
                      featuresCount: { type: Type.INTEGER },
                      image: { type: Type.STRING },
                      tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      demoUrl: { type: Type.STRING },
                      features: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                },
                portfolio: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      category: { type: Type.STRING },
                      description: { type: Type.STRING },
                      imageUrl: { type: Type.STRING },
                      client: { type: Type.STRING },
                      year: { type: Type.STRING },
                      tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      demoUrl: { type: Type.STRING },
                    },
                  },
                },
                testimonials: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      avatarUrl: { type: Type.STRING },
                      text: { type: Type.STRING },
                      rating: { type: Type.INTEGER },
                      type: { type: Type.STRING },
                    },
                  },
                },
                team: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      imageUrl: { type: Type.STRING },
                      skills: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      bio: { type: Type.STRING },
                    },
                  },
                },
                contactConfig: {
                  type: Type.OBJECT,
                  properties: {
                    officeAddress: { type: Type.STRING },
                    helplineNumbers: { type: Type.STRING },
                    officialEmails: { type: Type.STRING },
                    supportHours: { type: Type.STRING },
                    facebookUrl: { type: Type.STRING },
                    twitterUrl: { type: Type.STRING },
                    linkedinUrl: { type: Type.STRING },
                    githubUrl: { type: Type.STRING },
                    bkashNumber: { type: Type.STRING },
                    nagadNumber: { type: Type.STRING },
                  },
                },
              },
            },
            explanation: {
              type: Type.STRING,
              description: "A friendly message in Bengali explaining what was changed and why.",
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    const parsedResult = JSON.parse(resultText);

    res.json({
      success: true,
      ...parsedResult,
    });
  } catch (error: any) {
    console.error("Error running Gemini Content Modifier AI:", error);
    
    let userMessage = error.message || "An error occurred while generating update parameters with Gemini API.";
    const errStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
    
    if (errStr.includes("leaked") || userMessage.includes("leaked")) {
      userMessage = "আপনার Gemini API Key-টি লিকেজ (leaked) হওয়ার কারণে Google কর্তৃক ব্লক করা হয়েছে। অনুগ্রহ করে নতুন একটি Gemini API Key সংগ্রহ করুন এবং AI Studio-র ডানদিকের গিয়ার (Settings) আইকন থেকে Secrets প্যানেলে গিয়ে 'GEMINI_API_KEY' কি-টি আপডেট করুন।";
    } else if (errStr.includes("PERMISSION_DENIED") || userMessage.includes("PERMISSION_DENIED")) {
      userMessage = "Gemini API অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে (Permission Denied)। অনুগ্রহ করে নিশ্চিত করুন যে Settings > Secrets-এ আপনার GEMINI_API_KEY ভ্যালুটি সঠিক ও সচল রয়েছে।";
    }
    
    res.status(500).json({
      success: false,
      error: userMessage,
    });
  }
});

// JSON File DB Database Paths
const CONTENT_DB_FILE = path.join(process.cwd(), "content_db.json");
const ORDERS_DB_FILE = path.join(process.cwd(), "orders_db.json");
const SUPABASE_CONFIG_FILE = path.join(process.cwd(), "src", "supabase_config.json");

// Intelligently instantiate a server-side Supabase client for cloud persistent sync
function getSupabaseClient() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    if (fs.existsSync(SUPABASE_CONFIG_FILE)) {
      try {
        const config = JSON.parse(fs.readFileSync(SUPABASE_CONFIG_FILE, "utf-8"));
        supabaseUrl = supabaseUrl || config.VITE_SUPABASE_URL || "";
        supabaseAnonKey = supabaseAnonKey || config.VITE_SUPABASE_ANON_KEY || "";
      } catch (e) {
        console.warn("Failed to parse src/supabase_config.json server-side:", e);
      }
    }
  }

  supabaseUrl = supabaseUrl.trim();
  supabaseAnonKey = supabaseAnonKey.trim();

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "YOUR_SUPABASE_URL_HERE" && supabaseUrl.length > 0) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });
  }
  return null;
}

// API to get content config from sever JSON file
app.get("/api/content", async (req, res) => {
  try {
    const dbClient = getSupabaseClient();
    if (dbClient) {
      const { data: dbData, error } = await dbClient
        .from("avexon_content")
        .select("*");

      if (!error && dbData && dbData.length > 0) {
        const dbMap: Record<string, any> = {};
        dbData.forEach((row: any) => {
          // Ignore the orders row for the regular content endpoint to keep it clean
          if (row.key !== "orders") {
            dbMap[row.key] = row.value;
          }
        });

        // Sync with local file storage backup
        try {
          fs.writeFileSync(CONTENT_DB_FILE, JSON.stringify(dbMap, null, 2), "utf-8");
        } catch (fsErr) {
          console.warn("Could not save backup copy of content data to filesystem:", fsErr);
        }

        return res.json({ success: true, data: dbMap });
      }
    }

    if (fs.existsSync(CONTENT_DB_FILE)) {
      const fileData = fs.readFileSync(CONTENT_DB_FILE, "utf-8");
      res.json({ success: true, data: JSON.parse(fileData) });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err: any) {
    console.error("Error reading content database:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to save content config to server JSON file with shallow merging of individual fields
app.post("/api/content", async (req, res) => {
  try {
    const incomingData = req.body;
    let currentData = {};

    if (fs.existsSync(CONTENT_DB_FILE)) {
      try {
        currentData = JSON.parse(fs.readFileSync(CONTENT_DB_FILE, "utf-8"));
      } catch (e) {
        currentData = {};
      }
    }

    const mergedContent = { ...currentData, ...incomingData };
    fs.writeFileSync(CONTENT_DB_FILE, JSON.stringify(mergedContent, null, 2), "utf-8");

    // Push to Supabase if configured for cloud fallback
    const dbClient = getSupabaseClient();
    if (dbClient && typeof incomingData === "object" && incomingData !== null) {
      const upsertPromises = Object.entries(incomingData).map(([key, value]) => {
        // Skip orders payload in generic content updater
        if (key !== "orders" && value !== undefined) {
          return dbClient.from("avexon_content").upsert({ key, value });
        }
        return Promise.resolve();
      });
      await Promise.all(upsertPromises);
    }

    res.json({ success: true, message: "Content updated successfully on the server!" });
  } catch (err: any) {
    console.error("Error writing content database:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to save manual Supabase credentials to src/supabase_config.json
app.post("/api/supabase-config", (req, res) => {
  try {
    const { url, anonKey } = req.body;
    const config = {
      VITE_SUPABASE_URL: url || "",
      VITE_SUPABASE_ANON_KEY: anonKey || ""
    };
    fs.writeFileSync(SUPABASE_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    res.json({ success: true, message: "Supabase config written to workspace successfully!" });
  } catch (err: any) {
    console.error("Error writing supabase config:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to get all customer orders
app.get("/api/orders", async (req, res) => {
  try {
    const dbClient = getSupabaseClient();
    if (dbClient) {
      try {
        // Set a strict 1500ms timeout for Supabase query to prevent blocking if cloud is down or slow
        const selectPromise = dbClient.from("avexon_orders").select("*");
        const result = await Promise.race([
          selectPromise,
          new Promise<{ data: null; error: any }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error("Supabase query timeout") }), 1500)
          )
        ]);

        const { data: orderRows, error: orderTableError } = result;

        if (!orderTableError && orderRows) {
          const ordersList = orderRows.map((row: any) => row.value || row);
          
          // Save backup copy locally
          try {
            fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(ordersList, null, 2), "utf-8");
          } catch (fsErr) {
            console.warn("Could not save backup copy of orders data to filesystem:", fsErr);
          }
          return res.json({ success: true, data: ordersList });
        } else {
          // Fallback to legacy avexon_content "orders" key row with strict 1500ms timeout
          const legacyPromise = dbClient.from("avexon_content").select("value").eq("key", "orders").single();
          const legacyResult = await Promise.race([
            legacyPromise,
            new Promise<{ data: null; error: any }>((resolve) =>
              setTimeout(() => resolve({ data: null, error: new Error("Supabase query fallback timeout") }), 1500)
            )
          ]);

          const { data: legacyData, error: legacyError } = legacyResult;

          if (!legacyError && legacyData && Array.isArray(legacyData.value)) {
            const ordersList = legacyData.value;
            
            // Seed the flat orders table in background silently
            for (const order of ordersList) {
              (async () => {
                try {
                  await dbClient.from("avexon_orders").upsert({ id: order.id, value: order });
                } catch (e) {
                  // backup fail silent
                }
              })();
            }

            // Save backup to disk
            try {
              fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(ordersList, null, 2), "utf-8");
            } catch (fsErr) {
              console.warn("Could not save backup copy of orders data to filesystem:", fsErr);
            }
            return res.json({ success: true, data: ordersList });
          }
        }
      } catch (err) {
        console.warn("Supabase query handling timed out or failed. Falling back to local filesystem storage:", err);
      }
    }

    // Default fast local filesystem fallback if Supabase is offline or not configured
    if (fs.existsSync(ORDERS_DB_FILE)) {
      const fileData = fs.readFileSync(ORDERS_DB_FILE, "utf-8");
      try {
        res.json({ success: true, data: JSON.parse(fileData) });
      } catch (parseErr) {
        console.error("Local file orders_db.json is corrupted:", parseErr);
        res.json({ success: true, data: [] });
      }
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (err: any) {
    console.error("Error reading orders database:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to add or update an order in server JSON file and cloud table (Non-blocking background cloud sync)
app.post("/api/orders", async (req, res) => {
  try {
    const incomingOrder = req.body;
    let ordersList = [];

    if (fs.existsSync(ORDERS_DB_FILE)) {
      try {
        const fileData = fs.readFileSync(ORDERS_DB_FILE, "utf-8");
        ordersList = JSON.parse(fileData);
      } catch (err) {
        ordersList = [];
      }
    }

    const existingIndex = ordersList.findIndex((o: any) => o.id === incomingOrder.id);
    if (existingIndex !== -1) {
      ordersList[existingIndex] = { ...ordersList[existingIndex], ...incomingOrder };
    } else {
      ordersList.unshift(incomingOrder); // Add brand new orders to the very top
    }

    // Write copy locally to disk - super fast, done in < 1ms
    fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(ordersList, null, 2), "utf-8");

    // Immediately respond to the client so user interface doesn't lag
    res.json({ success: true, data: ordersList });

    // Perform Supabase cloud storage syncing asynchronously in background
    const dbClient = getSupabaseClient();
    if (dbClient) {
      (async () => {
        try {
          // 1. Try upserting to flat avexon_orders table
          const { error: flatError } = await dbClient
            .from("avexon_orders")
            .upsert({ id: incomingOrder.id, value: incomingOrder });

          if (flatError) {
            console.warn("Flat order upsert failed in background:", flatError.message);
          }

          // 2. Keep legacy 'orders' key row in sync as fallback
          await dbClient
            .from("avexon_content")
            .upsert({ key: "orders", value: ordersList });
        } catch (dbErr) {
          console.error("Error persisting orders to server-side Supabase in background:", dbErr);
        }
      })();
    }
  } catch (err: any) {
    console.error("Error writing orders database:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// API to delete an order from server JSON file (Non-blocking background cloud delete)
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    let ordersList = [];

    if (fs.existsSync(ORDERS_DB_FILE)) {
      try {
        const fileData = fs.readFileSync(ORDERS_DB_FILE, "utf-8");
        ordersList = JSON.parse(fileData);
      } catch (err) {
        ordersList = [];
      }
    }

    ordersList = ordersList.filter((o: any) => o.id !== orderId);
    fs.writeFileSync(ORDERS_DB_FILE, JSON.stringify(ordersList, null, 2), "utf-8");

    // Immediately respond to client to refresh active admin list
    res.json({ success: true, data: ordersList });

    // Perform background cloud deletion
    const dbClient = getSupabaseClient();
    if (dbClient) {
      (async () => {
        try {
          // 1. Delete from flat avexon_orders table
          await dbClient.from("avexon_orders").delete().eq("id", orderId);

          // 2. Sync legacy copy in avexon_content
          await dbClient.from("avexon_content").upsert({ key: "orders", value: ordersList });
        } catch (dbErr) {
          console.error("Error persisting deleted orders state to server-side Supabase in background:", dbErr);
        }
      })();
    }
  } catch (err: any) {
    console.error("Error deleting order:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
});

// Secure API to verify admin passcode without exposing it to the front-end code inspectors
app.post("/api/verify-passcode", (req, res) => {
  try {
    const { passcode } = req.body;
    if (passcode === "Tasumu@2021" || passcode === "avexon2026") {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "ভুল পাসকোড! অনুগ্রহ করে আবার চেষ্টা করুন।" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup development dev-server or production asset handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build configuration loaded.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://localhost:${PORT}`);
  });
}

startServer();
