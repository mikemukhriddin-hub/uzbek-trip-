-- ====================================================
-- 📖 WIKIPEDIA COLUMNS AND MAPPINGS MIGRATION
-- ====================================================

ALTER TABLE locations ADD COLUMN IF NOT EXISTS wikipedia_title_en VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS wikipedia_title_ru VARCHAR(255);
ALTER TABLE locations ADD COLUMN IF NOT EXISTS wikipedia_title_uz VARCHAR(255);

UPDATE locations SET wikipedia_title_en = 'Registan', wikipedia_title_ru = 'Регистан', wikipedia_title_uz = 'Registon' WHERE id = 1;
UPDATE locations SET wikipedia_title_en = 'Gur-e-Amir', wikipedia_title_ru = 'Гур-Эмир', wikipedia_title_uz = 'Goʻri_Amir' WHERE id = 2;
UPDATE locations SET wikipedia_title_en = 'Shah-i-Zinda', wikipedia_title_ru = 'Шахи_Зинда', wikipedia_title_uz = 'Shohizinda' WHERE id = 3;
UPDATE locations SET wikipedia_title_en = 'Bibi-Khanym_Mosque', wikipedia_title_ru = 'Мечеть_Биби-Ханым', wikipedia_title_uz = 'Bibi_Xonim_masjidi' WHERE id = 4;
UPDATE locations SET wikipedia_title_en = 'Ulugh_Beg_Observatory', wikipedia_title_ru = 'Обсерватория_Улугбека', wikipedia_title_uz = 'Ulugʻbek_observatoriyasi' WHERE id = 5;
UPDATE locations SET wikipedia_title_en = 'Urgut', wikipedia_title_ru = 'Ургут', wikipedia_title_uz = 'Urgut' WHERE id = 6;
UPDATE locations SET wikipedia_title_en = 'Aman-Kutan', wikipedia_title_ru = 'Аманкутан', wikipedia_title_uz = 'Omonqoʻton' WHERE id = 7;
UPDATE locations SET wikipedia_title_en = 'Mulberry_paper', wikipedia_title_ru = 'Самаркандская_бумага', wikipedia_title_uz = 'Samarqand_qogʻozi' WHERE id = 8;
UPDATE locations SET wikipedia_title_en = 'Pilaf', wikipedia_title_ru = 'Плов', wikipedia_title_uz = 'Palov' WHERE id = 9;
UPDATE locations SET wikipedia_title_en = 'Obi_non', wikipedia_title_ru = 'Тандыр-нан', wikipedia_title_uz = 'Obi_non' WHERE id = 10;
UPDATE locations SET wikipedia_title_en = 'Uzbek_cuisine', wikipedia_title_ru = 'Узбекская_кухня', wikipedia_title_uz = 'Oʻzbek_oshxonasi' WHERE id = 11;
UPDATE locations SET wikipedia_title_en = 'Po-i-Kalyan', wikipedia_title_ru = 'Пои-Калян', wikipedia_title_uz = 'Poyi_Kalon' WHERE id = 12;
UPDATE locations SET wikipedia_title_en = 'Ark_of_Bukhara', wikipedia_title_ru = 'Арк', wikipedia_title_uz = 'Buxoro_arki' WHERE id = 13;
UPDATE locations SET wikipedia_title_en = 'Lyabi-Khauz', wikipedia_title_ru = 'Ляби-хауз', wikipedia_title_uz = 'Labi_hovuz' WHERE id = 14;
UPDATE locations SET wikipedia_title_en = 'Chor_Minor', wikipedia_title_ru = 'Чор-Минор', wikipedia_title_uz = 'Chor_Minor' WHERE id = 15;
UPDATE locations SET wikipedia_title_en = 'Samanid_Mausoleum', wikipedia_title_ru = 'Мавзолей_Саманидов', wikipedia_title_uz = 'Somoniylar_maqbarasi' WHERE id = 16;
UPDATE locations SET wikipedia_title_en = 'Sitorai_Mokhi-Khosa', wikipedia_title_ru = 'Ситораи_Мохи-хоса', wikipedia_title_uz = 'Sitorai_Mohi_Xosa' WHERE id = 17;
UPDATE locations SET wikipedia_title_en = 'Chor-Bakr', wikipedia_title_ru = 'Чор-Бакр', wikipedia_title_uz = 'Chor_Bakr' WHERE id = 18;
UPDATE locations SET wikipedia_title_en = 'Kyzylkum_Desert', wikipedia_title_ru = 'Кызылкум', wikipedia_title_uz = 'Qizilqum' WHERE id = 19;
UPDATE locations SET wikipedia_title_en = 'Bukhara', wikipedia_title_ru = 'Бухарский_базар', wikipedia_title_uz = 'Buxoro' WHERE id = 20;
UPDATE locations SET wikipedia_title_en = 'Uzbek_cuisine', wikipedia_title_ru = 'Узбекская_кухня', wikipedia_title_uz = 'Oʻzbek_oshxonasi' WHERE id = 21;
UPDATE locations SET wikipedia_title_en = 'Uzbek_cuisine', wikipedia_title_ru = 'Узбекская_кухня', wikipedia_title_uz = 'Oʻzbek_oshxonasi' WHERE id = 22;
UPDATE locations SET wikipedia_title_en = 'Itchan_Kala', wikipedia_title_ru = 'Ичан-Кала', wikipedia_title_uz = 'Ichan_Qalʼa' WHERE id = 23;
UPDATE locations SET wikipedia_title_en = 'Kalta_Minor', wikipedia_title_ru = 'Кальта-Минор', wikipedia_title_uz = 'Kalta_minor' WHERE id = 24;
UPDATE locations SET wikipedia_title_en = 'Tash_Khauli', wikipedia_title_ru = 'Таш-Хаули', wikipedia_title_uz = 'Toshhovli' WHERE id = 25;
UPDATE locations SET wikipedia_title_en = 'Kunya-Ark', wikipedia_title_ru = 'Куня-Арк', wikipedia_title_uz = 'Koʻhna_Ark' WHERE id = 26;
UPDATE locations SET wikipedia_title_en = 'Juma_Mosque,_Khiva', wikipedia_title_ru = 'Джума-мечеть_(Хива)', wikipedia_title_uz = 'Juma_masjidi_(Xiva)' WHERE id = 27;
UPDATE locations SET wikipedia_title_en = 'Islam_Khodja_Minaret', wikipedia_title_ru = 'Минарет_Ислам-Ходжа', wikipedia_title_uz = 'Islom_xoʻja_madrasasi_va_minorasi' WHERE id = 28;
UPDATE locations SET wikipedia_title_en = 'Pahlavan_Mahmud_Mausoleum', wikipedia_title_ru = 'Мавзолей_Пахлавана_Махмуда', wikipedia_title_uz = 'Pahlavon_Mahmud_maqbarasi' WHERE id = 29;
UPDATE locations SET wikipedia_title_en = 'Kibla_Tozabog', wikipedia_title_ru = 'Кибла_Тозабог', wikipedia_title_uz = 'Qibla_Tozabogʻ' WHERE id = 30;
UPDATE locations SET wikipedia_title_en = 'Suzani', wikipedia_title_ru = 'Сюзане', wikipedia_title_uz = 'Soʻzana' WHERE id = 31;
UPDATE locations SET wikipedia_title_en = 'Shivit_oshi', wikipedia_title_ru = 'Шивит_оши', wikipedia_title_uz = 'Shivit_oshi' WHERE id = 32;
UPDATE locations SET wikipedia_title_en = 'Tukhum_barak', wikipedia_title_ru = 'Тухум_барак', wikipedia_title_uz = 'Tuxum_barak' WHERE id = 33;
UPDATE locations SET wikipedia_title_en = 'Aqsaray_Palace', wikipedia_title_ru = 'Ак-Сарай_(Шахрисабз)', wikipedia_title_uz = 'Oqsaroy_(Shahrisabz)' WHERE id = 34;
UPDATE locations SET wikipedia_title_en = 'Kok_Gumbaz_Mosque', wikipedia_title_ru = 'Кок-Гумбаз_(мечеть,_Шахрисабз)', wikipedia_title_uz = 'Koʻk_gumbaz_masjidi' WHERE id = 35;
UPDATE locations SET wikipedia_title_en = 'Dorus_Saodat', wikipedia_title_ru = 'Дорус-Сиадат', wikipedia_title_uz = 'Dorussaodat' WHERE id = 36;
UPDATE locations SET wikipedia_title_en = 'Amir_Temur', wikipedia_title_ru = 'Тимур', wikipedia_title_uz = 'Amir_Temur' WHERE id = 37;
UPDATE locations SET wikipedia_title_en = 'Shahrisabz', wikipedia_title_ru = 'Шахрисабз', wikipedia_title_uz = 'Shahrisabz' WHERE id = 38;
UPDATE locations SET wikipedia_title_en = 'Tandyr_kabob', wikipedia_title_ru = 'Тандыр_кабоб', wikipedia_title_uz = 'Tandir_kabob' WHERE id = 39;
UPDATE locations SET wikipedia_title_en = 'Amir_Temur_Square', wikipedia_title_ru = 'Сквер_Амира_Тимура', wikipedia_title_uz = 'Amir_Temur_xiyoboni' WHERE id = 40;
UPDATE locations SET wikipedia_title_en = 'Hazrati_Imom_complex', wikipedia_title_ru = 'Ансамбль_Хазрет_Имам', wikipedia_title_uz = 'Hazrati_Imom_majmuasi' WHERE id = 41;
UPDATE locations SET wikipedia_title_en = 'Chorsu_Bazaar', wikipedia_title_ru = 'Базар_Чорсу', wikipedia_title_uz = 'Chorsu_bozori' WHERE id = 42;
UPDATE locations SET wikipedia_title_en = 'Alisher_Navoi_Opera_and_Ballet_Theatre', wikipedia_title_ru = 'Большой_театр_имени_Алишера_Навои', wikipedia_title_uz = 'Alisher_Navoiy_nomidagi_davlat_akademik_katta_teatri' WHERE id = 43;
UPDATE locations SET wikipedia_title_en = 'Tashkent_Television_Tower', wikipedia_title_ru = 'Ташкентская_телебашня', wikipedia_title_uz = 'Toshkent_teleminorasi' WHERE id = 44;
UPDATE locations SET wikipedia_title_en = 'Naryn_(dish)', wikipedia_title_ru = 'Нарын_(блюдо)', wikipedia_title_uz = 'Norin' WHERE id = 45;
UPDATE locations SET wikipedia_title_en = 'Nukus_Museum_of_Art', wikipedia_title_ru = 'Государственный_музей_искусств_Республики_Каракалпакстан_имени_И._В._Савицкого', wikipedia_title_uz = 'Qoraqalpogʻiston_Respublikasi_I.V._Savitskiy_nomidagi_davlat_sanʼat_muzeyi' WHERE id = 46;
UPDATE locations SET wikipedia_title_en = 'Mizdakhkhan', wikipedia_title_ru = 'Миздахкан', wikipedia_title_uz = 'Mizdaxqon' WHERE id = 47;
UPDATE locations SET wikipedia_title_en = 'Chilpyk', wikipedia_title_ru = 'Чилпык', wikipedia_title_uz = 'Shilpiq_daxmasi' WHERE id = 48;
UPDATE locations SET wikipedia_title_en = 'Aral_Sea', wikipedia_title_ru = 'Аральское_море', wikipedia_title_uz = 'Orol_dengizi' WHERE id = 49;
UPDATE locations SET wikipedia_title_en = 'Ustyurt_Plateau', wikipedia_title_ru = 'Устюрт', wikipedia_title_uz = 'Ustyurt' WHERE id = 50;
UPDATE locations SET wikipedia_title_en = 'Karakalpak_cuisine', wikipedia_title_ru = 'Каракалпакская_кухня', wikipedia_title_uz = 'Qoraqalpoq_oshxonasi' WHERE id = 51;
