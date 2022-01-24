(async () => {
  const http = require("http");
  const fs = require("fs"),
    { join } = require("path"),
    mimes = require("./mimes.json");
  const get = (req, res) => {
    var headers = {
      "Access-Control-Allow-Origin": "*", // CORS
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET", // CORS
      "Access-Control-Max-Age": 2592000, // 30 days
      "Content-Security-Policy": "object-src 'self' data:;", // CSP
      viewport: "width=device-width, initial-scale=1.0", // Basic viewport meta tag equivalent
      "X-UA-Compatible": "IE=edge",
      /*
	X-UA-Compatible allows you to choose what version of Internet Explorer the page should be rendered as.
	I chose edge as it's based on chromium... idk.
	Try switching it to IE11 or IE7 to not open the site in a newer browser if your code supports it.
*/
    };

    const extension = req.url.substring(req.url.lastIndexOf("."));

    const type = mimes[extension];
    if (type) {
      headers["Content-Type"] = type;
    }

    if (req.url != "/") {
      fs.readFile(join(__dirname, "public", req.url), function (err, data) {
        if (err) {
          if (err.code === "ENOENT") {
            headers["Content-Type"] = "text/html";
            res.writeHead(404, headers);
            res.end(
              fs.readFileSync(join(__dirname, "public", "error", "404.html"))
            );
            console.log(err);
            return;
          } else {
            res.writeHead(520, headers);
            res.end(err.message);
            throw err;
          }
        }
        res.writeHead(200, headers);
        res.end(data);
      });
    } else {
      fs.readFile(
        join(__dirname, "public", "index.html"),
        function (err, data) {
          if (err) {
            if (err.code === "ENOENT") {
              headers["Content-Type"] = "text/html";
              res.writeHead(404, headers);
              res.end(
                fs.readFile(join(__dirname, "public", "error", "404.html"))
              );
              console.log(err);
              return;
            } else {
              res.writeHead(520, headers);
              res.end(err.message);
              throw err;
            }
          }
          res.writeHead(200, headers);
          res.end(data);
        }
      );
    }
  };

  const post = (req, res) => {
    var body = "";
    req.on("data", function (chunk) {
      body += chunk.toString();
    });

    req.on("end", function () {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(body);
      body = JSON.parse(body);
    });
    return body;
  };

  const srv = http.createServer(function (req, res) {
    if (req.method === "GET") {
      get(req, res);
    } else if (req.method === "POST") {
      var data = post(req, res);
      if ((req.url = "/login")) {
        console.log(data);
      } else {
      }
    }
  });

  try {
    let startFinished = false;
    await new Promise((resolve, reject) => {
      srv.listen(42069, "127.0.0.1", () => {
        if (!startFinished) {
          startFinished = true;
          resolve();
        }
      });
      srv.once("error", (err) => {
        if (!startFinished) {
          startFinished = true;
          console.log(
            "There was an error starting the server in the error listener:",
            err.message
          );
          reject();
        }
      });
    });
    return srv;
  } catch (e) {
    if (e) {
      console.log(e.message);
    }
  }
})();
