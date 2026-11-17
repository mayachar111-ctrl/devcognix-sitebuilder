# Authoring helper for the starter templates. Output: lib/templates/*.json
import json, os
def u(i, w=1600, h=None):
    return f"https://images.unsplash.com/photo-{i}?w={w}" + (f"&h={h}" if h else "") + "&q=75&auto=format&fit=crop"
def L(label, href): return {"label": label, "href": href}
def I(src, alt): return {"src": src, "alt": alt}
OUT = "lib/templates"

# ---------------------------------------------------------------- SaaS
ledger_nav = {"id": "navbar-1", "type": "navbar", "props": {"brand": "Ledgerline", "links": [L("Product", "#features"), L("Pricing", "#pricing"), L("Customers", "#testimonials"), L("Blog", "/blog")], "cta": L("Start free", "#pricing"), "sticky": True}}
ledger_footer = {"id": "footer-1", "type": "footer", "props": {"brand": "Ledgerline", "tagline": "GST-ready invoicing and cash-flow clarity for India's small teams.", "columns": [
    {"title": "Product", "links": [L("Invoicing", "#features"), L("Payment links", "#features"), L("Reports", "#features"), L("Pricing", "#pricing")]},
    {"title": "Company", "links": [L("About", "#"), L("Careers", "#"), L("Blog", "/blog")]},
    {"title": "Support", "links": [L("Help centre", "#"), L("Status", "#"), L("Contact", "#")]}],
    "socials": [{"platform": "linkedin", "href": "#"}, {"platform": "x", "href": "#"}, {"platform": "youtube", "href": "#"}],
    "copyright": "© 2026 Ledgerline Technologies Pvt. Ltd."}}
