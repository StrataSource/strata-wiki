function notify(message, icon) {
    let container = document.createElement('div');
    container.classList.add('notice');

    let icn = document.createElement('span');
    icn.classList.add('icon', 'mdi', 'mdi-' + icon);
    container.append(icn);

    let msg = document.createElement('div');
    msg.classList.add('message');
    msg.innerHTML = message;
    container.append(msg);

    document.querySelector('.notices').append(container);
}

function clearNotices() {
    document.querySelector('.notices').innerHTML = '';
}

window.addEventListener('error', (e) => notify('An error occurred! ' + e.message, 'alert-circle'));
window.addEventListener('unhandledrejection', (e) => notify('An error occurred! ' + e.reason, 'alert-circle'));
