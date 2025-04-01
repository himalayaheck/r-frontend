import React, { useState } from "react";
import axios from "axios";
import { Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import * as XLSX from "xlsx";

const App = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]); // Store file data
  const [columns, setColumns] = useState([]); // Store column names
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Store result image

  const methods = [
    "Handling Missing Values",
    "Logarithmic Transformation",
    "Karl Pearson's Correlation",
    "Estimate Lag",
    "Exponentially Weighted Moving Average (EWMA)",
    "Change Point Analysis",
    "ARIMA Model",
    "Linear Model(LM)",
    "Generalized Linear Model(GLM)",
    "XGBoost",
    "Sir Model",
  ];

  // Handle file selection and extract column names
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);

    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (jsonData.length > 0) {
          setColumns(jsonData[0]); // Extract header row as column names
          setData(jsonData.slice(1)); // Store file data (excluding headers)
        }
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  // Handle method selection
  const handleMethodChange = (event) => {
    setSelectedMethod(event.target.value);
  };

  // Handle Run Button Click
  const handleRun = async () => {
    if (!file || !selectedX || selectedMethod === "") {
      alert("Please select a valid file, column(s), and method.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);

    if (selectedMethod === "Karl Pearson's Correlation") {
      if (!selectedY) {
        alert("Please select both X and Y columns for correlation analysis.");
        return;
      }
      formData.append("columnX", selectedX);
      formData.append("columnY", selectedY);
    } else if (selectedMethod === "Exponentially Weighted Moving Average (EWMA)") {
      formData.append("column", selectedX); // Only one column for EWMA
    }

    try {
      const endpoint =
        selectedMethod === "Karl Pearson's Correlation" ? "/correlation" : "/ewma";

      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error processing file.");
    }
  };



  return (
    <div style={{ textAlign: "center", fontFamily: "Arial", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ backgroundColor: "blue", padding: "20px", color: "white", fontSize: "27px", fontWeight: "bold", textAlign: "left" }}>
        EpiAlertR
      </div>

      {/* Download Link BELOW the header */}
      <div style={{ textAlign: "right", padding: "10px 20px" }}>
        <a href="#" style={{ color: "blue", textDecoration: "underline", fontSize: "14px" }}>
          Download the Standalone EpiAlertR Package
        </a>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", padding: "10px" }}>
        <div style={{ width: "25%", padding: "20px", textAlign: "left" }}>
          {/* File Upload */}
          <div style={{ marginBottom: "20px" }}>
            <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
            <p>{file ? file.name : "No file chosen"}</p>
          </div>

          {/* Column Selection */}
          {columns.length > 0 && (
            <>
              <FormControl style={{ width: "300px", marginBottom: "20px" }}>
                <InputLabel>X Column</InputLabel>
                <Select value={selectedX} onChange={(e) => setSelectedX(e.target.value)}>
                  {columns.map((col, index) => (
                    <MenuItem key={index} value={col}>
                      {col}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Hide Y Column Selection for EWMA */}
              {selectedMethod !== "Exponentially Weighted Moving Average (EWMA)" && (
                <FormControl style={{ width: "300px", marginBottom: "20px" }}>
                  <InputLabel>Y Column</InputLabel>
                  <Select value={selectedY} onChange={(e) => setSelectedY(e.target.value)}>
                    {columns.map((col, index) => (
                      <MenuItem key={index} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}


          {/* Method Selection */}
          <FormControl style={{ width: "300px", marginBottom: "20px" }}>
            <InputLabel>Method</InputLabel>
            <Select value={selectedMethod} onChange={handleMethodChange}>
              {methods.map((method, index) => (
                <MenuItem key={index} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Run Button */}
          <div>
            <Button variant="contained" color="primary" onClick={handleRun}>
              Run
            </Button>
          </div>
        </div>

        {/* Show Table Data */}
        <div style={{ flex: 1, padding: "20px", overflow: "auto", maxHeight: "400px" }}>
          {data.length > 0 && (
            <table border="1" width="100%">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col, colIndex) => (
                      <td key={colIndex}>{row[colIndex]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Show Result Image */}
      {imageUrl && (
        <div style={{ padding: "20px" }}>
          <h3>
            {selectedMethod === "Karl Pearson's Correlation"
              ? "Correlation Result:"
              : selectedMethod === "Exponentially Weighted Moving Average (EWMA)"
                ? "EWMA Result:"
                : "Analysis Result:"}
          </h3>
          <img src={imageUrl} alt="Analysis Plot" width="600px" />
        </div>
      )}

      {/* Instructions Section - Moved to Bottom & Reduced Size */}
      <div style={{ width: "23%", backgroundColor: "#f5f5f5", padding: "10px", textAlign: "justify", fontSize: "14px" }}>
        <strong>Instructions:</strong>
        <p>Step 1: Upload the dataset file.</p>
        <p>Step 2: Select the desired method for analysis.</p>
        <p>Step 3: Click the "Run" button to start the process.</p>
        <p>Step 4: View the results displayed below.</p>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "blue", padding: "10px", color: "white", fontSize: "14px", textAlign: "center", width: "100%" }}>
        All rights reserved © 2025 Tata Institute for Genetics and Society
      </div>
    </div>
  );
};

export default App;
