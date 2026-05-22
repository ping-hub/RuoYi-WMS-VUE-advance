const WebSocket = require('ws');

const port = 12353;
const server = new WebSocket.Server({ port });

console.log(`mock print server listening: ws://localhost:${port}`);

server.on('connection', ws => {
  console.log('client connected');

  ws.on('message', raw => {
    const text = raw.toString();
    console.log('\nrecv:', text);

    let req;
    try {
      req = JSON.parse(text);
    } catch (e) {
      ws.send(JSON.stringify({ msg: 'json err', code: -1, type: 'Unknown' }));
      return;
    }

    if (req.type === 'ListDevcies') {
      ws.send(JSON.stringify({
        msg: 'Success',
        code: 1,
        data: [
          { printerId: 'MOCK_PRINTER_001', description: 'mock printer 1', interface: 'usb' },
          { printerId: 'MOCK_PRINTER_002', description: 'mock printer 2', interface: 'usb' }
        ],
        printerId: '',
        type: 'ListDevcies'
      }));
      return;
    }

    if (req.type === 'SendData') {
      console.log('printerId:', req.printerId || '');
      console.log('data:\n' + (req.data || ''));
      ws.send(JSON.stringify({
        msg: 'Success',
        code: 1,
        printerId: req.printerId || '',
        type: 'SendData'
      }));
      return;
    }

    if (req.type === 'ClosePrinter') {
      ws.send(JSON.stringify({
        msg: 'success',
        code: 1,
        printerId: req.printerId || '',
        type: 'ClosePrinter'
      }));
      return;
    }

    ws.send(JSON.stringify({
      msg: `unsupported type: ${req.type}`,
      code: -1,
      printerId: req.printerId || '',
      type: req.type || 'Unknown'
    }));
  });

  ws.on('close', () => {
    console.log('client disconnected');
  });
});

