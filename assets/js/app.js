import css from '../css/app.css'
import 'phoenix_html'
import socket from './socket'

class Toten {
    constructor(name) {
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.fontColor = '#333333';
        this.backgroundColor = '#cccccc';
    }
};


const model = {
    totens: []
};

const ReceiveTotens = 'receive-totens';
const SendCommand = 'send-command';
const UpdateFontColor = 'update-font-color';
const UpdateBackgroundColor = 'update-background-color';

const update = (action, data, model) => {
    switch (action) {

        case ReceiveTotens:
            model.totens = data.map(name => {
                return model.totens.find(t => t.name === name) || new Toten(name);
            });
            return model;

        case UpdateFontColor:
            model.totens[model.totens.findIndex(t => t.id === data[0].id)].fontColor = data[1];
            return model;

        case UpdateBackgroundColor:
            model.totens[model.totens.findIndex(t => t.id === data[0].id)].backgroundColor = data[1];
            return model;

        case SendCommand:
            console.log('Send command', data);
            return model;

        default: return model;
    }
};

const empty = node => {
    while (node.firstChild) {
        node.firstChild.remove();
    }
};

const totenEl = (signal, model, toten) => {
    const el = document.createElement('div');
    const template = document.getElementById('toten-template');

    el.innerHTML = template.innerHTML;
    el.querySelector('h1').innerText = `Toten: ${toten.name}`;
    el.querySelector('small').innerText = `Id: ${toten.id}`;

    const fontInput = el.querySelector('input.input-font');
    fontInput.value = toten.fontColor;
    fontInput.onchange = () => {
        signal(UpdateFontColor, [toten, fontInput.value])();
        signal(SendCommand, ['new-font-color', fontInput.value])();
    };

    const backgroundInput = el.querySelector('input.input-background');
    backgroundInput.value = toten.backgroundColor;
    backgroundInput.onchange = (e) => {
        signal(UpdateBackgroundColor, [toten, backgroundInput.value])();
        signal(SendCommand, ['new-background-color', backgroundInput.value])();
    };

    el.querySelector('button.change-background').onclick = () => { backgroundInput.click(); };
    el.querySelector('button.change-font').onclick = () => { fontInput.click(); };
    el.querySelector('button.turn-off').onclick = signal(SendCommand, ['turn-off', '']);

    return el;
};

const nothingHereEl = () => {
    const el = document.createElement('div');
    const p = document.createElement('p');

    p.innerText = `No toten connected...`;
    el.appendChild(p);

    return el;
};

const view = (signal, model, root) => {
    empty(root);

    const elements =
        model.totens.length ?
            model.totens.map(toten => totenEl(signal, model, toten)) :
            [ nothingHereEl() ];

    elements.forEach(element => { root.appendChild(element); });
};

const connect = (signal, model) => {
    const channel = socket.channel('central:totens', {});

    channel
        .join()
        .receive('ok', _ => { console.log(`Connected to socket at ${Date.now()}`) });

    channel.on('totens', data => {
        signal(ReceiveTotens, 'totens' in data ? data.totens : [])();
    });

    return channel;
};

const mount = (model, update, view, root_element) => {
    const signal = (action, data) => {
        return () => {
            model = update(action, data, model);
            view(signal, model, root_element);
        };
    };

    view(signal, model, root_element);
    connect(signal, model);
};

mount(model, update, view, document.getElementById('app'));
