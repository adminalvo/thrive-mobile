(()=>{var e={};e.id=6028,e.ids=[224,6028],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:e=>{"use strict";e.exports=require("crypto")},29021:e=>{"use strict";e.exports=require("fs")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},74998:e=>{"use strict";e.exports=require("perf_hooks")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},90179:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>R,routeModule:()=>E,serverHooks:()=>O,workAsyncStorage:()=>_,workUnitAsyncStorage:()=>g});var s={};r.r(s),r.d(s,{DELETE:()=>c,GET:()=>l,PUT:()=>m,dynamic:()=>p});var a=r(42706),i=r(28203),n=r(45994),o=r(39187),d=r(27914),u=r(80224);let p="force-dynamic";async function l(e,{params:t}){try{let{id:e}=await t;if(!e)return o.NextResponse.json({error:"ID is required"},{status:400});let r=await (0,d.A)`
      SELECT 
        s.id,
        s.created_at,
        s.program,
        s.monthly_payment,
        s.duration_months,
        s.total_price,
        s.signed_contract_url,
        p.id as profile_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        u.id as user_id,
        u.role
      FROM students s
      LEFT JOIN user_profiles p ON s.profile_id = p.id
      LEFT JOIN auth.users u ON p.user_id = u.id
      WHERE s.id = ${e}
    `;if(0===r.length)return o.NextResponse.json({error:"Student not found"},{status:404});let s=r[0],a=`${s.first_name||""} ${s.last_name||""}`.trim()||"Bilinmir",i=[];try{i=await (0,d.A)`
        SELECT p.id, up.first_name || ' ' || up.last_name as name, up.phone, au.email, p.fin_code as fin, p.id_card_number as idCard
        FROM parents p
        JOIN student_parents sp ON p.id = sp.parent_id
        LEFT JOIN user_profiles up ON p.profile_id = up.id
        LEFT JOIN auth.users au ON up.user_id = au.id
        WHERE sp.student_id = ${e}
      `}catch(e){console.error("Fetch student parents error:",e)}let n=[];try{n=(await (0,d.A)`
        SELECT 
          i.id,
          i.amount,
          i.status,
          i.created_at,
          COALESCE((SELECT SUM(amount) FROM payments p WHERE p.invoice_id = i.id), 0) as paid_amount
        FROM invoices i
        WHERE i.student_id = ${e} OR i.student_id = ${s.user_id} OR i.student_id = ${s.profile_id}
        ORDER BY i.created_at DESC
      `).map(e=>{let t=Number(e.amount)||0,r=Number(e.paid_amount)||0;return{id:e.id,amount:t,paidAmount:r,status:e.status||(r>=t&&t>0?"PAID":"PENDING"),date:e.created_at||new Date().toISOString(),dueDate:e.created_at||new Date().toISOString()}})}catch(e){console.error("Fetch student payments error:",e)}let u=[];try{u=(await (0,d.A)`
        SELECT 
          g.id,
          g.name,
          g.room,
          g.created_at,
          pr.name as program,
          COALESCE(tp.first_name || ' ' || tp.last_name, u.email, 'Müəllim təyin edilməyib') as teacher
        FROM group_students gs
        JOIN groups g ON gs.group_id = g.id
        LEFT JOIN programs pr ON g.program_id = pr.id
        LEFT JOIN auth.users u ON g.teacher_id = u.id
        LEFT JOIN teachers t ON g.teacher_id = t.id
        LEFT JOIN user_profiles tp ON t.profile_id = tp.id
        WHERE gs.student_id = ${e} OR gs.student_id = ${s.user_id} OR gs.student_id = ${s.profile_id}
        ORDER BY g.created_at DESC
      `).map(e=>({id:e.id,name:e.name,program:e.program||"\xdcmumi Proqram",teacher:e.teacher||"Təyin edilməyib",room:e.room||"Room 101",schedule:"B.e, \xc7.a 10:00 - 12:00"}))}catch(e){console.error("Fetch student groups error:",e)}let p=[];try{p=(await (0,d.A)`
        SELECT 
          a.id,
          a.date,
          g.name as group_name,
          a.status,
          a.notes
        FROM attendance a
        LEFT JOIN groups g ON a.group_id = g.id
        WHERE a.student_id = ${e} OR a.student_id = ${s.user_id} OR a.student_id = ${s.profile_id}
        ORDER BY a.date DESC
      `).map(e=>({id:e.id,date:e.date?new Date(e.date).toISOString().split("T")[0]:"",groupName:e.group_name||"Bilinmir",status:"PRESENT"===(e.status||"").toUpperCase()?"PRESENT":"LATE"===(e.status||"").toUpperCase()?"LATE":"ABSENT",notes:e.notes||""}))}catch(e){console.error("Fetch attendance error:",e)}let l=n.reduce((e,t)=>e+(Number(t.paidAmount)||0),0);n.reduce((e,t)=>e+Math.max(0,(Number(t.amount)||0)-(Number(t.paidAmount)||0)),0);let c=n.reduce((e,t)=>e+(Number(t.amount)||0),0),m=p.filter(e=>"PRESENT"===e.status).length,E=p.length,_=[];try{_=await (0,d.A)`
        SELECT * FROM student_programs 
        WHERE student_id = ${e}
        ORDER BY joined_date DESC
      `||[]}catch(e){console.error("Fetch programs error:",e)}return o.NextResponse.json({studentPrograms:_.map(e=>({id:e.id,name:e.program_name,price:e.monthly_payment,date:e.joined_date,status:e.status})),student:{id:s.id,firstName:s.first_name||"",lastName:s.last_name||"",name:a,email:s.email||"",phone:s.phone||"",fin:s.fin_code||"",idCard:s.id_card_number||"",status:s.status||"Aktiv",joinDate:s.created_at||new Date().toISOString(),program:s.program||"",monthlyPayment:s.monthly_payment||0,durationMonths:s.duration_months||0,totalPrice:s.total_price||0,signedContractUrl:s.signed_contract_url||null},parents:i,groups:u,payments:n,attendance:p,stats:{totalPaid:l,totalDebt:Math.max(0,c-l),attendanceRate:(E>0?Math.round(m/E*100):100)+"%",enrolledGroupsCount:u.length}})}catch(e){return console.error("Get Student Profile Error:",e),o.NextResponse.json({error:e.message||"Failed to fetch student profile"},{status:500})}}async function c(e,{params:t}){try{let{id:e}=await t;if(!e)return o.NextResponse.json({error:"ID is required"},{status:400});return await (0,d.A)`DELETE FROM students WHERE id = ${e}`,await (0,u.logAction)("DELETE_STUDENT",{studentId:e}),o.NextResponse.json({success:!0})}catch(e){return console.error("Delete Student Error:",e),o.NextResponse.json({error:"Failed to delete student"},{status:500})}}async function m(e,{params:t}){try{let{id:r}=await t;if(!r)return o.NextResponse.json({error:"ID is required"},{status:400});let s=await e.json(),a=await (0,d.A)`SELECT profile_id FROM students WHERE id = ${r}`;if(a.length>0&&a[0].profile_id){let e=a[0].profile_id;if(s.name||s.phone||s.email){let t=(s.name||"").trim().split(" "),r=t[0],a=t.slice(1).join(" ");await (0,d.A)`
          UPDATE user_profiles
          SET 
            first_name = COALESCE(${r||null}, first_name),
            last_name = COALESCE(${a||null}, last_name),
            phone = COALESCE(${s.phone||null}, phone),
            email = COALESCE(${s.email||null}, email)
          WHERE id = ${e}
        `}let t=void 0!==s.program?s.program:Array.isArray(s.programs)?s.programs.join(", "):s.programs;await (0,d.A)`
        UPDATE students
        SET 
          program = COALESCE(${t||null}, program),
          fin_code = COALESCE(${s.fin||null}, fin_code),
          id_card_number = COALESCE(${s.idCard||null}, id_card_number)
        WHERE id = ${r}
      `}return await (0,u.logAction)("UPDATE_STUDENT",{studentId:r,updates:s}),o.NextResponse.json({success:!0})}catch(e){return console.error("Update Student Error:",e),o.NextResponse.json({error:"Failed to update student"},{status:500})}}let E=new a.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/students/[id]/route",pathname:"/api/students/[id]",filename:"route",bundlePath:"app/api/students/[id]/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\students\\[id]\\route.ts",nextConfigOutput:"standalone",userland:s}),{workAsyncStorage:_,workUnitAsyncStorage:g,serverHooks:O}=E;function R(){return(0,n.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:g})}},96487:()=>{},78335:()=>{},27914:(e,t,r)=>{"use strict";r.d(t,{A:()=>i});var s=r(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,i=a?(0,s.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})},80224:(e,t,r)=>{"use strict";r.d(t,{logAction:()=>a});var s=r(27914);async function a(e,t,r){try{await (0,s.A)`
      INSERT INTO system_logs (user_id, action, details, created_at)
      VALUES (${r||null}, ${e}, ${s.A.json(t)}, NOW())
    `}catch(e){console.error("Failed to log action:",e)}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[638,5452,3186],()=>r(90179));module.exports=s})();