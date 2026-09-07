(()=>{var e={};e.id=6150,e.ids=[224,6150],e.modules={5486:e=>{"use strict";e.exports=require("bcrypt")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},77626:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>T,routeModule:()=>E,serverHooks:()=>N,workAsyncStorage:()=>g,workUnitAsyncStorage:()=>h});var a={};r.r(a),r.d(a,{GET:()=>_,POST:()=>m,dynamic:()=>c});var s=r(42706),i=r(28203),n=r(45994),o=r(39187),d=r(27914),u=r(5486),p=r.n(u),l=r(80224);let c="force-dynamic";async function _(){try{let[e,t,r]=await Promise.all([(0,d.A)`
        SELECT 
          s.id, 
          s.created_at, 
          s.program,
          s.fin_code,
          p.first_name, 
          p.last_name, 
          p.email, 
          p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        ORDER BY s.created_at DESC
      `,(0,d.A)`
        SELECT student_id, program_name, status 
        FROM student_programs
      `,(0,d.A)`
        SELECT gs.student_id, g.id as group_id, g.name as group_name
        FROM group_students gs
        JOIN groups g ON gs.group_id = g.id
      `]),a=new Map;t.forEach(e=>{a.has(e.student_id)||a.set(e.student_id,[]),a.get(e.student_id).push(e.program_name)});let s=new Map;r.forEach(e=>{s.has(e.student_id)||s.set(e.student_id,[]),s.get(e.student_id).push({id:e.group_id,name:e.group_name})});let i=e.map(e=>{let t=a.get(e.id)||[],r=e.program?e.program.split(",").map(e=>e.trim()).filter(Boolean):[],i=Array.from(new Set([...r,...t]));return{id:e.id,name:`${e.first_name||""} ${e.last_name||""}`.trim()||"Bilinmir",email:e.email||"",phone:e.phone||"",fin:e.fin_code||"",program:e.program||"—",programs:i.length>0?i:e.program?[e.program]:[],groups:s.get(e.id)||[],group:s.get(e.id)?.[0]?.name||"Əsas Qrup",joinDate:e.created_at?new Date(e.created_at).toLocaleDateString():"",status:"ACTIVE"}});return o.NextResponse.json(i)}catch(e){return console.error("Students GET error:",e),o.NextResponse.json({error:"Failed to fetch students"},{status:500})}}async function m(e){try{let t=await e.json(),{name:r,email:a,phone:s,programs:i,password:n,parentName:u,parentPhone:c,parentEmail:_,parentPassword:m}=t,E=Array.isArray(i)?i.join(", "):t.program||"",g=n?await p().hash(n,10):await p().hash("123456",10),h=m?await p().hash(m,10):await p().hash("123456",10),N=(r||"").trim().split(" "),T=N[0]||"Tələbə",O=N.slice(1).join(" ")||"",$=crypto.randomUUID(),w=crypto.randomUUID(),S=crypto.randomUUID();return await d.A.begin(async e=>{let t=a||`${$.substring(0,8)}@example.com`,r=await e`SELECT id FROM auth.users WHERE email = ${t}`,i=$;r.length>0?i=r[0].id:await e`
          INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
          VALUES (
            ${$}, 
            '00000000-0000-0000-0000-000000000000', 
            ${t}, 
            'authenticated', 
            'authenticated', 
            ${g},
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            NOW()
          )
        `;let n=await e`SELECT id FROM user_profiles WHERE user_id = ${i}`,o=w;if(n.length>0?o=n[0].id:await e`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${w}, ${i}, ${T}, ${O}, ${a||null}, ${s||null})
        `,await e`
        INSERT INTO students (
          id, profile_id, program, monthly_payment, duration_months, total_price, 
          fin_code, id_card_number, dob, address, contract_details
        )
        VALUES (
          ${S}, ${o}, ${E||null}, ${0}, 
          ${1}, ${0}, null, null,
          null, null, '{}'
        )
      `,await e`
        INSERT INTO user_roles (user_id, role)
        VALUES (${i}, 'student')
        ON CONFLICT (user_id) DO NOTHING
      `,u||_||c){let t=_||`${S.substring(0,8)}@parent.thrive.az`,r=crypto.randomUUID(),a=crypto.randomUUID(),s=crypto.randomUUID(),i=await e`SELECT id FROM auth.users WHERE email = ${t}`,n=r;i.length>0?n=i[0].id:await e`
            INSERT INTO auth.users (id, instance_id, email, role, aud, encrypted_password, raw_app_meta_data, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
            VALUES (
              ${r}, 
              '00000000-0000-0000-0000-000000000000', 
              ${t}, 
              'authenticated', 
              'authenticated', 
              ${h},
              '{"provider":"email","providers":["email"]}',
              '{}',
              NOW(),
              NOW(),
              NOW()
            )
          `;let o=(u||"").trim().split(" "),d=o[0]||"Valideyn",p=o.slice(1).join(" ")||"",l=await e`SELECT id FROM user_profiles WHERE user_id = ${n}`,m=a;l.length>0?m=l[0].id:await e`
            INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
            VALUES (${a}, ${n}, ${d}, ${p}, ${t}, ${c||null})
          `;let E=await e`SELECT id FROM parents WHERE profile_id = ${m}`,g=s;E.length>0?g=E[0].id:await e`
            INSERT INTO parents (id, profile_id, fin_code, id_card_number, address)
            VALUES (${s}, ${m}, null, null, null)
          `,await e`
          INSERT INTO student_parents (student_id, parent_id, relation_type)
          VALUES (${S}, ${g}, 'Ata')
          ON CONFLICT DO NOTHING
        `,await e`
          INSERT INTO user_roles (user_id, role)
          VALUES (${n}, 'parent')
          ON CONFLICT (user_id) DO NOTHING
        `}}),await (0,l.logAction)("CREATE_STUDENT",{studentId:S,name:`${T} ${O}`.trim(),email:a}),o.NextResponse.json({success:!0,id:S})}catch(e){return console.error("Student Creation Error:",e),o.NextResponse.json({error:e.message||"Failed to create student"},{status:500})}}let E=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/students/route",pathname:"/api/students",filename:"route",bundlePath:"app/api/students/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\students\\route.ts",nextConfigOutput:"standalone",userland:a}),{workAsyncStorage:g,workUnitAsyncStorage:h,serverHooks:N}=E;function T(){return(0,n.patchFetch)({workAsyncStorage:g,workUnitAsyncStorage:h})}},96487:()=>{},78335:()=>{},27914:(e,t,r)=>{"use strict";r.d(t,{A:()=>i});var a=r(73186);let s=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=s?(0,a.A)(s,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})},80224:(e,t,r)=>{"use strict";r.d(t,{logAction:()=>s});var a=r(27914);async function s(e,t,r){try{await (0,a.A)`
      INSERT INTO system_logs (user_id, action, details, created_at)
      VALUES (${r||null}, ${e}, ${a.A.json(t)}, NOW())
    `}catch(e){console.error("Failed to log action:",e)}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[638,5452,3186],()=>r(77626));module.exports=a})();