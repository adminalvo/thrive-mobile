(()=>{var E={};E.id=9199,E.ids=[9199],E.modules={10846:E=>{"use strict";E.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:E=>{"use strict";E.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:E=>{"use strict";E.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:E=>{"use strict";E.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:E=>{"use strict";E.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},55511:E=>{"use strict";E.exports=require("crypto")},29021:E=>{"use strict";E.exports=require("fs")},91645:E=>{"use strict";E.exports=require("net")},21820:E=>{"use strict";E.exports=require("os")},74998:E=>{"use strict";E.exports=require("perf_hooks")},27910:E=>{"use strict";E.exports=require("stream")},34631:E=>{"use strict";E.exports=require("tls")},17577:(E,e,T)=>{"use strict";T.r(e),T.d(e,{patchFetch:()=>D,routeModule:()=>o,serverHooks:()=>I,workAsyncStorage:()=>N,workUnitAsyncStorage:()=>U});var t={};T.r(t),T.d(t,{GET:()=>A,dynamic:()=>d});var a=T(42706),s=T(28203),r=T(45994),n=T(39187),i=T(27914);let d="force-dynamic";async function A(){try{return await i.A.begin(async E=>{await E`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY,
          user_id UUID,
          first_name TEXT,
          last_name TEXT,
          email TEXT,
          phone TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id UUID PRIMARY KEY,
          role TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY,
          profile_id UUID,
          program VARCHAR(255),
          monthly_payment NUMERIC(10,2),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='program') THEN
                ALTER TABLE students ADD COLUMN program VARCHAR(255);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='monthly_payment') THEN
                ALTER TABLE students ADD COLUMN monthly_payment NUMERIC(10,2);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='duration_months') THEN
                ALTER TABLE students ADD COLUMN duration_months INT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='total_price') THEN
                ALTER TABLE students ADD COLUMN total_price NUMERIC(10,2);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='fin_code') THEN
                ALTER TABLE students ADD COLUMN fin_code TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='id_card_number') THEN
                ALTER TABLE students ADD COLUMN id_card_number TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='dob') THEN
                ALTER TABLE students ADD COLUMN dob DATE;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='address') THEN
                ALTER TABLE students ADD COLUMN address TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='contract_details') THEN
                ALTER TABLE students ADD COLUMN contract_details JSONB DEFAULT '{}'::jsonb;
            END IF;
        END $$;
      `,await E`
        CREATE TABLE IF NOT EXISTS teachers (
          id UUID PRIMARY KEY,
          profile_id UUID,
          specialization TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS parents (
          id UUID PRIMARY KEY,
          profile_id UUID,
          fin_code TEXT,
          id_card_number TEXT,
          address TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parents' AND column_name='address') THEN
                ALTER TABLE parents ADD COLUMN address TEXT;
            END IF;
        END $$;
      `,await E`
        CREATE TABLE IF NOT EXISTS parent_students (
          parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (parent_id, student_id)
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          deleted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS groups (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          program_id UUID,
          teacher_id UUID,
          room TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS group_schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          group_id UUID,
          day_of_week INT,
          start_time TIME,
          end_time TIME,
          room TEXT,
          teacher_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          source TEXT,
          status TEXT NOT NULL DEFAULT 'NEW',
          notes TEXT,
          next_follow_up TIMESTAMPTZ,
          created_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='created_by') THEN
                ALTER TABLE leads ADD COLUMN created_by UUID;
            END IF;
        END $$;
      `,await E`
        CREATE TABLE IF NOT EXISTS attendance (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          schedule_id UUID,
          student_id UUID,
          status TEXT NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE'
          date DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS group_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID,
          group_id UUID,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          action TEXT NOT NULL,
          details_az TEXT,
          details_en TEXT,
          details_ru TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS kanban_tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'TODO',
          priority TEXT NOT NULL DEFAULT 'MEDIUM',
          due_date TIMESTAMPTZ,
          assignee TEXT,
          order_index INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          student_id UUID,
          amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'PENDING',
          due_date TIMESTAMPTZ,
          payment_method TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          title TEXT NOT NULL,
          message TEXT,
          type TEXT,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS student_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          is_private BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS exams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
          teacher_id UUID REFERENCES auth.users(id),
          date DATE NOT NULL,
          max_score INT NOT NULL DEFAULT 100,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS exam_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          score DECIMAL(5,2) NOT NULL,
          feedback TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(exam_id, student_id)
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
          teacher_id UUID REFERENCES auth.users(id),
          due_date TIMESTAMPTZ,
          max_score INT DEFAULT 100,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `,await E`
        CREATE TABLE IF NOT EXISTS assignment_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, SUBMITTED, GRADED, LATE
          content TEXT,
          score INT,
          feedback TEXT,
          submitted_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(assignment_id, student_id)
        )
      `;try{await E`ALTER TABLE student_notes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE`}catch(E){console.log("Could not add is_private to student_notes:",E)}}),n.NextResponse.json({message:"Database initialized successfully"})}catch(E){return console.error("Database init error:",E),n.NextResponse.json({error:E.message},{status:500})}}let o=new a.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/init-db/route",pathname:"/api/init-db",filename:"route",bundlePath:"app/api/init-db/route"},resolvedPagePath:"C:\\Users\\mexty\\OneDrive\\Desktop\\thrive-crm\\src\\app\\api\\init-db\\route.ts",nextConfigOutput:"standalone",userland:t}),{workAsyncStorage:N,workUnitAsyncStorage:U,serverHooks:I}=o;function D(){return(0,r.patchFetch)({workAsyncStorage:N,workUnitAsyncStorage:U})}},96487:()=>{},78335:()=>{},27914:(E,e,T)=>{"use strict";T.d(e,{A:()=>s});var t=T(73186);let a=process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.DIRECT_URL,s=a?(0,t.A)(a,{ssl:"require",prepare:!1}):new Proxy(()=>{},{apply:()=>{throw Error("DATABASE_URL is not set in Vercel Environment Variables")}})}};var e=require("../../../webpack-runtime.js");e.C(E);var T=E=>e(e.s=E),t=e.X(0,[638,5452,3186],()=>T(17577));module.exports=t})();