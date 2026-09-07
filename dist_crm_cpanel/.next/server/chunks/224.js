"use strict";exports.id=224,exports.ids=[224],exports.modules={80224:(t,o,s)=>{s.d(o,{logAction:()=>a});var e=s(27914);async function a(t,o,s){try{await (0,e.A)`
      INSERT INTO system_logs (user_id, action, details, created_at)
      VALUES (${s||null}, ${t}, ${e.A.json(o)}, NOW())
    `}catch(t){console.error("Failed to log action:",t)}}}};