import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const connectionUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DIRECT_URL;
if (!connectionUrl) throw new Error("No DB URL");

const sql = postgres(connectionUrl, { ssl: "require", prepare: false });

const programs = [
  {
    name: "TOEFL",
    description: "TOEFL akademik ingilis dili səviyyəsini qiymətləndirən beynəlxalq imtahandır. ABŞ, Kanada, Avropa və Asiyanın minlərlə universiteti tərəfindən qəbul edilir."
  },
  {
    name: "IB (International Baccalaureate)",
    description: "IB (International Baccalaureate) dünyanın ən nüfuzlu orta təhsil proqramlarından biridir. Proqram tələbələri aparıcı universitetlərdə təhsilə hazırlayır və dünyanın bir çox ölkəsində tanınır."
  },
  {
    name: "SAT",
    description: "SAT universitetlərə qəbul zamanı istifadə olunan beynəlxalq standartlaşdırılmış imtahandır. İmtahan Math (Riyaziyyat) və Verbal (İngilis dili) bölmələrindən ibarətdir və tələbələrin akademik biliklərini qiymətləndirir."
  },
  {
    name: "IELTS",
    description: "IELTS beynəlxalq səviyyədə tanınan ingilis dili imtahanıdır. İmtahan Dinləmə (Listening), Oxuma (Reading), Yazı (Writing) və Danışıq (Speaking) bacarıqlarını qiymətləndirir."
  },
  {
    name: "Duolingo English Test",
    description: "Duolingo English Test beynəlxalq səviyyədə tanınan ingilis dili imtahanıdır. İmtahan tələbələrin Oxuma (Reading), Dinləmə (Listening), Yazı (Writing) və Danışıq (Speaking) bacarıqlarını qiymətləndirir."
  },
  {
    name: "CSCA",
    description: "CSCA Çin universitetlərinə qəbul üçün keçirilən beynəlxalq qəbul imtahanıdır. Əsasən Riyaziyyat, Fizika və Kimya fənləri üzrə biliklər qiymətləndirilir."
  },
  {
    name: "AP Microeconomics",
    description: "AP Microeconomics orta məktəb şagirdləri üçün nəzərdə tutulmuş universitet səviyyəli iqtisadiyyat kursudur. Kurs bazar iqtisadiyyatı, tələb və təklif, istehlakçı davranışı və biznes qərarlarını öyrədir."
  },
  {
    name: "AP Calculus",
    description: "AP Calculus orta məktəb şagirdləri üçün nəzərdə tutulmuş universitet səviyyəli riyaziyyat kursudur."
  },
  {
    name: "AP Business",
    description: "AP Business orta məktəb şagirdləri üçün nəzərdə tutulmuş universitet səviyyəsinə yaxın biznes hazırlığı proqramıdır. Kurs tələbələrə biznesin idarə edilməsi, sahibkarlıq və iqtisadi düşüncə bacarıqlarını inkişaf etdirməyə kömək edir."
  },
  {
    name: "AP Macroeconomics",
    description: "AP Macroeconomics orta məktəb şagirdləri üçün nəzərdə tutulmuş universitet səviyyəli iqtisadiyyat kursudur. Kurs ölkə və dünya iqtisadiyyatının işləmə prinsiplərini öyrədir."
  },
  {
    name: "AP Statistics",
    description: "AP Statistics orta məktəb şagirdləri üçün nəzərdə tutulmuş universitet səviyyəli statistika kursudur. Kurs məlumatların toplanması, təhlili və statistik nəticələrin şərh edilməsini öyrədir."
  },
  {
    name: "Private School Tutoring",
    description: "Private School Tutoring özəl məktəblərdə təhsil alan şagirdlər üçün fərdi və peşəkar hazırlıq proqramıdır. Dərslər məktəb proqramına uyğun şəkildə təşkil olunur və akademik nəticələrin yüksəldilməsinə kömək edir."
  },
  {
    name: "General English",
    description: "General English ingilis dilini gündəlik həyatda, təhsildə və iş mühitində sərbəst istifadə etməyi öyrədən kompleks dil proqramıdır. Kurs bütün dil bacarıqlarını inkişaf etdirməyə yönəlib."
  },
  {
    name: "DİM Riyaziyyat",
    description: "DİM Riyaziyyat hazırlığı Dövlət İmtahan Mərkəzinin imtahanlarına hazırlaşan şagirdlər üçün nəzərdə tutulmuş kompleks kursdur."
  },
  {
    name: "İngilis dili DİM",
    description: "DİM İngilis dili hazırlığı şagirdlərin ingilis dili biliklərini inkişaf etdirməyə və DİM imtahan formatına uyğun hazırlaşmasına kömək edir."
  },
  {
    name: "Rus dili DIM",
    description: "DİM Rus dili hazırlığı rus bölməsində təhsil alan və rus dili üzrə imtahan verən şagirdlər üçün nəzərdə tutulub."
  },
  {
    name: "Azərbaycan dili DİM",
    description: "DİM Azərbaycan dili hazırlığı buraxılış və qəbul imtahanlarına hazırlaşan şagirdlər üçün nəzərdə tutulmuş kompleks kursdur."
  }
];

async function main() {
  try {
    console.log("Inserting programs...");
    for (const p of programs) {
      await sql`
        INSERT INTO programs (name, description, created_at)
        VALUES (${p.name}, ${p.description}, NOW())
      `;
    }
    console.log("Successfully inserted all programs!");
  } catch (error) {
    console.error("Error inserting programs:", error);
  } finally {
    process.exit(0);
  }
}

main();
