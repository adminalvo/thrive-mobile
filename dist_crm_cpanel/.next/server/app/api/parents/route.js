(()=>{var e={};e.id=3165,e.ids=[3165],e.modules={5486:e=>{"use strict";e.exports=require("bcrypt")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},32087:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>A,routeModule:()=>m,serverHooks:()=>x,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>N});var s={};t.r(s),t.d(s,{GET:()=>l,POST:()=>_,dynamic:()=>c});var a=t(42706),n=t(28203),i=t(45994),o=t(39187),u=t(27914),p=t(5486),d=t.n(p);let c="force-dynamic";async function l(){try{let e=(await (0,u.A)`
      SELECT p.id, p.fin_code, p.id_card_number, p.created_at, 
             COALESCE(NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), p.full_name) as full_name, 
             COALESCE(u.phone, p.phone) as phone,
             au.email
      FROM parents p
      LEFT JOIN user_profiles u ON p.profile_id = u.id
      LEFT JOIN auth.users au ON u.user_id = au.id
      ORDER BY p.created_at DESC
    `).map(e=>({id:e.id,name:e.full_name||"N/A",contact:e.phone||"N/A",email:e.email||"N/A",fin:e.fin_code||"N/A",idCard:e.id_card_number||"N/A"}));return o.NextResponse.json(e)}catch(e){return console.error("Parents API Error:",e),o.NextResponse.json({error:"Internal Server Error"},{status:500})}}async function _(e){try{let r=await e.json(),{first_name:t,last_name:s,phone:a,email:n,fin_code:i,id_card_number:p,password:c}=r,l=c?await d().hash(c,10):await d().hash("123456",10),_=crypto.randomUUID(),m=crypto.randomUUID(),E=crypto.randomUUID();return await u.A.begin(async e=>{let o=n||`${_.substring(0,8)}@example.com`,u=await e`SELECT id FROM auth.users WHERE email = ${o}`,d=_;u.length>0?d=u[0].id:await e`
          INSERT INTO auth.users (id, email, role, aud, encrypted_password)
          VALUES (${_}, ${o}, 'authenticated', 'authenticated', ${l})
        `;let c=await e`SELECT id FROM user_profiles WHERE user_id = ${d}`,N=m;c.length>0?N=c[0].id:await e`
          INSERT INTO user_profiles (id, user_id, first_name, last_name, email, phone)
          VALUES (${m}, ${d}, ${t||"Valideyn"}, ${s||""}, ${n||null}, ${a||null})
        `,await e`
        INSERT INTO parents (id, profile_id, fin_code, id_card_number)
        VALUES (${E}, ${N}, ${i}, ${p||null})
      `,await e`
        INSERT INTO user_roles (user_id, role)
        VALUES (${d}, 'parent')
        ON CONFLICT (user_id) DO NOTHING
      `;let x=r.student_id||r.studentId;x&&await e`
          INSERT INTO student_parents (student_id, parent_id, relation_type)
          VALUES (${x}, ${E}, 'Ata/Ana')
          ON CONFLICT DO NOTHING
        `}),o.NextResponse.json({success:!0,id:E})}catch(e){return console.error("Parents Create Error:",e),o.NextResponse.json({error:e.message||"Failed to create parent"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/parents/route",pathname:"/api/parents",filename:"route",bundlePath:"app/api/parents/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\parents\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:E,workUnitAsyncStorage:N,serverHooks:x}=m;function A(){return(0,i.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:N})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>n});var s=t(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,n=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(32087));module.exports=s})();