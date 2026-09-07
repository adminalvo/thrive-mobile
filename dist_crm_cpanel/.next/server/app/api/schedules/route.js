(()=>{var e={};e.id=2288,e.ids=[2288],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},6005:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>T,routeModule:()=>c,serverHooks:()=>g,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>E});var s={};t.r(s),t.d(s,{GET:()=>_,POST:()=>m,dynamic:()=>u});var o=t(42706),a=t(28203),i=t(45994),n=t(39187),d=t(27914);let u="force-dynamic";async function p(){await (0,d.A)`
    CREATE TABLE IF NOT EXISTS group_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT,
      teacher_id UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `}async function _(){try{await p();let e=(await (0,d.A)`
      SELECT 
        g.id,
        g.name,
        g.room,
        p.name as program_name,
        COALESCE(up.first_name || ' ' || up.last_name, 'Təyin edilməyib') as teacher_name,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', s.id,
                'groupId', s.group_id,
                'dayOfWeek', s.day_of_week,
                'day_of_week', s.day_of_week,
                'startTime', s.start_time,
                'start_time', s.start_time,
                'endTime', s.end_time,
                'end_time', s.end_time,
                'room', COALESCE(s.room, g.room)
              ) ORDER BY s.day_of_week ASC, s.start_time ASC
            )
            FROM group_schedules s
            WHERE s.group_id = g.id
          ),
          '[]'::json
        ) as schedules
      FROM groups g
      LEFT JOIN programs p ON g.program_id = p.id
      LEFT JOIN teachers t ON g.teacher_id = t.id
      LEFT JOIN user_profiles up ON t.profile_id = up.id
      ORDER BY g.name ASC
    `).map(e=>({id:e.id,name:e.name,room:e.room||"N/A",teacher:e.teacher_name,language:"AZ",maxCapacity:15,_count:{students:0},program:{name:e.program_name||"Proqram se\xe7ilməyib"},schedules:e.schedules||[]}));return n.NextResponse.json(e)}catch(e){return console.error("Schedules GET error:",e),n.NextResponse.json({error:"Failed to fetch schedules"},{status:500})}}async function m(e){try{await p();let r=await e.json(),t=r.group_id||r.groupId,s=void 0!==r.day_of_week?r.day_of_week:r.dayOfWeek,o=parseInt(s,10),a=(r.start_time||r.startTime||"").trim(),i=(r.end_time||r.endTime||"").trim(),u=r.room?String(r.room).trim():null,_=r.teacher_id||r.teacherId||null;if(!t)return n.NextResponse.json({error:"group_id is required"},{status:400});if(isNaN(o)||o<1||o>7)return n.NextResponse.json({error:"day_of_week must be between 1 and 7"},{status:400});if(!a||!i)return n.NextResponse.json({error:"start_time and end_time are required"},{status:400});let m=(await (0,d.A)`
      INSERT INTO group_schedules (group_id, day_of_week, start_time, end_time, room, teacher_id)
      VALUES (${t}, ${o}, ${a}, ${i}, ${u}, ${_})
      RETURNING *
    `)[0],c={id:m.id,groupId:m.group_id,group_id:m.group_id,dayOfWeek:m.day_of_week,day_of_week:m.day_of_week,startTime:m.start_time,start_time:m.start_time,endTime:m.end_time,end_time:m.end_time,room:m.room};return n.NextResponse.json(c,{status:201})}catch(e){return console.error("Schedules POST error:",e),n.NextResponse.json({error:"Failed to create schedule"},{status:500})}}let c=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/schedules/route",pathname:"/api/schedules",filename:"route",bundlePath:"app/api/schedules/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\schedules\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:l,workUnitAsyncStorage:E,serverHooks:g}=c;function T(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:E})}},96487:()=>{},78335:()=>{},27914:(e,r,t)=>{"use strict";t.d(r,{A:()=>a});var s=t(73186);let o=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,a=o?(0,s.A)(o,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[638,5452,3186],()=>t(6005));module.exports=s})();