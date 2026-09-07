(()=>{var e={};e.id=5540,e.ids=[5540],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},62579:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>h,routeModule:()=>l,serverHooks:()=>_,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>g});var s={};t.r(s),t.d(s,{DELETE:()=>c,GET:()=>d,PUT:()=>m,dynamic:()=>u});var a=t(42706),o=t(28203),n=t(45994),i=t(39187),p=t(27914);let u="force-dynamic";async function d(e,{params:r}){try{let{id:e}=await r;if(!e)return i.NextResponse.json({error:"ID is required"},{status:400});let t=await (0,p.A)`
      SELECT 
        g.id,
        g.name,
        g.room,
        g.created_at,
        g.program_id,
        g.teacher_id,
        pr.name as program_name,
        pr.description as program_description,
        COALESCE(tp.first_name || ' ' || tp.last_name, u.email, 'Müəllim təyin edilməyib') as teacher_name,
        COALESCE(tp.email, u.email) as teacher_email,
        tp.phone as teacher_phone
      FROM groups g
      LEFT JOIN programs pr ON g.program_id = pr.id
      LEFT JOIN auth.users u ON g.teacher_id = u.id
      LEFT JOIN teachers t ON g.teacher_id = t.id
      LEFT JOIN user_profiles tp ON t.profile_id = tp.id
      WHERE g.id = ${e}
    `;if(0===t.length)return i.NextResponse.json({error:"Group not found"},{status:404});let s=t[0],a=[];try{a=(await (0,p.A)`
        SELECT 
          s.id,
          s.created_at as "enrolledAt",
          p.first_name,
          p.last_name,
          p.email,
          p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 12
      `).map((e,r)=>({id:e.id,name:`${e.first_name||""} ${e.last_name||""}`.trim()||"Tələbə",email:e.email||"",phone:e.phone||"",enrolledAt:e.enrolledAt||new Date().toISOString(),paymentStatus:r%4==0?"PENDING":"PAID",attendanceRate:r%3==0?"90%":"96%"}))}catch(e){console.error("Fetch group students error:",e)}let o=[];try{let r=await (0,p.A)`
        SELECT s.id, s.day_of_week, s.start_time, s.end_time, g.room
        FROM schedules s
        JOIN groups g ON s.group_id = g.id
        WHERE s.group_id = ${e}
      `,t=["Bazar","Bazar ertəsi","\xc7ərşənbə axşamı","\xc7ərşənbə","C\xfcmə axşamı","C\xfcmə","Şənbə"];o=r.map(e=>({id:e.id,dayOfWeek:e.day_of_week,dayName:t[e.day_of_week]||"Məlum deyil",startTime:e.start_time?.substring(0,5)||"",endTime:e.end_time?.substring(0,5)||"",room:e.room||s.room||"Room"}))}catch(e){console.error("Fetch group schedules error:",e)}let n=[];try{n=(await (0,p.A)`
        SELECT a.date, 
               SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
               SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count
        FROM attendance a
        WHERE a.group_id = ${e}
        GROUP BY a.date
        ORDER BY a.date DESC
        LIMIT 5
      `).map((e,r)=>({id:`ah-${r}`,date:e.date?new Date(e.date).toISOString().split("T")[0]:"",presentCount:Number(e.present_count),absentCount:Number(e.absent_count),topic:"Dərs m\xf6vzusu"}))}catch(e){console.error("Fetch group attendance error:",e)}let u=s.max_capacity||15,d=a.length,c=u>0?Math.round(d/u*100):0,m={group:{id:s.id,name:s.name,program:s.program_name||"Proqram se\xe7ilməyib",programDescription:s.program_description||"Akademik tədris proqramı",durationMonths:s.duration_months||6,teacher:s.teacher_name||"Təyin edilməyib",teacherEmail:s.teacher_email||"",teacherPhone:s.teacher_phone||"",room:s.room||"Room 101",maxCapacity:u,status:"ACTIVE",createdAt:s.created_at||new Date().toISOString()},students:a,schedules:o,attendanceHistory:n,stats:{enrolledStudentsCount:d,maxCapacity:u,capacityPercentage:c,averageAttendance:"100%"}};return i.NextResponse.json(m)}catch(e){return console.error("Get Group Profile Error:",e),i.NextResponse.json({error:e.message||"Failed to fetch group profile"},{status:500})}}async function c(e,{params:r}){try{let{id:e}=await r;if(!e)return i.NextResponse.json({error:"ID is required"},{status:400});return await (0,p.A)`DELETE FROM groups WHERE id = ${e}`,i.NextResponse.json({success:!0})}catch(e){return console.error("Delete Group Error:",e),i.NextResponse.json({error:"Failed to delete group"},{status:500})}}async function m(e,{params:r}){try{let{id:t}=await r,s=await e.json();if(!t)return i.NextResponse.json({error:"ID is required"},{status:400});let a=await (0,p.A)`
      UPDATE groups
      SET 
        name = COALESCE(${s.name||null}, name),
        room = COALESCE(${s.room||null}, room),
        program_id = COALESCE(${s.program_id||null}, program_id),
        teacher_id = COALESCE(${s.teacher_id||null}, teacher_id)
      WHERE id = ${t}
      RETURNING *
    `;return i.NextResponse.json(a[0])}catch(e){return console.error("Update Group Error:",e),i.NextResponse.json({error:"Failed to update group"},{status:500})}}let l=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/groups/[id]/route",pathname:"/api/groups/[id]",filename:"route",bundlePath:"app/api/groups/[id]/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\groups\\[id]\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:E,workUnitAsyncStorage:g,serverHooks:_}=l;function h(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:g})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>o});var s=t(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,o=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(62579));module.exports=s})();