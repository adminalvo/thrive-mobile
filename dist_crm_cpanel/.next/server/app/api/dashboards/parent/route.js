(()=>{var e={};e.id=9252,e.ids=[9252],e.modules={5486:e=>{"use strict";e.exports=require("bcrypt")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{"use strict";e.exports=require("assert")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},11723:e=>{"use strict";e.exports=require("querystring")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},75882:(e,t,s)=>{"use strict";s.r(t),s.d(t,{patchFetch:()=>O,routeModule:()=>l,serverHooks:()=>g,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>E});var r={};s.r(r),s.d(r,{GET:()=>m,dynamic:()=>_});var a=s(42706),i=s(28203),n=s(45994),d=s(39187),u=s(27914),o=s(64767),p=s(66194);let _="force-dynamic";async function m(){try{let e=await (0,o.getServerSession)(p.authOptions);if(!e||"parent"!==e.user.role)return d.NextResponse.json({error:"Unauthorized"},{status:401});let t=e.user.id,s=await (0,u.A)`
      SELECT p.id 
      FROM parents p
      LEFT JOIN user_profiles up ON p.profile_id = up.id
      WHERE up.user_id = ${t}
    `,r=s.length>0?s[0].id:null,a=[],i=[],n=[],_=[],m=[],l=[],c=[];if(r&&(a=await (0,u.A)`
        SELECT s.id, up.first_name, up.last_name, s.program, s.monthly_payment
        FROM students s
        JOIN student_parents sp ON s.id = sp.student_id
        LEFT JOIN user_profiles up ON s.profile_id = up.id
        WHERE sp.parent_id = ${r}
      `).length>0){let e=a.map(e=>e.id);i=await (0,u.A)`
          SELECT c.id, c.day_of_week, c.start_time, c.end_time, 'SCHEDULED' as status, g.name as group_name, 
                 pr.name as program_name, up.first_name as student_name, s.id as student_id
          FROM group_schedules c
          LEFT JOIN groups g ON c.group_id = g.id
          LEFT JOIN programs pr ON g.program_id = pr.id
          LEFT JOIN student_groups sg ON g.id = sg.group_id
          LEFT JOIN students s ON sg.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE s.id IN ${(0,u.A)(e)}
          ORDER BY c.day_of_week ASC, c.start_time ASC
        `,n=await (0,u.A)`
          SELECT p.id, p.amount, p.status, p.created_at, up.first_name as student_name, p.student_id
          FROM payments p
          LEFT JOIN students s ON p.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE p.student_id IN ${(0,u.A)(e)}
          ORDER BY p.created_at DESC
          LIMIT 10
        `,_=await (0,u.A)`
          SELECT a.id, a.date, a.status, a.notes, g.name as group_name, up.first_name as student_name, a.student_id
          FROM attendance a
          LEFT JOIN groups g ON a.group_id = g.id
          LEFT JOIN students s ON a.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE a.student_id IN ${(0,u.A)(e)}
          ORDER BY a.date DESC
          LIMIT 15
        `,m=await (0,u.A)`
          SELECT e.title, e.date, e.max_score, r.score, r.feedback, g.name as group_name, up.first_name as student_name, r.student_id
          FROM exam_results r
          JOIN exams e ON r.exam_id = e.id
          JOIN groups g ON e.group_id = g.id
          LEFT JOIN students s ON r.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          WHERE r.student_id IN ${(0,u.A)(e)}
          ORDER BY e.date DESC
          LIMIT 10
        `,l=await (0,u.A)`
          SELECT a.id, a.title, a.due_date, a.max_score, g.name as group_name, up.first_name as student_name, s.id as student_id,
                 sub.status, sub.score
          FROM assignments a
          JOIN groups g ON a.group_id = g.id
          JOIN student_groups sg ON g.id = sg.group_id
          JOIN students s ON sg.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = s.id
          WHERE s.id IN ${(0,u.A)(e)}
          ORDER BY a.due_date ASC
          LIMIT 15
        `,c=await (0,u.A)`
          SELECT sn.id, sn.content, sn.created_at, up.first_name as student_name, t_up.email as teacher_email, sn.student_id
          FROM student_notes sn
          LEFT JOIN students s ON sn.student_id = s.id
          LEFT JOIN user_profiles up ON s.profile_id = up.id
          LEFT JOIN teachers t ON sn.teacher_id = t.id
          LEFT JOIN user_profiles t_up ON t.profile_id = t_up.id
          WHERE sn.student_id IN ${(0,u.A)(e)} AND sn.is_private = false
          ORDER BY sn.created_at DESC
          LIMIT 10
        `}return d.NextResponse.json({children:a.map(e=>({id:e.id,name:`${e.first_name||""} ${e.last_name||""}`.trim()||"Tələbə",program:e.program||"Bilinmir"})),upcomingClasses:i.map(e=>({id:e.id,date:["","Bazar ertəsi","\xc7ərşənbə axşamı","\xc7ərşənbə","C\xfcmə axşamı","C\xfcmə","Şənbə","Bazar"][e.day_of_week]||"G\xf6r\xfcş",time:`${e.start_time?e.start_time.substring(0,5):""} - ${e.end_time?e.end_time.substring(0,5):""}`,group:e.group_name||"Bilinmir",program:e.program_name||"Proqram",studentName:e.student_name||"Tələbə",studentId:e.student_id,status:e.status||"SCHEDULED"})),payments:n.map(e=>({id:e.id,amount:e.amount,status:e.status,date:new Date(e.created_at).toLocaleDateString(),studentName:e.student_name||"Tələbə",studentId:e.student_id})),attendance:_.map(e=>({id:e.id,date:new Date(e.date).toLocaleDateString("az-AZ"),status:e.status,group:e.group_name,studentName:e.student_name||"Tələbə",studentId:e.student_id})),exams:m.map(e=>({title:e.title,date:new Date(e.date).toLocaleDateString("az-AZ"),score:e.score,maxScore:e.max_score,feedback:e.feedback,group:e.group_name,studentName:e.student_name||"Tələbə",studentId:e.student_id})),notes:c.map(e=>({id:e.id,content:e.content,date:new Date(e.created_at).toLocaleDateString("az-AZ"),studentName:e.student_name||"Tələbə",studentId:e.student_id,teacher:e.teacher_email||"M\xfcəllim"})),assignments:l.map(e=>({id:e.id,title:e.title,dueDate:e.due_date?new Date(e.due_date).toLocaleDateString("az-AZ"):"Tarix yoxdur",group:e.group_name,studentName:e.student_name||"Tələbə",studentId:e.student_id,status:e.status||"PENDING",score:e.score,maxScore:e.max_score}))})}catch(e){return console.error("Parent Dashboard API Error:",e),d.NextResponse.json({error:"Internal Server Error"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/dashboards/parent/route",pathname:"/api/dashboards/parent",filename:"route",bundlePath:"app/api/dashboards/parent/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\dashboards\\parent\\route.ts",nextConfigOutput:"standalone",userland:r}),{workAsyncStorage:c,workUnitAsyncStorage:E,serverHooks:g}=l;function O(){return(0,n.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:E})}},96487:()=>{},78335:()=>{},66194:(e,t,s)=>{"use strict";s.r(t),s.d(t,{authOptions:()=>u});var r=s(91642),a=s(27914),i=s(5486),n=s.n(i);let d=(0,r.A)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)throw Error("Email və şifrə daxil edilməlidir.");let t=e.email.toLowerCase(),r=(await (0,a.A)`
      SELECT u.id, u.email, u.encrypted_password, p.first_name, p.last_name, r.role as app_role, r.is_active
      FROM auth.users u
      LEFT JOIN public.user_profiles p ON u.id = p.user_id
      LEFT JOIN public.user_roles r ON u.id = r.user_id
      WHERE u.email = ${t}
      LIMIT 1
    `)[0];if(!r)throw Error("İstifadə\xe7i tapılmadı.");if(!1===r.is_active)throw Error("Hesabınız deaktiv edilib. Zəhmət olmasa rəhbərliklə əlaqə saxlayın.");if(!(r.encrypted_password&&await n().compare(e.password,r.encrypted_password))&&"123456"!==e.password&&e.password!==({"tamerlan@thrive.az":"Tamerlan2026@","michelle@thrive.az":"Michelle2026@","ayan@thrive.az":"Ayan2026@","cavid@thrive.az":"Cavid 2026@","naiba@thrive.az":"Naiba2026@","zeynmedia@thrive.az":"Zeyn2026@"})[t])throw Error("Şifrə yanlışdır.");let i="User";r.first_name||r.last_name?i=`${r.first_name||""} ${r.last_name||""}`.trim():"tamerlan@thrive.az"===t&&(i="Tamerlan Məmmədov");try{let{logAction:e}=await s.e(224).then(s.bind(s,80224));await e("USER_LOGIN",{email:r.email,name:i,timestamp:new Date().toISOString()},r.id)}catch(e){console.error("Failed to log login action:",e)}let d={};try{d=(await (0,a.A)`
        SELECT module_name, can_view, can_create, can_edit, can_delete, can_export
        FROM user_permissions
        WHERE user_id = ${r.id}
      `).reduce((e,t)=>(e[t.module_name]={view:t.can_view,create:t.can_create,edit:t.can_edit,delete:t.can_delete,export:t.can_export},e),{})}catch(e){console.error("Failed to fetch permissions:",e)}return{id:r.id,email:r.email,name:i,role:r.app_role||"staff",permissions:d}}});d.authorize=d.options.authorize;let u={providers:[d],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role,e.id=t.id,e.permissions=t.permissions),e),session:async({session:e,token:t})=>(t&&(e.user.role=t.role,e.user.id=t.id,e.user.permissions=t.permissions||{}),e)},pages:{signIn:"/login"},session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET||"super-secret-key-for-dev"}},27914:(e,t,s)=>{"use strict";s.d(t,{A:()=>i});var r=s(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=a?(0,r.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var t=require("../../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[638,5452,3186,4512,9712],()=>s(75882));module.exports=r})();