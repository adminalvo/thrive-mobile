(()=>{var e={};e.id=9872,e.ids=[9872],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},10800:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>E,routeModule:()=>c,serverHooks:()=>x,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>m});var s={};t.r(s),t.d(s,{GET:()=>d,revalidate:()=>p});var a=t(42706),o=t(28203),i=t(45994),n=t(39187),u=t(27914);let p=300;async function d(){try{let e=new Date().getDay();if(!(await (0,u.A)`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'group_schedules'
      );
    `)[0].exists)return n.NextResponse.json([]);let r=(await (0,u.A)`
      SELECT 
        s.start_time as time,
        g.name as title,
        COALESCE(s.room, g.room, 'Təyin edilməyib') as room,
        pr.first_name,
        pr.last_name
      FROM group_schedules s
      JOIN groups g ON s.group_id = g.id
      LEFT JOIN auth.users u ON g.teacher_id = u.id
      LEFT JOIN user_profiles pr ON pr.user_id = u.id
      WHERE s.day_of_week = ${0===e?7:e}
      ORDER BY s.start_time ASC
      LIMIT 10
    `).map(e=>({time:e.time,title:e.title,room:e.room,teacher:`${e.first_name||""} ${e.last_name||""}`.trim()||"M\xfcəllim təyin edilməyib"}));return n.NextResponse.json(r)}catch(e){return console.error("Dashboard Today Classes Error:",e),n.NextResponse.json({error:"Failed to fetch today's classes"},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/dashboard/today/route",pathname:"/api/dashboard/today",filename:"route",bundlePath:"app/api/dashboard/today/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\dashboard\\today\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:l,workUnitAsyncStorage:m,serverHooks:x}=c;function E(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:m})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>o});var s=t(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,o=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(10800));module.exports=s})();