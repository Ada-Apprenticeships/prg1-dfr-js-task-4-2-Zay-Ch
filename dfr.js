const fs = require("fs");

function fileExists(filename) {
  return fs.existsSync(filename);
}

function validNumber(value) {
  // Check if the value is a number type
  if (typeof value === 'number') {
      return !isNaN(value);
  }
  // If the value is a string, check against the regex
  if (typeof value === 'string') {
      // Regular expression to match valid numbers (integer and float, signed and unsigned)
      const regex = /^-?\d+(\.\d+)?$/;
      return regex.test(value.trim()); // Test the trimmed string against the regex
  }
  // If it's neither a number nor a string, return false
  return false;
}

function dataDimensions(dataframe) {
  if (dataframe == null || dataframe == undefined) {
    return [-1, -1]; // Return -1 for both dimensions if invalid
  }
  if (Array.isArray(dataframe)) {
    const rows = dataframe.length;
    const cols = Array.isArray(dataframe[0]) ? dataframe[0].length : -1;
    return [rows,cols];
  }
  return [-1, -1]; // Return -1 for both dimensions if not an array
}

function findTotal(dataset) {
  if (!Array.isArray(dataset) || dataset.length === 0 || Array.isArray(dataset[0])) {   // Check if the dataset is a valid 1D array
      return 0; // Return 0 for empty arrays or 2D arrays
  }
  const validNumbers = dataset.filter(value => validNumber(value));
  const total = validNumbers.reduce((acc, value) => {   // Calculate the total of valid numbers
      return acc + (typeof value === 'string' ? parseFloat(value) : value);
  }, 0);
  return total;
}

function calculateMean(dataset) {
  // Check if the dataset is an array
  if (!Array.isArray(dataset) || dataset.length === 0) {
      return 0; // Return 0 for invalid dataset
  }
  const validNumbers = dataset.filter(value => validNumber(value));
  // Check if there are any valid numbers
  if (validNumbers.length === 0) {
      return 0;
  }
  // Calculate the mean average
  const sum = validNumbers.reduce((acc, value) => {
      return acc + (typeof value === 'string' ? parseFloat(value) : value);
  }, 0);  
  return sum / validNumbers.length; // Return the mean
}

function calculateMedian(dataset) {
  if (!Array.isArray(dataset) || dataset.length === 0) {
      return 0;
  }
  const validNumbers = dataset.filter(value => validNumber(value))
                               .map(value => (typeof value === 'string' ? parseFloat(value) : value));
  if (validNumbers.length === 0) {
      return 0;
  }
  // Sort the valid numbers
  validNumbers.sort((a, b) => a - b);
  const mid = Math.floor(validNumbers.length / 2);
  // Calculate the median
  if (validNumbers.length % 2 === 0) {
      // Even number of elements
      return (validNumbers[mid - 1] + validNumbers[mid]) / 2;
  } else {
      // Odd number of elements
      return validNumbers[mid];
  }
}

function convertToNumber(dataframe, col) {
  let count = 0;
  for (let row of dataframe) {
// If statement that checks  conditions regarding the value at a specific column (col) of the current row (row) in a dataframe 
    if (row[col] != undefined && validNumber(row[col]) && typeof row[col] != 'number') { 
      row[col] = parseFloat(row[col]);
      count++;
    }
  }
  return count;
}

function flatten(dataframe) {
  if (dataDimensions(dataframe)[1] == 1) {
    return dataframe.map(row => row[0]); // Convert a 2D array (dataframe) into a 1D array.
  }  
  return [];
}


function loadCSV(filename, ignoreRows = [], ignoreCols = []) {
    if (!fs.existsSync(filename)) {
        return [[], -1, -1]; // Return if the file does not exist
    }
    // Read the file content
    const fileContent = fs.readFileSync(filename, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0); // Trim and filter empty lines
    const originalColCount = lines[0].split(',').length; // Total number of columns
    const results = [];
    let originalRowCount = 0;
    lines.forEach((line, lineIndex) => {
        // Skip ignored rows
        if (ignoreRows.includes(lineIndex)) {
            return;
        }
        const columns = line.split(',');
        // Create a filtered row based on ignored columns
        const filteredRow = columns.map((col, index) => {
            return ignoreCols.includes(index) ? null : col; // Ignore specified columns
        }).filter(value => value !== null); // Remove ignored columns
        // Only push the filtered row if it has valid data
        if (filteredRow.length > 0) {
            results.push(filteredRow);
            originalRowCount++; // Increment only when a valid row is added
        }
    });
    // Return the results, original row count (including headers), and original column count
    return [results, lines.length, originalColCount];
}

function createSlice(dataframe, colindex, colpattern, exportcols = []) {
  if (!Array.isArray(dataframe) || !Array.isArray(dataframe[0])) {
    throw new Error('Invalid dataframe');
  }
  // Filter rows based on colpattern
  const rows = dataframe.filter((row) => {
    if (colindex >= row.length) {
      throw new Error('colindex is out of range');
    }
    // Match the pattern
    return colpattern === '*' || row[colindex] == colpattern;
  });
  // Determine which columns to export
  const slicedData = rows.map(row => {
    if (exportcols.length === 0) {
      return row; // Return all columns if none specified
    }
    return exportcols.map(colIndex => row[colIndex]);
  });
  return slicedData;
}

module.exports = {
  fileExists,
  validNumber,
  dataDimensions,
  calculateMean,
  findTotal,
  convertToNumber,
  flatten,
  loadCSV,
  calculateMedian,
  createSlice,
};