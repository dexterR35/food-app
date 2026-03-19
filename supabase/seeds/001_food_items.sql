-- FoodApp — Sample Food Items Seed
-- Run after migrations

insert into public.food_items (name, description, price, calories, protein_g, carbs_g, fat_g, category, is_active)
values
  -- Mains
  ('Grilled Chicken Breast',    'Juicy grilled chicken with herbs',       28.00, 320, 42, 0,  8,  'Main',    true),
  ('Beef Rice Bowl',            'Seasoned beef with steamed rice',        32.00, 580, 38, 72, 14, 'Main',    true),
  ('Pasta Bolognese',           'Classic beef bolognese with penne',      25.00, 620, 32, 78, 18, 'Main',    true),
  ('Veggie Wrap',               'Grilled veggies in whole wheat wrap',    20.00, 380, 12, 52, 10, 'Main',    true),
  ('Salmon Fillet',             'Baked salmon with lemon butter',         42.00, 410, 46, 0,  22, 'Main',    true),
  ('Turkey Sandwich',           'Turkey, lettuce, tomato on sourdough',   22.00, 450, 34, 48, 12, 'Main',    true),

  -- Salads
  ('Caesar Salad',              'Romaine, parmesan, croutons, dressing',  18.00, 280, 14, 18, 16, 'Salad',   true),
  ('Greek Salad',               'Feta, olives, cucumber, tomato',         16.00, 220, 8,  14, 14, 'Salad',   true),
  ('Tuna Salad Bowl',           'Tuna, corn, greens, olive oil',          22.00, 310, 28, 12, 12, 'Salad',   true),

  -- Soups
  ('Tomato Soup',               'Creamy tomato with basil',               12.00, 180, 4,  22, 8,  'Soup',    true),
  ('Chicken Noodle Soup',       'Classic chicken broth with noodles',     15.00, 240, 18, 28, 6,  'Soup',    true),
  ('Lentil Soup',               'Hearty red lentil soup',                 14.00, 260, 14, 38, 4,  'Soup',    true),

  -- Sides
  ('Steamed Broccoli',          'Fresh steamed broccoli with butter',     8.00,  90,  4,  8,  4,  'Side',    true),
  ('Sweet Potato Fries',        'Baked sweet potato fries',               12.00, 240, 3,  42, 6,  'Side',    true),
  ('Brown Rice',                '200g steamed brown rice',                8.00,  220, 5,  44, 2,  'Side',    true),

  -- Drinks
  ('Still Water 500ml',         '',                                        4.00,  0,   0,  0,  0,  'Drink',   true),
  ('Sparkling Water 500ml',     '',                                        5.00,  0,   0,  0,  0,  'Drink',   true),
  ('Fresh Orange Juice',        'Freshly squeezed',                       10.00, 110, 2,  26, 0,  'Drink',   true),
  ('Green Tea',                 'Unsweetened green tea',                   6.00,  2,   0,  0,  0,  'Drink',   true),
  ('Protein Shake',             'Vanilla whey, 30g protein',              18.00, 180, 30, 10, 2,  'Drink',   true),

  -- Desserts
  ('Greek Yogurt with Berries', '150g yogurt, mixed berries',             12.00, 160, 10, 20, 4,  'Dessert', true),
  ('Dark Chocolate 70%',        '2 squares, 20g',                         8.00,  120, 2,  10, 8,  'Dessert', true),
  ('Fruit Salad',               'Seasonal mixed fruit',                   10.00, 130, 1,  32, 0,  'Dessert', true);
