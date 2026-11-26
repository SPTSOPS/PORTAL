const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('status');
const modelInput = document.getElementById('modelNumber');
const serialInput = document.getElementById('serialNumber');

let stream = null;

// 1. Start Rear Camera with Clear Diagnostics
async function startCamera() {
  // Check if browser blocks camera due to HTTP / file://
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    statusText.textContent = 'Live camera blocked (requires HTTPS or localhost). Use "Choose File" below to take a photo.';
    captureBtn.disabled = true;
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      statusText.textContent = 'Camera ready.';
      captureBtn.disabled = false;
    };
  } catch (err) {
    statusText.textContent = 'Camera permission denied or unavailable (' + err.name + '). Use "Choose File" below.';
    captureBtn.disabled = true;
  }
}

// 2. Capture Live Video Frame & Process
captureBtn.addEventListener('click', async () => {
  if (!video.videoWidth || !video.videoHeight) {
    statusText.textContent = 'Camera is not active yet. Use "Choose File" below.';
    return;
  }

  captureBtn.disabled = true;
  statusText.textContent = 'Processing image...';

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

// 3. Native Mobile Camera / File Upload Fallback
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.textContent = 'Loading photo...';
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUrl = event.target.result;

      // Display uploaded/captured photo on canvas
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        video.style.display = 'none';
        canvas.style.display = 'block';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'block';
      };
      img.src = imageDataUrl;

      await extractLabelData(imageDataUrl);
    };
    reader.readAsDataURL(file);
  });
}

// 4. Reset Camera / Preview
retakeBtn.addEventListener('click', () => {
  canvas.style.display = 'none';
  video.style.display = 'block';
  retakeBtn.style.display = 'none';
  captureBtn.style.display = 'block';
  if (fileInput) fileInput.value = '';
  modelInput.value = '';
  serialInput.value = '';
  statusText.textContent = stream ? 'Camera ready.' : 'Use "Choose File" below to take a photo.';
});

// 5. Barcode Decoding + OCR Fallback
async function extractLabelData(imageDataUrl) {
  let foundModel = '';
  let foundSerial = '';

  // Step A: Try Barcode Decoding First
  try {
    const codeReader = new ZXing.BrowserMultiFormatReader();
    const img = new Image();
    img.src = imageDataUrl;
    await img.decode();

    const result = await codeReader.decodeFromImageElement(img);
    if (result && result.text) {
      const barcodeParsed = parseExtractedText(result.text);
      if (barcodeParsed.model) foundModel = barcodeParsed.model;
      if (barcodeParsed.serial) foundSerial = barcodeParsed.serial;
    }
  } catch (e) {
    console.log('Barcode pass incomplete, falling back to OCR...');
  }

  // Step B: Run OCR to capture all stacked lines (Model + SN)
  statusText.textContent = 'Reading text & barcodes (OCR)...';
  try {
    const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng');
    const ocrParsed = parseExtractedText(text);

    if (!foundModel && ocrParsed.model) foundModel = ocrParsed.model;
    if (!foundSerial && ocrParsed.serial) foundSerial = ocrParsed.serial;

    modelInput.value = foundModel || 'Not detected';
    serialInput.value = foundSerial || 'Not detected';
    statusText.textContent = 'Scan complete!';
  } catch (err) {
    statusText.textContent = 'Error reading image: ' + err.message;
  }
}

// 6. Pattern Matching (Regex) for Motorola Battery Labels
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
