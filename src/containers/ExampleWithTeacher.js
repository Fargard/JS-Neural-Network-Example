import React, { Component } from "react";
import brain from "brain.js";

class ExampleWithTeacher extends Component {
  componentDidMount() {
    this.updateCanvas();

    const clearB = this.refs.clear;
    const trainB = this.refs.train;
    const vectorB = this.refs.vector;

    let vectorRes = [];
    let net = null;
    let train_data = [];

    clearB.addEventListener("click", e => {
      this.clear();
    });

    trainB.addEventListener("click", e => {
      vectorRes = this.calculate(true);

      //train
      if (window.confirm("Positive?")) {
        train_data.push({
          input: vectorRes,
          output: { positive: 1 }
        });
      } else {
        train_data.push({
          input: vectorRes,
          output: { negative: 1 }
        });
      }
    });

    vectorB.addEventListener("click", e => {
      net = new brain.NeuralNetwork();
      net.train(train_data, { log: true });

      const result = brain.likely(this.calculate(), net);
      alert(result);
    });
  }

  updateCanvas() {
    const canv = this.refs.canv;
    const ctx = canv.getContext("2d");
    const pixel = 20;

    let is_mouse_down = false;

    canv.width = 500;
    canv.height = 500;

    canv.addEventListener("mousedown", function(e) {
      is_mouse_down = true;
      ctx.beginPath();
    });

    canv.addEventListener("mouseup", function(e) {
      is_mouse_down = false;
    });

    canv.addEventListener("mousemove", function(e) {
      if (is_mouse_down) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
        ctx.lineWidth = pixel;

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      }
    });
  }

  drawLine(x1, y1, x2, y2, color = "gray") {
    const canv = this.refs.canv;
    const ctx = canv.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  drawCell(x, y, w, h) {
    const canv = this.refs.canv;
    const ctx = canv.getContext("2d");

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "blue";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.rect(x, y, w, h);
    ctx.fill();
  }

  clear() {
    const canv = this.refs.canv;
    const ctx = canv.getContext("2d");

    ctx.clearRect(0, 0, canv.width, canv.height);
  }

  drawGrid() {
    const canv = this.refs.canv;
    const pixel = 20;

    const w = canv.width;
    const h = canv.height;
    const p = w / pixel;

    const xStep = w / p;
    const yStep = h / p;

    for (let x = 0; x < w; x += xStep) {
      this.drawLine(x, 0, x, h);
    }

    for (let y = 0; y < h; y += yStep) {
      this.drawLine(0, y, w, y);
    }
  }

  calculate(draw = false) {
    const canv = this.refs.canv;
    const ctx = canv.getContext("2d");
    const pixel = 20;

    const w = canv.width;
    const h = canv.height;
    const p = w / pixel;

    const xStep = w / p;
    const yStep = h / p;

    const vector = [];
    let __draw = [];

    for (let x = 0; x < w; x += xStep) {
      for (let y = 0; y < h; y += yStep) {
        const data = ctx.getImageData(x, y, xStep, yStep);

        let nonEmptyPixelsCount = 0;
        for (let i = 0; i < data.data.length; i += 10) {
          const isEmpty = data.data[i] === 0;

          if (!isEmpty) {
            nonEmptyPixelsCount += 1;
          }
        }

        if (nonEmptyPixelsCount > 1 && draw) {
          __draw.push([x, y, xStep, yStep]);
        }

        vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
      }
    }

    if (draw) {
      this.clear();
      this.drawGrid();

      for (let _d in __draw) {
        this.drawCell(
          __draw[_d][0],
          __draw[_d][1],
          __draw[_d][2],
          __draw[_d][3]
        );
      }
    }

    return vector;
  }

  render() {
    return (
      <div>
        <h2>Пример нейронной сети, обучающейся учитилем</h2>
        <p>
          Давайте сделаем интерфейс, в котором мы можем нарисовать смайлик и
          обучить нейронную сеть распознавать грустный это смайлик или веселый
          :)
        </p>
        <div>
          <canvas ref="canv" id="canv">
            Ваш браузер устарел, обновитесь.
          </canvas>
          <div>
            <button ref="clear">Clear</button>
            <button ref="train">Train</button>
            <button ref="vector">Vector</button>
          </div>
        </div>
      </div>
    );
  }
}

export default ExampleWithTeacher;
