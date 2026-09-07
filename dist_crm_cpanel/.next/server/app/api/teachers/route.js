(()=>{var e={};e.id=7163,e.ids=[7163],e.modules={5486:e=>{"use strict";e.exports=require("bcrypt")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},10155:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>y,routeModule:()=>h,serverHooks:()=>_,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>x});var s={};t.r(s),t.d(s,{GET:()=>l,POST:()=>m,dynamic:()=>d});var i=t(42706),a=t(28203),o=t(45994),n=t(39187),p=t(27914),u=t(5486),c=t.n(u);let d="force-dynamic";async function l(){try{let e=(await (0,p.A)`
      SELECT 
        t.id, 
        t.specialization, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone,
        p.user_id,
        (
          SELECT COUNT(*)::int 
          FROM groups g 
          WHERE g.teacher_id = p.user_id 
             OR g.teacher_id = t.id 
             OR g.teacher_id = t.profile_id
        ) as active_groups
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
    `).map(e=>({id:e.user_id||e.id,teacher_table_id:e.id,name:`${e.first_name||""} ${e.last_name||""}`.trim()||"Bilinmir",email:e.email||"",phone:e.phone||"",specialty:e.specialization||"Təyin edilməyib",activeGroups:Number(e.active_groups)||0}));return n.NextResponse.json(e)}catch(e){return console.error(e),n.NextResponse.json({error:"Failed to fetch teachers"},{status:500})}}async function m(e){try{let{name:r,email:t,specialty:s,password:i,groupIds:a,groups:o,groupId:u}=await e.json();if(!r||"string"!=typeof r||!r.trim()||!t||"string"!=typeof t||!t.trim())return n.NextResponse.json({error:"Name and email are required"},{status:400});let d=t.trim().toLowerCase();if((await (0,p.A)`SELECT id FROM auth.users WHERE email = ${d}`).length>0)return n.NextResponse.json({error:"Email already exists"},{status:409});let l=r.trim().split(" "),m=l[0]||"M\xfcəllim",h=l.slice(1).join(" ")||"",E=crypto.randomUUID(),x=crypto.randomUUID(),_=crypto.randomUUID(),y=await c().hash(i||"123456",10),R=Array.isArray(a)?a:Array.isArray(o)?o:u?[u]:a?[a]:[];return await p.A.begin(async e=>{for(let r of(await e`
        INSERT INTO auth.users (id, email, role, aud, encrypted_password)
        VALUES (${E}, ${d}, 'teacher', 'authenticated', ${y})
      `,await e`
        INSERT INTO user_profiles (id, user_id, first_name, last_name, email)
        VALUES (${x}, ${E}, ${m}, ${h}, ${d})
      `,await e`
        INSERT INTO teachers (id, profile_id, specialization)
        VALUES (${_}, ${x}, ${s||null})
      `,await e`
        INSERT INTO user_roles (user_id, role)
        VALUES (${E}, 'teacher')
        ON CONFLICT (user_id) DO UPDATE SET role = 'teacher'
      `,R))r&&await e`
            UPDATE groups
            SET teacher_id = ${E}
            WHERE id = ${r}
          `}),n.NextResponse.json({success:!0,id:_,teacher:{id:_,name:`${m} ${h}`.trim(),email:d,specialty:s||null}},{status:201})}catch(e){return console.error("Teacher Creation Error:",e),n.NextResponse.json({error:e.message||"Failed to create teacher"},{status:500})}}let h=new i.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/teachers/route",pathname:"/api/teachers",filename:"route",bundlePath:"app/api/teachers/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\teachers\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:E,workUnitAsyncStorage:x,serverHooks:_}=h;function y(){return(0,o.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:x})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>a});var s=t(73186);let i=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,a=i?(0,s.A)(i,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(10155));module.exports=s})();