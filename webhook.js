const http = require('http');
const { exec } = require('child_process');

http
  .createServer((req, res) => {
    if (req.method === 'POST') {
      console.log('\n🔔 Webhook received');

      // sprawdź czy są lokalne zmiany
      exec('git status --porcelain', (err, stdout) => {
        if (err) {
          console.error('❌ Error checking git status:', err);
          return;
        }

        if (stdout.trim() !== '') {
          console.log('⚠️ Masz lokalne zmiany – pomijam pull');
          return;
        }

        console.log('⬇️ Brak lokalnych zmian, robię sync...');

        exec(
          'git fetch origin && git reset --hard origin/main',
          (err, stdout, stderr) => {
            if (err) {
              console.error('❌ Git error:', err);
              return;
            }

            console.log('✅ Repo zsynchronizowane:');
            console.log(stdout);
          },
        );
      });
    }

    res.end('ok');
  })
  .listen(3123, () => console.log('🚀 Webhook listening on 3123'));
