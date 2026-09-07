"use strict";exports.id=857,exports.ids=[857],exports.modules={8542:(e,t,r)=>{r.d(t,{Z:()=>n});var s=r(5512);r(8009);var a=r(4195);let n=({children:e,className:t,hover:r=!1})=>(0,s.jsx)("div",{className:(0,a.cn)("bg-[#0D1E36] border border-slate-800/80 rounded-2xl p-5 shadow-xl",r&&"hover:border-[#4CA2B5]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#4CA2B5]/5",t),children:e})},4518:(e,t,r)=>{r.d(t,{W:()=>n});var s=r(5842);let a=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],n={async getLiveScheduleMatrix(e,t){try{let{data:r,error:n}=await s.N.from("group_schedules").select(`
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
        `);if(n||!r)return console.error("group_schedules error:",n),[];let o=0===new Date().getDay()?7:new Date().getDay(),i=r.filter(e=>e.groups&&e.day_of_week).map(e=>{let t=e.groups,r=t?.programs,s=7===e.day_of_week?0:e.day_of_week;return{id:e.id,groupId:e.group_id,groupName:t?.name||"Academic Group",programName:r?.name||"Academic Course",teacherName:"Faculty Member",room:e.room||t?.room||"Room 101",dayOfWeek:e.day_of_week,dayName:a[s]||"Scheduled Day",startTime:e.start_time?e.start_time.substring(0,5):"10:00",endTime:e.end_time?e.end_time.substring(0,5):"11:30",isToday:e.day_of_week===o}});if(e){let{data:t}=await s.N.from("students").select("id, program, group_students(group_id)").eq("id",e).maybeSingle();if(t){let e=(t.program||"").toLowerCase().split(",").map(e=>e.trim()).filter(Boolean),r=(t.group_students||[]).map(e=>e.group_id),s=i.filter(t=>{let s=t.groupName.toLowerCase(),a=t.programName.toLowerCase();return r.length>0&&r.includes(t.groupId)?0===e.length||e.some(e=>s.includes(e)||a.includes(e)||e.includes(s)||e.includes(a)||e.includes("math")&&s.includes("math")||e.includes("english")&&(s.includes("ge")||s.includes("speaking"))):e.some(e=>s.includes(e)||a.includes(e)||e.includes("math")&&s.includes("math")||e.includes("english")&&(s.includes("ge")||s.includes("speaking")))});if(s.length>0)return s}}return t&&"all"!==t&&(i=i.filter(e=>e.programName===t)),i}catch(e){return console.error("getLiveScheduleMatrix error:",e),[]}},async getTeacherDashboard(e){try{let t=s.N.from("groups").select(`
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
        `);e&&(t=t.eq("teacher_id",e));let{data:r,error:n}=await t;if(n||!r)return{groups:[],totalStudents:0,todaysClasses:[]};let o=0,i=[],d=new Date().getDay();return r.forEach(e=>{let t=e.group_students?.length||0;o+=t,(e.group_schedules||[]).forEach(t=>{let r=t.day_of_week%7;i.push({id:t.id,groupId:e.id,groupName:e.name,programName:e.programs?.name||"Course",teacherName:"Teacher Console",room:t.room||e.room||"Main Hall",dayOfWeek:t.day_of_week,dayName:a[r],startTime:t.start_time||"10:00",endTime:t.end_time||"11:30",isToday:r===d})})}),{groups:r,totalStudents:o,todaysClasses:i.filter(e=>e.isToday)}}catch(e){return console.error("getTeacherDashboard error:",e),{groups:[],totalStudents:0,todaysClasses:[]}}},async markAttendance(e,t,r,a,n){try{let o=new Date().toISOString().split("T")[0];if(a<o)return{error:"Time-Lock Enforced: Past attendance records cannot be altered."};let{data:i,error:d}=await s.N.from("attendance").upsert({group_id:e,student_id:t,date:a,status:r.toUpperCase(),notes:n||null},{onConflict:"group_id,student_id,date"}).select();if(d)throw d;return{success:!0,data:i}}catch(e){return console.error("markAttendance error:",e),{error:e.message||"Failed to update attendance"}}},async getStudentDashboard(e){try{let t=s.N.from("students").select(`
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
        `);e&&(t=t.eq("id",e));let{data:r,error:a}=await t;if(a||!r||0===r.length)return null;let n=r[0],{data:o}=await s.N.from("attendance").select("*").eq("student_id",n.id),i=o||[],d=i.length,l=i.filter(e=>"PRESENT"===e.status).length,u=i.filter(e=>"LATE"===e.status).length,m=d>0?Math.round((l+.5*u)/d*100):98;return{student:n,attendanceRate:m,totalClasses:d,presentCount:l,attendanceHistory:i}}catch(e){return console.error("getStudentDashboard error:",e),null}},async getAdvancedParentDashboard(e,t){try{let{data:r,error:a}=await s.N.from("students").select(`
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
        `);if(a||!r||0===r.length)return{children:[],selectedChild:null};let n=(e||"").split("@")[0].toLowerCase().trim(),o=(t||"").replace(/\D/g,""),i=r.filter(e=>{let t=(e.id||"").toLowerCase(),r=((e.user_profiles||{}).phone||"").replace(/\D/g,"");return!!(n&&(t.startsWith(n)||n.includes(t.substring(0,8)))||o&&r&&(o===r||r.includes(o)||o.includes(r)))});0===i.length&&(i=r.slice(0,2));let d=await Promise.all(i.map(async e=>{let t=e.user_profiles||{},r=`${t.first_name||""} ${t.last_name||""}`.trim()||"Student",{data:a}=await s.N.from("attendance").select("*").eq("student_id",e.id),n=a||[],o=n.length,i=n.filter(e=>"PRESENT"===e.status).length,d=n.filter(e=>"LATE"===e.status).length,l=n.filter(e=>"ABSENT"===e.status).length,u=o>0?Math.round((i+.5*d)/o*100):96,m=(e.group_students||[]).map(e=>e.group_id).filter(Boolean),c=[];if(m.length>0){let{data:e}=await s.N.from("assignments").select("id, title, due_date, max_score, assignment_submissions(*)").in("group_id",m);c=e||[]}let g=[];if(m.length>0){let{data:e}=await s.N.from("group_schedules").select("id, group_id, day_of_week, start_time, end_time, room, groups(name)").in("group_id",m);g=e||[]}return{id:e.id,profileId:e.profile_id,name:r,email:t.email||"",phone:t.phone||"",program:e.program||e.group_students?.[0]?.groups?.programs?.name||"Academic Course",monthlyPayment:e.monthly_payment||350,totalPrice:e.total_price||3150,durationMonths:e.duration_months||9,groups:(e.group_students||[]).map(e=>e.groups).filter(Boolean),attendanceRate:u,totalClasses:o,presentCount:i,lateCount:d,absentCount:l,attendanceHistory:n,assignments:c,schedules:g}}));return{children:d,selectedChild:d[0]||null}}catch(e){return console.error("getAdvancedParentDashboard error:",e),{children:[],selectedChild:null}}},async getAssignments(e){try{let t=s.N.from("assignments").select(`
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
        `).order("created_at",{ascending:!1});e&&(t=t.eq("group_id",e));let{data:r,error:a}=await t;if(a||!r)return[];return r}catch(e){return console.error("getAssignments error:",e),[]}},async createAssignment(e,t,r,a,n=100){try{let{data:o,error:i}=await s.N.from("assignments").insert({group_id:e,title:t,description:r,due_date:a,max_score:n}).select();if(i)throw i;return{success:!0,data:o}}catch(e){return console.error("createAssignment error:",e),{error:e.message}}},async submitAssignment(e,t,r){try{let{data:a,error:n}=await s.N.from("assignment_submissions").insert({assignment_id:e,student_id:t,content:r,status:"SUBMITTED",submitted_at:new Date().toISOString()}).select();if(n)throw n;return{success:!0,data:a}}catch(e){return console.error("submitAssignment error:",e),{error:e.message}}},async gradeSubmission(e,t,r){try{let{data:a,error:n}=await s.N.from("assignment_submissions").update({score:t,feedback:r,status:"GRADED"}).eq("id",e).select();if(n)throw n;return{success:!0,data:a}}catch(e){return console.error("gradeSubmission error:",e),{error:e.message}}},async getAnnouncements(){try{let{data:e,error:t}=await s.N.from("notifications").select("*").order("created_at",{ascending:!1}).limit(20);if(t||!e)return[];return e}catch(e){return console.error("getAnnouncements error:",e),[]}},async postAnnouncement(e,t){try{let{data:r,error:a}=await s.N.from("notifications").insert({title:e,message:t,is_read:!1}).select();if(a)throw a;return{success:!0,data:r}}catch(e){return console.error("postAnnouncement error:",e),{error:e.message}}},async getStudentPayments(e){try{let{data:t,error:r}=await s.N.from("payments").select("*").eq("student_id",e).order("payment_date",{ascending:!1});if(r||!t)return[];return t}catch(e){return console.error("getStudentPayments error:",e),[]}},async getExamResults(e){try{let t=s.N.from("exam_results").select(`
          id,
          score,
          max_score,
          feedback,
          created_at,
          students ( user_profiles ( first_name, last_name ) )
        `).order("created_at",{ascending:!1});e&&(t=t.eq("student_id",e));let{data:r,error:a}=await t;if(a||!r)return[];return r}catch(e){return console.error("getExamResults error:",e),[]}}}},6335:(e,t,r)=>{r.d(t,{A:()=>s});let s=(0,r(4825).A)("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]])}};