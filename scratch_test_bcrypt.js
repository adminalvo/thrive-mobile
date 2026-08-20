const bcrypt = require('bcrypt');
async function test() {
  const hash = '$2a$10$ptdFObwCTf9NLvygxl6TSuGUQIj6U0Un3Pz5SckaqJ2ZSdSEwfx8a'; // password123
  const match = await bcrypt.compare('password123', hash);
  console.log('Match?', match);
}
test();
