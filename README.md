#Devtools VNC

This repository contains chrome extension and server which can be used for embedding VNC client inside your chrome devtools.

##Demo

![Demo](http://blog.mgechev.com/wp-content/uploads/devtools-vnc.gif)

#Installation

##Install the extension

In order to install the chrome extension:

1. Visit [chrome://extensions](chrome://extensions)
2. Enable **Developer mode**
3. Click on **Load unpacked extension...** and navigate to the extension directory (`./chrome-extension`)
4. Click **Select**

When you finish with these steps open Chrome Devtools, you should see new tab named **VNC Client**.

##Install the server

In order to install the server use:

```bash
cd server
npm install
npm i git+https://github.com/pkrumins/node-png --save
```

All dependencies for the server are now resolved. For running the server execute:

```bash
node index.js
```

Now in the form in the **VNC Client** tab enter hostname, port and password of valid VNC server, after that click **Connect**.

**NOTE:**

1. Only `vnc` security type is supported
2. Only `raw` format of the rectangles is supported

#License

This software is distributed under the terms of the MIT.