saas = {
  "name": "Ledgerline", "description": "GST-ready invoicing, payment links and cash-flow forecasts for small businesses.",
  "theme": {"palette": {"primary": "#5048E5", "accent": "#10B6A0", "background": "#FBFBFE", "surface": "#F2F2FA", "text": "#12122A", "muted": "#5D5E78", "border": "#E3E3F0"}, "fontPair": "geometric", "radius": "lg", "style": "soft"},
  "pages": [
    {"slug": "home", "title": "Ledgerline — invoicing that gets you paid faster", "sections": [
      ledger_nav,
      {"id": "hero-1", "type": "hero-gradient", "props": {"badge": "New: UPI AutoPay reminders", "headline": "Send GST invoices in seconds and", "highlight": "get paid twice as fast", "subheadline": "Ledgerline turns invoices, payment links and follow-ups into one calm workflow — so you spend Fridays growing, not chasing payments.", "primaryCta": L("Start free — no card", "#pricing"), "secondaryCta": L("See a 2-min tour", "#video"), "note": "Free for your first 20 invoices every month"}},
      {"id": "logos-1", "type": "logo-strip", "props": {"title": "Running the books at 4,000+ growing businesses", "logos": ["Chaiwala Co.", "Tessera Labs", "Indigo Threads", "Kiranakart", "Monsoon Media", "Pivotal Freight", "Saffron Studio"], "marquee": True}},
      {"id": "features-1", "type": "features-grid", "props": {"eyebrow": "Why Ledgerline", "title": "The money side of your business, finally sorted", "subtitle": "Everything a 2–50 person team needs to bill, collect and plan — without hiring an accountant on day one.", "columns": 3, "items": [
        {"icon": "bolt", "title": "Invoices in 30 seconds", "description": "Auto-filled GSTIN, HSN codes and tax splits. Send by email or WhatsApp."},
        {"icon": "wallet", "title": "Payment links built in", "description": "Every invoice carries a UPI, card and net-banking link. Money lands faster."},
        {"icon": "clock", "title": "Polite auto follow-ups", "description": "Friendly reminders go out on your schedule, so you never have to nag."},
        {"icon": "chart", "title": "Cash-flow forecast", "description": "See the next 90 days of money in and out, updated every morning."},
        {"icon": "shield", "title": "Audit-ready records", "description": "GSTR-1 exports and a clean trail your CA will thank you for."},
        {"icon": "users", "title": "Made for teams", "description": "Roles for founders, sales and finance — with approvals where it matters."}]}},
      {"id": "rows-1", "type": "feature-rows", "props": {"eyebrow": "How teams use it", "title": "From quote to cash, in one place", "subtitle": "", "rows": [
        {"title": "Quote, convert, invoice", "description": "Turn an approved estimate into a tax invoice with one click. Line items, discounts and terms carry over.", "bullets": ["Branded templates", "Multi-currency for exports", "Recurring invoices"], "image": I(u("1460925895917-afdab827c52f", 1200, 900), "Analytics dashboard on a laptop")},
        {"title": "Know who owes what", "description": "An ageing view shows overdue invoices at a glance, ranked by amount and risk.", "bullets": ["Smart reminder timing", "Partial payments", "Customer statements"], "image": I(u("1551434678-e076c223a692", 1200, 900), "Team reviewing numbers together")},
        {"title": "Plan the next quarter", "description": "Forecast cash with real invoices and expected expenses, then test what-if scenarios.", "bullets": ["90-day runway view", "Expense categories", "Export to Excel"], "image": I(u("1531297484001-80022131f5a1", 1200, 900), "Laptop on a desk at night")}]}},
      {"id": "stats-1", "type": "stats", "props": {"title": "", "tinted": True, "items": [
        {"value": 4000, "prefix": "", "suffix": "+", "label": "Businesses"}, {"value": 2.1, "prefix": "", "suffix": "×", "label": "Faster payments"},
        {"value": 850, "prefix": "₹", "suffix": " Cr", "label": "Invoiced yearly"}, {"value": 4.8, "prefix": "", "suffix": "/5", "label": "Average rating"}]}},
      {"id": "video-1", "type": "video", "props": {"eyebrow": "Product tour", "title": "See a month of billing in two minutes", "subtitle": "", "poster": I(u("1556761175-5973dc0f32e7", 1800, 1000), "Team meeting around a table"), "caption": "Demo video placeholder — swap in your own embed URL."}},
      {"id": "testimonials-1", "type": "testimonials", "props": {"eyebrow": "Customers", "title": "Teams that stopped chasing payments", "subtitle": "", "items": [
        {"quote": "Our average collection time dropped from 41 days to 18. The reminders do the awkward part for us.", "name": "Priya Nair", "role": "Co-founder, Monsoon Media", "avatar": u("1494790108377-be9c29b29330", 160, 160), "rating": 5},
        {"quote": "Filing GSTR-1 used to eat a weekend. Now my CA just downloads the export.", "name": "Rohan Desai", "role": "Owner, Pivotal Freight", "avatar": u("1507003211169-0a1dd7228f2d", 160, 160), "rating": 5},
        {"quote": "The cash-flow view is the first thing I open every morning. It changed how we hire.", "name": "Fatima Sheikh", "role": "CEO, Tessera Labs", "avatar": u("1580489944761-15a19d654956", 160, 160), "rating": 5},
        {"quote": "Clients pay from the WhatsApp link before I've even hung up the call.", "name": "Vikram Iyer", "role": "Freelance designer", "avatar": u("1500648767791-00dcc994a43e", 160, 160), "rating": 4},
        {"quote": "Switched from spreadsheets in an afternoon. Support answered every question within minutes.", "name": "Ananya Rao", "role": "Ops lead, Indigo Threads", "avatar": u("1438761681033-6461ffad8d80", 160, 160), "rating": 5}]}},
      {"id": "pricing-1", "type": "pricing", "props": {"eyebrow": "Pricing", "title": "Fair pricing, in rupees", "subtitle": "All plans include unlimited customers and GST-compliant invoices.", "currency": "₹", "billingToggle": True, "yearlyNote": "2 months free", "plans": [
        {"name": "Solo", "priceMonthly": 0, "priceYearly": 0, "period": "/month", "description": "Freelancers getting started.", "features": ["20 invoices / month", "UPI payment links", "Email reminders"], "cta": L("Start free", "#"), "highlighted": False},
        {"name": "Growth", "priceMonthly": 799, "priceYearly": 666, "period": "/month", "description": "Small teams that bill weekly.", "features": ["Unlimited invoices", "WhatsApp delivery", "Cash-flow forecast", "3 team seats", "GSTR-1 export"], "cta": L("Try Growth free", "#"), "highlighted": True},
        {"name": "Scale", "priceMonthly": 2499, "priceYearly": 2083, "period": "/month", "description": "Finance teams and multi-branch.", "features": ["Everything in Growth", "Approvals & roles", "Multi-GSTIN", "Priority support"], "cta": L("Talk to us", "#"), "highlighted": False}]}},
      {"id": "faq-1", "type": "faq", "props": {"eyebrow": "FAQ", "title": "Good questions", "subtitle": "Still curious? Our team replies on chat within minutes, 9am–9pm IST.", "items": [
        {"question": "Is Ledgerline GST compliant?", "answer": "Yes. Invoices include GSTIN, HSN/SAC codes and CGST/SGST/IGST splits, and you can export GSTR-1 ready data."},
        {"question": "Do you charge a fee on payments?", "answer": "Payment-gateway fees are passed through at cost. Ledgerline itself adds nothing on top."},
        {"question": "Can I import my existing customers?", "answer": "Upload a CSV or connect your Tally export — most teams are set up in under 15 minutes."},
        {"question": "What happens if I cancel?", "answer": "You keep read-only access to every invoice and can export all your data anytime."}]}},
      {"id": "cta-1", "type": "cta-banner", "props": {"title": "Your next invoice could be paid by tonight", "subtitle": "Start free in two minutes. Upgrade only when Ledgerline is paying for itself.", "primaryCta": L("Create free account", "#pricing"), "secondaryCta": L("Book a demo", "#"), "variant": "gradient"}},
      ledger_footer]},
    {"slug": "blog", "title": "Ledgerline Blog", "sections": [
      ledger_nav,
      {"id": "blog-1", "type": "blog-cards", "props": {"eyebrow": "Blog", "title": "Notes on getting paid", "subtitle": "Practical guides for founders and finance teams.", "posts": [
        {"title": "A plain-English guide to GST invoices", "excerpt": "What must be on every invoice, and the mistakes that trigger notices.", "image": I(u("1554224155-6726b3ff858f", 900, 600), "Calculator and paperwork"), "category": "Guides", "date": "04 Nov 2026", "href": "#"},
        {"title": "The reminder schedule that halves late payments", "excerpt": "We studied 200,000 invoices to find the timing that works.", "image": I(u("1497215728101-856f4ea42174", 900, 600), "Bright office window"), "category": "Research", "date": "22 Oct 2026", "href": "#"},
        {"title": "Forecasting cash when revenue is lumpy", "excerpt": "A simple 90-day model any small business can keep up to date.", "image": I(u("1460925895917-afdab827c52f", 900, 600), "Charts on a laptop"), "category": "Finance", "date": "09 Oct 2026", "href": "#"}]}},
      {"id": "newsletter-1", "type": "newsletter", "props": {"title": "One useful money email a month", "subtitle": "Templates, checklists and GST updates — written for humans.", "placeholder": "you@company.in", "buttonLabel": "Subscribe", "note": "Join 9,000+ founders. Unsubscribe anytime."}},
      ledger_footer]}]}

