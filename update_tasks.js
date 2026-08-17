import fs from 'fs';
const file = 'src/app/[locale]/dashboard/tasks/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import useSession
content = content.replace('import { useTranslations } from "next-intl";', 
'import { useTranslations } from "next-intl";\nimport { useSession } from "next-auth/react";');

// 2. Add isSuperAdmin
content = content.replace('const [loading, setLoading] = useState(true);',
`const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin';`);

// 3. Conditional Add Task Button
content = content.replace('<button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>',
'{isSuperAdmin && <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>');
content = content.replace('<Plus size={18} /> {t("newTask")}\n        </button>',
'<Plus size={18} /> {t("newTask")}\n        </button>}');

// 4. Conditional Draggable
content = content.replace('draggable="true"', 'draggable={isSuperAdmin}');

// 5. Conditional Task Options (MoreVertical)
content = content.replace('{/* Task Options (Edit/Delete) */}\n                      <div className={styles.taskOptionsWrapper} onClick={e => e.stopPropagation()}>',
`{/* Task Options (Edit/Delete) */}
                      {isSuperAdmin && <div className={styles.taskOptionsWrapper} onClick={e => e.stopPropagation()}>`);
                      
content = content.replace('</button>\n                          </div>\n                        )}\n                      </div>',
'</button>\n                          </div>\n                        )}\n                      </div>}');

fs.writeFileSync(file, content);
console.log("TasksPage updated");
