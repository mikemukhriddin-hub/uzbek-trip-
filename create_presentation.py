import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    # 1. Initialize presentation
    prs = Presentation()
    
    # Set to widescreen (16:9)
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # 2. Define Theme Colors (Matching Samarkand Night Design System)
    C_BG_DARK = RGBColor(10, 15, 29)       # #0A0F1D (Dark Sapphire)
    C_BG_CARD = RGBColor(18, 26, 47)       # #121A2F (Glass Card BG)
    C_GOLD = RGBColor(212, 175, 55)        # #D4AF37 (Regal Gold)
    C_TURQUOISE = RGBColor(0, 155, 158)    # #009B9E (Deep Turquoise)
    C_WHITE = RGBColor(255, 255, 255)      # White
    C_SLATE_400 = RGBColor(148, 163, 184)  # #94A3B8 (Secondary Text)
    C_SLATE_600 = RGBColor(71, 85, 105)    # #475569 (Muted Text)

    # 3. Helper to style slide background
    def apply_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = C_BG_DARK
        
        # Add top decorative golden line
        top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.15))
        top_line.fill.solid()
        top_line.fill.fore_color.rgb = C_GOLD
        top_line.line.fill.background()
        
        # Add bottom subtle brand branding
        brand_box = slide.shapes.add_textbox(Inches(0.5), Inches(7.1), Inches(12.333), Inches(0.3))
        tf = brand_box.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "SAMARQAND CRAFTOUR  |  INVESTITSIYA TAQDIMOTI 2026"
        p.font.name = "Segoe UI"
        p.font.size = Pt(9)
        p.font.color.rgb = C_SLATE_600
        p.font.bold = True

    # 4. Helper to create standard titles
    def add_slide_title(slide, title_text):
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text.upper()
        p.font.name = "Georgia"
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = C_GOLD
        return title_box

    # 5. Helper to create cards
    def add_card(slide, left, top, width, height, border_color=C_GOLD, fill_color=C_BG_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    # Blank layout is index 6 in standard templates
    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 1: MUQOVA (TITLE / COVER SLIDE)
    # ==========================================
    slide_1 = prs.slides.add_slide(blank_layout)
    # Solid background
    background = slide_1.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = C_BG_DARK
    
    # Golden border frame for cover
    frame = slide_1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(0.4), Inches(12.533), Inches(6.7))
    frame.fill.background()
    frame.line.color.rgb = C_GOLD
    frame.line.width = Pt(2)
    
    # 3D accent background design (Turquoise gradient replica shape)
    accent = slide_1.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9), Inches(-2), Inches(6), Inches(6))
    accent.fill.solid()
    accent.fill.fore_color.rgb = RGBColor(12, 35, 64)
    accent.line.fill.background()
    
    # Title Box
    title_box = slide_1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(11.333), Inches(2.0))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "SAMARQAND CRAFTOUR"
    p.font.name = "Georgia"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.alignment = PP_ALIGN.LEFT
    
    p2 = tf.add_paragraph()
    p2.text = "Moslashuvchan va Shaxsiy Turizm Platformasi"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(22)
    p2.font.color.rgb = C_WHITE
    p2.alignment = PP_ALIGN.LEFT
    p2.space_before = Pt(10)

    p3 = tf.add_paragraph()
    p3.text = "Sayyohlar uchun interaktiv marshrut konstruktori va shaffof band qilish ekotizimi."
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(14)
    p3.font.color.rgb = C_SLATE_400
    p3.alignment = PP_ALIGN.LEFT
    p3.space_before = Pt(20)

    # Footer on Cover
    cov_foot = slide_1.shapes.add_textbox(Inches(1.0), Inches(5.8), Inches(6.0), Inches(0.8))
    tf_f = cov_foot.text_frame
    p_f = tf_f.paragraphs[0]
    p_f.text = "INVESTITSIYA TAQDIMOTI  |  2026"
    p_f.font.name = "Segoe UI"
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = C_TURQUOISE
    p_f.font.bold = True

    # ==========================================
    # SLIDE 2: MUAMMO (THE PROBLEM)
    # ==========================================
    slide_2 = prs.slides.add_slide(blank_layout)
    apply_background(slide_2)
    add_slide_title(slide_2, "TURIZMDAGI ASOSIY MUAMMOLAR")

    # Muammo 3 ta ustun ko'rinishida
    col_width = Inches(3.6)
    col_height = Inches(4.5)
    gap = Inches(0.4)
    start_left = Inches(0.8)
    top_pos = Inches(1.8)

    problems = [
        {
            "num": "01",
            "title": "Turlar Qotib Qolganligi",
            "desc": "An'anaviy turpaketlar juda qattiq rejalashtirilgan. Zamonaviy sayyohlar tayyor shablonlardan charchagan va o'z marshrutlarini shaxsiy qiziqishlariga moslashni xohlashadi.",
            "sub": "Tog'lar, hunarmandchilik ustaxonalari va gastronomik lokatsiyalar e'tibordan chetda qoladi."
        },
        {
            "num": "02",
            "title": "Narxlar Shaffof Emasligi",
            "desc": "Gidlar va haydovchilar bozori tartibga solinmagan. Yashirin komissiyalar, narxlarning tez-tez o'zgarishi va sayyohlar uchun oldindan aniq xarajatlarni bilish imkoni yo'qligi.",
            "sub": "Muzokaralar va narx ustida tortishuvlar sayohat sifatini pasaytiradi."
        },
        {
            "num": "03",
            "title": "Ishonchli Band Qilish Muammosi",
            "desc": "Professional tillarni biluvchi sertifikatlangan gidlar va tajribali haydovchilarni oldindan bitta platformada xavfsiz va kafolatlangan holda band qilish imkoniyati yo'q.",
            "sub": "Kutilmagan bekor qilishlar va sifatsiz xizmat ko'rsatish xavfi yuqori."
        }
    ]

    for i, prob in enumerate(problems):
        left_pos = start_left + i * (col_width + gap)
        # Background card
        add_card(slide_2, left_pos, top_pos, col_width, col_height)
        
        # Text inside card
        tb = slide_2.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.2), col_width - Inches(0.4), col_height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        # Number indicator
        p_num = tf.paragraphs[0]
        p_num.text = prob["num"]
        p_num.font.name = "Georgia"
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = C_TURQUOISE
        
        # Title
        p_title = tf.add_paragraph()
        p_title.text = prob["title"]
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = C_GOLD
        p_title.space_before = Pt(10)
        p_title.space_after = Pt(10)
        
        # Description
        p_desc = tf.add_paragraph()
        p_desc.text = prob["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = C_SLATE_400
        p_desc.space_after = Pt(10)
        
        # Sub detail
        p_sub = tf.add_paragraph()
        p_sub.text = prob["sub"]
        p_sub.font.name = "Segoe UI"
        p_sub.font.size = Pt(11)
        p_sub.font.italic = True
        p_sub.font.color.rgb = C_SLATE_600

    # ==========================================
    # SLIDE 3: YECHIM (THE SOLUTION)
    # ==========================================
    slide_3 = prs.slides.add_slide(blank_layout)
    apply_background(slide_3)
    add_slide_title(slide_3, "YECHIM: SAMARQAND CRAFTOUR PLATFORMASI")

    # Left Column: Big Vision
    left_tb = slide_3.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(4.5), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "Biz sayyohlarga to'liq erkinlik va shaffoflik beramiz."
    pl_1.font.name = "Georgia"
    pl_1.font.size = Pt(26)
    pl_1.font.bold = True
    pl_1.font.color.rgb = C_WHITE
    pl_1.space_after = Pt(15)
    
    pl_2 = tf_l.add_paragraph()
    pl_2.text = "Samarqand CrafTour — bu shunchaki gid yoki mashina buyurtma qilish ilovasi emas. Bu sayyohlarning shaxsiy qiziqishlariga moslashuvchan, real vaqt rejimida ishlovchi aqlli sayohat konstruktoridir."
    pl_2.font.name = "Segoe UI"
    pl_2.font.size = Pt(14)
    pl_2.font.color.rgb = C_SLATE_400
    pl_2.space_after = Pt(15)

    pl_3 = tf_l.add_paragraph()
    pl_3.text = "Sayyoh o'z sayohatini xuddi 'Lego' g'ishtchalari kabi mustaqil teradi va yakuniy narxni soniyalarda ko'radi."
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(13)
    pl_3.font.color.rgb = C_TURQUOISE

    # Right Column: 3 Key Pillar Cards
    right_left = Inches(5.8)
    card_w = Inches(6.7)
    card_h = Inches(1.3)
    card_gap = Inches(0.2)
    
    pillars = [
        {
            "title": "🗺 Interaktiv Marshrut Quruvchi",
            "desc": "Tarixiy maskanlar (Registon, Shohi Zinda), tabiat (Omonqo'ton dovoni) va gastronomiyani (Osh markazlari) birlashtiruvchi interaktiv xarita."
        },
        {
            "title": "🚗 Shaffof Narxlar va Avtomatik Hisob",
            "desc": "Yashirin komissiyalarsiz real vaqtda transport turi va gid tillari (En, Ru, Es, Fr, Uz) tariflari asosida narxni avtomatik hisoblash."
        },
        {
            "title": "👤 Tezkor OTP Tasdiqlash va Kafolat",
            "desc": "Email yoki WhatsApp orqali bir lahzada OTP kod bilan tasdiqlash va sayohatni muvofiqlashtiruvchi boshqaruv tizimi."
        }
    ]

    for i, pil in enumerate(pillars):
        curr_top = Inches(1.8) + i * (card_h + card_gap)
        add_card(slide_3, right_left, curr_top, card_w, card_h)
        
        tb = slide_3.shapes.add_textbox(right_left + Inches(0.2), curr_top + Inches(0.1), card_w - Inches(0.4), card_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = pil["title"]
        p_t.font.name = "Georgia"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = C_GOLD
        
        p_d = tf.add_paragraph()
        p_d.text = pil["desc"]
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(11.5)
        p_d.font.color.rgb = C_SLATE_400
        p_d.space_before = Pt(4)

    # ==========================================
    # SLIDE 4: QANDAY ISHLAYDI (HOW IT WORKS)
    # ==========================================
    slide_4 = prs.slides.add_slide(blank_layout)
    apply_background(slide_4)
    add_slide_title(slide_4, "MAHSULOT DEMOTSIYASI: 4 TA ODDIY QADAM")

    # 4 ta qadam - gorizontal joylashuv
    step_w = Inches(2.6)
    step_h = Inches(4.5)
    step_gap = Inches(0.3)
    step_start = Inches(0.8)
    step_top = Inches(1.8)

    steps = [
        {
            "step": "1-QADAM",
            "icon": "🗺",
            "title": "Marshrut Tuzish",
            "desc": "Sayyoh Registon, Shohi Zinda, Konigil eko-qishlog'i va tog'larni xaritadan tanlab, o'z yo'nalishini belgilaydi."
        },
        {
            "step": "2-QADAM",
            "icon": "🚗",
            "title": "Transport Tanlash",
            "desc": "Cobalt, Gentra, Minivan yoki katta sayyohlar guruhi uchun Isuzu avtobuslarini sig'im va narx bo'yicha tanlaydi."
        },
        {
            "step": "3-QADAM",
            "icon": "🗣",
            "title": "Gidni Tanlang",
            "desc": "Ingliz, rus, fransuz yoki ispan tillarida so'zlashuvchi gidlar ro'yxatidan o'ziga mosini tanlaydi."
        },
        {
            "step": "4-QADAM",
            "icon": "👤",
            "title": "OTP Tasdiqlash",
            "desc": "Aloqa ma'lumotlarini kiritadi. WhatsApp/Email orqali yuborilgan OTP kodni kiritib, buyurtmani darhol band qiladi."
        }
    ]

    for i, step in enumerate(steps):
        left_pos = step_start + i * (step_w + step_gap)
        
        # Transparent Card
        add_card(slide_4, left_pos, step_top, step_w, step_h)
        
        tb = slide_4.shapes.add_textbox(left_pos + Inches(0.15), step_top + Inches(0.2), step_w - Inches(0.3), step_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        # Step label
        p_st = tf.paragraphs[0]
        p_st.text = step["step"]
        p_st.font.name = "Segoe UI"
        p_st.font.size = Pt(11)
        p_st.font.bold = True
        p_st.font.color.rgb = C_TURQUOISE
        p_st.alignment = PP_ALIGN.CENTER
        
        # Big Icon
        p_ico = tf.add_paragraph()
        p_ico.text = step["icon"]
        p_ico.font.size = Pt(40)
        p_ico.alignment = PP_ALIGN.CENTER
        p_ico.space_before = Pt(15)
        p_ico.space_after = Pt(15)
        
        # Title
        p_title = tf.add_paragraph()
        p_title.text = step["title"]
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = C_GOLD
        p_title.alignment = PP_ALIGN.CENTER
        p_title.space_after = Pt(10)
        
        # Desc
        p_desc = tf.add_paragraph()
        p_desc.text = step["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = C_SLATE_400
        p_desc.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 5: BOZOR IMKONIYATI (MARKET OPPORTUNITY)
    # ==========================================
    slide_5 = prs.slides.add_slide(blank_layout)
    apply_background(slide_5)
    add_slide_title(slide_5, "BOZOR IMKONIYATLARI VA O'SISH SUR'ATI")

    # Big Metrics Visual Layout
    box_w = Inches(3.6)
    box_h = Inches(2.2)
    top_pos_1 = Inches(1.8)
    top_pos_2 = Inches(4.3)
    left_1 = Inches(0.8)
    left_2 = Inches(4.8)
    left_3 = Inches(8.8)

    metrics = [
        {"val": "+45%", "lbl": "Turizm Oqimining Yillik O'sishi", "sub": "Yangi Samarqand xalqaro aeroporti va vizasiz kirish islohotlari natijasida o'sish sur'ati."},
        {"val": "68%", "lbl": "Mustaqil Sayohatchilar Ulushi", "sub": "Zamonaviy sayyohlar an'anaviy guruhlardan voz kechib, shaxsiy marshrutlarni afzal ko'rishmoqda."},
        {"val": "$1.2B+", "lbl": "O'zbekistondagi Turizm Bozori", "sub": "2026-yil oxiriga kelib ichki va xalqaro turizm xarajatlarining umumiy aylanmasi."},
    ]

    for i, met in enumerate(metrics):
        left_pos = left_1 + i * (box_w + Inches(0.4))
        
        # Metric card
        add_card(slide_5, left_pos, top_pos_1, box_w, box_h, border_color=C_TURQUOISE)
        
        tb = slide_5.shapes.add_textbox(left_pos + Inches(0.2), top_pos_1 + Inches(0.15), box_w - Inches(0.4), box_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_val = tf.paragraphs[0]
        p_val.text = met["val"]
        p_val.font.name = "Georgia"
        p_val.font.size = Pt(48)
        p_val.font.bold = True
        p_val.font.color.rgb = C_GOLD
        p_val.alignment = PP_ALIGN.CENTER
        
        p_lbl = tf.add_paragraph()
        p_lbl.text = met["lbl"]
        p_lbl.font.name = "Segoe UI"
        p_lbl.font.size = Pt(13)
        p_lbl.font.bold = True
        p_lbl.font.color.rgb = C_WHITE
        p_lbl.alignment = PP_ALIGN.CENTER
        p_lbl.space_before = Pt(5)

    # Sub-text panel for alternative tourism market
    panel_w = Inches(11.733)
    panel_h = Inches(2.0)
    add_card(slide_5, left_1, top_pos_2, panel_w, panel_h)
    
    tb_p = slide_5.shapes.add_textbox(left_1 + Inches(0.3), top_pos_2 + Inches(0.2), panel_w - Inches(0.6), panel_h - Inches(0.4))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    
    pp_1 = tf_p.paragraphs[0]
    pp_1.text = "🎯 Maqsadli Segment: Muqobil va Eko-Turizm"
    pp_1.font.name = "Georgia"
    pp_1.font.size = Pt(18)
    pp_1.font.bold = True
    pp_1.font.color.rgb = C_GOLD
    pp_1.space_after = Pt(6)
    
    pp_2 = tf_p.add_paragraph()
    pp_2.text = "Sayyohlar faqatgina Registon yoki tarixiy obidalarni emas, balki Urgut tog'lari, Omonqo'ton qarag'ayzorlari, Konigil qog'oz fabrikasi kabi ekologik maskanlarni va milliy palov tayyorlash jarayonlarini mustaqil ko'rishni istashadi. Platformamiz aynan shu segmentga tezkor va kafolatlangan xizmat ko'rsatuvchi birinchi vositadir."
    pp_2.font.name = "Segoe UI"
    pp_2.font.size = Pt(12)
    pp_2.font.color.rgb = C_SLATE_400

    # ==========================================
    # SLIDE 6: BIZNES MODEL (BUSINESS MODEL)
    # ==========================================
    slide_6 = prs.slides.add_slide(blank_layout)
    apply_background(slide_6)
    add_slide_title(slide_6, "BIZNES MODEL VA DAROMAD MANBALARI")

    # 3 ta ustunda daromad manbalari
    col_w = Inches(3.6)
    col_h = Inches(4.5)
    gap = Inches(0.4)
    start_left = Inches(0.8)
    top_pos = Inches(1.8)

    models = [
        {
            "title": "Platforma Komissiyasi",
            "val": "15%",
            "desc": "Platforma orqali band qilingan har bir transport va gid xizmati uchun komissiya to'lovi.",
            "points": [
                "Haydovchilar shahar va tog' tariflaridan 15% ulush.",
                "Gidlar kunlik til tariflaridan 15% platforma ulushi."
            ]
        },
        {
            "title": "B2B Hamkorlik shartnomalari",
            "val": "Keshbek & Reklama",
            "desc": "Tashrif buyuriladigan gastronomik va hunarmandchilik nuqtalaridan olinadigan komissiya to'lovlari.",
            "points": [
                "Konigil eco-village, Karimbek restorani va Milliy palov markazlari integratsiyasi.",
                "Kopaytirilgan mijozlar oqimidan belgilangan ulush."
            ]
        },
        {
            "title": "Kelajakdagi Integratsiyalar",
            "val": "Premium & Sotuvlar",
            "desc": "Platformani kengaytirish orqali chiptalar va tayyor turlarni sotish imkoniyati.",
            "points": [
                "Afrosiyob tezurar poyezdi va tarixiy obidalar chiptalarini ilova ichida sotish.",
                "Tayyor premium yo'nalishli turlar konstruktori."
            ]
        }
    ]

    for i, mod in enumerate(models):
        left_pos = start_left + i * (col_w + gap)
        add_card(slide_6, left_pos, top_pos, col_w, col_h)
        
        tb = slide_6.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = mod["title"]
        p_t.font.name = "Georgia"
        p_t.font.size = Pt(18)
        p_t.font.bold = True
        p_t.font.color.rgb = C_GOLD
        p_t.space_after = Pt(10)
        
        p_val = tf.add_paragraph()
        p_val.text = mod["val"]
        p_val.font.name = "Georgia"
        p_val.font.size = Pt(22)
        p_val.font.bold = True
        p_val.font.color.rgb = C_TURQUOISE
        p_val.space_after = Pt(10)
        
        p_desc = tf.add_paragraph()
        p_desc.text = mod["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = C_WHITE
        p_desc.space_after = Pt(15)
        
        for pt in mod["points"]:
            p_pt = tf.add_paragraph()
            p_pt.text = "• " + pt
            p_pt.font.name = "Segoe UI"
            p_pt.font.size = Pt(11)
            p_pt.font.color.rgb = C_SLATE_400
            p_pt.space_after = Pt(5)

    # ==========================================
    # SLIDE 7: TEXNIK ARXITEKTURA VA AVTOMATIZATSIYA
    # ==========================================
    slide_7 = prs.slides.add_slide(blank_layout)
    apply_background(slide_7)
    add_slide_title(slide_7, "TEXNOLOGIK STACK VA AVTOMATIZATSIYA (n8n)")

    # Left box: Tech Stack
    box_w = Inches(5.6)
    box_h = Inches(4.5)
    left_1 = Inches(0.8)
    left_2 = Inches(6.8)
    top_pos = Inches(1.8)

    add_card(slide_7, left_1, top_pos, box_w, box_h)
    tb_l = slide_7.shapes.add_textbox(left_1 + Inches(0.3), top_pos + Inches(0.3), box_w - Inches(0.6), box_h - Inches(0.6))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    pl_t = tf_l.paragraphs[0]
    pl_t.text = "💻 Platforma Arxitekturasi"
    pl_t.font.name = "Georgia"
    pl_t.font.size = Pt(20)
    pl_t.font.bold = True
    pl_t.font.color.rgb = C_GOLD
    pl_t.space_after = Pt(15)

    stacks = [
        ("Next.js 16 (App Router)", "Tezkor yuklanish, SEO optimallashtirish va xavfsiz Server Component'lar."),
        ("Supabase (PostgreSQL & Auth)", "Sayyohlar ma'lumotlari, real vaqt rejimidagi gid va haydovchilar bazasi."),
        ("Leaflet.js Interactive Maps", "Hech qanday og'ir Google Maps to'lovlarisiz sayyohning marshrutini xaritada tekin chizish."),
        ("Nodemailer Email System", "Tasdiqlash OTP kodlarini va yakuniy vaucherni mijozga yuborish tizimi.")
    ]

    for label, desc in stacks:
        p_st = tf_l.add_paragraph()
        p_st.text = f"{label}: "
        p_st.font.name = "Segoe UI"
        p_st.font.size = Pt(12)
        p_st.font.bold = True
        p_st.font.color.rgb = C_WHITE
        
        # Add run for description
        run = p_st.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = C_SLATE_400
        p_st.space_after = Pt(10)

    # Right box: n8n Workflow Automation
    add_card(slide_7, left_2, top_pos, box_w, box_h)
    tb_r = slide_7.shapes.add_textbox(left_2 + Inches(0.3), top_pos + Inches(0.3), box_w - Inches(0.6), box_h - Inches(0.6))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "⚡ n8n va WhatsApp Avtomatizatsiyasi"
    pr_t.font.name = "Georgia"
    pr_t.font.size = Pt(20)
    pr_t.font.bold = True
    pr_t.font.color.rgb = C_GOLD
    pr_t.space_after = Pt(15)

    autos = [
        ("n8n workflow integratsiyasi", "Buyurtmalar boshqaruvi va monitoringi n8n platformasiga ulangan."),
        ("Avtomatik xabar yetkazish", "Sayyoh buyurtmani tasdiqlagach, haydovchi va gidning WhatsApp / Telegramiga darhol xabar ketadi."),
        ("Marshrut va aloqa ma'lumotlari", "Xabarda sayyohning to'liq marshruti, poyezd/samolyot kelish vaqti va telefon raqami avtomatik taqdim etiladi."),
        ("Operatsion xarajatlarni 90% kamaytirish", "Menejerlarning qo'lda aloqa qilish vaqtini tejaydi, inson omilini kamaytiradi.")
    ]

    for label, desc in autos:
        p_st = tf_r.add_paragraph()
        p_st.text = f"• {label} — "
        p_st.font.name = "Segoe UI"
        p_st.font.size = Pt(12)
        p_st.font.bold = True
        p_st.font.color.rgb = C_TURQUOISE
        
        run = p_st.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = C_SLATE_400
        p_st.space_after = Pt(10)

    # ==========================================
    # SLIDE 8: KELAJAK VA INVESTITSIYA (FUTURE & INVESTMENT)
    # ==========================================
    slide_8 = prs.slides.add_slide(blank_layout)
    apply_background(slide_8)
    add_slide_title(slide_8, "KELAJAK REJALARI VA INVESTITSIYA")

    # Left Column: Investment Goal
    left_tb = slide_8.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.0), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "INVESTITSIYA MAQSADI"
    pl_1.font.name = "Segoe UI"
    pl_1.font.size = Pt(14)
    pl_1.font.bold = True
    pl_1.font.color.rgb = C_TURQUOISE
    pl_1.space_after = Pt(10)

    pl_2 = tf_l.add_paragraph()
    pl_2.text = "$100,000 Seed Round"
    pl_2.font.name = "Georgia"
    pl_2.font.size = Pt(36)
    pl_2.font.bold = True
    pl_2.font.color.rgb = C_GOLD
    pl_2.space_after = Pt(15)

    pl_3 = tf_l.add_paragraph()
    pl_3.text = "Ushbu investitsiya quyidagi strategik yo'nalishlarga sarflanadi:"
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(13)
    pl_3.font.color.rgb = C_WHITE
    pl_3.space_after = Pt(10)

    funds = [
        ("Ilova ishlab chiqish", "iOS va Android uchun to'liq mobil ilovalarni tayyorlash."),
        ("O'zbekiston bo'ylab kengayish", "Buxoro, Xiva va Toshkent shaharlari gid va transport tarmoqlarini qo'shish."),
        ("Marketing va brending", "Yevropa, AQSh va Arab davlatlaridan kelayotgan sayyohlarga raqamli marketing orqali yetib borish.")
    ]
    for lbl, desc in funds:
        p = tf_l.add_paragraph()
        p.text = f"✔ {lbl} — "
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_GOLD
        
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = C_SLATE_400
        p.space_after = Pt(5)

    # Right Column: Future Goals / Contact panel
    right_left = Inches(6.5)
    add_card(slide_8, right_left, Inches(1.8), Inches(6.0), Inches(4.5))
    
    tb_r = slide_8.shapes.add_textbox(right_left + Inches(0.4), Inches(2.1), Inches(5.2), Inches(3.9))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "🚀 Kutilayotgan Natijalar (2026-2027)"
    pr_t.font.name = "Georgia"
    pr_t.font.size = Pt(20)
    pr_t.font.bold = True
    pr_t.font.color.rgb = C_GOLD
    pr_t.space_after = Pt(15)

    milestones = [
        "10,000 dan ortiq muvaffaqiyatli buyurtmalarni amalga oshirish.",
        "500+ sertifikatlangan gid va haydovchilar bilan hamkorlik tarmog'i.",
        "Muzeylar, tezyurar poyezdlar va madaniy tadbirlar chiptalari bilan to'liq integratsiya.",
        "Sayohatlarni rejalashtirish operatsion vaqtini 5 daqiqadan kamaytirish."
    ]

    for ms in milestones:
        p = tf_r.add_paragraph()
        p.text = "⚡ " + ms
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_SLATE_400
        p.space_after = Pt(8)

    p_contact = tf_r.add_paragraph()
    p_contact.text = "Biz bilan bog'lanish: info@samarkandcraftour.uz"
    p_contact.font.name = "Segoe UI"
    p_contact.font.size = Pt(13)
    p_contact.font.bold = True
    p_contact.font.color.rgb = C_TURQUOISE
    p_contact.space_before = Pt(20)

    # 6. Save presentation
    output_filename = "Samarqand_CrafTour_Investor_Pitch_Deck.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as '{output_filename}'!")

if __name__ == "__main__":
    create_deck()
