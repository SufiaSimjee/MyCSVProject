import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("view engine", "ejs");

const upload = multer({ dest: "uploads/" });

// HOME PAGE
app.get("/", (req, res) => {
  res.render("index", { table1: null, table2: null });
});

// my upload logic
app.post("/upload", upload.single("csvfile"), (req, res) => {
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", () => {
      fs.unlinkSync(req.file.path);

      // for table 2
      const data = {};

      results.forEach((row) => {
        const key = row["Index #"];   
        const value = Number(row["Value"]); 
        data[key] = value;
      });

      const table2 = [
        {
          category: "Alpha",
          value: data["A5"] + data["A20"]
        },
        {
          category: "Beta",
          value: data["A15"] / data["A7"]
        },
        {
          category: "Charlie",
          value: data["A13"] * data["A12"]
        }
      ];

      res.render("index", {
        table1: results,
        table2: table2
      });
    });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});