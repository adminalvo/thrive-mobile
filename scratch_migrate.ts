import sql from './src/lib/db';

async function migrate() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Add some dummy expenses for presentation purposes (optional, but good for charts)
    await sql`
      INSERT INTO expenses (category, amount, date, description)
      VALUES 
      ('Maaşlar', 1500, NOW() - INTERVAL '2 days', 'Müəllim maaşları'),
      ('Ofis xərcləri', 300, NOW() - INTERVAL '5 days', 'İşıq pulu və su'),
      ('Reklam', 200, NOW() - INTERVAL '10 days', 'Instagram reklamı')
      ON CONFLICT DO NOTHING;
    `;
    
    console.log("Expenses migration successful");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
