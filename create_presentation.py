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
        
        # Add Uzbek Mandala Ornament peeking in the top-right corner
        try:
            slide.shapes.add_picture("uzbek_mandala.jpg", Inches(11.0), Inches(-1.0), Inches(3.5), Inches(3.5))
        except Exception as e:
            pass
        
        # Add top decorative golden line
        top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.12))
        top_line.fill.solid()
        top_line.fill.fore_color.rgb = C_GOLD
        top_line.line.fill.background()
        
        # Add bottom brand branding
        brand_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(10.5), Inches(0.3))
        tf = brand_box.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = "UZBEK-TRIP (SAMARQAND CRAFTOUR)  |  HAMKORLIK TAQDIMOTI 2026"
        p.font.name = "Segoe UI"
        p.font.size = Pt(9)
        p.font.color.rgb = C_SLATE_600
        p.font.bold = True
        
        # Add small logo in the bottom right corner
        try:
            slide.shapes.add_picture("logo.jpg", Inches(12.5), Inches(6.9), Inches(0.5), Inches(0.5))
        except Exception as e:
            pass

    # 4. Helper to create standard titles
    def add_slide_title(slide, title_text):
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(0.8))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text.upper()
        p.font.name = "Georgia"
        p.font.size = Pt(30)
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
    background = slide_1.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = C_BG_DARK
    
    # Golden border frame for cover
    frame = slide_1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(0.4), Inches(12.533), Inches(6.7))
    frame.fill.background()
    frame.line.color.rgb = C_GOLD
    frame.line.width = Pt(2)
    
    # Large Floating Uzbek Mandala Plate on the Right
    try:
        slide_1.shapes.add_picture("uzbek_mandala.jpg", Inches(7.5), Inches(1.25), Inches(5.0), Inches(5.0))
    except Exception as e:
        pass
    
    # Logo on Cover
    try:
        slide_1.shapes.add_picture("logo.jpg", Inches(1.0), Inches(0.8), Inches(1.2), Inches(1.2))
    except Exception as e:
        pass
        
    # Title Box
    title_box = slide_1.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(6.2), Inches(4.0))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    
    p = tf.paragraphs[0]
    p.text = "UZBEK-TRIP\nPLATFORMASI"
    p.font.name = "Georgia"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.alignment = PP_ALIGN.LEFT
    
    p2 = tf.add_paragraph()
    p2.text = "Menejment, Marketing, Audit va Iqtisodiyot"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(16)
    p2.font.color.rgb = C_WHITE
    p2.font.bold = True
    p2.alignment = PP_ALIGN.LEFT
    p2.space_before = Pt(10)

    p3 = tf.add_paragraph()
    p3.text = "Sayohatlarni real vaqtda rejalashtirish, GPS navigatsiyasi, n8n avtomatizatsiyasi hamda hamkorlar uchun unit-iqtisodiy yechimlar ekotizimi."
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(12)
    p3.font.color.rgb = C_SLATE_400
    p3.alignment = PP_ALIGN.LEFT
    p3.space_before = Pt(15)

    # Footer on Cover
    cov_foot = slide_1.shapes.add_textbox(Inches(1.0), Inches(5.8), Inches(6.0), Inches(0.8))
    tf_f = cov_foot.text_frame
    p_f = tf_f.paragraphs[0]
    p_f.text = "BIZNES HAMKORLAR VA INVESTORLAR UCHUN TAQDIMOT  |  2026"
    p_f.font.name = "Segoe UI"
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = C_TURQUOISE
    p_f.font.bold = True

    # ==========================================
    # SLIDE 2: BIZNES MUAMMO VA IMKONIYAT (PROBLEM)
    # ==========================================
    slide_2 = prs.slides.add_slide(blank_layout)
    apply_background(slide_2)
    add_slide_title(slide_2, "BOZOR MUAMMOLARI VA IMKONIYAT")

    col_width = Inches(3.6)
    col_height = Inches(4.5)
    gap = Inches(0.4)
    start_left = Inches(0.8)
    top_pos = Inches(1.8)

    problems = [
        {
            "num": "01",
            "title": "Tashkiliy Qiyinchiliklar",
            "desc": "Sayyohlar gidlar, haydovchilar va marshrutlarni turli joylardan qidirishga majbur. Yagona, tezkor va ishonchli buyurtma berish vositasi mavjud emas.",
            "sub": "Operatsion menejmentning parchalanganligi."
        },
        {
            "num": "02",
            "title": "Shaffof Emas Narxlar",
            "desc": "Turizm bozorida narxlar sun'iy oshirilgan. Sayyoh oldindan aniq xizmatlar uchun qancha pul to'lashini va narx qanday shakllanishini ko'ra olmaydi.",
            "sub": "Yashirin komissiyalar va noaniqlik."
        },
        {
            "num": "03",
            "title": "Sifat va Audit Kamchiligi",
            "desc": "Haydovchi va gidlarning sifati oldindan tekshirilmaydi. Xavfsizlik va xizmat darajasi kafolatlanmaganligi sayyohlar ishonchini yo'qotadi.",
            "sub": "Audit va reyting tizimining yo'qligi."
        }
    ]

    for i, prob in enumerate(problems):
        left_pos = start_left + i * (col_width + gap)
        add_card(slide_2, left_pos, top_pos, col_width, col_height)
        
        tb = slide_2.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.2), col_width - Inches(0.4), col_height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_num = tf.paragraphs[0]
        p_num.text = prob["num"]
        p_num.font.name = "Georgia"
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = C_TURQUOISE
        
        p_title = tf.add_paragraph()
        p_title.text = prob["title"]
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = C_GOLD
        p_title.space_before = Pt(10)
        p_title.space_after = Pt(10)
        
        p_desc = tf.add_paragraph()
        p_desc.text = prob["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = C_SLATE_400
        p_desc.space_after = Pt(10)
        
        p_sub = tf.add_paragraph()
        p_sub.text = prob["sub"]
        p_sub.font.name = "Segoe UI"
        p_sub.font.size = Pt(11)
        p_sub.font.italic = True
        p_sub.font.color.rgb = C_SLATE_600

    # ==========================================
    # SLIDE 3: OPERATSION MENEJMENT (MANAGEMENT)
    # ==========================================
    slide_3 = prs.slides.add_slide(blank_layout)
    apply_background(slide_3)
    add_slide_title(slide_3, "OPERATSION MENEJMENT VA STRUKTURA")

    left_tb = slide_3.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(4.5), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "Samarali Boshqaruv Model"
    pl_1.font.name = "Georgia"
    pl_1.font.size = Pt(26)
    pl_1.font.bold = True
    pl_1.font.color.rgb = C_WHITE
    pl_1.space_after = Pt(15)
    
    pl_2 = tf_l.add_paragraph()
    pl_2.text = "Inson omilini kamaytirgan holda, platforma barcha buyurtmalar, haydovchilar va gidlar faoliyatini markazlashgan boshqaruv paneli orqali nazorat qiladi."
    pl_2.font.name = "Segoe UI"
    pl_2.font.size = Pt(14)
    pl_2.font.color.rgb = C_SLATE_400
    pl_2.space_after = Pt(15)

    pl_3 = tf_l.add_paragraph()
    pl_3.text = "Barcha jarayonlar avtomatlashtirilgan bo'lib, dispetcherlar va operatsion xodimlarga bo'lgan ehtiyojni 90% gacha kamaytiradi."
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(12)
    pl_3.font.color.rgb = C_TURQUOISE

    right_left = Inches(5.8)
    card_w = Inches(6.7)
    card_h = Inches(1.3)
    card_gap = Inches(0.2)
    
    pillars = [
        {
            "title": "🚗 Haydovchilar Menejmenti",
            "desc": "Avtomobillar sig'imi, turi (sedan, minivan, avtobus) va yo'nalish tariflari bo'yicha real vaqtda avtomatik boshqaruv va band qilish."
        },
        {
            "title": "🗣 Gidlar Boshqaruvi",
            "desc": "Gidlar o'z tillari (EN, RU, ES, FR, UZ) va bandlik kalendarlari asosida tizimga integratsiya qilingan."
        },
        {
            "title": "📊 Admin Dashboard",
            "desc": "Platforma ma'murlari uchun barcha faol turlarni kuzatish, kelib tushgan to'lovlarni nazorat qilish va hisobotlarni shakllantirish paneli."
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
    # SLIDE 4: MARKETING STRATEGIYASI (MARKETING)
    # ==========================================
    slide_4 = prs.slides.add_slide(blank_layout)
    apply_background(slide_4)
    add_slide_title(slide_4, "MARKETING VA MIJOZLARNI JALB QILISH")

    step_w = Inches(3.6)
    step_h = Inches(4.5)
    step_gap = Inches(0.4)
    step_start = Inches(0.8)
    step_top = Inches(1.8)

    marketings = [
        {
            "step": "B2C RAQAMLI MARKETING",
            "icon": "📱",
            "title": "Target Reklama & SEO",
            "desc": "Google Ads, Instagram va Facebook orqali O'zbekistonga sayohat rejalashtirayotgan xorijiy sayyohlarni maqsadli jalb qilish. Saytning xalqaro SEO optimallashtirilishi organik trafikni oshiradi."
        },
        {
            "step": "B2B HAMKORLIK",
            "icon": "🏨",
            "title": "Mehmonxonalar va Hostellar",
            "desc": "Samarqand va Toshkentdagi 50+ yirik mehmonxonalar bilan hamkorlik shartnomalari. Har bir xonada platformaga yo'naltiruvchi maxsus QR-kod stikerlari o'rnatiladi."
        },
        {
            "step": "INFLUENCER MARKETING",
            "icon": "🗣",
            "title": "Sayohat Blogerlari",
            "desc": "Chet ellik taniqli travel-blogerlarni taklif qilish va ularning real sayohatlarini xaritada jonli kuzatish (live tracking) orqali virusli marketing kampaniyalarini amalga oshirish."
        }
    ]

    for i, mkt in enumerate(marketings):
        left_pos = step_start + i * (step_w + step_gap)
        add_card(slide_4, left_pos, step_top, step_w, step_h)
        
        tb = slide_4.shapes.add_textbox(left_pos + Inches(0.15), step_top + Inches(0.2), step_w - Inches(0.3), step_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_st = tf.paragraphs[0]
        p_st.text = mkt["step"]
        p_st.font.name = "Segoe UI"
        p_st.font.size = Pt(11)
        p_st.font.bold = True
        p_st.font.color.rgb = C_TURQUOISE
        p_st.alignment = PP_ALIGN.CENTER
        
        p_ico = tf.add_paragraph()
        p_ico.text = mkt["icon"]
        p_ico.font.size = Pt(32)
        p_ico.alignment = PP_ALIGN.CENTER
        p_ico.space_before = Pt(10)
        p_ico.space_after = Pt(10)
        
        p_title = tf.add_paragraph()
        p_title.text = mkt["title"]
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(16)
        p_title.font.bold = True
        p_title.font.color.rgb = C_GOLD
        p_title.alignment = PP_ALIGN.CENTER
        p_title.space_after = Pt(10)
        
        p_desc = tf.add_paragraph()
        p_desc.text = mkt["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(11)
        p_desc.font.color.rgb = C_SLATE_400
        p_desc.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 5: AUDIT VA SIFAT NAZORATI (AUDIT)
    # ==========================================
    slide_5 = prs.slides.add_slide(blank_layout)
    apply_background(slide_5)
    add_slide_title(slide_5, "AUDIT VA SIFAT NAZORATI TIZIMI")

    left_tb = slide_5.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(4.5), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "Kafolatlangan Sifat"
    pl_1.font.name = "Georgia"
    pl_1.font.size = Pt(26)
    pl_1.font.bold = True
    pl_1.font.color.rgb = C_WHITE
    pl_1.space_after = Pt(15)
    
    pl_2 = tf_l.add_paragraph()
    pl_2.text = "Sayohat davomida eng yuqori darajada xavfsizlik va xizmat sifatini ta'minlash maqsadida platformamizda ko'p bosqichli audit tizimi joriy qilingan."
    pl_2.font.name = "Segoe UI"
    pl_2.font.size = Pt(14)
    pl_2.font.color.rgb = C_SLATE_400
    pl_2.space_after = Pt(15)

    pl_3 = tf_l.add_paragraph()
    pl_3.text = "Har bir haydovchi va gid muntazam tekshiruvdan o'tkaziladi."
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(12)
    pl_3.font.color.rgb = C_TURQUOISE

    right_left = Inches(5.8)
    card_w = Inches(6.7)
    card_h = Inches(1.3)
    card_gap = Inches(0.2)
    
    audits = [
        {
            "title": "🔒 OTP Tasdiqlash & Anti-Fraud",
            "desc": "Buyurtmani rasmiylashtirishda email/WhatsApp orqali majburiy OTP kod kiritiladi. Bu soxta buyurtmalarni 100% oldini oladi."
        },
        {
            "title": "🚗 Avtotransport Texnik Auditi",
            "desc": "Hamkorlikdagi barcha transport vositalari konditsioner, tozalik va xavfsizlik kamarlari bo'yicha yillik texnik auditdan o'tadi."
        },
        {
            "title": "🗣 Gidlar Litsenziya Nazorati",
            "desc": "Tizimga faqat davlat tomonidan litsenziyalangan, chet tillarini bilish darajasi tasdiqlangan professional gidlar jalb etiladi."
        }
    ]

    for i, aud in enumerate(audits):
        curr_top = Inches(1.8) + i * (card_h + card_gap)
        add_card(slide_5, right_left, curr_top, card_w, card_h)
        
        tb = slide_5.shapes.add_textbox(right_left + Inches(0.2), curr_top + Inches(0.1), card_w - Inches(0.4), card_h - Inches(0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_t = tf.paragraphs[0]
        p_t.text = aud["title"]
        p_t.font.name = "Georgia"
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = C_GOLD
        
        p_d = tf.add_paragraph()
        p_d.text = aud["desc"]
        p_d.font.name = "Segoe UI"
        p_d.font.size = Pt(11.5)
        p_d.font.color.rgb = C_SLATE_400
        p_d.space_before = Pt(4)

    # ==========================================
    # SLIDE 6: IQTISODIY YONDASHUV (ECONOMICS)
    # ==========================================
    slide_6 = prs.slides.add_slide(blank_layout)
    apply_background(slide_6)
    add_slide_title(slide_6, "IQTISODIY YONDASHUV VA UNIT-IQTISODIYOT")

    box_w = Inches(3.6)
    box_h = Inches(2.2)
    top_pos_1 = Inches(1.8)
    top_pos_2 = Inches(4.3)
    left_1 = Inches(0.8)
    left_2 = Inches(4.8)
    left_3 = Inches(8.8)

    metrics = [
        {"val": "15%", "lbl": "Platforma Komissiyasi", "sub": "Gidlar, haydovchilar va restoranlar to'lovlaridan platforma foydasi."},
        {"val": "$120", "lbl": "O'rtacha Buyurtma Narxi", "sub": "1 sayohat davomida bitta sayyoh tomonidan transport va gidlar uchun qilinadigan xarajat."},
        {"val": "$18", "lbl": "Mijozdan Olinadigan Sof Foyda", "sub": "Har bir jalb etilgan sayyohdan komissiya hisobiga platformaga tushadigan o'rtacha foyda."}
    ]

    for i, met in enumerate(metrics):
        left_pos = left_1 + i * (box_w + Inches(0.4))
        add_card(slide_6, left_pos, top_pos_1, box_w, box_h, border_color=C_TURQUOISE)
        
        tb = slide_6.shapes.add_textbox(left_pos + Inches(0.2), top_pos_1 + Inches(0.15), box_w - Inches(0.4), box_h - Inches(0.3))
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

        p_sub = tf.add_paragraph()
        p_sub.text = met["sub"]
        p_sub.font.name = "Segoe UI"
        p_sub.font.size = Pt(10)
        p_sub.font.color.rgb = C_SLATE_400
        p_sub.alignment = PP_ALIGN.CENTER
        p_sub.space_before = Pt(5)

    panel_w = Inches(11.733)
    panel_h = Inches(2.0)
    add_card(slide_6, left_1, top_pos_2, panel_w, panel_h)
    
    tb_p = slide_6.shapes.add_textbox(left_1 + Inches(0.3), top_pos_2 + Inches(0.2), panel_w - Inches(0.6), panel_h - Inches(0.4))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True
    
    pp_1 = tf_p.paragraphs[0]
    pp_1.text = "🎯 Past CAC (Mijozni jalb qilish narxi) va Yuqori ROI"
    pp_1.font.name = "Georgia"
    pp_1.font.size = Pt(18)
    pp_1.font.bold = True
    pp_1.font.color.rgb = C_GOLD
    pp_1.space_after = Pt(6)
    
    pp_2 = tf_p.add_paragraph()
    pp_2.text = "Bizning marketing modelimiz bevosita mehmonxonalar, QR-kod integratsiyalari va organik qidiruvga asoslangan. Shu sababli mijozni jalb qilish tannarxi (CAC) o'rtacha $2-$3 ni tashkil etadi. Bu esa har bir buyurtmadan kamida 6 barobar sof daromad (ROI) olishni ta'minlaydi."
    pp_2.font.name = "Segoe UI"
    pp_2.font.size = Pt(12)
    pp_2.font.color.rgb = C_SLATE_400

    # ==========================================
    # SLIDE 7: BIZNES MODEL VA DAROMAD MANBALARI
    # ==========================================
    slide_7 = prs.slides.add_slide(blank_layout)
    apply_background(slide_7)
    add_slide_title(slide_7, "MOLIYAVIY PROYEKSIYALAR VA KO'RSATKICHLAR")

    col_w = Inches(3.6)
    col_h = Inches(4.5)
    gap = Inches(0.4)
    start_left = Inches(0.8)
    top_pos = Inches(1.8)

    models = [
        {
            "title": "2026-yil (Samarqand)",
            "val": "$150,000",
            "desc": "Samarqand shahrida loyihani to'liq yo'lga qo'yish va 10,000 dan ortiq turlarni muvaffaqiyatli band qilish.",
            "points": [
                "150+ gid va haydovchilar tarmog'i.",
                "O'rtacha aylanma: $1.2 Million."
            ]
        },
        {
            "title": "2027-yil (Kengayish)",
            "val": "$600,000",
            "desc": "Toshkent, Buxoro, Xiva va Qoraqalpog'iston shaharlarini integratsiya qilish hamda turlarni ko'paytirish.",
            "points": [
                "600+ gid va haydovchilar tarmog'i.",
                "B2B va mehmonxonalar bilan hamkorlik."
            ]
        },
        {
            "title": "2028-yil (Milliy Lider)",
            "val": "$1,800,000",
            "desc": "O'zbekistondagi eng yirik mustaqil shaxsiy sayohat konstruktoriga aylanish va super-app integratsiyasi.",
            "points": [
                "2,000+ hamkorlar tarmog'i.",
                "Afrosiyob chiptalari va mehmonxona bron."
            ]
        }
    ]

    for i, mod in enumerate(models):
        left_pos = start_left + i * (col_w + gap)
        add_card(slide_7, left_pos, top_pos, col_w, col_h)
        
        tb = slide_7.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
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
    # SLIDE 8: TEXNOLOGIK STACK VA AVTOMATIZATSIYA
    # ==========================================
    slide_8 = prs.slides.add_slide(blank_layout)
    apply_background(slide_8)
    add_slide_title(slide_8, "TEXNOLOGIK STACK VA AVTOMATIZATSIYA (n8n)")

    box_w = Inches(5.6)
    box_h = Inches(4.5)
    left_1 = Inches(0.8)
    left_2 = Inches(6.8)
    top_pos = Inches(1.8)

    add_card(slide_8, left_1, top_pos, box_w, box_h)
    tb_l = slide_8.shapes.add_textbox(left_1 + Inches(0.3), top_pos + Inches(0.3), box_w - Inches(0.6), box_h - Inches(0.6))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True

    pl_t = tf_l.paragraphs[0]
    pl_t.text = "💻 Platforma Stacki"
    pl_t.font.name = "Georgia"
    pl_t.font.size = Pt(20)
    pl_t.font.bold = True
    pl_t.font.color.rgb = C_GOLD
    pl_t.space_after = Pt(15)

    stacks = [
        ("Next.js 16 (App Router)", "Tez yuklanish, SEO optimallik va yuqori xavfsizlik."),
        ("Supabase (PostgreSQL)", "Ma'lumotlar xavfsizligi va real vaqtdagi gid/transport bazasi."),
        ("Leaflet.js Maps", "Bepul va ochiq kodli xarita tizimi (Google Maps uchun ortiqcha to'lov yo'q)."),
        ("OTP Verification System", "Aloqa xavfsizligi va buyurtmani vaucher ko'rinishida yuborish.")
    ]

    for label, desc in stacks:
        p_st = tf_l.add_paragraph()
        p_st.text = f"{label}: "
        p_st.font.name = "Segoe UI"
        p_st.font.size = Pt(12)
        p_st.font.bold = True
        p_st.font.color.rgb = C_WHITE
        
        run = p_st.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = C_SLATE_400
        p_st.space_after = Pt(10)

    add_card(slide_8, left_2, top_pos, box_w, box_h)
    tb_r = slide_8.shapes.add_textbox(left_2 + Inches(0.3), top_pos + Inches(0.3), box_w - Inches(0.6), box_h - Inches(0.6))
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
    # SLIDE 9: ERISHILGAN NATIJALAR (TRACTION)
    # ==========================================
    slide_9 = prs.slides.add_slide(blank_layout)
    apply_background(slide_9)
    add_slide_title(slide_9, "ERISHILGAN MUVAFFAQIYATLAR VA KOD TAYYORLIGI")

    left_tb = slide_9.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.0), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "LOYIHANING BUGUNGI HOLATI"
    pl_1.font.name = "Segoe UI"
    pl_1.font.size = Pt(14)
    pl_1.font.bold = True
    pl_1.font.color.rgb = C_TURQUOISE
    pl_1.space_after = Pt(10)

    pl_2 = tf_l.add_paragraph()
    pl_2.text = "Tayyor va Ishlovchi MVP"
    pl_2.font.name = "Georgia"
    pl_2.font.size = Pt(36)
    pl_2.font.bold = True
    pl_2.font.color.rgb = C_GOLD
    pl_2.space_after = Pt(15)

    pl_3 = tf_l.add_paragraph()
    pl_3.text = "Platformaning veb-versiyasi ishlab chiqildi va barcha asosiy funksiyalar kod darajasida tayyorlandi:"
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(13)
    pl_3.font.color.rgb = C_WHITE
    pl_3.space_after = Pt(10)

    tractions = [
        ("Vercel Live-demo", "Loyiha muvaffaqiyatli bulutga yuklandi va testdan o'tdi."),
        ("OSRM Routing", "Haqiqiy avtomobil yo'llari bo'yicha navigatsiya chizig'i ishlaydi."),
        ("Jonli GPS Navigatsiyasi", "Foydalanuvchi joylashuvini live ko'rsatish funksiyasi tayyor."),
        ("Simulyatsiya rejimi (Demo)", "Virtual haydovchining harakatlanishini kuzatish imkoniyati.")
    ]
    for lbl, desc in tractions:
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

    right_left = Inches(6.5)
    add_card(slide_9, right_left, Inches(1.8), Inches(6.0), Inches(4.5))
    
    tb_r = slide_9.shapes.add_textbox(right_left + Inches(0.4), Inches(2.1), Inches(5.2), Inches(3.9))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "📈 Keyingi 3 Oylik Reja"
    pr_t.font.name = "Georgia"
    pr_t.font.size = Pt(20)
    pr_t.font.bold = True
    pr_t.font.color.rgb = C_GOLD
    pr_t.space_after = Pt(15)

    milestones = [
        "Mehmonxonalarga QR-kodlarni taqsimlashni boshlash.",
        "Samarqand shahridagi 50 ta yetakchi gid va 30 ta haydovchini tizimga ro'yxatga olish.",
        "Restoranlar va eko-turizm nuqtalari bilan keshbek shartnomalarini tuzish.",
        "Ilk 1,000 ta muvaffaqiyatli buyurtmani yakunlash."
    ]

    for ms in milestones:
        p = tf_r.add_paragraph()
        p.text = "⚡ " + ms
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_SLATE_400
        p.space_after = Pt(8)

    p_contact = tf_r.add_paragraph()
    p_contact.text = "Veb-sayt: uzbek-trip.vercel.app"
    p_contact.font.name = "Segoe UI"
    p_contact.font.size = Pt(13)
    p_contact.font.bold = True
    p_contact.font.color.rgb = C_TURQUOISE
    p_contact.space_before = Pt(20)

    # ==========================================
    # SLIDE 10: STRATEGIK KELAJAK (FUTURE PLANS)
    # ==========================================
    slide_10 = prs.slides.add_slide(blank_layout)
    apply_background(slide_10)
    add_slide_title(slide_10, "KELAJAKDAGI STRATEGIK REJALAR")

    col_w = Inches(3.6)
    col_h = Inches(4.5)
    gap = Inches(0.4)
    start_left = Inches(0.8)
    top_pos = Inches(1.8)

    futures = [
        {
            "num": "01",
            "title": "UzRailways Integratsiyasi",
            "desc": "Platforma ichida Afrosiyob tezyurar poyezdi chiptalarini avtomatik sotish tizimini yo'lga qo'yish (UzRailways API orqali).",
            "val": "Poyezd Chiptalari"
        },
        {
            "num": "02",
            "title": "Milliy Avia-chiptalar",
            "desc": "Xalqaro va ichki reys chiptalarini dynamic ravishda platformaga ulash. Sayohat konstruktorida poyezd + samolyot integratsiyasi.",
            "val": "Aviakompaniyalar"
        },
        {
            "num": "03",
            "title": "Ovozli Navigatsiya",
            "desc": "Sayyohlar tarixiy obidalarda yurganda avtomatik ishga tushadigan localized ovozli audioprezentatsiya (multilingual voice guidance).",
            "val": "Smart Audio Guide"
        }
    ]

    for i, fut in enumerate(futures):
        left_pos = start_left + i * (col_w + gap)
        add_card(slide_10, left_pos, top_pos, col_w, col_h)
        
        tb = slide_10.shapes.add_textbox(left_pos + Inches(0.2), top_pos + Inches(0.2), col_w - Inches(0.4), col_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_num = tf.paragraphs[0]
        p_num.text = fut["num"]
        p_num.font.name = "Georgia"
        p_num.font.size = Pt(28)
        p_num.font.bold = True
        p_num.font.color.rgb = C_TURQUOISE
        
        p_title = tf.add_paragraph()
        p_title.text = fut["title"]
        p_title.font.name = "Georgia"
        p_title.font.size = Pt(17)
        p_title.font.bold = True
        p_title.font.color.rgb = C_GOLD
        p_title.space_before = Pt(10)
        p_title.space_after = Pt(10)
        
        p_desc = tf.add_paragraph()
        p_desc.text = fut["desc"]
        p_desc.font.name = "Segoe UI"
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = C_SLATE_400
        p_desc.space_after = Pt(15)

        p_val = tf.add_paragraph()
        p_val.text = "Maqsad: " + fut["val"]
        p_val.font.name = "Segoe UI"
        p_val.font.size = Pt(12)
        p_val.font.bold = True
        p_val.font.color.rgb = C_WHITE

    # ==========================================
    # SLIDE 11: INVESTITSIYA VA SEED ROUND
    # ==========================================
    slide_11 = prs.slides.add_slide(blank_layout)
    apply_background(slide_11)
    add_slide_title(slide_11, "INVESTITSIYA TAKLIFI VA BUDJET TAQSIMOTI")

    left_tb = slide_11.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(5.0), Inches(4.5))
    tf_l = left_tb.text_frame
    tf_l.word_wrap = True
    
    pl_1 = tf_l.paragraphs[0]
    pl_1.text = "MOLIYAVIY EHTIYOJ"
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
    pl_3.text = "Ushbu sarmoya loyihaning operatsion faoliyatini kengaytirish va 1 yillik rivojlanish bosqichlari uchun sarflanadi."
    pl_3.font.name = "Segoe UI"
    pl_3.font.size = Pt(13)
    pl_3.font.color.rgb = C_WHITE
    pl_3.space_after = Pt(10)

    allocs = [
        ("Dasturiy Rivojlanish (40%)", "iOS / Android mobil ilovalarini tayyorlash."),
        ("Marketing va Jalb Etish (35%)", "B2C va B2B mehmonxona kampaniyalari."),
        ("Operatsion Xarajatlar (25%)", "Haydovchilar auditini o'tkazish va ofis faoliyati.")
    ]
    for lbl, desc in allocs:
        p = tf_l.add_paragraph()
        p.text = f"✔ {lbl}: "
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = C_GOLD
        
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = C_SLATE_400
        p.space_after = Pt(5)

    right_left = Inches(6.5)
    add_card(slide_11, right_left, Inches(1.8), Inches(6.0), Inches(4.5))
    
    tb_r = slide_11.shapes.add_textbox(right_left + Inches(0.4), Inches(2.1), Inches(5.2), Inches(3.9))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True

    pr_t = tf_r.paragraphs[0]
    pr_t.text = "🤝 Hamkorlik Shartlari"
    pr_t.font.name = "Georgia"
    pr_t.font.size = Pt(20)
    pr_t.font.bold = True
    pr_t.font.color.rgb = C_GOLD
    pr_t.space_after = Pt(15)

    terms = [
        "10-15% gacha ulush (Equity) investitsiya evaziga.",
        "Mehmonxonalar va restorantlar uchun B2B hamkorlikda alohida referral / keshbek tizimi.",
        "Tezyurar poyezd va aviabiletlar integratsiyasida qo'shma aksiyalar va hamkorlik imkoniyatlari.",
        "Strategik boshqaruv kengashida ishtirok etish huquqi."
    ]

    for trm in terms:
        p = tf_r.add_paragraph()
        p.text = "⚡ " + trm
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.color.rgb = C_SLATE_400
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 12: SAVOLLAR VA ALOQA (CONTACT)
    # ==========================================
    slide_12 = prs.slides.add_slide(blank_layout)
    apply_background(slide_12)
    
    # Large Decorative Golden Frame in Center
    frame = slide_12.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(2.0), Inches(1.5), Inches(9.333), Inches(4.5))
    frame.fill.solid()
    frame.fill.fore_color.rgb = C_BG_CARD
    frame.line.color.rgb = C_GOLD
    frame.line.width = Pt(2)
    
    tb = slide_12.shapes.add_textbox(Inches(2.5), Inches(2.0), Inches(8.333), Inches(3.5))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = "KATTA RAHMAT!"
    p1.font.name = "Georgia"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = C_GOLD
    p1.alignment = PP_ALIGN.CENTER
    p1.space_after = Pt(10)
    
    p2 = tf.add_paragraph()
    p2.text = "O'zbekistonda Zamonaviy va Shaxsiy Turizm Ekotizimini Birgalikda Yarataylik."
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(16)
    p2.font.color.rgb = C_WHITE
    p2.alignment = PP_ALIGN.CENTER
    p2.space_after = Pt(25)
    
    p3 = tf.add_paragraph()
    p3.text = "📞 Aloqa: +998 (94) 019-64-20\n📧 Email: mikemukhriddin@gmail.com\n🌐 Veb-sayt: uzbek-trip.vercel.app"
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(14)
    p3.font.color.rgb = C_SLATE_400
    p3.alignment = PP_ALIGN.CENTER
    p3.space_after = Pt(15)

    p4 = tf.add_paragraph()
    p4.text = "Savollar bormi? Biz har qanday hamkorlikka tayyormiz!"
    p4.font.name = "Segoe UI"
    p4.font.size = Pt(13)
    p4.font.color.rgb = C_TURQUOISE
    p4.font.bold = True
    p4.font.italic = True
    p4.alignment = PP_ALIGN.CENTER

    # Save presentation
    output_filename = "Samarqand_CrafTour_Investor_Pitch_Deck.pptx"
    prs.save(output_filename)
    print(f"Presentation saved successfully as '{output_filename}'!")

    # Convert to PDF if possible
    try:
        import os
        import win32com.client
        
        print("Converting presentation to PDF...")
        powerpoint = win32com.client.Dispatch("PowerPoint.Application")
        pptx_abs = os.path.abspath(output_filename)
        pdf_filename = "Samarqand_CrafTour_Investor_Pitch_Deck.pdf"
        pdf_abs = os.path.abspath(pdf_filename)
        
        deck = powerpoint.Presentations.Open(pptx_abs, WithWindow=False)
        deck.SaveAs(pdf_abs, 32)
        deck.Close()
        powerpoint.Quit()
        print(f"Presentation successfully converted and saved as '{pdf_filename}'!")
    except Exception as e:
        print(f"Notice: Could not automatically convert PPTX to PDF via win32com: {e}")

if __name__ == "__main__":
    create_deck()
