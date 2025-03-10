//Hide or show control-panel
function toggleControl() {
  let controlPanel = document.getElementsByClassName("control-panel")[0];
  let controlButton = document.getElementById("controlButton");
  if (controlPanel.style.display === "none") {
    controlPanel.style.display = "block";
    controlButton.innerHTML = "Hide controls";
  } else {
    controlPanel.style.display = "none";
    controlButton.innerHTML = "Show controls";
  }
}

//Get HTML elements and create global variables
const videoElement = document.getElementsByClassName("input_video")[0];
const videoSelect = document.querySelector("select#videoSource");
const selectors = [videoSelect];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const showTracking = document.getElementById("showTracking");
const selfie = document.getElementById("selfie");
const fpsoutput = document.getElementById("fps");
const gesture = document.getElementById("gesture");
const device = document.getElementById("device");
const sendMidi = document.getElementById("sendMidi");
const bpm = document.getElementById("bpm");
const BPMAutomateInput = document.getElementById("BPMAutomateInput");
let tempo = 500; //or BPM 120
const bpmValue = document.getElementById("bpmValue");
const sliderMinValueInput = document.getElementById("sliderMinValue");
const sliderMaxValueInput = document.getElementById("sliderMaxValue");
let minVal = sliderMinValueInput.value;
let maxVal = sliderMaxValueInput.value;
const midiChannel = document.getElementById("midiChannel");
const trigger1Channel = document.getElementById("trigger1Channel");
const midi1NoteInput = document.getElementById("midi1NoteInput");
const trigger2Channel = document.getElementById("trigger2Channel");
const midi2NoteInput = document.getElementById("midi2NoteInput");
const trigger3Channel = document.getElementById("trigger3Channel");
const midi3NoteInput = document.getElementById("midi3NoteInput");
const trigger4Channel = document.getElementById("trigger4Channel");
const midi4NoteInput = document.getElementById("midi4NoteInput");
const midiPitchControlInput = document.getElementById("midiPitchControlInput");
const midiVelInput = document.getElementById("midiVelInput");
const pitchBendInput = document.getElementById("pitchBendInput");
const aftertouchInput = document.getElementById("aftertouchInput");
const cc1Input = document.getElementById("cc1Input");
const cc1Controller = document.getElementById("cc1Controller");
const cc1Channel = document.getElementById("cc1Channel");
const cc2Input = document.getElementById("cc2Input");
const cc2Controller = document.getElementById("cc2Controller");
const cc2Channel = document.getElementById("cc2Channel");
const cc3Input = document.getElementById("cc3Input");
const cc3Controller = document.getElementById("cc3Controller");
const cc3Channel = document.getElementById("cc3Channel");
const cc4Input = document.getElementById("cc4Input");
const cc4Controller = document.getElementById("cc4Controller");
const cc4Channel = document.getElementById("cc4Channel");
let leftWrist,
  leftIndex,
  leftPinky,
  rightPinky,
  rightWrist,
  rightIndex,
  leftThumb,
  rightThumb,
  leftThumbX,
  rightThumbX,
  leftIndexX,
  leftPinkyX,
  leftIndexY,
  leftWristX,
  leftWristY,
  rightIndexX,
  rightIndexY,
  rightPinkyX,
  rightWristX,
  rightWristY,
  leftClose,
  rightClose,
  distance;
let output,
  midiPitchControlValue = 60,
  midiVel = 1;

let midi1Note = 60;
let midi2Note = 60;
let midi3Note = 60;
let midi4Note = 60;

// Check if Web MIDI API is supported
if (navigator.requestMIDIAccess) {
  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert("Web MIDI access error: " + err));
} else {
  alert(
    "Web MIDI API is not supported in this browser. Please use Chrome or Firefox for full functionality."
  );
}

function onEnabled() {
  if (WebMidi.outputs.length === 0) {
    alert("No MIDI devices detected. Please connect a MIDI device.");
    return;
  }

  for (let i = 0; i < WebMidi.outputs.length; i++) {
    jQuery("<option/>", {
      value: WebMidi.outputs[i].name,
      html: WebMidi.outputs[i].name,
    }).appendTo("#dropdown select");
  }
  output = WebMidi.outputs[0];
}

function changeDevice() {
  const selectedDevice = device.value;
  output = WebMidi.outputs.find((output) => output.name === selectedDevice);
  if (!output) {
    alert("Selected MIDI device not found.");
  }
}

