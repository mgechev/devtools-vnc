(function () {
  var Config = {
      URL: 'http://localhost:8090',
      CONNECTION_TIMEOUT: 2000
    },
    keyMap = [[8,65288,65288],[9,65289,65289],[13,65293,65293],[16,65505,65505],[16,65506,65506],[17,65507,65507],[17,65508,65508],[18,65513,65513],[18,65514,65514],[27,65307,65307],[32,32,32],[33,65365,65365],[34,65366,65366],[35,65367,65367],[36,65360,65360],[37,65361,65361],[38,65362,65362],[39,65363,65363],[40,65364,65364],[45,65379,65379],[46,65535,65535],[48,48,41],[49,49,33],[50,50,64],[51,51,35],[52,52,36],[53,53,37],[54,54,94],[55,55,38],[56,56,42],[57,57,40],[65,97,65],[66,98,66],[67,99,67],[68,100,68],[69,101,69],[70,102,70],[71,103,71],[72,104,72],[73,105,73],[74,106,74],[75,107,75],[76,108,76],[77,109,77],[78,110,78],[79,111,79],[80,112,80],[81,113,81],[82,114,82],[83,115,83],[84,116,84],[85,117,85],[86,118,86],[87,119,87],[88,120,88],[89,121,89],[90,122,90],[97,49,49],[98,50,50],[99,51,51],[100,52,52],[101,53,53],[102,54,54],[103,55,55],[104,56,56],[105,57,57],[106,42,42],[107,61,61],[109,45,45],[110,46,46],[111,47,47],[112,65470,65470],[113,65471,65471],[114,65472,65472],[115,65473,65473],[116,65474,65474],[117,65475,65475],[118,65476,65476],[119,65477,65477],[120,65478,65478],[121,65479,65479],[122,65480,65480],[123,65481,65481],[186,59,58],[187,61,43],[188,44,60],[189,45,95],[190,46,62],[191,47,63],[192,96,126],[220,92,124],[221,93,125],[222,39,34],[219,91,123]];

  function Screen(canvas, vncClient) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.vncClientScreen = vncClient;
    this.addEventListener();
    this.resize();
  }

  Screen.prototype.resize = function () {
    var canvas = this.vncClientScreen.getCanvas(),
        ratio = canvas.width / canvas.height,
        width = window.innerWidth,
        height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = width / ratio;
    if (this.canvas.height > height) {
      this.canvas.height = height;
      this.canvas.width = height * ratio;
    }
    this.redraw();
  };

  Screen.prototype.resizeHandler = function () {
    var self = this;
    return this.resizeHandler = function () {
      self.resize();
    };
  };

  Screen.prototype.addEventListener = function () {
    var self = this;
    this.vncClientScreen.onUpdate(function () {
      self.redraw();
    });
    window.addEventListener('resize', this.resizeHandler(), false);
  };

  Screen.prototype.addMouseHandler = function (cb) {
    var buttonsState = [0, 0, 0],
        self = this;

    function getMask() {
      var copy = Array.prototype.slice.call(buttonsState);
          buttons = copy.reverse().join('');
      return parseInt(buttons, 2);
    }

    function getMousePosition(x, y) {
      var c = self.canvas,
          oc = self.vncClientScreen.getCanvas(),
          pos = c.getBoundingClientRect(),
          width = c.width,
          height = c.height,
          oWidth = oc.width,
          oHeight = oc.height,
          widthRatio = width / oWidth,
          heightRatio = height / oHeight;
      return {
        x: x / widthRatio - pos.left,
        y: y / heightRatio - pos.top
      };
    }

    this.canvas.addEventListener('mousedown', function (e) {
      if (e.button === 0 || e.button === 2) {
        buttonsState[e.button] = 1;
        var pos = getMousePosition(e.pageX, e.pageY);
        cb.call(null, pos.x, pos.y, getMask());
      }
      e.preventDefault();
    }, false);
    this.canvas.addEventListener('mouseup', function (e) {
      if (e.button === 0 || e.button === 2) {
        buttonsState[e.button] = 0;
        var pos = getMousePosition(e.pageX, e.pageY);
        cb.call(null, pos.x, pos.y, getMask());
      }
      e.preventDefault();
    }, false);
    this.canvas.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    });
    this.canvas.addEventListener('mousemove', function (e) {
      var pos = getMousePosition(e.pageX, e.pageY);
      cb.call(null, pos.x, pos.y, getMask());
      e.preventDefault();
    }, false);
  };

  Screen.prototype.keyUpHandler = function (cb) {
    return this.keyUpHandler = function (e) {
      cb.call(null, e.keyCode, e.shiftKey, 1);
      e.preventDefault();
    };
  };

  Screen.prototype.keyDownHandler = function (cb) {
    return this.keyDownHandler = function (e) {
      cb.call(null, e.keyCode, e.shiftKey, 0);
      e.preventDefault();
    };
  };

  Screen.prototype.addKeyboardHandlers = function (cb) {
    document.addEventListener('keydown', this.keyDownHandler(cb), false);
    document.addEventListener('keyup', this.keyUpHandler(cb), false);
  };

  Screen.prototype.redraw = function () {
    var canvas = this.vncClientScreen.getCanvas();
    this.context.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height);
  };

  Screen.prototype.destroy = function () {
    document.removeEventListener('keydown', this.keyDownHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.canvas.removeEventListener('contextmenu');
    this.canvas.removeEventListener('mousemove');
    this.canvas.removeEventListener('mousedown');
    this.canvas.removeEventListener('mouseup');
  };

  function VNCClientScreen(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.onUpdateCbs = [];
  }

  VNCClientScreen.prototype.drawRect = function (rect) {
    var img = new Image(),
        self = this;
    img.width = rect.width;
    img.height = rect.height;
    img.src = 'data:image/png;base64,' + rect.image;
    img.onload = function () {
      self.context.drawImage(this, rect.x, rect.y, rect.width, rect.height);
      self.onUpdateCbs.forEach(function (cb) {
        cb();
      });
    };
  };

  VNCClientScreen.prototype.getCanvas = function () {
    return this.canvas;
  };

  VNCClientScreen.prototype.onUpdate = function (cb) {
    this.onUpdateCbs.push(cb);
  };

  function Client(screen, vncClientScreen) {
    this.screen = screen;
    this.vncClientScreen = vncClientScreen;
  }

  Client.prototype.initEventListeners = function () {
    var self = this;
    this.screen.addMouseHandler(function (x, y, mask) {
      self.socket.emit('mouse', {
        x: x,
        y: y,
        button: mask
      });
    });
    this.screen.addKeyboardHandlers(function (code, shift, isDown) {
      var rfbKey = self.toRfbKeyCode(code, shift, isDown);
      if (rfbKey)
        self.socket.emit('keyboard', {
          keyCode: rfbKey,
          isDown: isDown
        });
    });
  };

  Client.prototype.connect = function (config) {
    var self = this;
    if (config.forceNewConnection) {
      this.socket = io.connect(Config.URL);
    } else {
      this.socket = io.connect(Config.URL, { 'force new connection': true });
    }
    this.socket.emit('init', {
      host: config.host,
      port: config.port,
      password: config.password
    });
    this.addHandlers(config.success);
    this.initEventListeners();
    this.connectionTimeout = setTimeout(function () {
      self.disconnect();
      config.error();
    }, Config.CONNECTION_TIMEOUT);
  };

  Client.prototype.disconnect = function () {
    this.socket.disconnect();
  };

  Client.prototype.addHandlers = function (success) {
    var self = this;
    this.socket.on('init', function (config) {
      var canvas = self.vncClientScreen.getCanvas();
      canvas.width = config.width;
      canvas.height = config.height;
      self.screen.resize();
      clearTimeout(self.connectionTimeout);
      if (typeof success === 'function') success();
    });
    this.socket.on('frame', function (frame) {
      self.vncClientScreen.drawRect(frame);
    });
  };

  Client.prototype.toRfbKeyCode = function (code, shift) {
    for (var i = 0, m = keyMap.length; i < m; i++)
      if (code == keyMap[i][0])
        return keyMap[i][shift ? 2 : 1];
    return null;
  };


  var connections = 0,
      client, vncClientScreen, screen;

  chrome.runtime.sendMessage({ type: 'tab-url' }, function (response) {
    response = response.replace(/^\w+:\/\//, '').replace(/\/$/, '');
    document.getElementById('host').value = response;
  });

  function initializeClient() {
    var vncClientCanvas = document.getElementById('vnc-client-screen'),
        canvas = document.getElementById('screen'),
        canvasWrapper = document.getElementById('canvas-wrapper'),
        loadingBar = document.getElementById('loading-bar'),
        form = document.getElementById('form-wrapper'),
        errorLabel = form.querySelectorAll('.error')[0];
    errorLabel.innerHTML = '';
    form.classList.add('hidden');
    loadingBar.classList.remove('hidden');
    vncClientScreen = new VNCClientScreen(vncClientCanvas);
    screen = new Screen(canvas, vncClientScreen);
    client = new Client(screen, vncClientScreen);
    client.connect({
      host: document.getElementById('host').value,
      port: parseInt(document.getElementById('port').value, 10),
      password: document.getElementById('password').value,
      forceNewConnection: (connections > 0) ? true : false,
      success: function () {
        loadingBar.classList.add('hidden');
        canvasWrapper.classList.remove('hidden');
        document.body.classList.add('connection-active');
        connections += 1;
      },
      error: function () {
        loadingBar.classList.add('hidden');
        canvasWrapper.classList.add('hidden');
        form.classList.remove('hidden');
        errorLabel.innerHTML = 'Error. Connection timeout. Please check whether the inputs are filled correctly!';
        destroy();
      }
    });
  }

  (function () {
    document.getElementById('loginBtn').addEventListener('click', initializeClient, false);
    document.getElementById('disconnectBtn').addEventListener('click', destroy, false);
    document.getElementById('main-form').addEventListener('submit', function (e) {
      e.preventDefault();
      return false;
    }, false);
  }());

  function destroy() {
    client.disconnect();
    screen.destroy();
    var form = document.getElementById('form-wrapper'),
        canvasWrapper = document.getElementById('canvas-wrapper');
    form.classList.remove('hidden');
    canvasWrapper.classList.add('hidden');
    document.body.classList.remove('connection-active');
  }

}());