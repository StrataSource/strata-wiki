class ScrollSpy {
    init() {
        this.breakpoints = { up: -2, down: -1 };
        this.reset();
    }

    reset() {
        this.targets = [];
        this.menu = [];
        this.index = 0;

        window.removeEventListener('scroll', this.compare);
        document.querySelector('.scrollspy-container')?.remove();

        const menuContainer = document.createElement('div');
        menuContainer.classList.add('scrollspy-container');
        document.querySelector('.sidebar .article.active').after(menuContainer);

        const headings = document.querySelectorAll('.content h1');
        for (const heading of headings) {
            let hash = heading.textContent.toLowerCase().replaceAll(' ', '-');
            heading.id = hash;

            let bbox = heading.getBoundingClientRect();

            let height = bbox.top + window.scrollY - 1 - window.innerHeight / 4;

            this.targets.push(height);

            const menuItem = document.createElement('a');
            menuItem.classList.add('scrollspy');
            menuItem.textContent = heading.textContent;
            menuItem.href = `#${hash}`;
            menuContainer.append(menuItem);
            this.menu.push(menuItem);
        }

        this.breakpoints.up = -2;
        this.breakpoints.down = this.targets[0];
        window.addEventListener('scroll', this.compare);
    }

    compare() {
        window.scroll({ left: 0 });

        let change = 0;
        if (this.breakpoints.up > window.scrollY) {
            change = -1;
        } else if (this.breakpoints.down < window.scrollY) {
            change = 1;
        } else {
            return;
        }

        console.log('Changed by', change);
        if (this.index > -1) this.menu[this.index].classList.remove('active');

        this.index += change;
        if (this.index > -1) this.menu[this.index].classList.add('active');

        this.breakpoints.up = this.targets[this.index] - 1 || -1;
        this.breakpoints.down = this.targets[this.index + 1] || document.body.getBoundingClientRect().height;

        this.compare();
    }
}
