const fs = require("fs");
const path = require("path");
const open = require("open");
const figlet = require("figlet");
const request = require("./libs/request");
const log = require("./libs/logger");

figlet("Nitro Gen :)", function(err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log("\x1b[32m", data);
});

function genCode() {
  const limit = 16;
  const combination =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let keyCode = "";

  for (let i = 0; i < limit; i++) {
    keyCode += combination.charAt(
      Math.floor(Math.random() * combination.length)
    );
  }

  return keyCode;
}

/**
 *
 * @param {*} arr - Takes an array of proxies
 */
function formatProxy(arr) {
  let formatted = [];
  for (let i = 0; i < arr.length; i++) {
    const splitProxy = arr.split(":");
    if (splitProxy.length > 3) {
      formatProxy.push(
        `http:${splitProxy[2]}:${splitProxy[3]}@${splitProxy[0]}:${splitProxy[1]}`
      );
    } else {
      formatProxy.push(`http:${splitProxy[0]}:${splitProxy[1]}`);
    }
  }

  return formatProxy;
}

function fetchUserProxies() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, "proxy.txt"), "utf8", (err, data) => {
      if (!err) {
        const proxies =
          data == ""
            ? []
            : formatProxy(
                text
                  .replace(/\r/g, "")
                  .trim()
                  .split("\n")
              );

        return resolve(proxies);
      }

      return reject(err);
    });
  });
}

function getRandomProxy(list) {
  if (list.length > 0) {
    return list[Math.floor(Math.random() * list.length)];
  }

  return null;
}

async function startScript(code) {
  try {
    const list = await fetchUserProxies();
    const randomProxy = getRandomProxy(list);

    const opts = {
      uri: `https://discordapp.com/api/v6/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`,
      method: "GET",
      proxy: randomProxy,
      json: true
    };

    // # make request
    const resp = await request(opts);
    const jsonBody = resp.body;

    if (
      jsonBody.message != "Unknown Gift Code" &&
      jsonBody.message != "You are being rate limited."
    ) {
      // # found giftcode
      log.green(`FOUND GIFT CODE: https://discord.gift/${code}`);
      log.green("OPENING BROWSER");
      // # open browser to claim code
      await open(`https://discord.gift/${code}`);
    } else if (jsonBody.message == "You are being rate limited.") {
      log.red("BEING RATE LIMITED!");
    } else {
      log.yellow("SEARCHING FOR CODE...");
    }
  } catch (e) {
    log.red("An error occurred!");
    log.red(e);
    return;
  }
}

setInterval(() => {
  startScript(genCode());
}, 2000);
