import 'phoenix_html'
import socket from './socket'

class Toten {
    constructor(name) {
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.name = name;
    }
};


const model = {
    totens: []
};

const ReceiveTotens = 'receive-totens';
const SendCommand = 'send-command';

const update = (action, data, model) => {
    switch (action) {

        case ReceiveTotens:
            model.totens = data.map(name => {
                return model.totens.find(t => t.name === name) || new Toten(name);
            });
            return model;

        case SendCommand:
            data.channel.push('new_command', {
                toten: data.toten,
                command: data.command,
                arg: data.arg
            });

            return model;

        default: return model;
    }
};

const empty = node => {
    while (node.firstChild) {
        node.firstChild.remove();
    }
};

const colorPalette = (signal, toten, channel, area) => {
    const colors = [
        'hsl(0, 0%, 100%)',
        'hsl(0, 0%, 96%)',
        'hsl(0, 0%, 21%)',
        'hsl(0, 0%, 4%)',
        'hsl(171, 100%, 41%)',
        'hsl(217, 71%, 53%)',
        'hsl(204, 86%, 53%)',
        'hsl(141, 71%, 48%)',
        'hsl(48, 100%, 67%)',
        'hsl(348, 100%, 61%)'
    ];
    
    const el = document.createElement('div');

    colors.forEach(color => {
        const button = document.createElement('button');
        button.style.backgroundColor = color;
        button.classList.add('button');
        button.onclick = signal(SendCommand, { channel, toten: toten.name, command: `change_${area}_color`, arg: color });

        el.appendChild(button);
    });

    return el;
}

const totenEl = (signal, model, channel, toten) => {
    const el = document.createElement('div');
    const template = document.getElementById('toten-template');

    el.innerHTML = template.innerHTML;
    el.querySelector('.toten-name').innerText = `Toten: ${toten.name}`;
    el.querySelector('.toten-id').innerText = `${toten.id}`;

    el.querySelector('.font-colors').appendChild(colorPalette(signal, toten, channel, 'font'));
    el.querySelector('.background-colors').appendChild(colorPalette(signal, toten, channel, 'background'));

    el.querySelector('button.turn-off').onclick = signal(SendCommand, { channel, toten: toten.name, command: 'turn-off', arg: '' });

    return el;
};

const nothingHereEl = () => {
    const el = document.createElement('div');
    const p = document.createElement('p');

    p.innerText = `No toten connected...`;
    el.appendChild(p);

    return el;
};

const view = (signal, model, channel, root) => {
    empty(root);

    const elements =
        model.totens.length ?
            model.totens.map(toten => totenEl(signal, model, channel, toten)) :
            [ nothingHereEl() ];

    elements.forEach(element => { root.appendChild(element); });
};

const connect = (signal, model) => {
    const channel = socket.channel('central:totens', {});

    channel
        .join()
        .receive('ok', _ => { console.log(`Connected to socket at ${Date.now()}`) });

    return channel;
};

const mount = (model, update, view, root_element) => {
    const channel = connect(signal, model);

    const signal = (action, data) => {
        return () => {
            model = update(action, data, model);
            view(signal, model, channel, root_element);
        };
    };

    // init

    channel.on('totens', data => {
        signal(ReceiveTotens, 'totens' in data ? data.totens : [])();
    });

    view(signal, model, channel, root_element);
};

mount(model, update, view, document.getElementById('app'));
