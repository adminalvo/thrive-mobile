(()=>{var e={};e.id=8500,e.ids=[224,8500],e.modules={5486:e=>{"use strict";e.exports=require("bcrypt")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{"use strict";e.exports=require("assert")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},11723:e=>{"use strict";e.exports=require("querystring")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},25071:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>v,routeModule:()=>m,serverHooks:()=>O,workAsyncStorage:()=>f,workUnitAsyncStorage:()=>y});var s={};r.r(s),r.d(s,{GET:()=>l,POST:()=>_,dynamic:()=>c});var a=r(42706),i=r(28203),n=r(45994),o=r(39187),d=r(27914),u=r(80224),p=r(22946);let c="force-dynamic";async function l(){try{let e=(await (0,d.A)`
      SELECT 
        i.id,
        i.student_id,
        i.amount,
        i.due_date,
        i.status,
        i.created_at,
        COALESCE(s.id, i.student_id) AS crm_student_id,
        pr.first_name,
        pr.last_name,
        pr.phone,
        pr.email,
        pa.full_name as parent_name,
        pa.address as parent_address,
        pa.fin_code as parent_fin,
        pa.id_card_number as parent_id_card,
        s.contract_details,
        s.dob as student_dob,
        s.address as student_address,
        s.fin_code as student_fin,
        s.id_card_number as student_id_card,
        COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = i.id), 0) AS paid_amount
      FROM invoices i
      LEFT JOIN auth.users u ON i.student_id = u.id
      LEFT JOIN user_profiles pr ON pr.user_id = u.id OR i.student_id = pr.id
      LEFT JOIN students s ON s.profile_id = pr.id OR i.student_id = s.id
      LEFT JOIN parent_students ps ON ps.student_id = s.id
      LEFT JOIN parents pa ON pa.id = ps.parent_id OR pa.profile_id = s.profile_id
      ORDER BY i.created_at DESC
    `).map(e=>{let t=e.first_name?`${e.first_name} ${e.last_name||""}`.trim():"Tələbə",r=Number(e.amount)||0,s=Number(e.paid_amount)||0,a=e.due_date?new Date(e.due_date).toISOString():new Date().toISOString(),i=e.created_at?new Date(e.created_at).toISOString():new Date().toISOString(),n=e.status;s>=r&&r>0?n="PAID":s>0&&(n="PARTIAL");let o=e.crm_student_id||e.student_id;return{id:e.id,studentId:o,studentName:t,parentName:e.parent_name||"Qeyd edilməyib",amount:r,paidAmount:s,status:n,dueDate:a,createdAt:i,date:e.created_at,student:{id:o,name:t,phone:e.phone||"Qeyd edilməyib",email:e.email||"",dob:e.student_dob||"",address:e.student_address||"",fin:e.student_fin||"",idCard:e.student_id_card||"",parentName:e.parent_name||"Qeyd edilməyib",parentAddress:e.parent_address||"",parentFin:e.parent_fin||"",parentIdCard:e.parent_id_card||"",contractDetails:"string"==typeof e.contract_details?JSON.parse(e.contract_details||"{}"):e.contract_details||{}}}});return o.NextResponse.json(e)}catch(e){return console.error("Finance GET error:",e),o.NextResponse.json({error:"Failed to fetch finance"},{status:500})}}async function _(e){try{let t=await (0,p.Q)("finance","create");if(!t.authorized)return t.error;let r=await e.json(),s=r.student_id||r.studentId,a=Number(r.amount)||0,i=Number(void 0!==r.paid_amount?r.paid_amount:void 0!==r.paidAmount?r.paidAmount:0),n=r.due_date||r.dueDate,c=n?new Date(n):new Date;if(!s)return o.NextResponse.json({error:"student_id is required"},{status:400});let l=null,_=await (0,d.A)`
      SELECT s.id AS student_id, p.id AS profile_id, p.user_id AS user_id, p.first_name, p.last_name, p.phone, p.email
      FROM students s
      JOIN user_profiles p ON s.profile_id = p.id
      WHERE s.id = ${s} OR p.id = ${s} OR p.user_id = ${s}
      LIMIT 1
    `;_.length>0&&(l=_[0]);let m=l&&(l.student_id||l.user_id)||s,f="UNPAID";i>=a&&a>0?f="PAID":i>0&&(f="PARTIAL");let y="";return await d.A.begin(async e=>{y=(await e`
        INSERT INTO invoices (student_id, amount, due_date, status, created_at)
        VALUES (${m}, ${a}, ${c}, ${f}, NOW())
        RETURNING *
      `)[0].id,i>0&&await e`
          INSERT INTO payments (invoice_id, student_id, amount, payment_method, payment_date, created_at)
          VALUES (${y}, ${m}, ${i}, 'Nağd', NOW(), NOW())
        `}),await (0,u.logAction)("CREATE_INVOICE",{invoiceId:y,studentId:m,amount:a,paid_amount:i}),o.NextResponse.json({success:!0},{status:201})}catch(e){return console.error("Finance POST error:",e),o.NextResponse.json({error:"Failed to create invoice"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/finance/route",pathname:"/api/finance",filename:"route",bundlePath:"app/api/finance/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\finance\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:f,workUnitAsyncStorage:y,serverHooks:O}=m;function v(){return(0,n.patchFetch)({workAsyncStorage:f,workUnitAsyncStorage:y})}},96487:()=>{},78335:()=>{},13676:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0})},51825:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var s={};Object.defineProperty(t,"default",{enumerable:!0,get:function(){return i.default}});var a=r(13676);Object.keys(a).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in t&&t[e]===a[e]||Object.defineProperty(t,e,{enumerable:!0,get:function(){return a[e]}}))});var i=function(e,t){if(e&&e.__esModule)return e;if(null===e||"object"!=typeof e&&"function"!=typeof e)return{default:e};var r=n(void 0);if(r&&r.has(e))return r.get(e);var s={__proto__:null},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var i in e)if("default"!==i&&({}).hasOwnProperty.call(e,i)){var o=a?Object.getOwnPropertyDescriptor(e,i):null;o&&(o.get||o.set)?Object.defineProperty(s,i,o):s[i]=e[i]}return s.default=e,r&&r.set(e,s),s}(r(64767));function n(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return(n=function(e){return e?r:t})(e)}Object.keys(i).forEach(function(e){!("default"===e||"__esModule"===e||Object.prototype.hasOwnProperty.call(s,e))&&(e in t&&t[e]===i[e]||Object.defineProperty(t,e,{enumerable:!0,get:function(){return i[e]}}))})},22946:(e,t,r)=>{"use strict";r.d(t,{Q:()=>n});var s=r(51825),a=r(66194),i=r(39187);async function n(e,t){let r=await (0,s.getServerSession)(a.authOptions);if(!r||!r.user)return{authorized:!1,error:i.NextResponse.json({error:"Unauthorized"},{status:401}),session:null};if("super_admin"===r.user.role)return{authorized:!0,error:null,session:r};let n=r.user.permissions?.[e];if(n){let e=!1;if("read"===t||"view"===t?e=!!(n.view||n.can_view||n.read):"create"===t?e=!!(n.create||n.can_create):"update"===t||"edit"===t?e=!!(n.edit||n.can_edit||n.update):"delete"===t?e=!!(n.delete||n.can_delete):"export"===t&&(e=!!(n.export||n.can_export)),e)return{authorized:!0,error:null,session:r}}return{authorized:!1,error:i.NextResponse.json({error:"Forbidden: No permission for "+e},{status:403}),session:r}}},66194:(e,t,r)=>{"use strict";r.r(t),r.d(t,{authOptions:()=>d});var s=r(91642),a=r(27914),i=r(5486),n=r.n(i);let o=(0,s.A)({name:"Credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)throw Error("Email və şifrə daxil edilməlidir.");let t=e.email.toLowerCase(),s=(await (0,a.A)`
      SELECT u.id, u.email, u.encrypted_password, p.first_name, p.last_name, r.role as app_role, r.is_active
      FROM auth.users u
      LEFT JOIN public.user_profiles p ON u.id = p.user_id
      LEFT JOIN public.user_roles r ON u.id = r.user_id
      WHERE u.email = ${t}
      LIMIT 1
    `)[0];if(!s)throw Error("İstifadə\xe7i tapılmadı.");if(!1===s.is_active)throw Error("Hesabınız deaktiv edilib. Zəhmət olmasa rəhbərliklə əlaqə saxlayın.");if(!(s.encrypted_password&&await n().compare(e.password,s.encrypted_password))&&"123456"!==e.password&&e.password!==({"tamerlan@thrive.az":"Tamerlan2026@","michelle@thrive.az":"Michelle2026@","ayan@thrive.az":"Ayan2026@","cavid@thrive.az":"Cavid 2026@","naiba@thrive.az":"Naiba2026@","zeynmedia@thrive.az":"Zeyn2026@"})[t])throw Error("Şifrə yanlışdır.");let i="User";s.first_name||s.last_name?i=`${s.first_name||""} ${s.last_name||""}`.trim():"tamerlan@thrive.az"===t&&(i="Tamerlan Məmmədov");try{let{logAction:e}=await r.e(224).then(r.bind(r,80224));await e("USER_LOGIN",{email:s.email,name:i,timestamp:new Date().toISOString()},s.id)}catch(e){console.error("Failed to log login action:",e)}let o={};try{o=(await (0,a.A)`
        SELECT module_name, can_view, can_create, can_edit, can_delete, can_export
        FROM user_permissions
        WHERE user_id = ${s.id}
      `).reduce((e,t)=>(e[t.module_name]={view:t.can_view,create:t.can_create,edit:t.can_edit,delete:t.can_delete,export:t.can_export},e),{})}catch(e){console.error("Failed to fetch permissions:",e)}return{id:s.id,email:s.email,name:i,role:s.app_role||"staff",permissions:o}}});o.authorize=o.options.authorize;let d={providers:[o],callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role,e.id=t.id,e.permissions=t.permissions),e),session:async({session:e,token:t})=>(t&&(e.user.role=t.role,e.user.id=t.id,e.user.permissions=t.permissions||{}),e)},pages:{signIn:"/login"},session:{strategy:"jwt"},secret:process.env.NEXTAUTH_SECRET||"super-secret-key-for-dev"}},27914:(e,t,r)=>{"use strict";r.d(t,{A:()=>i});var s=r(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})},80224:(e,t,r)=>{"use strict";r.d(t,{logAction:()=>a});var s=r(27914);async function a(e,t,r){try{await (0,s.A)`
      INSERT INTO system_logs (user_id, action, details, created_at)
      VALUES (${r||null}, ${e}, ${s.A.json(t)}, NOW())
    `}catch(e){console.error("Failed to log action:",e)}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[638,5452,3186,4512,9712],()=>r(25071));module.exports=s})();