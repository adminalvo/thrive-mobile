import fs from 'fs';

function addTranslations() {
  const files = [
    {
      path: 'messages/en.json',
      sidebar: { groups: "Groups", parents: "Parents" },
      groups: {
        title: "Groups",
        subtitle: "Manage class groups and programs.",
        newGroup: "+ New Group",
        search: "Search groups...",
        table: { name: "Group Name", program: "Program", teacher: "Teacher", room: "Room" }
      },
      parents: {
        title: "Parents",
        subtitle: "Manage parents and contacts.",
        newParent: "+ New Parent",
        search: "Search parents...",
        table: { name: "Parent Name", contact: "Contact", fin: "FIN", idCard: "ID Card" }
      }
    },
    {
      path: 'messages/az.json',
      sidebar: { groups: "Qruplar", parents: "Valideynlər" },
      groups: {
        title: "Qruplar",
        subtitle: "Qrup və proqramları idarə edin.",
        newGroup: "+ Yeni Qrup",
        search: "Qrupları axtar...",
        table: { name: "Qrup Adı", program: "Proqram", teacher: "Müəllim", room: "Otaq" }
      },
      parents: {
        title: "Valideynlər",
        subtitle: "Valideyn əlaqələrini idarə edin.",
        newParent: "+ Yeni Valideyn",
        search: "Valideyn axtar...",
        table: { name: "Valideyn (Ad Soyad)", contact: "Əlaqə", fin: "FİN", idCard: "Vəsiqə nömrəsi" }
      }
    },
    {
      path: 'messages/ru.json',
      sidebar: { groups: "Группы", parents: "Родители" },
      groups: {
        title: "Группы",
        subtitle: "Управление группами и программами.",
        newGroup: "+ Новая Группа",
        search: "Поиск групп...",
        table: { name: "Название", program: "Программа", teacher: "Учитель", room: "Комната" }
      },
      parents: {
        title: "Родители",
        subtitle: "Управление контактами родителей.",
        newParent: "+ Новый Родитель",
        search: "Поиск родителей...",
        table: { name: "Имя", contact: "Контакт", fin: "FIN", idCard: "ID Карта" }
      }
    }
  ];

  files.forEach(({ path, sidebar, groups, parents }) => {
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    // Add to Sidebar
    data.Sidebar.groups = sidebar.groups;
    data.Sidebar.parents = sidebar.parents;
    
    // Restore days if missing (because of bad regex earlier)
    if (!data.Schedule.days) {
      if (path.includes('en.json')) {
        data.Schedule.month = "Month";
        data.Schedule.days = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
      } else if (path.includes('az.json')) {
        data.Schedule.month = "Ay";
        data.Schedule.days = { mon: "Bazar ertəsi", tue: "Çərşənbə axşamı", wed: "Çərşənbə", thu: "Cümə axşamı", fri: "Cümə", sat: "Şənbə", sun: "Bazar" };
      }
    }
    
    // Add Groups and Parents sections
    data.Groups = groups;
    data.Parents = parents;
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${path}`);
  });
}

addTranslations();
