import React, { Component } from "react";
import brain from "brain.js";
import basicTrainData from "../resources/basicTrainData/exampleWithTeacher.json";

class ExampleWithTeacher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trainData: [],
      training: false,
      result: {
        negative: 0,
        positive: 0
      },
      neuralConfig: {
        binaryThresh: 0.5,
        activation: "sigmoid",
        hiddenLayers: [5],
        learningRate: 0.3
      }
    };

    this.neuralNetwork = new brain.NeuralNetwork(this.state.neuralConfig);

    this.handleTrain = this.handleTrain.bind(this);
    this.handleLoopTrain = this.handleLoopTrain.bind(this);
    this.handleChoise = this.handleChoise.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillMount() {
    const localTrainData = localStorage.getItem("trainData");
    if (localTrainData && localTrainData.length > 0) {
      this.setState({ trainData: JSON.parse(localTrainData) });
    } else {
      localStorage.setItem("trainData", JSON.stringify(basicTrainData));
      this.setState({ trainData: basicTrainData });
    }

    const savedNeuralNetwork = localStorage.getItem("neuralNetwork");
    if (savedNeuralNetwork && savedNeuralNetwork.length > 0) {
      this.neuralNetwork.fromJSON(JSON.parse(savedNeuralNetwork));
    }
  }

  componentDidMount() {
    this.state.trainData.length && this.handleTrain();

    const canvas = this.refs.canvas;
    const clear = this.refs.clear;
    const train = this.refs.train;
    const vector = this.refs.vector;
    const ctx = canvas.getContext("2d");

    const pixel = 10;
    canvas.width = 500;
    canvas.height = 500;

    let is_mouse_down = false;

    canvas.addEventListener("mousedown", event => {
      is_mouse_down = true;
      ctx.beginPath();
    });

    canvas.addEventListener("mouseup", event => {
      is_mouse_down = false;
    });

    canvas.addEventListener("mousemove", event => {
      if (is_mouse_down) {
        ctx.fillStyle = "red";
        ctx.strokeStyle = "red";
        ctx.lineWidth = pixel;

        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(event.offsetX, event.offsetY, pixel / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
      }
    });

    clear.addEventListener("click", () => {
      this.clear();
    });

    train.addEventListener("click", () => {
      this.setState({ training: !this.state.training });
    });

    vector.addEventListener("click", () => {
      this.handleTrain();
      const result = this.neuralNetwork.run(this.calculate());

      this.setState({
        result: { ...this.state.result, ...result }
      });
    });
  }

  componentDidUpdate(nextProps, nextState) {
    if (nextState.trainData !== this.state.trainData) {
      localStorage.setItem("trainData", JSON.stringify(this.state.trainData));
    }
  }

  handleChoise = value => {
    const vectorRes = this.calculate(true);

    if (value === "sad") {
      this.setState({
        trainData: [
          ...this.state.trainData,
          { input: vectorRes, output: { negative: 1 } }
        ]
      });
    } else if (value === "happy") {
      this.setState({
        trainData: [
          ...this.state.trainData,
          { input: vectorRes, output: { positive: 1 } }
        ]
      });
    }

    this.setState({ training: !this.state.training });
    setTimeout(() => {
      this.clear();
    }, 500);
  };

  handleChange = event => {
    const value = event.target.value;
    this.setState(prevState => ({
      neuralConfig: {
        ...prevState.neuralConfig,
        learningRate: parseFloat(value)
      }
    }));
  };

  handleSelect = event => {
    const value = event.target.value;
    this.setState(prevState => ({
      neuralConfig: {
        ...prevState.neuralConfig,
        activation: value
      }
    }));
  };

  handleTrain = () => {
    this.neuralNetwork.train(this.state.trainData);
    localStorage.setItem(
      "neuralNetwork",
      JSON.stringify(this.neuralNetwork.toJSON())
    );
  };

  handleLoopTrain = () => {
    for (let i = 0; i <= 50; i++) {
      this.handleTrain();
      i === 50 && this.clear();
    }
  };

  drawLine(x1, y1, x2, y2, color = "gray") {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  drawCell(x, y, w, h) {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "blue";
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.rect(x, y, w, h);
    ctx.fill();
  }

  clear() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.setState({
      result: {
        negative: 0,
        positive: 0
      },
      training: false
    });
  }

  drawGrid() {
    const canvas = this.refs.canvas;
    const pixel = 20;

    const w = canvas.width;
    const h = canvas.height;
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
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    const pixel = 20;

    const w = canvas.width;
    const h = canvas.height;
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
    const { trainData, training, result } = this.state;

    return (
      <div>
        <h2>Пример нейронной сети, обучающейся учитилем</h2>
        <p>
          Давайте сделаем интерфейс, в котором мы можем нарисовать смайлик и
          обучить нейронную сеть распознавать грустный это смайлик, веселый или
          нейтральный :)
        </p>
        <div className="exampleContent">
          <canvas ref="canvas" className="exampleContent__canvas">
            Ваш браузер устарел, обновитесь.
          </canvas>
          <div className="exampleContent__data">
            <div className="buttons">
              <button ref="clear" disabled={training ? true : false}>
                Очистить
              </button>
              <button ref="train">Тренировать</button>
              <button ref="vector" disabled={trainData.length ? false : true}>
                Оценить
              </button>
            </div>
            {training && (
              <div className="train-buttons">
                <button onClick={e => this.handleChoise("sad")}>
                  Грустный
                </button>
                <button onClick={e => this.handleChoise("happy")}>
                  Веселый
                </button>
                <button onClick={this.handleLoopTrain}>
                  Тренировать 50 раз
                </button>
              </div>
            )}
            <div className="results">
              <p>Примеров - {trainData.length}</p>
              <br />
              <br />
              <div className="config">
                <input
                  type="number"
                  min="0.1"
                  max="0.9"
                  value={this.state.neuralConfig.learningRate}
                  onChange={event => this.handleChange(event)}
                />
                <select onChange={event => this.handleSelect(event)}>
                  <option value="sigmoid">Сигмоидная</option>
                  <option value="tanh">Тангенс</option>
                </select>
              </div>
              <p>
                Грустный - {(result.negative * 100).toFixed(2)}%
                {Math.max(...Object.values(result)) === result.negative &&
                  result.negative > 0 && <span> --Верно</span>}
              </p>
              <p>
                Веселый - {(result.positive * 100).toFixed(2)}%
                {Math.max(...Object.values(result)) === result.positive &&
                  result.positive > 0 && <span> --Верно</span>}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExampleWithTeacher;
