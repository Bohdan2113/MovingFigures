class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distanceTo(other) {
    return Math.sqrt(
      Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)
    );
  }
}
class Coords {
  static MIN_UNIT_COUNT = 1;
  static MAX_UNIT_COUNT = 2000;

  constructor(_unitCount, _canvas) {
    this.unitCount = _unitCount;
    this.canvas = _canvas;

    this.canvas.addEventListener(
      "wheel",
      (event) => {
        if (!event.ctrlKey) return;
        event.preventDefault(); // щоб не прокручувалася сторінка

        const delta = Math.sign(event.deltaY); // 1 — вниз, -1 — вгору
        let step = coordSystem.unitCount / 30;
        if (delta < 0)
          coordSystem.unitCount = Math.max(
            Coords.MIN_UNIT_COUNT,
            coordSystem.unitCount - step
          );
        else
          coordSystem.unitCount = Math.min(
            Coords.MAX_UNIT_COUNT,
            coordSystem.unitCount + step
          );

        Redraw(coordSystem);
      },
      { passive: false }
    );
  }

  DrawCoords() {
    const GetSegmentLength = (uCount, uLength) => {
      const factors = [2, 2.5, 2];
      let index = 0;
      let baseLover = startUnitCount;
      let baseUpper = Math.max(gridHuge, 0);
      let interval = 1;

      if (uCount < baseLover) {
        do {
          baseLover /= factors[index];
          interval /= factors[index++];
          if (index >= factors.length) index = 0;
          if (index === 1) precision++;
        } while (uCount < baseLover);

        return interval * uLength;
      } else if (uCount >= baseUpper) {
        do {
          interval *= factors[index++];
          if (index >= factors.length) index = 0;
          baseUpper *= factors[index];
        } while (uCount >= baseUpper);

        return interval * uLength;
      } else return interval * uLength;
    };
    const DrawUnitsY = (isNumerate) => {
      const shtrichCount = Math.floor(yLength / segmentLength);
      const startX = centerX - shtrichSize / 2;
      const endX = centerX + shtrichSize / 2;

      for (var i = shtrichCount * -1; i <= shtrichCount; i++) {
        if (i === 0) continue;
        let Y = centerY + i * segmentLength;
        if (Y < 0) continue;
        if (Y > yLength) break;

        ctx.moveTo(startX, Y);
        ctx.lineTo(endX, Y);

        if (isNumerate) {
          const textX = endX + numberShift;
          const textY = Y;
          ctx.fillStyle = "#000000";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          const num =
            Math.round(
              -i * (segmentLength / unitLength) * Math.pow(10, precision)
            ) / Math.pow(10, precision);
          ctx.fillText(num, textX, textY);
        }
      }
    };
    const DrawUnitsX = (isNumerate) => {
      const shtrichCount = Math.floor(xLength / segmentLength);
      const startY = centerY - shtrichSize / 2;
      const endY = centerY + shtrichSize / 2;

      for (var i = shtrichCount * -1; i <= shtrichCount; i++) {
        if (i === 0) continue;
        let X = centerX + i * segmentLength;
        if (X < 0) continue;
        if (X > xLength) break;

        ctx.moveTo(X, startY);
        ctx.lineTo(X, endY);

        if (isNumerate) {
          const textX = X;
          const textY = endY + numberShift;
          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          const num =
            Math.round(
              i * (segmentLength / unitLength) * Math.pow(10, precision)
            ) / Math.pow(10, precision);
          ctx.fillText(num, textX, textY);
        }
      }
    };
    const DrawGrid = (gap) => {
      const lineHCount = yLength / 2 / gap;
      const lineWCount = xLength / 2 / gap;
      for (let i = 0; i <= lineHCount; i++) {
        let Y = centerY + i * gap;
        let _Y = centerY - i * gap;
        ctx.moveTo(0, Y);
        ctx.lineTo(canvas.width, Y);

        ctx.moveTo(0, _Y);
        ctx.lineTo(canvas.width, _Y);
      }
      for (let i = 0; i <= lineWCount; i++) {
        let X = centerX + i * gap;
        let _X = centerX - i * gap;
        ctx.moveTo(X, 0);
        ctx.lineTo(X, canvas.height);

        ctx.moveTo(_X, 0);
        ctx.lineTo(_X, canvas.height);
      }
    };

    const ctx = this.canvas.getContext("2d");
    const fontSizeNumeration = 10;
    const fontSizeDirection = 18;
    let precision = 0;

    const box = this.GetCoordSystemProportions();
    const shtrichSize = box.shtrichSize;
    const numberShift = box.numberShift;
    const arrowWidth = shtrichSize / 2;
    const arrowLength = arrowWidth * 2;

    const centerX = box.centerX;
    const centerY = box.centerY;
    const xLength = box.xLength;
    const yLength = box.yLength;
    const unitLength = box.unitLength;
    const segmentLength = GetSegmentLength(this.unitCount * 2, unitLength);

    ctx.beginPath(); // Fill with color
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.closePath();

    // coordinate system
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(centerX, 0); // Verrtical line
    ctx.lineTo(centerX, this.canvas.height);
    ctx.moveTo(0, centerY); // Horizontal line
    ctx.lineTo(this.canvas.width, centerY);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath(); // arrow on Y
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(centerX - arrowWidth, 0 + arrowLength);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + arrowWidth, 0 + arrowLength);
    ctx.stroke();

