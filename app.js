const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const app = express();

const port = 4000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("/public"));

app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/send-mp4", upload.single("file"), async (req, res) => {
  try {
    // Handle the uploaded file
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }
    const headers = {
      "Content-Type": "video/mp4",
    };

    await axios.post("http://localhost:4000/receive-mp4", file.buffer, {
      headers,
    });
    res.send(file.buffer);
  } catch (err) {
    console.log("------------------receive-mp4--------------", err.message);
  }
});

app.get("/downloadAndSend", async (req, res) => {
  try {
    // Download MP4 file from a sample URL
    const mp4Url =
      "https://file-examples.com/storage/fe19e15eac6560f8c936c41/2017/04/file_example_MP4_640_3MG.mp4";
    const response = await axios.get(mp4Url, { responseType: "arraybuffer" });

    // Send buffer data to the second API
    const secondApiUrl = "http://localhost:4000/receiveBuffer";
    const base64String = await axios.post(secondApiUrl, response.data);

    // Respond with success message
    res.send(base64String.data);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/receiveBuffer", (req, res) => {
  try {
    // Save buffer data to an MP4 file
    const fileName = "public/destination/receivedFile.mp4";
    let data = [];
    req
      .on("data", (chunk) => {
        data.push(chunk);
      })
      .on("end", function () {
        var buffer = Buffer.concat(data);
        fs.writeFileSync(fileName, buffer);
        res.send("ok");
      });

    // Respond with success message
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log("server is running on port: ", port);
});
