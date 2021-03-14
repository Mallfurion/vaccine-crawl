const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

const mail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'florin.scouts@gmail.com',
    pass: 'tybklzaqiambcvti'
  }
});

var mailOptions = {
  from: 'florin.scouts@gmail.com',
  to: 'florin.scouts@gmail.com',
  subject: 'RO-VACCINATE Available places',
  text: ''
};

var mailOptionsTokenInvalid = {
  from: 'florin.scouts@gmail.com',
  to: 'florin.scouts@gmail.com',
  subject: 'RO-VACCINATE Token Expired',
  text: 'Your token has expired'
};

let foundPlaces = [];

function run() {
  console.log('calling centers api ...')
  fetch("https://programare.vaccinare-covid.gov.ro/scheduling/api/centres?page=0&size=20&sort=,", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en;q=0.9,ro-RO;q=0.8,ro;q=0.7,en-US;q=0.6",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": "__utma=166663336.1591922312.1608886086.1608886086.1608886086.1; __utmz=166663336.1608886086.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); _ga_M62YWKC42M=GS1.1.1614342354.2.1.1614342821.0; _gid=GA1.2.1844811548.1615577577; SESSION=ZWVlZGQyYTgtNGM3Yi00MzRlLWJiOWUtNTg5ZjMwNDFlZTBh; _ga=GA1.2.1591922312.1608886086; _gat_gtag_UA_115306741_15=1; _ga_JZ40WVXFJF=GS1.1.1615728777.14.1.1615728782.0"
    },
    "referrer": "https://programare.vaccinare-covid.gov.ro/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"countyID\":12,\"localityID\":4273,\"name\":null,\"identificationCode\":\"1930309020100\",\"masterPersonnelCategoryID\":-4,\"personnelCategoryID\":32,\"recipientID\":5459333}",
    "method": "POST",
    "mode": "cors"
  }).then(res => res.json(), err => {
    console.log(err);
    mail.sendMail(mailOptionsTokenInvalid, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('email sent: ' + info.response);
      }
    });
    clearInterval(intervalID);
  })
  .then(response => {
      let foundPlace = false;
      if ('content' in response && response.content.length) {
        response.content.forEach(center => {
          if ('availableSlots' in center && center.availableSlots >= 2) {
            console.log(`FOUND PLACE ${center.name} | ${center.availableSlots} 'locuri'`);
            foundPlaces.push(`${center.name} | ${center.availableSlots} 'locuri'`);
            foundPlace = true;
          }
        });
        if (!foundPlace) {
          console.log('Nu sunt locuri disponibile');
        } else {
          mailOptions['text'] = foundPlaces.join('\n');
          mail.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('email sent: ' + info.response);
            }
          });
          // do not clear interval if place was found
          // clearInterval(intervalID);
        }
        foundPlaces = [];
      }
  });
}

run();
const intervalID = setInterval(run, 20 * 1000);