// Optional Safari workaround notice
if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  console.warn(
    "Safari detected. Web MIDI API is not natively supported. Consider using Chrome or Firefox."
  );
}

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map((select) => select.value);
  selectors.forEach((select) => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (
      Array.prototype.slice
        .call(select.childNodes)
        .some((n) => n.value === values[selectorIndex])
    ) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name
  );
}

//reset midinote pitch to 60 when note pitch input is set to "nil"
midiPitchControlInput.addEventListener("change", function () {
  if (midiPitchControlInput.value === "nil") {
    midiPitchControlValue = 60;
  }
});

//reset pitch bend to 0 when pitch bend input is set to "nil"
pitchBendInput.addEventListener("change", function () {
  if (pitchBendInput.value === "nil") {
    output.sendPitchBend(0);
  }
});

//reset aftertouch to 0 when aftertouch input is set to "nil"
aftertouchInput.addEventListener("change", function () {
  if (aftertouchInput.value === "nil") {
    output.sendChannelAftertouch(0, "all");
  }
});

//reset cc1 to 0 when cc1 input is set to "nil"
cc1Input.addEventListener("change", function () {
  if (cc1Input.value === "nil") {
    cc1Control(0);
  }
});

//reset cc2 to 0 when cc2 input is set to "nil"
cc2Input.addEventListener("change", function () {
  if (cc2Input.value === "nil") {
    cc2Control(0);
  }
});

//reset cc3 to 0 when cc3 input is set to "nil"
cc3Input.addEventListener("change", function () {
  if (cc3Input.value === "nil") {
    cc3Control(0);
  }
});

//reset cc4 to 0 when cc4 input is set to "nil"
cc4Input.addEventListener("change", function () {
  if (cc4Input.value === "nil") {
    cc4Control(0);
  }
});

//listen for updates to Midi1 trigger note
midi1NoteInput.onchange = function () {
  midi1Note = midi1NoteInput.value;
};

//listen for updates to Midi2 trigger note
midi2NoteInput.onchange = function () {
  midi2Note = midi2NoteInput.value;
};

//listen for updates to Midi3 trigger note
midi3NoteInput.onchange = function () {
  midi3Note = midi3NoteInput.value;
};

//listen for updates to Midi4 trigger note
midi4NoteInput.onchange = function () {
  midi4Note = midi4NoteInput.value;
};

//choose Midi output
function changeDevice() {
  for (let i = 0; i < WebMidi.outputs.length; i++) {
    if (WebMidi.outputs[i].name === device.value) {
      output = WebMidi.outputs[i];
    }
  }
}

