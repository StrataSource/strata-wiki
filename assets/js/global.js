function considerSize() {
    if (window.innerWidth < 700) {
        document.body.classList.remove('sidebar-pinned');
    } else {
        document.body.classList.add('sidebar-pinned');
    }

    scrollSpy_calculate();
}

window.addEventListener('resize', considerSize);
window.addEventListener('load', considerSize);

let scrollSpy_targets = [];
let scrollSpy_menu = [];
let scrollSpy_index = 0;
let scrollSpy_breakpoint_up = -2;
let scrollSpy_breakpoint_down = -1;
function scrollSpy_calculate() {
    window.removeEventListener('scroll', scrollSpy_compare);

    let headings = document.querySelectorAll('#content h1');
    scrollSpy_targets = [];
    scrollSpy_index = 0;

    try {
        document.querySelector('.scrollspy-container').remove();
    } catch {}

    let menuContainer = document.createElement('div');
    menuContainer.classList.add('scrollspy-container');
    document.querySelector('.menu a.active').after(menuContainer);

    for (const heading of headings) {
        let hash = heading.textContent.toLowerCase().replaceAll(' ', '-');
        heading.id = hash;

        let bbox = heading.getBoundingClientRect();

        let height = bbox.top + window.scrollY - 1 - window.innerHeight / 4;

        scrollSpy_targets.push(height);

        let menuItem = document.createElement('a');
        menuItem.classList.add('scrollspy');
        menuItem.innerText = heading.innerText;
        menuItem.href = '#' + hash;
        menuContainer.append(menuItem);
        scrollSpy_menu.push(menuItem);

        //Debugging thingy
        /*let debug = document.createElement("div");
    debug.classList.add("debug-line");
    debug.style.top = `${height}px`;
    document.body.prepend(debug);
    */
    }

    scrollSpy_breakpoint_up = -2;
    scrollSpy_breakpoint_down = scrollSpy_targets[0];

    window.addEventListener('scroll', scrollSpy_compare);
}
function scrollSpy_compare() {
    window.scroll({
        left: 0
    });

    let change = 0;
    if (scrollSpy_breakpoint_up > window.scrollY) {
        change = -1;
    }
    if (scrollSpy_breakpoint_down < window.scrollY) {
        change = 1;
    }

    if (change != 0) {
        console.log('Changed by', change);
        if (scrollSpy_index > -1) {
            scrollSpy_menu[scrollSpy_index].classList.remove('active');
        }
        scrollSpy_index += change;
        if (scrollSpy_index > -1) {
            scrollSpy_menu[scrollSpy_index].classList.add('active');
        }

        scrollSpy_breakpoint_up = scrollSpy_targets[scrollSpy_index] - 1 || -1;
        scrollSpy_breakpoint_down =
            scrollSpy_targets[scrollSpy_index + 1] || document.body.getBoundingClientRect().height;

        scrollSpy_compare();
    }
}
