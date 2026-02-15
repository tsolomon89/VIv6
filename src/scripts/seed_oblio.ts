
import { db } from '../core/db.js';
import { randomUUID } from 'crypto';

// 1. OBLIO BRAND CONFIG
const oblioBrandConfig = {
    theme: {
        colors: {
            background: "#FDFCF8", // Cream
            primary: "#1E1C24",    // Navy
            secondary: "#ff2a13",  // Coral
            accent: "#FBB03B",     // Gold
            surface: "#FFFFFF",
            text: "#1E1C24"
        },
        typography: {
            fontFamily: "Inter, sans-serif",
            headings: "font-black tracking-tighter uppercase"
        }
    },
    gtmId: "GTM-OBLIO-DEV", // Placeholder
    customScripts: []
};

// 2. SECTION TEMPLATES

// Features (Grid of 4 cards)
const featuresTemplate = {
    key: "oblio-features",
    name: "Oblio Features",
    description: "4-column grid with rotation effects",
    binding_kind: "static", 
    config: {
        type: "section",
        layout: "grid", // We might need to ensure 'grid' layout is supported or use 'flex'
        className: "bg-white text-oblio-navy py-20",
        pinHeight: 1500, // For scroll effects
        children: [
             // Title Group
            {
                type: "group",
                className: "text-center mb-16",
                children: [
                    { type: "text", content: "Features", className: "text-sm md:text-base font-bold tracking-[0.3em] text-[#ff2a13] uppercase block mb-4" },
                    { type: "text", content: "THE OBLIO ADVANTAGE", className: "text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1E1C24] leading-[0.9]" }
                ]
            },
            // Cards Container
            {
                type: "list",
                direction: "row",
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 container mx-auto px-4",
                children: [
                    // Card 1
                    {
                        type: "card",
                        className: "bg-[#1E1C24] text-white p-8 rounded-2xl min-h-[300px] flex flex-col justify-end transform -rotate-3 hover:rotate-0 transition-transform duration-500",
                        children: [
                            { type: "text", content: "Identity", className: "text-3xl font-black uppercase mb-4" },
                            { type: "text", content: "Unified player profiles that travel across the entire network.", className: "opacity-80 font-medium" }
                        ]
                    },
                    // Card 2
                    {
                        type: "card",
                        className: "bg-[#ff2a13] text-white p-8 rounded-2xl min-h-[300px] flex flex-col justify-end transform rotate-3 hover:rotate-0 transition-transform duration-500",
                        children: [
                            { type: "text", content: "Payments", className: "text-3xl font-black uppercase mb-4" },
                            { type: "text", content: "Seamless fiat-to-crypto onramps and instant settlement.", className: "opacity-80 font-medium" }
                        ]
                    },
                    // Card 3
                    {
                        type: "card",
                        className: "bg-[#7C4DFF] text-white p-8 rounded-2xl min-h-[300px] flex flex-col justify-end transform -rotate-2 hover:rotate-0 transition-transform duration-500",
                        children: [
                            { type: "text", content: "Engagement", className: "text-3xl font-black uppercase mb-4" },
                            { type: "text", content: "Deep loyalty tools to retain and reward power users.", className: "opacity-80 font-medium" }
                        ]
                    },
                    // Card 4
                    {
                        type: "card",
                        className: "bg-[#FBB03B] text-black p-8 rounded-2xl min-h-[300px] flex flex-col justify-end transform rotate-2 hover:rotate-0 transition-transform duration-500",
                        children: [
                            { type: "text", content: "Growth", className: "text-3xl font-black uppercase mb-4" },
                            { type: "text", content: "Data-driven analytics to scale your economy.", className: "font-medium" }
                        ]
                    }
                ]
            }
        ]
    }
};

