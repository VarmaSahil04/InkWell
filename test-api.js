const http = require('http');

const optionsSignup = {
  hostname: 'localhost',
  port: 8080,
  path: '/public/signup',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
};

const req1 = http.request(optionsSignup, (res) => {
  const optionsLogin = {
    hostname: 'localhost',
    port: 8080,
    path: '/public/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const req2 = http.request(optionsLogin, (res2) => {
    let token = '';
    res2.on('data', d => token += d);
    res2.on('end', () => {
      console.log("Token: ", token);
      const optionsCreate = {
        hostname: 'localhost',
        port: 8080,
        path: '/journal',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      };
      const req3 = http.request(optionsCreate, () => {
        const optionsGet = {
          hostname: 'localhost',
          port: 8080,
          path: '/journal',
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
        };
        const req4 = http.request(optionsGet, (res4) => {
          let data = '';
          res4.on('data', d => data += d);
          res4.on('end', () => console.log("DATA: ", data));
        });
        req4.end();
      });
      req3.write(JSON.stringify({title: "Test", content: "Test"}));
      req3.end();
    });
  });
  req2.write(JSON.stringify({userName: "testuser1", password: "password"}));
  req2.end();
});
req1.write(JSON.stringify({userName: "testuser1", password: "password", email: "test@example.com"}));
req1.end();
