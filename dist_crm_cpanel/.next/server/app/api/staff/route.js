(()=>{var e={};e.id=612,e.ids=[612],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},45058:(e,r,s)=>{"use strict";s.r(r),s.d(r,{patchFetch:()=>x,routeModule:()=>f,serverHooks:()=>E,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>_});var t={};s.r(t),s.d(t,{GET:()=>c,POST:()=>d,dynamic:()=>l});var a=s(42706),i=s(28203),o=s(45994),n=s(39187),u=s(27914),p=s(1959);let l="force-dynamic";async function c(){try{let e=await (0,u.A)`
      SELECT 
        u.id as user_id, 
        u.email, 
        r.role,
        p.first_name, 
        p.last_name,
        p.phone,
        r.is_active
      FROM auth.users u
      JOIN user_roles r ON u.id = r.user_id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE r.role IN ('super_admin', 'admin', 'staff', 'sales', 'teacher')
        AND r.is_active = true
        AND p.first_name IS NOT NULL
      ORDER BY 
        CASE 
          WHEN r.role = 'super_admin' THEN 1
          WHEN r.role = 'admin' THEN 2
          WHEN r.role = 'staff' THEN 3
          WHEN r.role = 'sales' THEN 4
          ELSE 5
        END ASC;
    `,r=new Map;for(let s of e){let e=`${s.first_name||""} ${s.last_name||""}`.trim(),t=(s.first_name||"").toLowerCase().trim(),a=(s.last_name||"").toLowerCase().trim(),i=(t+"_"+(a.charAt(0)||"")).replace(/ə/g,"e");if(r.has(i)){let e=r.get(i);e.allUserIds.includes(s.user_id)||e.allUserIds.push(s.user_id)}else r.set(i,{id:s.user_id,allUserIds:[s.user_id],name:e,email:s.email,role:s.role,phone:s.phone||"",isActive:!0})}let s=Array.from(r.values());return n.NextResponse.json(s)}catch(e){return console.error("Staff fetch error:",e),n.NextResponse.json({error:"Failed to fetch staff"},{status:500})}}async function d(e){try{let{email:r,password:s,firstName:t,lastName:a,phone:i,role:o,permissions:l}=await e.json();if(!r||!s||!t||!o)return n.NextResponse.json({error:"B\xfct\xfcn vacib xanaları doldurun"},{status:400});let{data:c,error:d}=await p.E.auth.admin.createUser({email:r,password:s,email_confirm:!0,user_metadata:{first_name:t,last_name:a||"",phone:i||""}});if(d)return n.NextResponse.json({error:d.message},{status:400});let f=c.user.id;return await u.A.begin(async e=>{if(await e`
        INSERT INTO user_profiles (user_id, first_name, last_name, email, phone)
        VALUES (${f}, ${t}, ${a}, ${r}, ${i||null})
      `,await e`
        INSERT INTO user_roles (user_id, role, is_active)
        VALUES (${f}, ${o}, true)
      `,l&&"object"==typeof l)for(let r of Object.keys(l)){let s=l[r];await e`
            INSERT INTO user_permissions (
              user_id, module_name, can_view, can_create, can_edit, can_delete, can_export
            ) VALUES (
              ${f}, ${r}, 
              ${s.view||!1}, 
              ${s.create||!1}, 
              ${s.edit||!1}, 
              ${s.delete||!1}, 
              ${s.export||!1}
            )
          `}}),n.NextResponse.json({success:!0,userId:f},{status:201})}catch(e){return console.error("Staff create error:",e),n.NextResponse.json({error:e.message||"Xəta baş verdi"},{status:500})}}let f=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/staff/route",pathname:"/api/staff",filename:"route",bundlePath:"app/api/staff/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\staff\\route.ts",nextConfigOutput:"standalone",userland:t}),{workAsyncStorage:m,workUnitAsyncStorage:_,serverHooks:E}=f;function x(){return(0,o.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:_})}},96487:()=>{},78335:()=>{},27914:(e,r,s)=>{"use strict";s.d(r,{A:()=>i});var t=s(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=a?(0,t.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})},1959:(e,r,s)=>{"use strict";s.d(r,{E:()=>i});var t=s(88148);let a=process.env.SUPABASE_SERVICE_ROLE_KEY||"",i=(0,t.UU)("https://bhiqieseyeamiqfgjssh.supabase.co",a,{auth:{autoRefreshToken:!1,persistSession:!1}})}};var r=require("../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[638,5452,3186,8148],()=>s(45058));module.exports=t})();