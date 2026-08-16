const fs = require('fs');

function addContractStrings(lang, strings) {
  const path = `./messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.ContractLegal = strings;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

const azStrings = {
  header: "Tədris Xidmətləri Müqaviləsi № {contractNo}",
  dateLocation: "Bakı ş. {date}",
  intro: "Bu Müqavilə (bundan sonra \"Müqavilə\"), bir tərəfdən Azərbaycan Respublikasında müvafiq qaydada qeydiyyatdan keçmiş, Direktoru Məmmədov Tamerlanın şəxsində təmsil edilən, \"Thrive\" MMC (bundan sonra \"İcraçı\" adlandırılacaq), və diqər tərəfdən {studentName} (ş/v № {idCard}, FİN: {fin}) (bundan sonra \"Tələbə\" adlandırılacaq) arasında, aşağıdakı şərtlər əsasında bağlanıldı. Müqavilənin məzmunundan başqa məna hasil olmazsa, İcraçı və Sifarişçi bundan sonra ayrılıqda «Tərəf», birlikdə «Tərəflər» adlandırılacaq.",
  s1_title: "1. Müqavilənin predmeti.",
  s1_1: "1.1. İcraçı \"{program}\" proqram/ları üzrə (bundan sonra \"Proqram\") Tələbəyə tədris xidmətlərini (bundan sonra \"Xidmətlər\") əyani/onlayn şəkilində Tələbəyə göstərməyi, Tələbə isə xidmətləri qəbul edib onların Müqavilə üzrə razılaşdırılmış qiymətini İcraçıya ödəməyi öhdəsinə götürür.",
  s2_title: "2. Xidmət haqqı və hesablaşma qaydası.",
  s2_1: "2.1. Müqavilə üzrə ümumi xidmət haqqı {totalPrice} Azərbaycan Manatı təşkil edir.",
  s2_2: "2.2. Müqavilə üzrə ödəniş aşağıdakı qaydada həyata keçirilir: Aylıq ödəniş: {monthlyPayment} Azərbaycan Manatı olmaqla; Tələbə xidmət haqqını {durationMonths} ay müddətində, hər ay {monthlyPayment} Azərbaycan Manatı olmaqla ödəyir.",
  s2_3: "2.3. Hər ay üzrə ödəniş ən gec ayın {paymentDay} tarixinədək həyata keçirilməlidir.",
  s2_4: "2.4. Müqavilə üzrə Tərəflər arasında bütün hesablaşmalar nağd və ya nağdsız qaydada, Azərbaycan manatı ilə həyata keçirilir.",
  s3_title: "3. Tərəflərin Hüquq və Öhdəlikləri.",
  s3_1: "3.1. Tələbənin hüquq və öhdəlikləri: Müqavilədə göstərilmiş \"{program}\" proqram/ları üzrə dərslərdə iştirak etmək; Tələbə fors-major hallarda İcraçıya qabaqcadan xəbər vermək şərti ilə 1 dəfə dərsi buraxa bilər...",
  s3_2: "3.2. İcraçının hüquq və öhdəlikləri: Tələbəni Proqrama uyğun olaraq tədris xidmətləri ilə təmin edir; Proqrama uyğun olaraq dərslərin vaxtında keçirilməsini və texniki şəraitin yaradılmasını təmin edir...",
  s5_title: "4. Kommersiya Sirri rejiminin müəyyən edilməsi.",
  s5_1: "4.1. Müqavilənin şərtləri və icrası, kommersiya sirri hesab edilir və Tələbə tərəfindən gizli saxlanılır.",
  s6_title: "5. Mübahisələrin həlli.",
  s6_1: "5.1. Mübahisələr danışıqlar yolu ilə, həll olunmadığı təqdirdə isə Azərbaycan Respublikasının qanunvericiliyi əsasında məhkəmə qaydasında həll edilir.",
  s8_title: "6. Fors-Major.",
  s8_1: "6.1. Tərəflərin iradəsindən asılı olmayan qarşısıalınmaz qüvvə (fors-major) baş verdiyi təqdirdə Tərəflər məsuliyyət daşımırlar.",
  s9_title: "7. Yekun müddəalar.",
  s9_1: "7.1. Müqavilə Azərbaycan dilində, 2 (iki) nüsxədə tərtib edilmişdir.",
  parties: "Tərəflər",
  executor: "İCRAÇI",
  executorDetails: "\"Thrive\" MMC\nÜnvan: Bakı ş., Səbail rayonu, Nizami 6A küçəsi\nVÖEN: 2008351441\nTel.: +994(99)446-60-00\nBank: \"Kapital Bank\" ASC\nH/H: AZ59AIIB400900G9443981875110",
  director: "Tamerlan Məmmədov\nDirektor",
  student: "TƏLƏBƏ",
  studentDetails: "{studentName}\nŞ/v №: {idCard}\nFİN: {fin}\nTel.: {phone}",
  parent: "Valideyn:"
};

const enStrings = {
  header: "Educational Services Contract No {contractNo}",
  dateLocation: "Baku c. {date}",
  intro: "This Contract is concluded between \"Thrive\" LLC (hereinafter \"Executor\"), represented by Director Tamerlan Mammadov, and {studentName} (ID No: {idCard}, FIN: {fin}) (hereinafter \"Student\").",
  s1_title: "1. Subject of the Contract.",
  s1_1: "1.1. The Executor undertakes to provide educational services to the Student under the \"{program}\" program, and the Student undertakes to accept the services and pay the agreed price.",
  s2_title: "2. Service fee and settlement procedure.",
  s2_1: "2.1. The total service fee under the Contract is {totalPrice} AZN.",
  s2_2: "2.2. Payment is made as follows: Monthly payment: {monthlyPayment} AZN; The student pays the fee over {durationMonths} months.",
  s2_3: "2.3. Monthly payment must be made no later than the {paymentDay}th of each month.",
  s2_4: "2.4. All settlements are made in cash or cashless form in Azerbaijani manats.",
  s3_title: "3. Rights and Obligations of the Parties.",
  s3_1: "3.1. Student's rights and obligations: Participate in classes under the \"{program}\" program...",
  s3_2: "3.2. Executor's rights and obligations: Provide educational services according to the Program...",
  s5_title: "4. Determination of Commercial Secret regime.",
  s5_1: "4.1. The terms of the Contract are considered commercial secrets and kept confidential by the Student.",
  s6_title: "5. Dispute Resolution.",
  s6_1: "5.1. Disputes are resolved through negotiations, otherwise in court according to the legislation of Azerbaijan.",
  s8_title: "6. Force Majeure.",
  s8_1: "6.1. The Parties are not liable in case of force majeure events.",
  s9_title: "7. Final Provisions.",
  s9_1: "7.1. The Contract is drawn up in 2 (two) copies.",
  parties: "Parties",
  executor: "EXECUTOR",
  executorDetails: "\"Thrive\" LLC\nAddress: Baku, Sabail, Nizami 6A\nTIN: 2008351441\nTel.: +994(99)446-60-00\nBank: \"Kapital Bank\" OJSC",
  director: "Tamerlan Mammadov\nDirector",
  student: "STUDENT",
  studentDetails: "{studentName}\nID No: {idCard}\nFIN: {fin}\nTel.: {phone}",
  parent: "Parent:"
};

const ruStrings = {
  header: "Договор на оказание образовательных услуг № {contractNo}",
  dateLocation: "г. Баку {date}",
  intro: "Настоящий Договор заключен между ООО \"Thrive\" (далее «Исполнитель») в лице Директора Тамерлана Мамедова и {studentName} (Уд. личн. №: {idCard}, FIN: {fin}) (далее «Студент»).",
  s1_title: "1. Предмет Договора.",
  s1_1: "1.1. Исполнитель обязуется оказать образовательные услуги Студенту по программе \"{program}\", а Студент обязуется принять услуги и оплатить согласованную цену.",
  s2_title: "2. Стоимость услуг и порядок расчетов.",
  s2_1: "2.1. Общая стоимость услуг по Договору составляет {totalPrice} AZN.",
  s2_2: "2.2. Оплата производится следующим образом: Ежемесячный платеж: {monthlyPayment} AZN; Студент оплачивает стоимость в течение {durationMonths} месяцев.",
  s2_3: "2.3. Ежемесячный платеж должен быть произведен не позднее {paymentDay}-го числа каждого месяца.",
  s2_4: "2.4. Все расчеты производятся в наличной или безналичной форме в азербайджанских манатах.",
  s3_title: "3. Права и Обязанности Сторон.",
  s3_1: "3.1. Права и обязанности Студента: Участвовать в занятиях по программе \"{program}\"...",
  s3_2: "3.2. Права и обязанности Исполнителя: Обеспечить предоставление образовательных услуг...",
  s5_title: "4. Режим коммерческой тайны.",
  s5_1: "4.1. Условия Договора считаются коммерческой тайной и сохраняются Студентом в тайне.",
  s6_title: "5. Разрешение споров.",
  s6_1: "5.1. Споры разрешаются путем переговоров, в противном случае - в судебном порядке.",
  s8_title: "6. Форс-мажор.",
  s8_1: "6.1. Стороны не несут ответственности в случае наступления форс-мажорных обстоятельств.",
  s9_title: "7. Заключительные положения.",
  s9_1: "7.1. Договор составлен в 2 (двух) экземплярах.",
  parties: "Стороны",
  executor: "ИСПОЛНИТЕЛЬ",
  executorDetails: "ООО \"Thrive\"\nАдрес: Баку, Сабаил, Низами 6A\nИНН: 2008351441\nТел.: +994(99)446-60-00\nБанк: ОАО \"Капитал Банк\"",
  director: "Тамерлан Мамедов\nДиректор",
  student: "СТУДЕНТ",
  studentDetails: "{studentName}\nУд. личн. №: {idCard}\nFIN: {fin}\nТел.: {phone}",
  parent: "Родитель:"
};

addContractStrings('az', azStrings);
addContractStrings('en', enStrings);
addContractStrings('ru', ruStrings);

console.log('Translations added successfully.');
