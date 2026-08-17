const fs = require('fs');
const path = require('path');

const locales = ['az', 'en', 'ru'];
const updates = {
  az: {
    Universities: {
      title: "Xaricdə Təhsil (Universitetlər)",
      subtitle: "Tərəfdaş universitetlərin siyahısı"
    },
    Settings: {
      settings: "Tənzimləmələr",
      about: {
        p1: "Thrive CRM, Thrive Education Center tərəfindən hazırlanmış CRM sistemidir. Sistem daxilində qeydiyyat edilmiş hər kəs müəyyənləşdirilmiş funksiyaları istifadə edə, ödənişlərini izləyə və s. əhatəli funksiyaları istifadə edə bilər.",
        p2: "Əlavə olaraq AI ilə gücləndirilmiş bu sistem HacTag tərəfindən dizayn edilmişdir.",
        copyright: "© 2026 Thrive Education Center. Bütün hüquqlar qorunur."
      }
    }
  },
  en: {
    Universities: {
      title: "Study Abroad (Universities)",
      subtitle: "List of partner universities"
    },
    Settings: {
      settings: "Settings",
      about: {
        p1: "Thrive CRM is a CRM system developed by Thrive Education Center. Anyone registered in the system can use the defined functions, track their payments, and use comprehensive features.",
        p2: "Additionally, this AI-powered system was designed by HacTag.",
        copyright: "© 2026 Thrive Education Center. All rights reserved."
      }
    }
  },
  ru: {
    Universities: {
      title: "Обучение за рубежом (Университеты)",
      subtitle: "Список университетов-партнеров"
    },
    Settings: {
      settings: "Настройки",
      about: {
        p1: "Thrive CRM — это CRM-система, разработанная Thrive Education Center. Любой зарегистрированный в системе может использовать определенные функции, отслеживать свои платежи и использовать другие комплексные возможности.",
        p2: "Кроме того, эта система на базе ИИ была разработана HacTag.",
        copyright: "© 2026 Thrive Education Center. Все права защищены."
      }
    }
  }
};

for (const locale of locales) {
  const filePath = path.join(__dirname, 'messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.Universities) data.Universities = {};
  data.Universities = { ...data.Universities, ...updates[locale].Universities };
  
  if (!data.Settings) data.Settings = {};
  data.Settings.settings = updates[locale].Settings.settings;
  data.Settings.about = updates[locale].Settings.about;
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${locale}.json`);
}