// Hero (Simplified for V1 - Focused on Typography and 3D)
const heroTemplate = {
    key: "oblio-hero",
    name: "Oblio Hero",
    description: "Big typography with 3D prism background",
    binding_kind: "static",
    config: {
        type: "section",
        className: "relative h-screen bg-[#FDFCF8] flex items-center justify-center overflow-hidden",
        pinHeight: 2000,
        children: [
            // Background Scene
            {
                type: "group",
                className: "absolute inset-0 pointer-events-none z-0",
                children: [
                    {
                        type: "prism",
                        shape: "box",
                        color: "#1E1C24",
                        position: { x: -3, y: 2 },
                        scale: 1,
                        animation: "rotate"
                    },
                     {
                        type: "prism",
                        shape: "sphere",
                        color: "#ff2a13",
                        position: { x: 3.5, y: -1 },
                        scale: 0.6,
                        animation: "hover"
                    }
                ]
            },
            // Foreground Text
            {
                type: "group",
                className: "relative z-10 text-center flex flex-col items-center",
                children: [
                     { type: "text", content: "GIVE", className: "text-[10rem] font-black tracking-tighter uppercase leading-[0.85] text-[#1E1C24]" },
                     { type: "text", content: "DATA A", className: "text-[10rem] font-black tracking-tighter uppercase leading-[0.85] text-[#1E1C24]" },
                     { 
                         type: "group", 
                         className: "flex items-center gap-4 text-[10rem] font-black tracking-tighter uppercase leading-[0.85] text-[#1E1C24]",
                         children: [
                             { type: "text", content: "POINT" },
                             // The 'Dot'
                             { type: "div", className: "w-[0.55em] h-[0.55em] rounded-full bg-gradient-to-br from-[#F5A623] to-[#C43D2F] shadow-lg" },
                             { type: "text", content: "!" }
                         ]
                     }
                ]
            }
        ]
    }
};

// Products (Interactive 3D Cards)
const productsTemplate = {
    key: "oblio-products",
    name: "Oblio Products",
    description: "3D Interactive Cards - Play, Win, Earn",
    binding_kind: "static",
    config: {
        type: "section",
        className: "bg-black py-32 z-20 relative text-white",
        pinHeight: 1200,
        children: [
            // Header
            {
                type: "group",
                className: "mb-20 text-center",
                children: [
                    { type: "text", content: "Product", className: "text-blue-500 font-mono tracking-[0.2em] text-sm mb-4 block animate-pulse uppercase" },
                     { type: "text", content: "PLAY. WIN. EARN.", className: "text-5xl md:text-8xl font-black text-white uppercase tracking-tighter" }
                ]
            },
            // 3D Cards Grid
            {
                type: "list",
                direction: "row",
                className: "grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-4",
                children: [
                    { type: "card3d", title: "Play", subtitle: "BUILD YOUR KINGDOM", color: "#FF4500", shape: "Box" },
                    { type: "card3d", title: "Win", subtitle: "CRUSH YOUR OPPONENTS", color: "#FFD700", shape: "Torus" },
                    { type: "card3d", title: "Earn", subtitle: "REAL REWARDS", color: "#00BFFF", shape: "Sphere" }
                ] 
            },
            // CTA
             {
                type: "div",
                className: "flex justify-center mt-20",
                children: [
                    { type: "button", content: "Create Your INK ID", className: "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold uppercase tracking-widest rounded-full px-8 py-3 transition-all" }
                ]
            }
        ]
    }
};

