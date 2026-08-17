-- Diqqət: Əgər əvvəlki köhnə cədvəli silmək və sıfırdan bu detallı cədvəli yaratmaq istəyirsinizsə, aşağıdakı sətiri aktiv saxlayın:
DROP TABLE IF EXISTS expenses CASCADE;

-- Aşırı detallı 'expenses' (xərclər) cədvəli
-- Bu cədvəl təşkilatın maliyyə xərclərini bütün detalları ilə (təsdiqləyən şəxs, ödəniş metodu, qəbz nömrəsi, əlavə fayllar və s.) izləmək üçündür.

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Kateqorizasiya və Məbləğ
  category VARCHAR(100) NOT NULL, -- Məsələn: 'Maaş', 'İcarə', 'Reklam', 'Vergi', 'Avadanlıq'
  amount DECIMAL(12, 2) NOT NULL, -- Xalis məbləğ
  tax_amount DECIMAL(12, 2) DEFAULT 0.00, -- Vergi və ya ƏDV məbləği
  total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED, -- Ümumi ödəniləcək məbləğ
  currency VARCHAR(10) DEFAULT 'AZN', -- Valyuta növü
  
  -- Ödəniş Detalları
  payment_method VARCHAR(50) DEFAULT 'CASH', -- CASH, CARD, BANK_TRANSFER, CRYPTO
  payment_status VARCHAR(50) DEFAULT 'PAID', -- PENDING, PAID, OVERDUE, CANCELLED
  receipt_number VARCHAR(100), -- Qəbz və ya hesab-faktura (invoice) nömrəsi
  vendor_name VARCHAR(255), -- Ödənişin edildiyi tərəf (şirkət və ya şəxs)
  
  -- Tarixlər
  expense_date DATE NOT NULL, -- Xərcin edildiyi gün
  due_date DATE, -- Ödəniş üçün son tarix (əgər hələ ödənilməyibsə)
  
  -- Təsvir və İzləmə
  title VARCHAR(255), -- Xərcin qısa başlığı
  description TEXT, -- Ətraflı açıqlama
  tags JSONB, -- Axtarış üçün etiketlər (məsələn: '["marketinq", "qış_kampaniyası"]')
  attachments JSONB, -- Qəbz şəkilləri, PDF sənədlərin URL-ləri
  
  -- Əlaqəli şəxslər (Xərci daxil edən və Təsdiqləyən)
  created_by UUID,
  approved_by UUID,
  is_approved BOOLEAN DEFAULT FALSE,
  
  -- Sistem qeydləri
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avtomatik 'updated_at' yenilənməsi üçün Trigger (İstəyə bağlı)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_expenses_modtime ON expenses;

CREATE TRIGGER update_expenses_modtime
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

