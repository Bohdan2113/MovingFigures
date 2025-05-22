class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Coords {
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
            minUnitCount,
            coordSystem.unitCount - step
          );
        else
          coordSystem.unitCount = Math.min(
            maxUnitCount,
            coordSystem.unitCount + step
          );

        Redraw(getEl("#myCanvas"));
      },
      { passive: false }
    );
  }

  DrawCoords() {
    const GetSegmentLength = (uCount, uLength) => {
      const factors = [2.5, 2, 2];
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
          const textX = endX + (numberShift);
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

const getEl = document.querySelector.bind(document);
const canvas = getEl("#myCanvas");
const startUnitCount = 30;
const minUnitCount = 1;
const maxUnitCount = 1000;
const coordSystem = new Coords(30, canvas);

window.onload = function () {
  canvas.height = window.innerHeight - 80;
  canvas.width = window.innerWidth - 450;
  coordSystem.DrawCoords(startUnitCount, canvas);

  // getEl("#lineWidth").addEventListener("input", function () {
  //   getEl("#lineWidthValue").innerText = this.value;
  // });
  // getEl("#angle").addEventListener("input", function () {
  //   getEl("#angleValue").innerText = this.value;
  // });

  // // Отримуємо всі поля вводу
  // const paramFields = Array.from(
  //   getEl("#params-form").querySelectorAll("input")
  // ).map((field) => ({
  //   field: field,
  //   errorId: `#error-message-getEl{field.getAttribute("id")}`,
  // }));
  // // Обробка введення (коректність і відображення змін)
  // paramFields.forEach(({ field, errorId }) => {
  //   field.addEventListener("input", (event) =>
  //     hideErrorMessage(event, errorId)
  //   );
  //   field.addEventListener("input", (event) => {
  //     checkInterval(event, errorId);
  //     ChangeFractal();
  //   });
  // });
  // getEl("#formula").addEventListener("input", (event) => {
  //   ChangeFractal();
  // });
  // getEl("#fractal-name").addEventListener("input", (event) => {
  //   workFractal.name = event.target.value;
  // });
};

// function FillFormValues(fractal) {
//   ClearForm("#params-form");

//   getEl("#fractal-type").value = fractal.type;
//   getEl("#fractal-name").value = fractal.name ? fractal.name : "noname";

//   getEl("#startX").value = fractal.x;
//   getEl("#startY").value = fractal.y;
//   getEl("#length").value = fractal.length;
//   getEl("#iterations").value = fractal.iterations;
//   getEl("#color").value = fractal.color;
//   getEl("#angle").value = fractal.angle;
//   getEl("#angleValue").innerText = fractal.angle;
//   getEl("#lineWidth").value = fractal.lineW;
//   getEl("#lineWidthValue").innerText = fractal.lineW;
//   getEl("#realC").value = fractal.realC;
//   getEl("#imagC").value = fractal.imagC;
//   getEl("#bailout").value = fractal.bailout;
//   getEl("#resolution").value = fractal.resolution;

//   const select = getEl("#formula");
//   select.value = fractal.formula;
//   select.dispatchEvent(new Event("change"));
// }
// function ReadFormValues(fractal) {
//   const fractalName = getEl("#fractal-name").value;
//   fractal.name = fractalName;

//   fractal.x = parseFloat(getEl("#startX").value);
//   fractal.y = parseFloat(getEl("#startY").value);
//   fractal.length = parseFloat(getEl("#length").value);
//   fractal.iterations = parseInt(getEl("#iterations").value);
//   fractal.color = getEl("#color").value;
//   fractal.angle = parseInt(getEl("#angle").value);
//   fractal.lineW = parseInt(getEl("#lineWidth").value);
//   fractal.realC = parseFloat(getEl("#realC").value);
//   fractal.imagC = parseFloat(getEl("#imagC").value);
//   fractal.bailout = parseFloat(getEl("#bailout").value);
//   fractal.resolution = parseInt(getEl("#resolution").value);
//   fractal.formula = parseInt(getEl("#formula").value);
// }

// function ChangeFractal() {
//   if (!ValidateForm("#params-form")) return;
//   ReadFormValues(workFractal);

//   Redraw(getEl("#myCanvas"), workFractal);
// }

// function SetBoundaries(form, type) {
//   const iterationsField = form["iterations"];
//   const lengthField = form["length"];
//   const startXField = form["startX"];
//   const startYField = form["startY"];
//   const bailoutField = form["bailout"];
//   const resolutionField = form["resolution"];
//   const angleField = form["angle"];
//   const widthField = form["width"];

//   if (type === "Algebraical") {
//     iterationsField.min = 1;
//     iterationsField.max = 700;
//     getEl("#iterations_block").title = "Max iterations for each pixel";
//     getEl("#color_block").title = "Determines the color scheme (shades)";
//   } else if (type === "Minkovskogo") {
//     iterationsField.min = 0;
//     iterationsField.max = 6;
//     getEl("#iterations_block").title = "Depth of fractal creation";
//     getEl("#color_block").title = "Fractal color";
//   }

//   startXField.min = -maxUnitCount;
//   startXField.max = maxUnitCount;

//   startYField.min = -maxUnitCount / 2 - 23;
//   startYField.max = maxUnitCount / 2 + 23;

//   lengthField.min = -maxUnitCount;
//   lengthField.max = maxUnitCount;

//   bailoutField.min = 0;
//   bailoutField.max = 1000;

//   resolutionField.min = 1;
//   resolutionField.max = 10;

//   angleField.min = 0;
//   angleField.max = 360;

//   widthField.min = 1;
//   widthField.max = 10;
// }

// function ClearWork() {
//   ClearCanvas(getEl("#myCanvas"));
//   // ClearForm("#params-form");
// }
function ClearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
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

// function ValidateForm(formId_str) {
//   const form = getEl(formId_str);
//   if (!form) {
//     console.error(`Form with id "getEl{formId_str}" not found.`);
//     return false;
//   }

//   const paramFields = Array.from(form.querySelectorAll("input"));
//   let emptyFields = FilterEmptyFields(paramFields);

//   if (emptyFields.length !== 0) {
//     console.log(emptyFields);
//     emptyFields.forEach((f) => {
//       f.style.borderColor = "red";
//       const message = `Define "getEl{f.getAttribute("name")}" field`;
//       showErrorMessage(message, `#error-message-getEl{f.getAttribute("id")}`);
//     });

//     return false;
//   }

//   for (let i = 0; i < paramFields.length; i++) {
//     const value = parseFloat(paramFields[i].value);
//     const min = parseFloat(paramFields[i].min);
//     const max = parseFloat(paramFields[i].max);

//     if (value > max || value < min) {
//       paramFields[i].style.borderColor = "red";
//       const message = `getEl{paramFields[i].getAttribute(
//         "name"
//       )}=getEl{value} is out of range [getEl{min}, getEl{max}]`;
//       showErrorMessage(
//         message,
//         `#error-message-getEl{paramFields[i].getAttribute("id")}`
//       );
//       return false;
//     }
//   }

//   return true;

//   function FilterEmptyFields(fields) {
//     let emptyFields = [];
//     for (let i = 0; i < fields.length; i++)
//       if (!fields[i].value.trim()) emptyFields.push(fields[i]);

//     return emptyFields;
//   }
// }
// function checkInterval(event, errorId) {
//   const value = parseFloat(event.target.value);
//   const min = parseFloat(event.target.min);
//   const max = parseFloat(event.target.max);

//   if (value === "") return;
//   if (value < min || value > max) {
//     const fieldId_str = errorId.split("-").pop();
//     console.log(fieldId_str);
//     const f = document.getElementById(fieldId_str);
//     showErrorMessage(
//       `getEl{f.getAttribute("name")}=getEl{value} is out of range [getEl{min}, getEl{max}]`,
//       errorId
//     );
//     event.target.style.borderColor = "red";
//   }
// }
// function hideErrorMessage(event, errorId) {
//   let errorElement = getEl(errorId);

//   errorElement.style.display = "none";
//   event.target.style.borderColor = "#6f6f6f";
// }
// function showErrorMessage(message, where) {
//   let errorElement = getEl(where);
//   errorElement.textContent = message;

//   errorElement.style.display = "block"; // Показати повідомлення
// }

function Redraw(canvas) {
  ClearCanvas(canvas);
  coordSystem.DrawCoords();
}

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
// function ToCanvas(canvas, point, uCount) {
//   const box = GetCoordSystemProportions();

//   return new Point(
//     box.centerX + point.x * box.unitLength,
//     box.centerY - point.y * box.unitLength
//   );
// }