// News (List)
const newsTemplate = {
    key: "oblio-news",
    name: "Oblio News",
    description: "News list with hover effects",
    binding_kind: "static",
    config: {
        type: "section",
        className: "bg-black text-white z-20 relative py-20",
        children: [
            {
                type: "grid",
                className: "grid grid-cols-1 lg:grid-cols-12 gap-12 container mx-auto px-4",
                children: [
                    // Col 1: Title
                     {
                        type: "div",
                        className: "lg:col-span-4",
                        children: [
                            { type: "text", content: "Updates", className: "text-blue-500 font-mono tracking-[0.2em] text-sm mb-4 block uppercase" },
                            { type: "text", content: "LATEST FROM INK GAMES", className: "text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none" }
                        ]
                    },
                    // Col 2: List (Using standard 'div' stack instead of custom newsItem)
                    {
                        type: "div",
                        className: "lg:col-span-8 flex flex-col",
                        children: [
                             createNewsItem("UPDATES", "Jan 12 2026", "INK Games Launches New Tournament System"),
                             createNewsItem("COMMUNITY", "Jan 10 2026", "Prize Kingdoms hits 1 Million Players"),
                             createNewsItem("DEV DIARY", "Jan 05 2026", "Behind the Architecture of INK 2.0"),
                             createNewsItem("EVENTS", "Dec 25 2025", "Holiday Rewards Bonanza Live Now")
                        ]
                    }
                ]
            }
        ]
    }
};

// Helper for Universal News Item
function createNewsItem(category: string, date: string, title: string) {
    return {
        type: "div",
        className: "group border-t border-white/10 py-8 flex flex-col md:flex-row gap-4 md:items-center justify-between hover:bg-white/5 transition-colors cursor-pointer px-4",
        children: [
            {
                type: "div",
                className: "flex flex-col gap-2",
                children: [
                    { 
                        type: "div", 
                        className: "flex gap-4 text-xs font-mono text-gray-400",
                        children: [
                            { type: "text", content: category, className: "text-blue-400" },
                            { type: "text", content: date }
                        ]
                    },
                    { type: "text", content: title, className: "text-xl md:text-2xl font-bold uppercase text-white" }
                ]
            },
            {
                type: "div",
                className: "opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2 text-white",
                children: [ { type: "text", content: "→" } ]
            }
        ]
    };
}

// Helper for Footer Col
function createFooterCol(title: string, links: string[]) {
    return {
        type: "div",
        className: "flex flex-col gap-6",
        children: [
            { type: "text", content: title, className: "font-bold tracking-widest text-sm uppercase text-gray-400" },
            {
                type: "div", // Stack container
                className: "flex flex-col gap-4",
                children: links.map(link => ({
                    type: "text",
                    content: link,
                    className: "font-bold text-lg hover:text-blue-500 cursor-pointer transition-colors text-black"
                }))
            }
        ]
    };
}

// Use Case (Split Section with 3D token animation)
// ... (Keep existing Use Case) ...
const useCaseTemplate = {
    key: "oblio-usecase",
    name: "Oblio Use Case",
    description: "Split section with scrolling 3D token scatter",
    binding_kind: "static",
    config: {
        type: "section",
        className: "relative w-full overflow-hidden bg-white z-30 min-h-screen flex items-center",
        pinHeight: 1500,
        children: [
             {
                 type: "split",
                 layout: "text-visual",
                 className: "container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full",
                 children: [
                     // Text Side
                     {
                         type: "div",
                         className: "flex flex-col justify-center",
                         children: [
                             { 
                                 type: "group", 
                                 className: "flex items-center gap-2 mb-4",
                                 children: [
                                     { type: "div", className: "w-2 h-2 bg-[#ff2a13]" },
                                     { type: "text", content: "Use Case", className: "text-sm font-bold tracking-[0.04em] text-[#ff2a13] uppercase" }
                                 ] 
                             },
                             { type: "text", content: "REAL WORLD VALUE.", className: "text-[#1E1C24] text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight mb-8" },
                             { type: "text", content: "Bridge the gap between digital engagement and physical commerce. The Oblio Network enables seamless value transfer for next-gen applications.", className: "text-gray-600 font-medium text-lg leading-relaxed max-w-md mb-8" },
                             { type: "button", content: "Start Building", className: "px-8 py-3 rounded-full border border-[#1E1C24]/20 hover:bg-[#1E1C24] hover:text-white transition-all duration-300 font-bold uppercase tracking-widest text-sm w-max" }
                         ]
                     },
                     // Visual Side
                     {
                         type: "scene",
                         sceneName: "oblio-token-scatter", 
                         className: "w-full h-full min-h-[500px]"
                     }
                 ]
             }
        ]
    }
};

