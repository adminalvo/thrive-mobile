(()=>{var e={};e.id=9607,e.ids=[9607],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},56166:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>R,routeModule:()=>m,serverHooks:()=>h,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>_});var s={};t.r(s),t.d(s,{DELETE:()=>l,GET:()=>d,PUT:()=>c,dynamic:()=>u});var a=t(42706),i=t(28203),o=t(45994),n=t(39187),p=t(27914);let u="force-dynamic";async function d(e,{params:r}){try{let{id:e}=await r;if(!e)return n.NextResponse.json({error:"ID is required"},{status:400});let t=await (0,p.A)`
      SELECT 
        t.id,
        t.specialization,
        t.created_at,
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.user_id
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE t.id = ${e} OR p.user_id = ${e}
    `;if(0===t.length)return n.NextResponse.json({error:"Teacher not found"},{status:404});let s=t[0],a=`${s.first_name||""} ${s.last_name||""}`.trim()||"Bilinmir",i=[];try{let r=await (0,p.A)`
        SELECT 
          g.id,
          g.name,
          g.room,
          g.created_at,
          pr.name as program
        FROM groups g
        LEFT JOIN programs pr ON g.program_id = pr.id
        WHERE g.teacher_id = ${s.user_id||""} 
           OR g.teacher_id = ${e}
           OR g.teacher_id = ${s.profile_id||""}
        ORDER BY g.created_at DESC
      `;r.length>0&&(i=r.map(e=>({id:e.id,name:e.name,program:e.program||s.specialization||"Proqram se\xe7ilməyib",room:e.room||"Room",studentCount:0,maxCapacity:15})))}catch(e){console.error("Fetch teacher groups error:",e)}let o=[];try{o=(await (0,p.A)`
        SELECT 
          s.id,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          s.created_at
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 10
      `).map((e,r)=>({id:e.id,name:`${e.first_name||""} ${e.last_name||""}`.trim()||"Tələbə",email:e.email||"",phone:e.phone||"",groupName:i[r%i.length]?.name||"Əsas Qrup"}))}catch(e){console.error("Fetch teacher students error:",e)}let u=[];try{let r=await (0,p.A)`
        SELECT s.id, s.day_of_week, s.start_time, s.end_time, g.name as group_name, g.room
        FROM schedules s
        JOIN groups g ON s.group_id = g.id
        WHERE g.teacher_id = ${s.user_id||""} 
           OR g.teacher_id = ${e}
           OR g.teacher_id = ${s.profile_id||""}
      `,t=["Bazar","Bazar ertəsi","\xc7ərşənbə axşamı","\xc7ərşənbə","C\xfcmə axşamı","C\xfcmə","Şənbə"];u=r.map(e=>({id:e.id,dayOfWeek:e.day_of_week,dayName:t[e.day_of_week]||"Məlum deyil",startTime:e.start_time?.substring(0,5)||"",endTime:e.end_time?.substring(0,5)||"",room:e.room||"Room",groupName:e.group_name||"Qrup"}))}catch(e){console.error("Fetch teacher schedules error:",e)}let d=o.length,l={activeGroupsCount:i.length,totalStudentsCount:d,weeklyHours:2*u.length},c={teacher:{id:s.id,name:a,firstName:s.first_name||"",lastName:s.last_name||"",email:s.email||"",phone:s.phone||"",specialty:s.specialization||"Təyin edilməyib",status:"ACTIVE",joinDate:s.created_at||new Date().toISOString()},groups:i,students:o,schedules:u,stats:l};return n.NextResponse.json(c)}catch(e){return console.error("Get Teacher Profile Error:",e),n.NextResponse.json({error:e.message||"Failed to fetch teacher profile"},{status:500})}}async function l(e,{params:r}){try{let{id:e}=await r;if(!e)return n.NextResponse.json({error:"ID is required"},{status:400});let t=await (0,p.A)`
      SELECT t.id as teacher_id, p.user_id, p.id as profile_id
      FROM teachers t
      LEFT JOIN user_profiles p ON t.profile_id = p.id
      WHERE t.id = ${e} OR p.user_id = ${e}
    `;if(0===t.length)return n.NextResponse.json({error:"Teacher not found"},{status:404});let{teacher_id:s,user_id:a,profile_id:i}=t[0];return await p.A.begin(async e=>{if(await e`DELETE FROM teachers WHERE id = ${s}`,await e`UPDATE groups SET teacher_id = NULL WHERE teacher_id = ${a} OR teacher_id = ${s}`,a){await e`DELETE FROM user_roles WHERE user_id = ${a} AND role = 'teacher'`;let r=await e`SELECT role FROM user_roles WHERE user_id = ${a}`;0===r.length&&(await e`DELETE FROM user_profiles WHERE id = ${i}`,await e`DELETE FROM auth.users WHERE id = ${a}`)}}),n.NextResponse.json({success:!0})}catch(e){return console.error("Delete Teacher Error:",e),n.NextResponse.json({error:"Failed to delete teacher"},{status:500})}}async function c(e,{params:r}){try{let{id:t}=await r;if(!t)return n.NextResponse.json({error:"ID is required"},{status:400});let s=await e.json(),a=await (0,p.A)`SELECT profile_id FROM teachers WHERE id = ${t}`;if(a.length>0&&a[0].profile_id){let e=a[0].profile_id;if(s.name||s.phone||s.email){let r=(s.name||"").trim().split(" "),t=r[0],a=r.slice(1).join(" ");await (0,p.A)`
          UPDATE user_profiles
          SET 
            first_name = COALESCE(${t||null}, first_name),
            last_name = COALESCE(${a||null}, last_name),
            phone = COALESCE(${s.phone||null}, phone),
            email = COALESCE(${s.email||null}, email)
          WHERE id = ${e}
        `}}return s.specialty&&await (0,p.A)`
        UPDATE teachers
        SET specialization = ${s.specialty}
        WHERE id = ${t}
      `,n.NextResponse.json({success:!0})}catch(e){return console.error("Update Teacher Error:",e),n.NextResponse.json({error:"Failed to update teacher"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/teachers/[id]/route",pathname:"/api/teachers/[id]",filename:"route",bundlePath:"app/api/teachers/[id]/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\teachers\\[id]\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:E,workUnitAsyncStorage:_,serverHooks:h}=m;function R(){return(0,o.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:_})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>i});var s=t(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(56166));module.exports=s})();