# ---------------------------------------------------------------- Cafe
cafe = {
  "name": "Kaapi & Crumb", "description": "Specialty filter coffee and slow-baked breads in Indiranagar, Bengaluru.",
  "theme": {"palette": {"primary": "#A94A24", "accent": "#D9952B", "background": "#FBF6EF", "surface": "#F3E8DA", "text": "#2A1C13", "muted": "#76604F", "border": "#E5D5C2"}, "fontPair": "editorial", "radius": "md", "style": "minimal"},
  "pages": [{"slug": "home", "title": "Kaapi & Crumb — coffee and bakes, Indiranagar", "sections": [
    {"id": "navbar-1", "type": "navbar", "props": {"brand": "Kaapi & Crumb", "links": [L("Menu", "#features"), L("Our story", "#story"), L("Gallery", "#gallery"), L("Visit", "#contact")], "cta": L("Reserve a table", "#contact"), "sticky": True}},
    {"id": "hero-1", "type": "hero-split", "props": {"eyebrow": "Indiranagar · Since 2019", "headline": "Slow coffee, warm bread, long conversations.", "subheadline": "Single-estate beans from Chikmagalur roasted every Tuesday, and sourdough that's been fermenting since yesterday. Pull up a chair.", "bullets": ["Filter kaapi brewed the traditional way", "Breads and bakes from our own oven", "Laptop-friendly mornings, cosy evenings"], "primaryCta": L("See the menu", "#features"), "secondaryCta": L("Find us", "#contact"), "image": I(u("1509042239860-f550ce710b93", 1200, 1400), "Latte with leaf art on a wooden table"), "imageSide": "right", "badge": "4.8 ★ from 2,300 Google reviews"}},
    {"id": "features-1", "type": "features-grid", "props": {"eyebrow": "What we're known for", "title": "Small menu, made with care", "subtitle": "Everything is made in-house, every day, in small batches.", "columns": 4, "items": [
      {"icon": "cup", "title": "Filter kaapi", "description": "Decoction brewed in brass, finished with frothy milk. ₹90."},
      {"icon": "leaf", "title": "Pour-overs", "description": "Rotating single estates, brewed to order on V60 or Chemex."},
      {"icon": "heart", "title": "Sourdough & bakes", "description": "Country loaf, cardamom buns and a weekend croissant drop."},
      {"icon": "clock", "title": "All-day breakfast", "description": "Akki roti, shakshuka and masala eggs on toast until 4pm."}]}},
    {"id": "rows-1", "type": "feature-rows", "props": {"eyebrow": "Our story", "title": "From one estate to your cup", "subtitle": "", "rows": [
      {"title": "We know our farmers by name", "description": "We buy directly from three family estates in the Baba Budangiri hills and pay well above market rates, every harvest.", "bullets": ["Direct trade since day one", "Roasted fresh every week"], "image": I(u("1442512595331-e89e73853f31", 1200, 900), "Pour-over coffee being brewed")},
      {"title": "An oven that never really cools", "description": "Our bakers start at 4am so the first loaves come out just as the shutters go up.", "bullets": ["48-hour sourdough", "Butter from a Mysuru dairy"], "image": I(u("1414235077428-338989a2e8c0", 1200, 900), "Plated food at a dinner table")}]}},
    {"id": "gallery-1", "type": "gallery", "props": {"eyebrow": "Gallery", "title": "A peek inside", "subtitle": "", "layout": "masonry", "images": [
      I(u("1554118811-1e0d58224f24", 800, 1000), "Sunlit café interior with plants"),
      I(u("1495474472287-4d71bcdd2085", 800, 600), "Friends clinking coffee cups"),
      I(u("1511920170033-f8396924c348", 800, 800), "Freshly ground espresso"),
      I(u("1501339847302-ac426a4a7cbb", 800, 600), "Neon café sign above the counter"),
      I(u("1559925393-8be0ec4767c8", 800, 1000), "Outdoor seating on the street"),
      I(u("1540189549336-e6e99c3679fe", 800, 700), "Fresh salad bowl")]}},
    {"id": "testimonials-1", "type": "testimonials", "props": {"eyebrow": "Kind words", "title": "Regulars say it best", "subtitle": "", "items": [
      {"quote": "The filter kaapi tastes exactly like my grandmother's in Kumbakonam. I come twice a week just for that.", "name": "Lakshmi S.", "role": "Regular since 2020", "avatar": "", "rating": 5},
      {"quote": "Best cardamom bun in the city, and they let me work for hours without a single look.", "name": "Aditya K.", "role": "Product designer", "avatar": "", "rating": 5},
      {"quote": "We had our small engagement brunch here. The staff made it feel like family.", "name": "Neha & Rahul", "role": "Celebrated here", "avatar": "", "rating": 5}]}},
    {"id": "contact-1", "type": "contact", "props": {"eyebrow": "Visit us", "title": "Come say hello", "subtitle": "Walk-ins always welcome. For groups of 6+ or private events, send us a note.", "email": "hello@kaapiandcrumb.in", "phone": "+91 80 4123 9876", "address": "1st Floor, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038", "hours": "Every day, 7:30am – 10:30pm", "submitLabel": "Send request", "successMessage": "Thank you! We'll confirm on WhatsApp within the hour.", "showServiceField": True, "services": ["Table for 6+", "Private event", "Bulk coffee order", "Something else"]}},
    {"id": "newsletter-1", "type": "newsletter", "props": {"title": "Hear about the weekend bake first", "subtitle": "One short note on Thursdays with the croissant flavour, new beans and events.", "placeholder": "you@email.com", "buttonLabel": "Count me in", "note": "We never share your email."}},
    {"id": "footer-1", "type": "footer", "props": {"brand": "Kaapi & Crumb", "tagline": "Slow coffee and warm bread in the heart of Indiranagar.", "columns": [
      {"title": "Visit", "links": [L("Directions", "#contact"), L("Hours", "#contact")]},
      {"title": "Eat & drink", "links": [L("Menu", "#features"), L("Bakery", "#story")]},
      {"title": "Say hi", "links": [L("Events", "#contact"), L("Careers", "#")]}],
      "socials": [{"platform": "instagram", "href": "#"}, {"platform": "whatsapp", "href": "#"}, {"platform": "facebook", "href": "#"}],
      "copyright": "© 2026 Kaapi & Crumb. Made with love in Bengaluru."}}]}]}

