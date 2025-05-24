class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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

        Redraw(getEl("#myCanvas"));
      },
      { passive: false }
    );
  }

  DrawCoords() {
    const GetSegmentLength = (uCount, uLength) => {
      const factors = [2, 2.5, 2];
      let index = 0;
      let baseLover = 20;
      let baseUpper = 50;
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

    const ctx = canvas.getContext("2d");
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
  }

  get baseMiddle() {
    return new Point((this.v1.x + this.v2.x) / 2, (this.v1.y + this.v2.y) / 2);
  }
  get baseLen() {
    return Math.sqrt(
      Math.pow(this.v2.x - this.v1.x, 2) + Math.pow(this.v2.y - this.v1.y, 2)
    );
  }

  get v3() {
    // 1. Середина основи
    const mid = this.baseMiddle;

    // 2. Вектор основи
    const dx = this.v2.x - this.v1.x;
    const dy = this.v2.y - this.v1.y;

    // 3. Довжина основи
    const len = this.baseLen;

    if (len === 0) throw new Error("Основа має нульову довжину");

    // 4. Одиничний вектор, перпендикулярний основі (-dy, dx) (поворот на 90° проти год. стрілки)
    const perpX = -dy / len;
    const perpY = dx / len;

    // 5. Точка на відстані h від середини в напрямку перпендикуляра
    return new Point(mid.x + perpX * this.h, mid.y + perpY * this.h);
  }
}
class Line {
  constructor(a, b, c, canvas) {
    this.A = a;
    this.B = b;
    this.C = c;
    this.canvas = canvas;
  }

  get v1() {
    let x1 = canvas.width / 2;
    let y1 = 0;

    if (this.B != 0) {
      x1 = -Coords.MAX_UNIT_COUNT;
      y1 = (-this.C - this.A * x1) / this.B;
    }

    return new Point(x1, y1);
  }

  get v2() {
    let x2 = canvas.width / 2;
    let y2 = canvas.height;

    if (this.B != 0) {
      x2 = Coords.MAX_UNIT_COUNT;
      y2 = (-this.C - this.A * x2) / this.B;
    }

    return new Point(x2, y2);
  }
}

const getEl = document.querySelector.bind(document);
const canvas = getEl("#myCanvas");
const startUnitCount = 20;

const coordSystem = new Coords(startUnitCount, canvas);
let line = new Line(1, -1, 0);
let triangle;

window.onload = function () {
  canvas.height = window.innerHeight - 80;
  canvas.width = window.innerWidth - 450;
  Redraw(canvas);
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
}
function showErrorMessage(message, where) {
  let errorElement = getEl(where);
  errorElement.textContent = message;
}

function UpdateLine() {
  const lineForm = getEl("#line-cofig-form");
  const lineA = lineForm["lineA"];
  const lineB = lineForm["lineB"];
  const lineC = lineForm["lineC"];

  line.A = parseFloat(lineA.value);
  line.B = parseFloat(lineB.value);
  line.C = parseFloat(lineC.value);

  Redraw(canvas);
}
function ToCanvas(point) {
  const box = coordSystem.GetCoordSystemProportions();

  return new Point(
    box.centerX + point.x * box.unitLength,
    box.centerY - point.y * box.unitLength
  );
}
function ClearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function Redraw(canvas) {
  ClearCanvas(canvas);
  coordSystem.DrawCoords();

  DrawLine(canvas, line);
  if (triangle) DrawTrinagle(canvas, triangle);
}

function DrawTrinagle(canvas, triangle) {
  const ctx = canvas.getContext("2d");

  const v1 = ToCanvas(triangle.v1);
  const v2 = ToCanvas(triangle.v2);
  const v3 = ToCanvas(triangle.v3);
  const baseMiddle = ToCanvas(triangle.baseMiddle);

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

  const v1 = ToCanvas(line.v1);
  const v2 = ToCanvas(line.v2);

  ctx.save();
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

function MultiplyMatrixes(A, B) {
  if (A.length === 0 || B.length === 0) {
    throw new Error("Неможливо перемножити порожні матриці");
  }
  if (A[0].length !== B.length) {
    throw new Error(
      "Неможливо перемножити: невідповідність розмірностей матриць"
    );
  }

  let resMatrix;

  for (let i = 0; i < A.length; i++) {
    for (let j = 0; B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < A[0].length; k++) {
        sum += A[i][k] * B[k][j];
      }
      resMatrix[i][j] = sum;
    }
  }

  return resMatrix;
}

function CreateTriangleBut() {
  const triangleForm = getEl("#triangle-cofig-form");

  if (!ValidateForm(triangleForm)) return;

  const v1x = parseFloat(triangleForm["v1x"].value);
  const v1y = parseFloat(triangleForm["v1y"].value);
  const v2x = parseFloat(triangleForm["v2x"].value);
  const v2y = parseFloat(triangleForm["v2y"].value);
  const height = parseFloat(triangleForm["height_tri"].value);

  triangle = new Triangle(new Point(v1x, v1y), new Point(v2x, v2y), height);

  Redraw(getEl("#myCanvas"));
}