    ctx.beginPath(); // arrow on X
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.moveTo(this.canvas.width - arrowLength, centerY - arrowWidth);
    ctx.lineTo(this.canvas.width, centerY);
    ctx.lineTo(this.canvas.width - arrowLength, centerY + arrowWidth);
    ctx.stroke();

    ctx.beginPath(); // coord segments
    ctx.font = `${fontSizeNumeration}px Arial`;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    DrawUnitsY(true);
    DrawUnitsX(true);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath(); // coord segments
    ctx.font = `${fontSizeDirection}px Arial`; // x / y text
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("x", xLength, centerY - arrowWidth * 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("y", centerX - arrowWidth * 2, 0);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath(); // Намалювати сітку на координатах
    ctx.lineWidth = 0.1;
    DrawGrid(segmentLength);
    ctx.stroke();
  }
  GetCoordSystemProportions() {
    const shtrichSize = this.canvas.width / 120;
    const betweenShrichCount = 3;
    const numberShift = this.canvas.width / 180;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const xLength = this.canvas.width;
    const yLength = this.canvas.height;
    const unitLength = Math.max(xLength, yLength) / (this.unitCount * 2);

    return {
      shtrichSize,
      betweenShrichCount,
      numberShift,

      centerX,
      centerY,
      xLength,
      yLength,
      unitLength,

      top: 0,
      right: this.canvas.width,
      bottom: this.canvas.height,
      left: 0,

      yUCount: yLength / 2 / unitLength,
      xUCount: xLength / 2 / unitLength,
    };
  }
}
class Triangle {
  constructor(v1, v2, h) {
    this.v1 = v1;
    this.v2 = v2;
    this.h = h;

    this.v3 = (() => {
      const mid = this.baseMiddle;

      const dx = this.v2.x - this.v1.x;
      const dy = this.v2.y - this.v1.y;

      const len = this.baseLen;
      if (len === 0) throw new Error("Основа має нульову довжину");

      const perpX = -dy / len;
      const perpY = dx / len;

      return new Point(mid.x + perpX * this.h, mid.y + perpY * this.h);
    })();
  }

  get baseMiddle() {
    return new Point((this.v1.x + this.v2.x) / 2, (this.v1.y + this.v2.y) / 2);
  }
  get baseLen() {
    return Math.sqrt(
      Math.pow(this.v2.x - this.v1.x, 2) + Math.pow(this.v2.y - this.v1.y, 2)
    );
  }

  get farthestVertexFromOrigin() {
    const origin = new Point(0, 0);

    const d1 = this.v1.distanceTo(origin);
    const d2 = this.v2.distanceTo(origin);
    const d3 = this.v3.distanceTo(origin);

    const max = Math.max(d1, d2, d3);

    if (max === d1) return this.v1;
    if (max === d2) return this.v2;
    return this.v3;
  }
}
class Line {
  constructor(a, b, c, shift, animateTime, fps, canvas) {
    this.A = a;
    this.B = b;
    this.C = c;
    this.canvas = canvas;
    this.shift = shift;
    this.animateTime = animateTime;
    this.fps = fps;
  }