# ---------------------------------------------------------------- Agency
agency = {
  "name": "Northbeam Studio", "description": "Independent brand and product design studio.",
  "theme": {"palette": {"primary": "#C5F23C", "accent": "#7B61FF", "background": "#0B0B10", "surface": "#14141C", "text": "#F3F3F7", "muted": "#9C9CB2", "border": "#272734"}, "fontPair": "modern", "radius": "xl", "style": "glass"},
  "pages": [{"slug": "home", "title": "Northbeam — brand & product design studio", "sections": [
    {"id": "navbar-1", "type": "navbar", "props": {"brand": "Northbeam", "links": [L("Work", "#gallery"), L("Services", "#features"), L("Process", "#process"), L("Studio", "#team")], "cta": L("Start a project", "#contact"), "sticky": True}},
    {"id": "hero-1", "type": "hero-centered", "props": {"eyebrow": "Booking projects for Q1 2027", "headline": "We design brands people remember and products people love.", "subheadline": "Northbeam is a 9-person studio pairing strategy, identity and interface design for ambitious startups and the companies that want to move like them.", "primaryCta": L("See selected work", "#gallery"), "secondaryCta": L("Our process", "#process"), "image": I(u("1618005182384-a83a8bd57fbe", 1800, 1000), "Abstract flowing gradient artwork")}},
    {"id": "logos-1", "type": "logo-strip", "props": {"title": "Partners we've shipped with", "logos": ["Halcyon", "Quanta Bank", "Fable & Co", "Arcadia Health", "Orbit Mobility", "Lumen"], "marquee": True}},
    {"id": "features-1", "type": "features-grid", "props": {"eyebrow": "Services", "title": "One team, from first idea to final pixel", "subtitle": "", "columns": 2, "items": [
      {"icon": "sparkles", "title": "Brand identity", "description": "Naming, positioning, logo systems and guidelines that scale from app icon to billboard."},
      {"icon": "layers", "title": "Product design", "description": "Research-led UX and polished UI for web and mobile apps, ready for engineering."},
      {"icon": "code", "title": "Websites", "description": "Fast, animated marketing sites built on modern stacks your team can edit."},
      {"icon": "rocket", "title": "Launch campaigns", "description": "Motion, social and launch assets that make day one land."}]}},
    {"id": "gallery-1", "type": "gallery", "props": {"eyebrow": "Selected work", "title": "Recent projects", "subtitle": "A few things we're proud of from the past year.", "layout": "grid", "images": [
      I(u("1626785774573-4b799315345d", 900, 900), "Creative tools identity system"),
      I(u("1600585154340-be6161a56a0c", 900, 900), "Architecture firm website"),
      I(u("1550439062-609e1531270e", 900, 900), "Developer platform dashboard"),
      I(u("1513475382585-d06e58bcb0e0", 900, 900), "Publishing house rebrand"),
      I(u("1559136555-9303baea8ebd", 900, 900), "Coworking space wayfinding"),
      I(u("1531297484001-80022131f5a1", 900, 900), "Fintech mobile app")]}},
    {"id": "process-1", "type": "process", "props": {"eyebrow": "Process", "title": "How a project with us runs", "subtitle": "Clear phases, weekly demos and no disappearing acts.", "steps": [
      {"title": "Discovery sprint", "description": "Workshops, interviews and an audit to agree on what success looks like.", "meta": "Week 1–2"},
      {"title": "Direction & concepts", "description": "Two or three distinct directions, presented with the reasoning behind them.", "meta": "Week 3–4"},
      {"title": "Design & build", "description": "We refine the chosen route and build it out with your team, demoing every Friday.", "meta": "Week 5–10"},
      {"title": "Launch & support", "description": "Handover, documentation and 30 days of support after go-live.", "meta": "Ongoing"}]}},
    {"id": "stats-1", "type": "stats", "props": {"title": "", "tinted": False, "items": [
      {"value": 120, "prefix": "", "suffix": "+", "label": "Projects shipped"}, {"value": 14, "prefix": "", "suffix": "", "label": "Design awards"},
      {"value": 9, "prefix": "", "suffix": "", "label": "Countries"}, {"value": 92, "prefix": "", "suffix": "%", "label": "Repeat clients"}]}},
    {"id": "team-1", "type": "team", "props": {"eyebrow": "Studio", "title": "Small team, senior hands", "subtitle": "Everyone you meet in the pitch works on your project.", "members": [
      {"name": "Isha Menon", "role": "Founder & Creative Director", "photo": u("1544005313-94ddf0286df2", 600, 750), "bio": "Previously led brand at two unicorns. Believes in fewer, better ideas."},
      {"name": "Marcus Lee", "role": "Head of Product Design", "photo": u("1472099645785-5658abf4ff4e", 600, 750), "bio": "Fifteen years designing products used by millions."},
      {"name": "Zara Qureshi", "role": "Brand Designer", "photo": u("1607746882042-944635dfe10e", 600, 750), "bio": "Type nerd, illustrator and the studio's resident colour expert."},
      {"name": "Dev Patel", "role": "Creative Developer", "photo": u("1507003211169-0a1dd7228f2d", 600, 750), "bio": "Turns static comps into motion that feels alive."}]}},
    {"id": "testimonials-1", "type": "testimonials", "props": {"eyebrow": "Clients", "title": "What it's like to work with us", "subtitle": "", "items": [
      {"quote": "Northbeam understood our business faster than our own board did. The new brand doubled inbound demos.", "name": "Sanjana Rao", "role": "CMO, Quanta Bank", "avatar": u("1573497019940-1c28c88b4f3e", 160, 160), "rating": 5},
      {"quote": "Weekly demos meant zero surprises. The app shipped on time and our ratings jumped to 4.7.", "name": "Tom Hartley", "role": "VP Product, Orbit Mobility", "avatar": u("1500648767791-00dcc994a43e", 160, 160), "rating": 5},
      {"quote": "Rare mix of taste and rigour. They pushed back when it mattered and it made the work better.", "name": "Leila Haddad", "role": "Founder, Fable & Co", "avatar": u("1534528741775-53994a69daeb", 160, 160), "rating": 5}]}},
    {"id": "cta-1", "type": "cta-banner", "props": {"title": "Have something worth building?", "subtitle": "Tell us about it. We reply to every enquiry within two working days.", "primaryCta": L("Start a project", "#contact"), "secondaryCta": L("hello@northbeam.studio", "mailto:hello@northbeam.studio"), "variant": "solid"}},
    {"id": "contact-1", "type": "contact", "props": {"eyebrow": "Contact", "title": "Let's make something great", "subtitle": "Share a few details and we'll set up a 30-minute intro call.", "email": "hello@northbeam.studio", "phone": "+91 99000 12345", "address": "Studio 4, Bandra West, Mumbai 400050", "hours": "Mon–Fri, 10:00–19:00 IST", "submitLabel": "Send enquiry", "successMessage": "Thanks — we'll be in touch within two working days.", "showServiceField": True, "services": ["Brand identity", "Product design", "Website", "Not sure yet"]}},
    {"id": "footer-1", "type": "footer", "props": {"brand": "Northbeam", "tagline": "Brand and product design for ambitious teams.", "columns": [
      {"title": "Studio", "links": [L("Work", "#gallery"), L("Services", "#features"), L("Team", "#team")]},
      {"title": "Connect", "links": [L("Instagram", "#"), L("Dribbble", "#"), L("LinkedIn", "#")]},
      {"title": "Contact", "links": [L("hello@northbeam.studio", "mailto:hello@northbeam.studio"), L("Careers", "#")]}],
      "socials": [{"platform": "instagram", "href": "#"}, {"platform": "linkedin", "href": "#"}, {"platform": "x", "href": "#"}],
      "copyright": "© 2026 Northbeam Studio LLP"}}]}]}

