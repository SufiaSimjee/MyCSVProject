import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// setting my templating engine to ejs
app.set("view engine", "ejs");

// if folder does not exist, create it
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });

// function to read and process CSV file
function processCSV(filePath, callback) {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", () => {

      const data = {};

      results.forEach((row) => {
        data[row["Index #"]] = Number(row["Value"]);
      });

      const table2 = [
        { category: "Alpha", value: data["A5"] + data["A20"] },
        { category: "Beta", value: data["A15"] / data["A7"] },
        { category: "Charlie", value: data["A13"] * data["A12"] }
      ];

      callback(results, table2);
    });
}


// default 
app.get("/", (req, res) => {
  processCSV("uploads/Table_Input.csv", (table1, table2) => {
    res.render("index", { table1, table2 });
  });
});

// display uploaded file
app.post("/upload", upload.single("csvfile"), (req, res) => {

  if (!req.file) {
    return res.redirect("/");
  }

  const filePath = req.file.path;

  processCSV(filePath, (table1, table2) => {

    // delete uploaded file AFTER reading
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    res.render("index", {
      table1,
      table2
    });
  });
});

// start server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});