  get v1() {
    if (this.A === 0 && this.B === 0) {
      if (this.C === 0) {
        throw new Error("Рівняння задає всю площину, а не пряму.");
      } else {
        throw new Error("Недопустиме рівняння: не існує жодної прямої.");
      }
    }

    let x1 = -this.C / this.A;
    let y1 = -Coords.MAX_UNIT_COUNT;

    if (this.B != 0) {
      x1 = -Coords.MAX_UNIT_COUNT;
      y1 = (-this.C - this.A * x1) / this.B;
    }

    return new Point(x1, y1);
  }

  get v2() {
    if (this.A === 0 && this.B === 0) {
      if (this.C === 0) {
        throw new Error("Рівняння задає всю площину, а не пряму.");
      } else {
        throw new Error("Недопустиме рівняння: не існує жодної прямої.");
      }
    }

    let x2 = -this.C / this.A;
    let y2 = +Coords.MAX_UNIT_COUNT;

    if (this.B != 0) {
      x2 = Coords.MAX_UNIT_COUNT;
      y2 = (-this.C - this.A * x2) / this.B;
    }

    return new Point(x2, y2);
  }
}

const getEl = document.querySelector.bind(document);
const canvas = getEl("#myCanvas");
const EPS = 1e-10;
const startUnitCount = 20;
const gridHuge = 50;
const animationTime_s = 2;
const FPS = 29.97;

const coordSystem = new Coords(startUnitCount, canvas);
let line = new Line(-1, 1, 0, 0, animationTime_s, FPS, canvas);
let sampleTriangle;
let triangle;
let isActivated = false;
let isPaused = false;
let isWaiting = true;

const isSublim = true;
const subliminalMax = 25;
let subliminal = 0;

const isConsoleOutput = false;

window.onload = function () {
  canvas.width = 1086;
  canvas.height = 615;
  Redraw(coordSystem);
  SetBoundaries();

  // Отримуємо всі поля вводу лише з двох форм
  const forms = [
    document.querySelector("#triangle-cofig-form"),
    document.querySelector("#line-cofig-form"),
  ];
  const paramFields = forms
    .flatMap((form) => Array.from(form.querySelectorAll("input")))
    .map((field) => ({
      field: field,
      errorId: `#${field.getAttribute("id")}-error`, // правильне формування ID помилки
    }));
  // Обробка введення (перевірка й реакція)
  paramFields.forEach(({ field, errorId }) => {
    field.addEventListener("input", (event) => {
      hideErrorMessage(event, errorId);
      checkInterval(event, errorId);
    });
  });
  const dynamicForms = [document.querySelector("#line-cofig-form")];
  const dynamicParamFields = dynamicForms
    .flatMap((form) => Array.from(form.querySelectorAll("input")))
    .map((field) => ({
      field: field,
    }));
  dynamicParamFields.forEach(({ field }) => {
    field.addEventListener("input", (event) => {
      UpdateLine();
    });
  });
};

