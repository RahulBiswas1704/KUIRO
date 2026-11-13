-- ==============================================================================
-- KUIRO: 365-Day Cultural, Regional & Industry Calendar Seeds
-- ==============================================================================

INSERT INTO public.cultural_events_calendar 
(event_name, event_date, category, regions, target_industries, prompt_context, design_suggestions)
VALUES
(
    'Republic Day',
    '2027-01-26',
    'NATIONAL',
    ARRAY['ALL_INDIA'],
    ARRAY['ALL'],
    'Celebrate the adoption of the Indian Constitution, constitutional pride, unity, and progress. Tie into the brand values of integrity, service to the nation, and commitment.',
    '{"theme": "patriotic", "suggested_palettes": ["#FF9933", "#FFFFFF", "#138808", "#000080"]}'::jsonb
),
(
    'Maha Shivratri',
    '2027-03-07',
    'FESTIVAL',
    ARRAY['NORTH_INDIA', 'CENTRAL_INDIA', 'SOUTH_INDIA'],
    ARRAY['ALL'],
    'Spiritual reflection, inner peace, devotion, overcoming darkness and ignorance. Respectful and serene tone.',
    '{"theme": "spiritual", "suggested_palettes": ["#1E293B", "#38BDF8", "#F1F5F9"]}'::jsonb
),
(
    'International Women''s Day',
    '2027-03-08',
    'INTERNATIONAL',
    ARRAY['ALL_INDIA', 'GLOBAL'],
    ARRAY['ALL'],
    'Championing female leadership, equality, empowerment, and celebrating women in the workforce, customers, and entrepreneurs.',
    '{"theme": "empowerment", "suggested_palettes": ["#7C3AED", "#EC4899", "#FDF2F8"]}'::jsonb
),
(
    'Holi (Festival of Colors)',
    '2027-03-22',
    'FESTIVAL',
    ARRAY['ALL_INDIA'],
    ARRAY['ALL'],
    'Joy, vibrant colors, triumph of good over evil, renewal of relationships. Upbeat, energetic, and colorful design.',
    '{"theme": "vibrant_festive", "suggested_palettes": ["#EC4899", "#3B82F6", "#10B981", "#F59E0B"]}'::jsonb
),
(
    'World Health Day',
    '2027-04-07',
    'HEALTH_AWARENESS',
    ARRAY['ALL_INDIA', 'GLOBAL'],
    ARRAY['HEALTHCARE', 'FITNESS', 'FOOD_BEVERAGE', 'CORPORATE'],
    'Focus on preventive health, accessible wellness, healthy lifestyles, and empathetic medical care.',
    '{"theme": "health_vitality", "suggested_palettes": ["#0284C7", "#10B981", "#F0FDF4"]}'::jsonb
),
(
    'National Technology Day',
    '2027-05-11',
    'INDUSTRY',
    ARRAY['ALL_INDIA'],
    ARRAY['TECH', 'STARTUPS', 'EDUCATION', 'MANUFACTURING'],
    'Celebrating Indian innovation, technological self-reliance, digital transformation, and future-forward engineering.',
    '{"theme": "futuristic", "suggested_palettes": ["#0F172A", "#06B6D4", "#3B82F6"]}'::jsonb
),
(
    'World Environment Day',
    '2027-06-05',
    'INTERNATIONAL',
    ARRAY['ALL_INDIA', 'GLOBAL'],
    ARRAY['ALL'],
    'Sustainability, environmental stewardship, eco-friendly practices, and green responsibility.',
    '{"theme": "eco_nature", "suggested_palettes": ["#15803D", "#84CC16", "#FEF08A"]}'::jsonb
),
(
    'National Doctors'' Day',
    '2027-07-01',
    'HEALTH_AWARENESS',
    ARRAY['ALL_INDIA'],
    ARRAY['HEALTHCARE', 'PHARMA', 'WELLNESS'],
    'Honoring the dedication, sacrifice, and tireless service of medical professionals across India (Dr. B.C. Roy birth anniversary).',
    '{"theme": "gratitude_medical", "suggested_palettes": ["#0369A1", "#0284C7", "#FFFFFF"]}'::jsonb
),
(
    'Independence Day',
    '2027-08-15',
    'NATIONAL',
    ARRAY['ALL_INDIA'],
    ARRAY['ALL'],
    'Celebrating 80 years of freedom, nation-building, sovereignty, pride in local manufacturing (Make in India), and growth.',
    '{"theme": "tri_color_majestic", "suggested_palettes": ["#FF9933", "#FFFFFF", "#138808", "#000080"]}'::jsonb
),
(
    'Raksha Bandhan',
    '2027-08-16',
    'FESTIVAL',
    ARRAY['ALL_INDIA'],
    ARRAY['RETAIL', 'E-COMMERCE', 'FOOD_BEVERAGE', 'JEWELRY'],
    'Celebrating the sacred bond of protection, family love, siblings, and heartfelt gifting.',
    '{"theme": "warm_festive", "suggested_palettes": ["#DC2626", "#F59E0B", "#FEF3C7"]}'::jsonb
),
(
    'Ganesh Chaturthi',
    '2027-09-04',
    'FESTIVAL',
    ARRAY['WEST_INDIA', 'SOUTH_INDIA', 'ALL_INDIA'],
    ARRAY['ALL'],
    'Welcoming Lord Ganesha, remover of obstacles (Vighnaharta), auspicious beginnings for new ventures, wisdom, and prosperity.',
    '{"theme": "divine_gold", "suggested_palettes": ["#B45309", "#F59E0B", "#FEF3C7", "#78350F"]}'::jsonb
),
(
    'Durga Puja & Navratri',
    '2027-10-09',
    'FESTIVAL',
    ARRAY['EAST_INDIA', 'WEST_INDIA', 'NORTH_INDIA', 'ALL_INDIA'],
    ARRAY['ALL'],
    'Celebrating Shakti, divine feminine power, victory of Maa Durga over Mahishasura, festive pandals, and celebration.',
    '{"theme": "royal_crimson", "suggested_palettes": ["#991B1B", "#D97706", "#FEF3C7", "#450A0A"]}'::jsonb
),
(
    'Diwali (Deepavali)',
    '2027-10-29',
    'FESTIVAL',
    ARRAY['ALL_INDIA', 'GLOBAL'],
    ARRAY['ALL'],
    'Festival of lights, welcoming prosperity (Maa Lakshmi), triumph of light over darkness, new financial year (Muhurat), and gifting.',
    '{"theme": "radiant_gold", "suggested_palettes": ["#78350F", "#D97706", "#FDE047", "#1E1B4B"]}'::jsonb
),
(
    'Christmas & Year End',
    '2027-12-25',
    'FESTIVAL',
    ARRAY['ALL_INDIA', 'GLOBAL'],
    ARRAY['ALL'],
    'Joy, gratitude for the year gone by, giving, holiday cheer, and looking forward to new horizons.',
    '{"theme": "holiday_classic", "suggested_palettes": ["#15803D", "#B91C1C", "#F8FAFC"]}'::jsonb
);
