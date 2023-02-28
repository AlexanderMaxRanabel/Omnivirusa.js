const fs = require('fs');
const verifyCodeSignature = require('node-verify-code-signature');

function isInfected(file) {
  // Scan file for basic virus pattern
  // For simplicity, we'll just check if the file contains the string "virus"
  const contents = fs.readFileSync(file, 'utf8');
  if (contents.indexOf('virus') !== -1) {
    return true;
  }
  return false;
}

function hasDigitalSignature(file) {
  return new Promise((resolve, reject) => {
    verifyCodeSignature(file, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.isVerified);
      }
    });
  });
}

async function scanFile(file) {
  console.log(`Scanning file: ${file}`);
  try {
    const signatureVerified = await hasDigitalSignature(file);
    if (!signatureVerified) {
      console.log(`WARNING: File ${file} does not have a valid digital signature!`);
    }
    if (isInfected(file)) {
      console.log(`Found virus in file: ${file}`);
    } else {
      console.log(`File is clean: ${file}`);
    }
  } catch (error) {
    console.log(`ERROR: Could not verify digital signature of file ${file}: ${error.message}`);
  }
}

function scanDirectory(directory) {
  console.log(`Scanning directory: ${directory}`);
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.log(`ERROR: Unable to scan directory ${directory}: ${err.message}`);
      return;
    }
    files.forEach((file) => {
      const fullPath = `${directory}/${file}`;
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        scanFile(fullPath);
      }
    });
  });
}

// Usage: node simple-antivirus.js <directory>
if (process.argv.length !== 3) {
  console.log('Usage: node simple-antivirus.js <directory>');
} else {
  const directory = process.argv[2];
  scanDirectory(directory);
}