function scaleValue(value, inMin, inMax, outMin, outMax) {
  if (inMin === inMax) {
    throw new Error("Input range cannot be zero.");
  }
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function linearScale(value, inMin, inMax, outMin, outMax) {
  let scaledValue = scaleValue(value, inMin, inMax, outMin, outMax);
  return outMin < outMax
    ? clamp(scaledValue, outMin, outMax)
    : clamp(scaledValue, outMax, outMin);
}

//listen to BPM slider if not automated
bpm.addEventListener("input", function (ev) {
  tempo = 60000 / bpm.value;
  bpmValue.innerHTML = bpm.value;
});

// Update slider's min and max when inputs change
sliderMinValueInput.addEventListener("input", function () {
  minVal = parseInt(sliderMinValueInput.value, 10);
  maxVal = parseInt(sliderMaxValueInput.value, 10);

  if (minVal < maxVal) {
    bpm.min = minVal;
    if (parseInt(bpm.value, 10) < minVal) {
      bpm.value = minVal;
      bpmValueDisplay.textContent = minVal;
    }
  }
});

sliderMaxValueInput.addEventListener("input", function () {
  minVal = parseInt(sliderMinValueInput.value, 10);
  maxVal = parseInt(sliderMaxValueInput.value, 10);

  if (maxVal > minVal) {
    bpm.max = maxVal;
    if (parseInt(bpm.value, 10) > maxVal) {
      bpm.value = maxVal;
      bpmValueDisplay.textContent = maxVal;
    }
  }
});

let BPMCounter = 0;
let BPMTracker = new Date();

//function to trigger midi notes at set tempo
function myMidiNoteLoop(leftIndex, rightIndex) {
  BPMCounter++;
  let BPMNow = new Date();
  let timeDiffBPM = BPMNow.getTime() - BPMTracker.getTime();
  if (sendMidi.checked && timeDiffBPM >= tempo) {
    if (leftIndex || rightIndex) {
      output.playNote(midiPitchControlValue, [midiChannel.value], {
        attack: midiVel,
        duration: tempo * 0.8,
      });
      //reset
      BPMCounter = 0;
      BPMTracker = new Date();
    }
  }
}

function autoBPMControl(controlValue) {
  tempo = linearScale(controlValue, 0, 1, 60000 / minVal, 60000 / maxVal);
}

function midiVelControl(controlValue) {
  midiVel = clamp(controlValue, 0, 1);
}

function midiPitchControl(controlValue) {
  midiPitchControlValue = linearScale(controlValue, 0, 1, 1, 127);
}

function pitchBendControl(controlValue) {
  if (output) output.sendPitchBend(linearScale(controlValue, 0, 1, -1, 1));
}

function aftertouchControl(controlValue) {
  if (output) output.sendChannelAftertouch(clamp(controlValue, 0, 1), "all");
}

function cc1Control(controlValue) {
  if (output)
    output.sendControlChange(
      Number(cc1Controller.value),
      linearScale(controlValue, 0, 1, 0, 127),
      [cc1Channel.value]
    );
}

function cc2Control(controlValue) {
  if (output)
    output.sendControlChange(
      Number(cc2Controller.value),
      linearScale(controlValue, 0, 1, 0, 127),
      [cc2Channel.value]
    );
}

function cc3Control(controlValue) {
  if (output)
    output.sendControlChange(
      Number(cc3Controller.value),
      linearScale(controlValue, 0, 1, 0, 127),
      [cc3Channel.value]
    );
}

function cc4Control(controlValue) {
  if (output)
    output.sendControlChange(
      Number(cc4Controller.value),
      linearScale(controlValue, 0, 1, 0, 127),
      [cc4Channel.value]
    );
}

//Trigger note if index fingers touching
let t1on = false;
let fingerDistanceActivate = 0.02;
let fingerDistanceDeactivate = 0.05;
function Trigger1(distance) {
  if (distance <= fingerDistanceActivate) {
    if (t1on) return;
    t1on = true;
    output.playNote(midi1Note, [trigger1Channel.value], {
      attack: 1,
      duration: 500,
    });
  }
  if (distance > fingerDistanceDeactivate) {
    t1on = false;
  }
}

//Trigger note if left hand reversed
let t2on = false;
let t2DistanceActivate = -0.1;
let t2DistanceDeactivate = 0;
function Trigger2(leftThumbX, leftPinkyX) {
  if (leftThumbX - leftPinkyX <= t2DistanceActivate) {
    if (t2on) return;
    t2on = true;
    output.playNote(midi2Note, [trigger2Channel.value], {
      attack: 1,
      duration: 500,
    });
  }
  if (leftThumbX - leftPinkyX > t2DistanceDeactivate) {
    t2on = false;
  }
}

//Trigger note if right hand reversed
let t3on = false;
let t3DistanceActivate = -0.1;
let t3DistanceDeactivate = 0;
function Trigger3(rightThumbX, rightPinkyX) {
  if (rightPinkyX - rightThumbX <= t3DistanceActivate) {
    if (t3on) return;
    t3on = true;
    output.playNote(midi3Note, [trigger3Channel.value], {
      attack: 1,
      duration: 500,
    });
  }
  if (rightPinkyX - rightThumbX > t3DistanceDeactivate) {
    t3on = false;
  }
}

let t4on = false;
let t4DistanceActivate = 0.02;
let t4DistanceDeactivate = 0.05;
function Trigger4(distance) {
  if(distance <= t4DistanceActivate) {
    if(t4on) return;
    t4on = true;
    output.playNote(midi4Note, [trigger4Channel.value], {
      attack: 1,
      duration: 500,
    });
  }
}

//Output movement to midi
let controls_io = [
  { in: BPMAutomateInput, out: autoBPMControl },
  { in: midiPitchControlInput, out: midiPitchControl },
  { in: midiVelInput, out: midiVelControl },
  { in: pitchBendInput, out: pitchBendControl },
  { in: aftertouchInput, out: aftertouchControl },
  { in: cc1Input, out: cc1Control },
  { in: cc2Input, out: cc2Control },
  { in: cc3Input, out: cc3Control },
  { in: cc4Input, out: cc4Control },
];

function myMidi(
  leftIndex,
  leftWrist,
  leftThumb,
  leftPinky,
  rightIndex,
  rightWrist,
  rightThumb,
  rightPinky
) {
  if (midiVelInput.value === "nil") {
    midiVel = 1;
  }
  controls_io.forEach((io) => {
    if (io.in.value === "leftIndexX" && leftIndex) {
      io.out(leftIndex.x);
    }
    if (io.in.value === "leftIndexY" && leftIndex) {
      io.out(1 - leftIndex.y);
    }
    if (io.in.value === "leftClosed" && leftIndex) {
      io.out(
        linearScale(
          Math.sqrt(
            (leftIndex.x - leftWrist.x) ** 2 + (leftIndex.y - leftWrist.y) ** 2
          ),
          0.1,
          0.4,
          1,
          0
        )
      );
    }
    if (io.in.value === "rightIndexX" && rightIndex) {
      io.out(rightIndex.x);
    }
    if (io.in.value === "rightIndexY" && rightIndex) {
      io.out(1 - rightIndex.y);
    }
    if (io.in.value === "rightClosed" && rightIndex) {
      io.out(
        linearScale(
          Math.sqrt(
            (rightIndex.x - rightWrist.x) ** 2 +
              (rightIndex.y - rightWrist.y) ** 2
          ),
          0,
          0.4,
          1,
          0
        )
      );
    }
    if (io.in.value === "indexDistance" && leftIndex && rightIndex) {
      io.out(
        Math.sqrt(
          (leftIndex.x - rightIndex.x) ** 2 + (leftIndex.y - rightIndex.y) ** 2
        )
      );
    }
  });
  if (gesture.checked && output && leftThumb && leftPinky) {
    Trigger2(leftThumb.x, leftPinky.x);
  }
  if (gesture.checked && output && rightThumb && rightPinky) {
    Trigger3(rightThumb.x, rightPinky.x);
  }
  if (gesture.checked && output && leftThumb && leftIndex) {
    Trigger4(
      Math.sqrt(
        (leftThumb.x - leftIndex.x) ** 2 + (leftThumb.y - rightThumb.y) ** 2
      )
    );
  }
  if (gesture.checked && output && leftIndex && rightIndex) {
    Trigger1(
      Math.sqrt(
        (leftIndex.x - rightIndex.x) ** 2 + (leftIndex.y - rightIndex.y) ** 2
      )
    );
  }
}

//Calculate FPS
let counter = 0;
let counterTracker = new Date();

function onResults(results) {
  counter++;
  let now = new Date();
  let timeDiff = now.getTime() - counterTracker.getTime();
  if (timeDiff >= 1000) {
    let fps = Math.floor(counter / (timeDiff / 1000));
    fpsoutput.innerHTML = fps;
    // reset
    counter = 0;
    counterTracker = new Date();
  }

  //Draw Hand landmarks on screen
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === "Right";
      const landmarks = results.multiHandLandmarks[index];
      if (showTracking.checked) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: isRightHand ? "#fff" : "#056df5",
        }),
          drawLandmarks(canvasCtx, landmarks, {
            color: isRightHand ? "#fff" : "#056df5",
            fillColor: isRightHand ? "#056df5" : "#fff",
            radius: (x) => {
              return lerp(x.from.z, -0.15, 0.1, 10, 1);
            },
          });
      }
      if (isRightHand === false) {
        leftIndex = landmarks[8];
        leftWrist = landmarks[0];
        leftThumb = landmarks[4];
        leftPinky = landmarks[20];
      } else {
        rightIndex = landmarks[8];
        rightWrist = landmarks[0];
        rightThumb = landmarks[4];
        rightPinky = landmarks[20];
      }
      myMidi(
        leftIndex,
        leftWrist,
        leftThumb,
        leftPinky,
        rightIndex,
        rightWrist,
        rightThumb,
        rightPinky
      );
      myMidiNoteLoop(leftIndex, rightIndex);
    }
    canvasCtx.restore();
  }
}

//Toggle selfie view
selfie.addEventListener("change", function () {
  if (this.checked) {
    hands.setOptions({ selfieMode: true });
  } else {
    hands.setOptions({ selfieMode: false });
  }
});

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3/${file}`;
  },
});

hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

function start() {
  const videoSource = videoSelect.value;
  const constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined },
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(gotStream)
    .then(gotDevices)
    .catch(handleError);
}

videoSelect.onchange = start;