function SetBoundaries() {
  const triangleForm = getEl("#triangle-cofig-form");
  const lineForm = getEl("#line-cofig-form");

  const v1x = triangleForm["v1x"];
  const v1y = triangleForm["v1y"];
  const v2x = triangleForm["v2x"];
  const v2y = triangleForm["v2y"];
  const height_tri = triangleForm["height_tri"];

  const lineA = lineForm["lineA"];
  const lineB = lineForm["lineB"];
  const lineC = lineForm["lineC"];
  const shift = lineForm["shift"];
  const time = lineForm["time"];
  const fps = lineForm["fps"];

  v1x.min = -Coords.MAX_UNIT_COUNT / 2;
  v1y.min = -Coords.MAX_UNIT_COUNT / 2;
  v2x.min = -Coords.MAX_UNIT_COUNT / 2;
  v2y.min = -Coords.MAX_UNIT_COUNT / 2;
  height_tri.min = 0;

  v1x.max = Coords.MAX_UNIT_COUNT / 2;
  v1y.max = Coords.MAX_UNIT_COUNT / 2;
  v2x.max = Coords.MAX_UNIT_COUNT / 2;
  v2y.max = Coords.MAX_UNIT_COUNT / 2;
  height_tri.max = Coords.MAX_UNIT_COUNT / 2;

  lineA.value = line.A;
  lineB.value = line.B;
  lineC.value = line.C;

  shift.value = line.shift;
  shift.min = 0;
  shift.max = Coords.MAX_UNIT_COUNT / 2;

  time.value = line.animateTime;
  time.min = 0;

  fps.value = line.fps;
  fps.min = 1;
  fps.max = 100;
}
function ValidateForm(form) {
  if (!form) {
    console.error(`Form with id "${form.getAttribute("id")}" is not found.`);
    return false;
  }

  const paramFields = Array.from(form.querySelectorAll("input"));
  let emptyFields = FilterEmptyFields(paramFields);

  if (emptyFields.length !== 0) {
    console.log(emptyFields);
    emptyFields.forEach((f) => {
      f.style.borderColor = "red";
      const message = `This field must be defined`;
      showErrorMessage(message, `#${f.getAttribute("id")}-error`);
    });

    return false;
  }

  for (let i = 0; i < paramFields.length; i++) {
    const value = parseFloat(paramFields[i].value);
    const min = parseFloat(paramFields[i].min);
    const max = parseFloat(paramFields[i].max);

    if (value > max || value < min) {
      paramFields[i].style.borderColor = "red";
      const message = `${value} is out of range [${min}, ${max}]`;
      showErrorMessage(message, `#${paramFields[i].getAttribute("id")}-error`);
      return false;
    }
  }

  return true;

  function FilterEmptyFields(fields) {
    let emptyFields = [];
    for (let i = 0; i < fields.length; i++)
      if (!fields[i].value.trim()) emptyFields.push(fields[i]);

    return emptyFields;
  }
}
function checkInterval(event, errorId) {
  const value = parseFloat(event.target.value);
  const min = parseFloat(event.target.min);
  const max = parseFloat(event.target.max);

  if (value === "") return;
  if (value < min || value > max) {
    const fieldId_str = errorId.split("-")[0];
    console.log(fieldId_str);
    const f = getEl(`${fieldId_str}`);
    showErrorMessage(`${value} is out of range [${min}, ${max}]`, errorId);
    event.target.style.borderColor = "red";
  }
}
function hideErrorMessage(event, errorId) {
  let errorElement = getEl(errorId);

  errorElement.textContent = "";
  event.target.style.borderColor = "#bdc3c7";

  const panelName = getEl(".panel-main-title");
  panelName.classList.remove("with-error");
}
function showErrorMessage(message, where) {
  let errorElement = getEl(where);
  errorElement.textContent = message;

  if (message.length > 0) {
    const panelName = getEl(".panel-main-title");
    panelName.classList.add("with-error");
  }
}

async function UpdateLine() {
  const lineForm = getEl("#line-cofig-form");
  const lineA = lineForm["lineA"];
  const lineB = lineForm["lineB"];
  const lineC = lineForm["lineC"];
  const shift = lineForm["shift"];
  const time = lineForm["time"];
  const fps = lineForm["fps"];

  if (
    parseFloat(lineA.value) === parseFloat(lineB.value) &&
    parseFloat(lineB.value) === 0
  ) {
    showErrorMessage("A and B can't both be zeros", "#line-config-error");
    return;
  } else showErrorMessage("", "#line-config-error");

  isPaused = true;
  while (!isWaiting) await sleep(10);
  if (lineA.value) line.A = parseFloat(lineA.value);
  if (lineB.value) line.B = parseFloat(lineB.value);
  if (lineC.value) line.C = parseFloat(lineC.value);
  if (shift.value) line.shift = parseFloat(shift.value);
  if (time.value) line.animateTime = parseFloat(time.value);
  if (fps.value) line.fps = parseFloat(fps.value);

  isPaused = false;

  Redraw(coordSystem);
}
function ToCanvas(point, coords) {
  const box = coords.GetCoordSystemProportions();

  return new Point(
    box.centerX + point.x * box.unitLength,
    box.centerY - point.y * box.unitLength
  );
}
function ClearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function Redraw(coords) {
  ClearCanvas(coords.canvas);
  coords.DrawCoords();

  DrawLine(coords.canvas, line);
  if (triangle) DrawTrinagle(coords, triangle);
}