// function ClearWork() {
//   ClearCanvas(getEl("#myCanvas"));
//   // ClearForm("#params-form");
// }
// function ClearForm(formId_str) {
//   const form = getEl(formId_str);
//   form.reset();
//   if (form) {
//     const paragraphs = form.querySelectorAll("p");
//     paragraphs.forEach((p) => {
//       p.style.display = "none";
//     });

//     const inputs = form.querySelectorAll("input");
//     inputs.forEach((input) => {
//       input.style.borderColor = "#6f6f6f";
//     });
//   }
// }

// function DrawLine(canvas, uCount, pStart, pEnd, width = 1, color = "#000000") {
//   const ctx = canvas.getContext("2d");

//   const pStartCanvas = ToCanvas(canvas, pStart, uCount);
//   const pEndCanvas = ToCanvas(canvas, pEnd, uCount);
//   const box = GetCoordSystemProportions(canvas, uCount);

//   ctx.strokeStyle = color;
//   ctx.lineWidth = width;
//   drawClippedLine(ctx, box, pStartCanvas, pEndCanvas);

//   function isPointInBox(p, box) {
//     return (
//       p.x >= box.left && p.x <= box.right && p.y >= box.top && p.y <= box.bottom
//     );
//   }
//   function drawClippedLine(ctx, box, pStartCanvas, pEndCanvas) {
//     const insideStart = isPointInBox(pStartCanvas, box);
//     const insideEnd = isPointInBox(pEndCanvas, box);

//     // обидві точки за межами — нічого не малюємо
//     if (!insideStart && !insideEnd) return;

//     // Якщо одна з точок за межами — обрізаємо лінію
//     let clippedStart = pStartCanvas;
//     let clippedEnd = pEndCanvas;
//     if (!insideStart || !insideEnd) {
//       [clippedStart, clippedEnd] = clipLineToBox(pStartCanvas, pEndCanvas, box);
//       if (!clippedStart || !clippedEnd) return;
//     }

//     // Малюємо лінію
//     ctx.beginPath();
//     ctx.moveTo(pStartCanvas.x, pStartCanvas.y);
//     ctx.lineTo(pEndCanvas.x, pEndCanvas.y);
//     ctx.stroke();
//   }
//   function clipLineToBox(p1, p2, box) {
//     let x1 = p1.x,
//       y1 = p1.y;
//     let x2 = p2.x,
//       y2 = p2.y;

//     const INSIDE = 0,
//       LEFT = 1,
//       RIGHT = 2,
//       BOTTOM = 4,
//       TOP = 8;

//     function computeOutCode(x, y) {
//       let code = INSIDE;
//       if (x < box.left) code |= LEFT;
//       else if (x > box.right) code |= RIGHT;
//       if (y < box.top) code |= TOP;
//       else if (y > box.bottom) code |= BOTTOM;
//       return code;
//     }

//     let outcode1 = computeOutCode(x1, y1);
//     let outcode2 = computeOutCode(x2, y2);
//     let accept = false;

//     while (true) {
//       if (!(outcode1 | outcode2)) {
//         // Обидві точки всередині
//         accept = true;
//         break;
//       } else if (outcode1 & outcode2) {
//         // Обидві точки по одну сторону — повністю поза
//         break;
//       } else {
//         // Є часткове перетинання — обрізаємо
//         let outcodeOut = outcode1 ? outcode1 : outcode2;
//         let x, y;

//         if (outcodeOut & TOP) {
//           x = x1 + ((x2 - x1) * (box.top - y1)) / (y2 - y1);
//           y = box.top;
//         } else if (outcodeOut & BOTTOM) {
//           x = x1 + ((x2 - x1) * (box.bottom - y1)) / (y2 - y1);
//           y = box.bottom;
//         } else if (outcodeOut & RIGHT) {
//           y = y1 + ((y2 - y1) * (box.right - x1)) / (x2 - x1);
//           x = box.right;
//         } else if (outcodeOut & LEFT) {
//           y = y1 + ((y2 - y1) * (box.left - x1)) / (x2 - x1);
//           x = box.left;
//         }

//         if (outcodeOut === outcode1) {
//           x1 = x;
//           y1 = y;
//           outcode1 = computeOutCode(x1, y1);
//         } else {
//           x2 = x;
//           y2 = y;
//           outcode2 = computeOutCode(x2, y2);
//         }
//       }
//     }

//     if (accept) {
//       return [
//         { x: x1, y: y1 },
//         { x: x2, y: y2 },
//       ];
//     } else {
//       return [null, null];
//     }
//   }
// }