// Footer
const footerTemplate = {
    key: "oblio-footer",
    name: "Oblio Footer",
    description: "Standard multi-column footer",
    binding_kind: "static",
    config: {
        type: "section",
        className: "w-full bg-white text-black py-20 px-4 mt-auto border-t",
        children: [
            {
                type: "grid",
                className: "container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20",
                children: [
                    createFooterCol("INKGAMES", ["Games", "INK HQ", "Support", "Invest", "INK ID"]),
                    createFooterCol("FOLLOW", ["Instagram", "X (Twitter)", "TikTok", "LinkedIn"]),
                    createFooterCol("CONTACT", ["Info", "Support", "Invest", "HQ"]),
                     { 
                         type: "div", 
                         className: "flex flex-col gap-2 text-gray-400 font-bold",
                         children: [
                             { type: "text", content: "© 2026 OBLIO" },
                             { type: "text", content: "Local Test Environment" }
                         ]
                     }
                ]
            }
        ]
    }
};

// 3. PAGE TEMPLATE (HOME)
const homePageTemplate = {
    key: "oblio-home",
    name: "Oblio Home",
    subject_target: "brand",
    subject_cardinality: "one",
    sections: [
        { ...heroTemplate.config, id: "hero-1" },
        { ...featuresTemplate.config, id: "features-1" },
        { ...productsTemplate.config, id: "products-1" },
        { ...newsTemplate.config, id: "news-1" },
        { ...useCaseTemplate.config, id: "usecase-1" },
        { ...footerTemplate.config, id: "footer-1" }
    ]
};

// EXECUTE SEEDING
const run = () => {
    console.log("🌱 Seeding Oblio Brand Data...");
    
    // 1. Brand Config
    const existingBrand = db.prepare("SELECT id FROM brand_config WHERE key = 'oblio'").get();
    if (existingBrand) {
        db.prepare("UPDATE brand_config SET data = ?, updated_at = ? WHERE key = 'oblio'").run(JSON.stringify(oblioBrandConfig), new Date().toISOString());
    } else {
        db.prepare("INSERT INTO brand_config (id, key, data) VALUES (?, ?, ?)").run(randomUUID(), 'oblio', JSON.stringify(oblioBrandConfig));
    }
    console.log("✅ Brand Config Updated");

    // 2. Section Templates
    const tpls = [heroTemplate, featuresTemplate, productsTemplate, newsTemplate, useCaseTemplate, footerTemplate];
    for (const tpl of tpls) {
         db.prepare(`
            INSERT INTO section_templates (id, key, name, description, binding_kind, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET config = excluded.config, updated_at = CURRENT_TIMESTAMP
        `).run(randomUUID(), tpl.key, tpl.name, tpl.description, tpl.binding_kind, JSON.stringify(tpl.config));
    }
    console.log("✅ Section Templates Updated");

    // 3. Page Template
    db.prepare(`
        INSERT INTO page_templates (id, key, name, subject_target, subject_cardinality, sections, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET sections = excluded.sections, updated_at = CURRENT_TIMESTAMP
    `).run(randomUUID(), homePageTemplate.key, homePageTemplate.name, homePageTemplate.subject_target, homePageTemplate.subject_cardinality, JSON.stringify(homePageTemplate.sections));
    console.log("✅ Page Template Updated");
    
    // 4. Update 'oblio' entity to use this page template? 
    // Usually build process picks by type. 'brand' entity -> 'oblio-home'? 
    // For now, we manually ensure the 'oblio' entity exists.
    
    const entity = db.prepare("SELECT id FROM records WHERE slug = 'oblio'").get();
    if (!entity) {
        db.prepare("INSERT INTO records (id, type, slug, name, account_id) VALUES (?, ?, ?, ?, ?)").run(randomUUID(), 'brand', 'oblio', 'Oblio', 'oblio');
        console.log("✅ Created 'oblio' record");
    }
};

run();
