-- ========================================================
-- VIBESHOT DATABASE SEED DATA
-- ========================================================
-- Copy-paste this SQL into the Supabase SQL Editor to populate
-- your tables with high-quality sample data!
-- This script safely detects existing users to link the data.

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Dapatkan user_id pertama yang ada di database auth.users (jika ada)
    SELECT id INTO target_user_id FROM auth.users LIMIT 1;
    
    -- Jika tidak ada user sama sekali, kita buat data brief dengan user_id NULL
    -- Ini aman karena foreign key briefs.user_id mengizinkan NULL.
    
    -- ========================================================
    -- DATA BRIEF 1: Glow & Go Sunscreen (Skincare TikTok)
    -- ========================================================
    INSERT INTO briefs (
        user_id, 
        title, 
        premise, 
        visual_style, 
        master_identity, 
        shotlist, 
        moodboard
    ) VALUES (
        target_user_id,
        'Glow & Go Sunscreen - Sunscreen Anti-Ribet',
        'Sebuah video transisi TikTok dramatis yang menunjukkan seorang mahasiswi terburu-buru kuliah di bawah sinar matahari Jakarta yang terik, namun tetap terlindungi dan wajahnya glowing seketika karena Glow & Go Sunscreen.',
        'real-life',
        '{
            "brand": "Glow & Go",
            "campaign": "Sunscreen Anti-Ribet",
            "target_audience": "Gen Z & Millennial active students",
            "duration": "15s",
            "tone": "Energetic, Fun, Relatable"
        }'::jsonb,
        '[
            {
                "shot": 1,
                "visual": "POV berlari terengah-engah di bawah terik matahari jalanan Jakarta, bayangan tangan menutupi wajah dari silau matahari.",
                "audio": "Sound effect: Deru klakson kota + detak jantung cepat. Voiceover: ''Aduh, udah jam segini, mana panas banget lagi! Wajah bisa kusam nih...''",
                "duration": "4s",
                "camera_angle": "POV_PERSPECTIVE",
                "lighting": "GOLDEN_HOUR"
            },
            {
                "shot": 2,
                "visual": "Transisi whip-pan cepat. Karakter berhenti di halte, mengeluarkan Glow & Go Sunscreen dari tas dan langsung mengaplikasikannya ke wajah dengan tepukan lembut. Efek visual sejuk/cooling biru transparan menyelimuti wajah.",
                "audio": "Sound effect: *Whoosh* segar, musik langsung berubah menjadi upbeat & ceria.",
                "duration": "5s",
                "camera_angle": "MEDIUM_SHOT",
                "lighting": "STUDIO_PRO"
            },
            {
                "shot": 3,
                "visual": "Close-up wajah karakter yang tersenyum percaya diri. Kulit wajahnya tampak glowing natural, terlindungi, bebas minyak, siap menghadapi hari kuliah.",
                "audio": "Voiceover: ''Tapi untung ada Glow & Go! Instant cooling, no white cast, and glowing all day!''",
                "duration": "6s",
                "camera_angle": "CLOSE_UP",
                "lighting": "STUDIO_PRO"
            }
        ]'::jsonb,
        '[
            {
                "id": "mb1_1",
                "prompt": "Cinematic close-up of a premium minimalist sunscreen tube on a clean tropical marble table, bathed in warm sun rays, aesthetic commercial photography",
                "imageUrl": "https://images.pollinations.ai/p/cinematic%20close-up%20of%20a%20premium%20minimalist%20sunscreen%20tube%20on%20a%20clean%20tropical%20marble%20table%2C%20bathed%20in%20warm%20sun%20rays%2C%20aesthetic%20commercial%20photography?width=512&height=512&seed=101"
            },
            {
                "id": "mb1_2",
                "prompt": "Aesthetic Indonesian young female student smiling under gentle warm sunlight, glowing clear skin, natural look, high detailed commercial photography",
                "imageUrl": "https://images.pollinations.ai/p/aesthetic%20Indonesian%20young%20female%20student%20smiling%20under%20gentle%20warm%20sunlight%2C%20glowing%20clear%20skin%2C%20natural%20look%2C%20high%20detailed%20commercial%20photography?width=512&height=512&seed=102"
            }
        ]'::jsonb
    );

    -- ========================================================
    -- DATA BRIEF 2: Kopi Senja (Cozy Coffee Shop Reels)
    -- ========================================================
    INSERT INTO briefs (
        user_id, 
        title, 
        premise, 
        visual_style, 
        master_identity, 
        shotlist, 
        moodboard
    ) VALUES (
        target_user_id,
        'Kopi Senja - Kopi Susu Aren Spesial',
        'Video cinematic aesthetic Reels dengan ambience cozy sore hari di coffee shop lokal, menonjolkan proses brewing espresso yang smooth dan pouring susu aren yang memanjakan mata.',
        'retro_aesthetic',
        '{
            "brand": "Kopi Senja",
            "campaign": "Sore di Kopi Senja",
            "target_audience": "Coffee lovers, remote workers, aesthetics enthusiast",
            "duration": "30s",
            "tone": "Warm, Nostalgic, Relaxing, ASMR"
        }'::jsonb,
        '[
            {
                "shot": 1,
                "visual": "Extreme wide establishing shot suasana Kopi Senja di sore hari, lampu gantung warm-white mulai menyala, beberapa pelanggan membaca buku dengan latar jendela kaca besar berembun.",
                "audio": "Sound: Suara rintik hujan lembut + petikan gitar akustik lo-fi lambat. Ambient coffee shop chatter.",
                "duration": "8s",
                "camera_angle": "WIDE_ESTABLISHING",
                "lighting": "DRAMATIC_CHIAROSCURO"
            },
            {
                "shot": 2,
                "visual": "Extreme close-up macro shot cairan espresso kental berwarna cokelat keemasan menetes perlahan dari portafilter mesin espresso, disusul kepulan uap hangat.",
                "audio": "ASMR Sound: Desisan mesin espresso *psshhhhh* + tetesan espresso yang kaya.",
                "duration": "10s",
                "camera_angle": "CLOSE_UP",
                "lighting": "GOLDEN_HOUR"
            },
            {
                "shot": 3,
                "visual": "Medium shot barista menuangkan gula aren cair kental ke dasar gelas, disusul es batu, susu segar dingin, dan shot espresso di atasnya hingga membentuk gradasi warna yang estetik.",
                "audio": "Voiceover lembut: ''Selalu ada cerita di balik setiap cangkir kopi soremu. Temukan ketenanganmu di Kopi Senja.''",
                "duration": "12s",
                "camera_angle": "MEDIUM_SHOT",
                "lighting": "DRAMATIC_CHIAROSCURO"
            }
        ]'::jsonb,
        '[
            {
                "id": "mb2_1",
                "prompt": "Aesthetic cozy coffee shop interior during sunset, warm lighting, wooden table with an espresso machine in the background, vintage film camera style",
                "imageUrl": "https://images.pollinations.ai/p/aesthetic%20cozy%20coffee%20shop%20interior%20during%20sunset%2C%20warm%20lighting%2C%20wooden%20table%20with%20an%20espresso%20machine%20in%20the%20background%2C%20vintage%20film%20camera%20style?width=512&height=512&seed=201"
            },
            {
                "id": "mb2_2",
                "prompt": "Macro shot of milk pouring into rich dark espresso coffee creating beautiful caramel swirls, warm golden hour light, high detailed commercial",
                "imageUrl": "https://images.pollinations.ai/p/macro%20shot%20of%20milk%20pouring%20into%20rich%20dark%20espresso%20coffee%20creating%20beautiful%20caramel%20swirls%2C%20warm%20golden%20hour%20light%2C%20high%20detailed%20commercial?width=512&height=512&seed=202"
            }
        ]'::jsonb
    );

    -- ========================================================
    -- DATA BRIEF 3: Hijab Kirana (Ramadhan / Hari Raya Campaign)
    -- ========================================================
    INSERT INTO briefs (
        user_id, 
        title, 
        premise, 
        visual_style, 
        master_identity, 
        shotlist, 
        moodboard
    ) VALUES (
        target_user_id,
        'Hijab Kirana - Anggun di Hari Fitri',
        'Kampanye video storytelling 3D Animation menyentuh tentang kepulangan seorang anak perempuan ke kampung halaman untuk memberikan hadiah berupa hijab premium Kirana kepada ibunya saat malam takbiran.',
        'animation',
        '{
            "brand": "Hijab Kirana",
            "campaign": "Hadiah Terbaik Ibu",
            "target_audience": "Moslem families, active daughters, mothers",
            "duration": "20s",
            "tone": "Emotional, Heartwarming, Elegant"
        }'::jsonb,
        '[
            {
                "shot": 1,
                "visual": "Animasi 3D premium. Karakter anak perempuan turun dari bus antar kota membawa koper dengan wajah lelah tapi tersenyum lebar. Suasana malam hari takbiran yang hangat dengan lampion-lampion kecil menggantung di jalan desa.",
                "audio": "Sound effect: Suara takbiran samar di kejauhan + melodi biola hangat bernuansa kekeluargaan.",
                "duration": "6s",
                "camera_angle": "WIDE_ESTABLISHING",
                "lighting": "NEON_GLOW"
            },
            {
                "shot": 2,
                "visual": "Karakter memeluk ibunya di depan pintu rumah kayu tradisional yang asri. Sang anak kemudian menyerahkan kotak kado eksklusif berwarna rose gold bermerek Hijab Kirana dengan mata berbinar.",
                "audio": "Voiceover: ''Kebahagiaan bukan hanya tentang pulang... tapi tentang senyuman yang kita bawa pulang untuknya.''",
                "duration": "7s",
                "camera_angle": "MEDIUM_SHOT",
                "lighting": "STUDIO_PRO"
            },
            {
                "shot": 3,
                "visual": "Close-up wajah sang Ibu yang matanya berkaca-kaca bahagia sambil mengelus hijab satin premium bercorak floral anggun yang baru dibukanya dari kado.",
                "audio": "Voiceover: ''Hijab Kirana, keanggunan sejati untuk Ibu terbaik di hari kemenangan.''",
                "duration": "7s",
                "camera_angle": "CLOSE_UP",
                "lighting": "STUDIO_PRO"
            }
        ]'::jsonb,
        '[
            {
                "id": "mb3_1",
                "prompt": "Premium 3D Pixar style animation, heartwarming scene of a daughter hugging her elderly mother in front of a cozy beautiful village house, warm light",
                "imageUrl": "https://images.pollinations.ai/p/Premium%203D%20Pixar%20style%20animation%2C%20heartwarming%20scene%20of%20a%20daughter%20hugging%20her%20elderly%20mother%20in%20front%20of%20a%20cozy%20beautiful%20village%20house%2C%20warm%20light?width=512&height=512&seed=301"
            },
            {
                "id": "mb3_2",
                "prompt": "Premium 3D Pixar style close-up of hands opening a beautiful rose gold luxury gift box revealing a beautiful elegant floral silk hijab, volumetric magical lighting",
                "imageUrl": "https://images.pollinations.ai/p/Premium%203D%20Pixar%20style%20close-up%20of%20hands%20opening%20a%20beautiful%20rose%20gold%20luxury%20gift%20box%20revealing%20a%20beautiful%20elegant%20floral%20silk%20hijab%2C%20volumetric%20magical%20lighting?width=512&height=512&seed=302"
            }
        ]'::jsonb
    );

    -- ========================================================
    -- 4. UPDATE USER PROFILE CREDITS (jika profile ada)
    -- ========================================================
    IF target_user_id IS NOT NULL THEN
        INSERT INTO profiles (id, tier, credits, updated_at)
        VALUES (target_user_id, 'premium', 100, now())
        ON CONFLICT (id) DO UPDATE 
        SET tier = 'premium', credits = 100, updated_at = now();
    END IF;

END $$;
