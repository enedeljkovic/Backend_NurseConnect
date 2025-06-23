const bcrypt = require('bcrypt');

const hash = '$2a$10$JUBmzaTVEBgrkOz58k7a5uKtiBvJCiqXKEtyspdpNxEb2SLkcVO1S'; // tvoj hash
const lozinka = 'admin123'; // test lozinka

bcrypt.compare(lozinka, hash).then(result => {
  if (result) {
    console.log('✅ Lozinka JE ispravna!');
  } else {
    console.log('❌ Lozinka NIJE ispravna.');
  }
});