function DrawTrinagle(coords, triangle) {
  const ctx = coords.canvas.getContext("2d");

  const v1 = ToCanvas(triangle.v1, coords);
  const v2 = ToCanvas(triangle.v2, coords);
  const v3 = ToCanvas(triangle.v3, coords);
  const baseMiddle = ToCanvas(triangle.baseMiddle, coords);

  // triangle
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#056913";
  ctx.moveTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.lineTo(v3.x, v3.y);
  ctx.lineTo(v1.x, v1.y);
  ctx.stroke();
  ctx.closePath();

  // height
  ctx.beginPath();
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#000000";
  ctx.moveTo(v3.x, v3.y);
  ctx.lineTo(baseMiddle.x, baseMiddle.y);
  ctx.stroke();
  ctx.closePath();
}
function DrawLine(canvas, line) {
  const ctx = canvas.getContext("2d");

  const box = coordSystem.GetCoordSystemProportions();
  let v1 = new Point(line.v1.x * box.unitLength, line.v1.y * box.unitLength);
  let v2 = new Point(line.v2.x * box.unitLength, line.v2.y * box.unitLength);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(1, -1); // щоб Y ріс вгору
  ctx.beginPath();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 1;
  ctx.setLineDash([30, 20]);
  ctx.moveTo(v1.x, v1.y);
  ctx.lineTo(v2.x, v2.y);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function CreateTriangleBut() {
  isActivated = false;
  isPaused = false;
  isWaiting = true;
  const triangleForm = getEl("#triangle-cofig-form");

  if (!ValidateForm(triangleForm)) return;

  const v1x = parseFloat(triangleForm["v1x"].value);
  const v1y = parseFloat(triangleForm["v1y"].value);
  const v2x = parseFloat(triangleForm["v2x"].value);
  const v2y = parseFloat(triangleForm["v2y"].value);
  const height = parseFloat(triangleForm["height_tri"].value);

  if (v1x === v2x && v1y === v2y) {
    const message = `Точки основи не повинні збігатись`;
    showErrorMessage(message, `#triangle-config-error`);
  } else showErrorMessage("", `#triangle-config-error`);

  triangle = new Triangle(new Point(v1x, v1y), new Point(v2x, v2y), height);
  sampleTriangle = new Triangle(
    new Point(v1x, v1y),
    new Point(v2x, v2y),
    height
  );
  line.shift = Math.abs(line.shift);

  Redraw(coordSystem);
}
function SaveMatrixBut() {
  const motionForm = getEl("#line-cofig-form");
  if (!ValidateForm(motionForm)) {
    alert("Введіть усі параметри руху коректно.");
    return;
  }

  let A;
  let coordsShiftX;
  let coordsShiftY;
  let coordsRotate;
  let mirrorOX = scale(1, -1);
  let figureShiftX = Math.abs(line.shift);

  if (line.B !== 0) {
    coordsShiftX = 0;
    coordsShiftY = -line.C / line.B; // зсув по Y
    coordsRotate = Math.atan2(-line.A, line.B) + (line.B < 0 ? Math.PI : 0);
  } else {
    coordsShiftX = -line.C / line.A; // зсув по X
    coordsShiftY = 0;
    coordsRotate = Math.PI / 2;
  }

  A = shift(-coordsShiftX, -coordsShiftY);
  A = MultiplyMatrixes(A, rotate(-coordsRotate));
  A = MultiplyMatrixes(A, mirrorOX);
  A = MultiplyMatrixes(A, shift(figureShiftX, 0));
  A = MultiplyMatrixes(A, rotate(coordsRotate));
  A = MultiplyMatrixes(A, shift(coordsShiftX, coordsShiftY));

  console.log(A);
  downloadMatrix(A);
}
function SaveFigureBut() {
  if (!triangle) {
    alert("Спершу створіть фігуру.");
    return;
  }

  // створюємо тимчасовий канвас
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  const tempUnitCount = parseInt(
    Math.max(
      Math.abs(sampleTriangle.farthestVertexFromOrigin.x),
      Math.abs(sampleTriangle.farthestVertexFromOrigin.y)
    ) * 2
  );
  const temCoords = new Coords(tempUnitCount, tempCanvas);
  temCoords.DrawCoords();
  DrawTrinagle(temCoords, sampleTriangle);

  const link = document.createElement("a");
  link.download = "sampleFigure.png";
  link.href = tempCanvas.toDataURL("image/png");
  link.click(); // Trigger the download
}
async function StartMotion() {
  if (isPaused) isPaused = false;
  if (isActivated) return;
  else isActivated = true;

  const motionForm = getEl("#line-cofig-form");
  if (!triangle) return;
  if (!ValidateForm(motionForm)) return;

  let A;
  let coordsShiftX;
  let coordsShiftY;
  let coordsRotate;
  let tempTriangle = new Triangle(
    new Point(sampleTriangle.v1.x, sampleTriangle.v1.y),
    new Point(sampleTriangle.v2.x, sampleTriangle.v2.y),
    sampleTriangle.h
  );

  let stopCondition = 1;
  let direction = 1; // 1 - додатній напрямок | -1 - від'ємний
  let delta = (1 / (line.animateTime * line.fps)) * 1;
  let deltaR = (1 / (line.animateTime * line.fps)) * direction;
  for (let i = delta, r = delta; ; i += delta, r += deltaR) {
    if (line.shift * i > Coords.MAX_UNIT_COUNT) i = -i;
    if (r < 0) r = 0;
    if (r > 1) r = 1;

    while (isPaused) {
      isWaiting = true;
      await sleep(100);
    }
    if (!isActivated) break;
    isWaiting = false;

    // Початкова фігура
    let triangleMatrix = [
      [tempTriangle.v1.x, tempTriangle.v1.y, 1],
      [tempTriangle.v2.x, tempTriangle.v2.y, 1],
      [tempTriangle.v3.x, tempTriangle.v3.y, 1],
    ];

    // Знаходження змінних
    let figureShiftX = line.shift * i;

    let figureScaleY = 1 - 2 * r; // відображення по OX
    if (line.B !== 0) {
      coordsShiftX = 0;
      coordsShiftY = -line.C / line.B; // зсув по Y
      coordsRotate = Math.atan2(-line.A, line.B) + (line.B < 0 ? Math.PI : 0);
    } else {
      coordsShiftX = -line.C / line.A; // зсув по X
      coordsShiftY = 0;
      coordsRotate = Math.PI / 2;
    }

    // Матриці перетворення фігури
    let mirrorOX = scale(1, figureScaleY);
    let shiftFigure = shift(figureShiftX, 0);
    // Обчислення матриць перетворенння системи координат
    let rotateCoords = rotate(-coordsRotate);
    let shiftCoords = shift(-coordsShiftX, -coordsShiftY);

    // Знаходження матриці афінного перетворення
    A = shiftCoords;
    A = MultiplyMatrixes(A, rotateCoords);
    A = MultiplyMatrixes(A, mirrorOX);
    A = MultiplyMatrixes(A, shiftFigure);
    A = MultiplyMatrixes(A, inverseMatrixSmart(rotateCoords));
    A = MultiplyMatrixes(A, inverseMatrixSmart(shiftCoords));
    // Застосування матриці до фігури
    triangleMatrix = MultiplyMatrixes(triangleMatrix, A);

    triangle.v1.x = triangleMatrix[0][0];
    triangle.v1.y = triangleMatrix[0][1];
    triangle.v2.x = triangleMatrix[1][0];
    triangle.v2.y = triangleMatrix[1][1];
    triangle.v3.x = triangleMatrix[2][0];
    triangle.v3.y = triangleMatrix[2][1];

    if (isSublim && subliminal === subliminalMax) {
      subliminal = 1;
      drawScaledText(coordSystem.canvas, "Привіт від Богдана!");
      await sleep(1000 / FPS);
    } else subliminal++;

    Redraw(coordSystem);
    await sleep(line.animateTime * 1000 * Math.abs(delta));

    if (r === stopCondition) {
      stopCondition = 1 - stopCondition;
      direction = -direction;
    }
    delta = (1 / (line.animateTime * line.fps)) * 1; // Оновлення часу та плавності анімаці
    deltaR = (1 / (line.animateTime * line.fps)) * direction; // Оновлення часу та плавності анімаці
  }
}
function StopMotion() {
  isPaused = true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function downloadMatrix(matrix, filename = "matrix.txt") {
  let text = "Матриця афінного перетворення (3x3):\n\n";

  for (let row of matrix) {
    text += row.map((n) => n.toExponential(4).padStart(15)).join(" ") + "\n";
  }

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
function drawScaledText(canvas, text) {
  const ctx = canvas.getContext("2d");

  let fontSize = 50;
  const maxWidth = canvas.width * 0.4;
  const maxHeight = canvas.height * 0.4;

  // // Знаходимо максимальний розмір шрифту
  // while (true) {
  //   ctx.font = `${fontSize}px sans-serif`;
  //   const metrics = ctx.measureText(text);
  //   const textHeight = fontSize; // орієнтовно
  //   if (metrics.width > maxWidth || textHeight > maxHeight) break;
  //   fontSize++;
  // }

  fontSize--; // останній допустимий розмір
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text, canvas.width / 2, canvas.height / 3);
}

const scale = (a, d) => [
  [a, 0, 0],
  [0, d, 0],
  [0, 0, 1],
];
const shift = (x, y) => [
  [1, 0, 0],
  [0, 1, 0],
  [x, y, 1],
];
const rotate = (fi) => [
  [Math.cos(fi), Math.sin(fi), 0],
  [-Math.sin(fi), Math.cos(fi), 0],
  [0, 0, 1],
];

function MultiplyMatrixes(A, B) {
  if (A.length === 0 || B.length === 0) {
    throw new Error("Неможливо перемножити порожні матриці");
  }
  if (A[0].length !== B.length) {
    throw new Error(
      "Неможливо перемножити: невідповідність розмірностей матриць"
    );
  }

  let resMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < A[0].length; k++) {
        sum += A[i][k] * B[k][j];
      }
      resMatrix[i][j] = sum;
    }
  }

  return resMatrix;
}
function isOrthogonal(matrix, tolerance = EPS) {
  const n = matrix.length;
  const transpose = transposeMatrix(matrix);
  const product = MultiplyMatrixes(matrix, transpose);

  // Перевірка чи добуток дорівнює одиничній матриці
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      if (Math.abs(product[i][j] - expected) > tolerance) {
        return false;
      }
    }
  }
  return true;
}
function transposeMatrix(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}
function inverseMatrix(matrix) {
  const n = matrix.length;

  // Створюємо розширену матрицю [A | I]
  const augmented = matrix.map((row, i) =>
    row.concat(Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  );

  for (let i = 0; i < n; i++) {
    // Знаходимо головний елемент
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }

    // Обмін рядків
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // Перевірка на нульовий визначник
    if (augmented[i][i] === 0) {
      throw new Error("Матриця не має оберненої (сингулярна матриця)");
    }

    // Нормалізація головного рядка
    const divisor = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= divisor;
    }

    // Занулення інших елементів у стовпці
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  // Вилучаємо обернену матрицю (права частина)
  const inverse = augmented.map((row) => row.slice(n));
  return inverse;
}
function inverseMatrixSmart(matrix) {
  if (isOrthogonal(matrix)) {
    if (isConsoleOutput)
      console.log("Матриця ортогональна — обернена = транспонована");
    return transposeMatrix(matrix);
  } else {
    if (isConsoleOutput) console.log("Матриця не ортогональна");
    return inverseMatrix(matrix); // з попереднього прикладу
  }
}
