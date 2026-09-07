(()=>{var e={};e.id=960,e.ids=[960],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},9121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},9726:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>i.a,__next_app__:()=>u,pages:()=>c,routeModule:()=>m,tree:()=>l});var s=r(260),a=r(8203),n=r(5155),i=r.n(n),o=r(7292),d={};for(let e in o)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(d[e]=()=>o[e]);r.d(t,d);let l=["",{children:["teacher",{children:["students",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,1615)),"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\thrive-portal\\src\\app\\teacher\\students\\page.tsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,1354)),"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\thrive-portal\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,9937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(r.t.bind(r,9116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(r.t.bind(r,1485,23)),"next/dist/client/components/unauthorized-error"]}],c=["C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\thrive-portal\\src\\app\\teacher\\students\\page.tsx"],u={require:r,loadChunk:()=>Promise.resolve()},m=new s.AppPageRouteModule({definition:{kind:a.RouteKind.APP_PAGE,page:"/teacher/students/page",pathname:"/teacher/students",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:l}})},6724:(e,t,r)=>{Promise.resolve().then(r.bind(r,1615))},692:(e,t,r)=>{Promise.resolve().then(r.bind(r,3350))},3350:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>p});var s=r(5512),a=r(8009),n=r(3093),i=r(8542),o=r(6719),d=r(9333),l=r(4302);r(4518);var c=r(9327),u=r(9472);let m=(0,r(4825).A)("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);function p(){let{profile:e}=(0,d.A)(),{t,locale:r}=(0,l.o)(),[p,h]=(0,a.useState)([]),[g,_]=(0,a.useState)(!0);return(0,s.jsx)(n.t,{title:t("nav.students"),children:(0,s.jsx)("div",{className:"space-y-6",children:(0,s.jsxs)(i.Z,{children:[(0,s.jsx)("div",{className:"flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6",children:(0,s.jsxs)("div",{children:[(0,s.jsx)("h3",{className:"text-lg font-bold text-white tracking-wide",children:"az"===r?"Qrup Tələbələri Siyahısı":"Enrolled Students Roster"}),(0,s.jsx)("p",{className:"text-xs text-slate-400 mt-0.5",children:"az"===r?"Tədris etdiyiniz canlı qruplar və qeydiyyatdakı tələbə profilləri":"Live active academic groups and enrolled student profiles"})]})}),g?(0,s.jsx)("div",{className:"py-12 text-center text-xs text-slate-400",children:t("common.loading")}):0===p.length?(0,s.jsx)("div",{className:"py-12 text-center text-xs text-slate-400",children:"az"===r?"Təyin olunmuş qrup tapılmadı":"No active groups assigned"}):(0,s.jsx)("div",{className:"space-y-8",children:p.map(e=>{let t=e.group_students||[];return(0,s.jsxs)("div",{className:"space-y-4",children:[(0,s.jsxs)("div",{className:"flex items-center justify-between bg-[#070F1E] px-5 py-3 rounded-2xl border border-slate-800",children:[(0,s.jsxs)("div",{className:"flex items-center gap-2.5",children:[(0,s.jsx)(c.A,{className:"w-4 h-4 text-[#5ce1e6]"}),(0,s.jsx)("h4",{className:"text-sm font-bold text-white",children:e.name}),(0,s.jsxs)("span",{className:"text-xs text-slate-400",children:["(",e.programs?.name||"General Course",")"]})]}),(0,s.jsxs)(o.E,{variant:"teal",children:[t.length," ","az"===r?"Tələbə":"Students"]})]}),0===t.length?(0,s.jsx)("p",{className:"text-xs text-slate-500 italic pl-2",children:"az"===r?"Bu qrupda hələlik tələbə qeydiyyatda deyil":"No students enrolled in this group"}):(0,s.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:t.map((t,r)=>{let a=t.students?.user_profiles,n=a?`${a.first_name||""} ${a.last_name||""}`.trim():"Academic Student",i=a?.email||"N/A",d=a?.phone||"N/A";return(0,s.jsxs)("div",{className:"bg-[#0D1E36]/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between hover:border-[#4CA2B5]/40 transition-all",children:[(0,s.jsxs)("div",{className:"flex items-center gap-4",children:[(0,s.jsx)("div",{className:"w-11 h-11 rounded-2xl bg-[#070F1E] border border-[#4CA2B5]/30 flex items-center justify-center font-bold text-[#5ce1e6] text-sm",children:n.charAt(0)}),(0,s.jsxs)("div",{children:[(0,s.jsx)("h5",{className:"text-sm font-bold text-white",children:n}),(0,s.jsxs)("div",{className:"mt-1 space-y-0.5 text-xs text-slate-400",children:[(0,s.jsxs)("p",{className:"flex items-center gap-1.5",children:[(0,s.jsx)(u.A,{className:"w-3 h-3 text-[#5ce1e6]"})," ",i]}),(0,s.jsxs)("p",{className:"flex items-center gap-1.5",children:[(0,s.jsx)(m,{className:"w-3 h-3 text-slate-500"})," ",d]})]})]})]}),(0,s.jsx)(o.E,{variant:"green",children:"Active"})]},`grp-${e.id}-st-${t.id||t.student_id}-${r}`)})})]},e.id)})})]})})})}},8542:(e,t,r)=>{"use strict";r.d(t,{Z:()=>n});var s=r(5512);r(8009);var a=r(4195);let n=({children:e,className:t,hover:r=!1})=>(0,s.jsx)("div",{className:(0,a.cn)("bg-[#0D1E36] border border-slate-800/80 rounded-2xl p-5 shadow-xl",r&&"hover:border-[#4CA2B5]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4CA2B5]/5",t),children:e})},4518:(e,t,r)=>{"use strict";r.d(t,{W:()=>n});var s=r(5842);let a=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],n={async getLiveScheduleMatrix(e,t){try{let{data:r,error:n}=await s.N.from("group_schedules").select(`
          id,
          group_id,
          day_of_week,
          start_time,
          end_time,
          room,
          groups (
            id,
            name,
            room,
            teacher_id,
            programs ( id, name )
          )
        `);if(n||!r)return console.error("group_schedules error:",n),[];let i=0===new Date().getDay()?7:new Date().getDay(),o=r.filter(e=>e.groups&&e.day_of_week).map(e=>{let t=e.groups,r=t?.programs,s=7===e.day_of_week?0:e.day_of_week;return{id:e.id,groupId:e.group_id,groupName:t?.name||"Academic Group",programName:r?.name||"Academic Course",teacherName:"Faculty Member",room:e.room||t?.room||"Room 101",dayOfWeek:e.day_of_week,dayName:a[s]||"Scheduled Day",startTime:e.start_time?e.start_time.substring(0,5):"10:00",endTime:e.end_time?e.end_time.substring(0,5):"11:30",isToday:e.day_of_week===i}});if(e){let{data:t}=await s.N.from("students").select("id, program, group_students(group_id)").eq("id",e).maybeSingle();if(t){let e=(t.program||"").toLowerCase().split(",").map(e=>e.trim()).filter(Boolean),r=(t.group_students||[]).map(e=>e.group_id),s=o.filter(t=>{let s=t.groupName.toLowerCase(),a=t.programName.toLowerCase();return r.length>0&&r.includes(t.groupId)?0===e.length||e.some(e=>s.includes(e)||a.includes(e)||e.includes(s)||e.includes(a)||e.includes("math")&&s.includes("math")||e.includes("english")&&(s.includes("ge")||s.includes("speaking"))):e.some(e=>s.includes(e)||a.includes(e)||e.includes("math")&&s.includes("math")||e.includes("english")&&(s.includes("ge")||s.includes("speaking")))});if(s.length>0)return s}}return t&&"all"!==t&&(o=o.filter(e=>e.programName===t)),o}catch(e){return console.error("getLiveScheduleMatrix error:",e),[]}},async getTeacherDashboard(e){try{let t=s.N.from("groups").select(`
          id,
          name,
          room,
          created_at,
          programs ( id, name ),
          group_students (
            id,
            student_id,
            students (
              id,
              program,
              user_profiles ( first_name, last_name, email, phone )
            )
          ),
          group_schedules (
            id,
            day_of_week,
            start_time,
            end_time,
            room
          )
        `);e&&(t=t.eq("teacher_id",e));let{data:r,error:n}=await t;if(n||!r)return{groups:[],totalStudents:0,todaysClasses:[]};let i=0,o=[],d=new Date().getDay();return r.forEach(e=>{let t=e.group_students?.length||0;i+=t,(e.group_schedules||[]).forEach(t=>{let r=t.day_of_week%7;o.push({id:t.id,groupId:e.id,groupName:e.name,programName:e.programs?.name||"Course",teacherName:"Teacher Console",room:t.room||e.room||"Main Hall",dayOfWeek:t.day_of_week,dayName:a[r],startTime:t.start_time||"10:00",endTime:t.end_time||"11:30",isToday:r===d})})}),{groups:r,totalStudents:i,todaysClasses:o.filter(e=>e.isToday)}}catch(e){return console.error("getTeacherDashboard error:",e),{groups:[],totalStudents:0,todaysClasses:[]}}},async markAttendance(e,t,r,a,n){try{let i=new Date().toISOString().split("T")[0];if(a<i)return{error:"Time-Lock Enforced: Past attendance records cannot be altered."};let{data:o,error:d}=await s.N.from("attendance").upsert({group_id:e,student_id:t,date:a,status:r.toUpperCase(),notes:n||null},{onConflict:"group_id,student_id,date"}).select();if(d)throw d;return{success:!0,data:o}}catch(e){return console.error("markAttendance error:",e),{error:e.message||"Failed to update attendance"}}},async getStudentDashboard(e){try{let t=s.N.from("students").select(`
          id,
          program,
          monthly_payment,
          duration_months,
          total_price,
          user_profiles ( first_name, last_name, email, phone ),
          group_students (
            id,
            groups (
              id,
              name,
              room,
              programs ( id, name ),
              group_schedules (
                id,
                day_of_week,
                start_time,
                end_time,
                room
              )
            )
          )
        `);e&&(t=t.eq("id",e));let{data:r,error:a}=await t;if(a||!r||0===r.length)return null;let n=r[0],{data:i}=await s.N.from("attendance").select("*").eq("student_id",n.id),o=i||[],d=o.length,l=o.filter(e=>"PRESENT"===e.status).length,c=o.filter(e=>"LATE"===e.status).length,u=d>0?Math.round((l+.5*c)/d*100):98;return{student:n,attendanceRate:u,totalClasses:d,presentCount:l,attendanceHistory:o}}catch(e){return console.error("getStudentDashboard error:",e),null}},async getAdvancedParentDashboard(e,t){try{let{data:r,error:a}=await s.N.from("students").select(`
          id,
          profile_id,
          program,
          monthly_payment,
          duration_months,
          total_price,
          user_profiles (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          group_students (
            id,
            group_id,
            groups (
              id,
              name,
              room,
              programs ( id, name )
            )
          )
        `);if(a||!r||0===r.length)return{children:[],selectedChild:null};let n=(e||"").split("@")[0].toLowerCase().trim(),i=(t||"").replace(/\D/g,""),o=r.filter(e=>{let t=(e.id||"").toLowerCase(),r=((e.user_profiles||{}).phone||"").replace(/\D/g,"");return!!(n&&(t.startsWith(n)||n.includes(t.substring(0,8)))||i&&r&&(i===r||r.includes(i)||i.includes(r)))});0===o.length&&(o=r.slice(0,2));let d=await Promise.all(o.map(async e=>{let t=e.user_profiles||{},r=`${t.first_name||""} ${t.last_name||""}`.trim()||"Student",{data:a}=await s.N.from("attendance").select("*").eq("student_id",e.id),n=a||[],i=n.length,o=n.filter(e=>"PRESENT"===e.status).length,d=n.filter(e=>"LATE"===e.status).length,l=n.filter(e=>"ABSENT"===e.status).length,c=i>0?Math.round((o+.5*d)/i*100):96,u=(e.group_students||[]).map(e=>e.group_id).filter(Boolean),m=[];if(u.length>0){let{data:e}=await s.N.from("assignments").select("id, title, due_date, max_score, assignment_submissions(*)").in("group_id",u);m=e||[]}let p=[];if(u.length>0){let{data:e}=await s.N.from("group_schedules").select("id, group_id, day_of_week, start_time, end_time, room, groups(name)").in("group_id",u);p=e||[]}return{id:e.id,profileId:e.profile_id,name:r,email:t.email||"",phone:t.phone||"",program:e.program||e.group_students?.[0]?.groups?.programs?.name||"Academic Course",monthlyPayment:e.monthly_payment||350,totalPrice:e.total_price||3150,durationMonths:e.duration_months||9,groups:(e.group_students||[]).map(e=>e.groups).filter(Boolean),attendanceRate:c,totalClasses:i,presentCount:o,lateCount:d,absentCount:l,attendanceHistory:n,assignments:m,schedules:p}}));return{children:d,selectedChild:d[0]||null}}catch(e){return console.error("getAdvancedParentDashboard error:",e),{children:[],selectedChild:null}}},async getAssignments(e){try{let t=s.N.from("assignments").select(`
          id,
          title,
          description,
          due_date,
          max_score,
          group_id,
          created_at,
          groups ( id, name, programs ( id, name ) ),
          assignment_submissions (
            id,
            student_id,
            score,
            status,
            content,
            feedback,
            submitted_at,
            students ( user_profiles ( first_name, last_name, email ) )
          )
        `).order("created_at",{ascending:!1});e&&(t=t.eq("group_id",e));let{data:r,error:a}=await t;if(a||!r)return[];return r}catch(e){return console.error("getAssignments error:",e),[]}},async createAssignment(e,t,r,a,n=100){try{let{data:i,error:o}=await s.N.from("assignments").insert({group_id:e,title:t,description:r,due_date:a,max_score:n}).select();if(o)throw o;return{success:!0,data:i}}catch(e){return console.error("createAssignment error:",e),{error:e.message}}},async submitAssignment(e,t,r){try{let{data:a,error:n}=await s.N.from("assignment_submissions").insert({assignment_id:e,student_id:t,content:r,status:"SUBMITTED",submitted_at:new Date().toISOString()}).select();if(n)throw n;return{success:!0,data:a}}catch(e){return console.error("submitAssignment error:",e),{error:e.message}}},async gradeSubmission(e,t,r){try{let{data:a,error:n}=await s.N.from("assignment_submissions").update({score:t,feedback:r,status:"GRADED"}).eq("id",e).select();if(n)throw n;return{success:!0,data:a}}catch(e){return console.error("gradeSubmission error:",e),{error:e.message}}},async getAnnouncements(){try{let{data:e,error:t}=await s.N.from("notifications").select("*").order("created_at",{ascending:!1}).limit(20);if(t||!e)return[];return e}catch(e){return console.error("getAnnouncements error:",e),[]}},async postAnnouncement(e,t){try{let{data:r,error:a}=await s.N.from("notifications").insert({title:e,message:t,is_read:!1}).select();if(a)throw a;return{success:!0,data:r}}catch(e){return console.error("postAnnouncement error:",e),{error:e.message}}},async getStudentPayments(e){try{let{data:t,error:r}=await s.N.from("payments").select("*").eq("student_id",e).order("payment_date",{ascending:!1});if(r||!t)return[];return t}catch(e){return console.error("getStudentPayments error:",e),[]}},async getExamResults(e){try{let t=s.N.from("exam_results").select(`
          id,
          score,
          max_score,
          feedback,
          created_at,
          students ( user_profiles ( first_name, last_name ) )
        `).order("created_at",{ascending:!1});e&&(t=t.eq("student_id",e));let{data:r,error:a}=await t;if(a||!r)return[];return r}catch(e){return console.error("getExamResults error:",e),[]}}}},1615:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});let s=(0,r(6760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"C:\\\\Users\\\\mexty\\\\OneDrive\\\\Desktop\\\\thrive-crm\\\\thrive-portal\\\\src\\\\app\\\\teacher\\\\students\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\thrive-portal\\src\\app\\teacher\\students\\page.tsx","default")},9472:(e,t,r)=>{"use strict";r.d(t,{A:()=>s});let s=(0,r(4825).A)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]])}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[57,955,621,21,93],()=>r(9726));module.exports=s})();