# ---------------------------------------------------------------- Clinic
clinic = {
  "name": "Aarogya Physio & Wellness", "description": "Physiotherapy, sports rehab and pain management clinic in Kothrud, Pune.",
  "theme": {"palette": {"primary": "#0E7C68", "accent": "#F2A531", "background": "#FFFFFF", "surface": "#EFF7F5", "text": "#0F2724", "muted": "#4D6662", "border": "#D8E9E5"}, "fontPair": "friendly", "radius": "xl", "style": "soft"},
  "pages": [{"slug": "home", "title": "Aarogya Physio & Wellness — Kothrud, Pune", "sections": [
    {"id": "navbar-1", "type": "navbar", "props": {"brand": "Aarogya Physio", "links": [L("Treatments", "#features"), L("Doctors", "#team"), L("Fees", "#pricing"), L("FAQ", "#faq")], "cta": L("Book appointment", "#contact"), "sticky": True}},
    {"id": "hero-1", "type": "hero-split", "props": {"eyebrow": "Physiotherapy clinic · Kothrud, Pune", "headline": "Move without pain again — with care that's personal.", "subheadline": "Evidence-based physiotherapy for back pain, sports injuries, post-surgery rehab and senior mobility. Clinic and home visits across Pune.", "bullets": ["Same-day appointments available", "Experienced, IAP-registered physiotherapists", "Home visits within 8 km"], "primaryCta": L("Book an appointment", "#contact"), "secondaryCta": L("WhatsApp us", "#contact"), "image": I(u("1571019613454-1cb2f99b2d8b", 1200, 1400), "Woman doing a guided core exercise"), "imageSide": "right", "badge": "4.9 ★ · 900+ Google reviews"}},
    {"id": "stats-1", "type": "stats", "props": {"title": "", "tinted": True, "items": [
      {"value": 12, "prefix": "", "suffix": "+ yrs", "label": "In practice"}, {"value": 15000, "prefix": "", "suffix": "+", "label": "Patients treated"},
      {"value": 6, "prefix": "", "suffix": "", "label": "Specialists"}, {"value": 96, "prefix": "", "suffix": "%", "label": "Would recommend"}]}},
    {"id": "features-1", "type": "features-grid", "props": {"eyebrow": "Treatments", "title": "How we can help", "subtitle": "Every plan starts with a thorough assessment — no cookie-cutter exercise sheets.", "columns": 3, "items": [
      {"icon": "shield", "title": "Back & neck pain", "description": "Manual therapy and posture correction for desk-job aches and slipped discs."},
      {"icon": "bolt", "title": "Sports injuries", "description": "ACL, ankle and shoulder rehab to get runners and cricketers back on the field."},
      {"icon": "heart", "title": "Post-surgery rehab", "description": "Structured recovery after knee replacement, spine and orthopaedic surgery."},
      {"icon": "users", "title": "Senior mobility", "description": "Balance, strength and fall-prevention programmes for elders."},
      {"icon": "leaf", "title": "Women's health", "description": "Pre- and post-natal physiotherapy and pelvic floor care."},
      {"icon": "map", "title": "Home visits", "description": "The same quality of care at home for patients who can't travel."}]}},
    {"id": "process-1", "type": "process", "props": {"eyebrow": "Your first visit", "title": "What to expect", "subtitle": "Simple, unhurried and focused on you.", "steps": [
      {"title": "Assessment", "description": "A 45-minute consultation to understand your pain, history and goals.", "meta": "Visit 1"},
      {"title": "Personal plan", "description": "A clear treatment plan with the number of sessions and home exercises.", "meta": "Same day"},
      {"title": "Treatment & progress", "description": "Hands-on sessions with progress checks every week.", "meta": "2–6 weeks"}]}},
    {"id": "team-1", "type": "team", "props": {"eyebrow": "Our team", "title": "Meet your physiotherapists", "subtitle": "", "members": [
      {"name": "Dr. Kunal Joshi, PT", "role": "Founder · Orthopaedic Physio", "photo": u("1612349317150-e413f6a5b16d", 600, 750), "bio": "MPT (Ortho), 12 years of practice. Specialises in spine and knee rehab."},
      {"name": "Dr. Sneha Kulkarni, PT", "role": "Sports Physiotherapist", "photo": u("1580489944761-15a19d654956", 600, 750), "bio": "Worked with state-level athletes. Loves getting runners back on the road."},
      {"name": "Dr. Anjali Deshpande, PT", "role": "Women's Health", "photo": u("1594824476967-48c8b964273f", 600, 750), "bio": "Certified in pre/post-natal and pelvic floor physiotherapy."},
      {"name": "Dr. Imran Shaikh, PT", "role": "Neuro & Geriatric Rehab", "photo": u("1622253692010-333f2da6031d", 600, 750), "bio": "Helps stroke survivors and seniors regain independence."}]}},
    {"id": "pricing-1", "type": "pricing", "props": {"eyebrow": "Fees", "title": "Transparent pricing", "subtitle": "No hidden charges. Insurance receipts provided on request.", "currency": "₹", "billingToggle": False, "yearlyNote": "", "plans": [
      {"name": "Consultation", "priceMonthly": 600, "priceYearly": 600, "period": "/visit", "description": "First assessment with a senior physio.", "features": ["45-minute assessment", "Diagnosis & treatment plan", "Home exercise sheet"], "cta": L("Book consultation", "#contact"), "highlighted": False},
      {"name": "10-session pack", "priceMonthly": 5500, "priceYearly": 5500, "period": "/pack", "description": "Best value for a full recovery plan.", "features": ["10 x 40-minute sessions", "Weekly progress review", "WhatsApp support", "Valid for 60 days"], "cta": L("Choose pack", "#contact"), "highlighted": True},
      {"name": "Home visit", "priceMonthly": 900, "priceYearly": 900, "period": "/session", "description": "Treatment at your home within 8 km.", "features": ["Portable equipment", "Ideal for post-surgery", "Flexible timings"], "cta": L("Request visit", "#contact"), "highlighted": False}]}},
    {"id": "testimonials-1", "type": "testimonials", "props": {"eyebrow": "Patient stories", "title": "Back to doing what they love", "subtitle": "", "items": [
      {"quote": "After my knee replacement I couldn't climb stairs. Eight weeks with Dr. Joshi and I'm walking to the temple every morning.", "name": "Sudha Patwardhan", "role": "68, Kothrud", "avatar": "", "rating": 5},
      {"quote": "Tore my ACL playing football. Sneha ma'am's rehab plan had me running again in five months.", "name": "Aniket More", "role": "24, Software engineer", "avatar": "", "rating": 5},
      {"quote": "Years of desk-job back pain gone in six sessions. They explain everything clearly.", "name": "Ritu Agarwal", "role": "35, Baner", "avatar": "", "rating": 5}]}},
    {"id": "faq-1", "type": "faq", "props": {"eyebrow": "FAQ", "title": "Common questions", "subtitle": "Call or WhatsApp us if you don't see your question here.", "items": [
      {"question": "Do I need a doctor's referral?", "answer": "No. You can book directly. If you have reports or X-rays, please bring them to your first visit."},
      {"question": "How many sessions will I need?", "answer": "It depends on your condition. Most patients feel a difference in 3–4 sessions; we'll give you a clear estimate after the assessment."},
      {"question": "Is physiotherapy covered by insurance?", "answer": "Many health policies cover physiotherapy after hospitalisation. We provide detailed receipts for your claim."},
      {"question": "What should I wear?", "answer": "Loose, comfortable clothing that lets us access the area being treated."}]}},
    {"id": "contact-1", "type": "contact", "props": {"eyebrow": "Book a visit", "title": "Book your appointment", "subtitle": "Share your details and we'll call back within 30 minutes during clinic hours.", "email": "care@aarogyaphysio.in", "phone": "+91 98220 45678", "address": "Shop 3, Shivtirth Nagar, Paud Road, Kothrud, Pune 411038", "hours": "Mon–Sat 8am–8pm · Sun 9am–1pm", "submitLabel": "Request appointment", "successMessage": "Thank you! Our team will call you shortly to confirm.", "showServiceField": True, "services": ["Back / neck pain", "Sports injury", "Post-surgery rehab", "Senior mobility", "Home visit"]}},
    {"id": "footer-1", "type": "footer", "props": {"brand": "Aarogya Physio", "tagline": "Physiotherapy and wellness in Kothrud, Pune. Clinic and home visits.", "columns": [
      {"title": "Treatments", "links": [L("Back pain", "#features"), L("Sports injuries", "#features"), L("Post-surgery", "#features")]},
      {"title": "Clinic", "links": [L("Our team", "#team"), L("Fees", "#pricing"), L("FAQ", "#faq")]},
      {"title": "Contact", "links": [L("+91 98220 45678", "tel:+919822045678"), L("Get directions", "#contact")]}],
      "socials": [{"platform": "whatsapp", "href": "#"}, {"platform": "instagram", "href": "#"}, {"platform": "facebook", "href": "#"}],
      "copyright": "© 2026 Aarogya Physio & Wellness"}}]}]}

for name, data in [("saas-ledgerline", saas), ("cafe-kaapi-crumb", cafe), ("agency-northbeam", agency), ("clinic-aarogya", clinic)]:
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
print("ok")
