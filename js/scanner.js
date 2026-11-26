const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const statusText = document.getElementById('status');
const modelInput = document.getElementById('modelNumber');
const serialInput = document.getElementById('serialNumber');

let stream = null;

// 1. Start Rear Camera
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
    statusText.textContent = 'Camera ready.';
  } catch (err) {
    statusText.textContent = 'Camera access denied or unavailable: ' + err.message;
  }
}

// 2. Capture Frame & Process
captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  statusText.textContent = 'Processing image...';

  // Draw current video frame to canvas
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Freeze preview
  video.style.display = 'none';
  canvas.style.display = 'block';
  captureBtn.style.display = 'none';
  retakeBtn.style.display = 'block';

  const imageDataUrl = canvas.toDataURL('image/png');
  await extractLabelData(imageDataUrl);
  captureBtn.disabled = false;
});

// 3. Reset Camera
retakeBtn.addEventListener('click', () => {
  canvas.style.display = 'none';
  video.style.display = 'block';
  retakeBtn.style.display = 'none';
  captureBtn.style.display = 'block';
  modelInput.value = '';
  serialInput.value = '';
  statusText.textContent = 'Camera ready.';
});

// 4. Barcode Decoding + OCR Fallback
async function extractLabelData(imageDataUrl) {
  let foundModel = '';
  let foundSerial = '';

  // Step A: Try Barcode Decoding First (Fast & Exact)
  try {
    const codeReader = new ZXing.BrowserMultiFormatReader();
    const img = new Image();
    img.src = imageDataUrl;
    await img.decode();

    // Note: Standard ZXing reads the clearest barcode first. 
    // If multiple barcodes exist, OCR below ensures we catch all lines.
    const result = await codeReader.decodeFromImageElement(img);
    if (result && result.text) {
      parseExtractedText(result.text);
    }
  } catch (e) {
    console.log('Single barcode pass incomplete, running full OCR...');
  }

  // Step B: Run OCR to capture all stacked lines (Model + SN) reliably
  statusText.textContent = 'Reading text & barcodes (OCR)...';
  try {
    const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng');
    const parsed = parseExtractedText(text);
    
    if (parsed.model) foundModel = parsed.model;
    if (parsed.serial) foundSerial = parsed.serial;

    modelInput.value = foundModel || 'Not detected';
    serialInput.value = foundSerial || 'Not detected';
    statusText.textContent = 'Scan complete!';
  } catch (err) {
    statusText.textContent = 'Error reading image: ' + err.message;
  }
}

// 5. Pattern Matching (Regex) for Motorola Battery Labels
function parseExtractedText(rawText) {
  const cleanText = rawText.toUpperCase();
  
  // Matches Motorola Part Numbers like NNTN8570B or PMNN4409AR
  const modelMatch = cleanText.match(/\b(NNTN|PMNN)[A-Z0-9]{4,8}\b/);
  
  // Matches Serial Numbers formatted like SN:500002151395 or SN 500002151395
  const serialMatch = cleanText.match(/SN[:\s]*([A-Z0-9]{8,16})/);

  return {
    model: modelMatch ? modelMatch[0] : null,
    serial: serialMatch ? serialMatch[1] : null
  };
}

startCamera();
