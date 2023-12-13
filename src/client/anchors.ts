export function anchorHeaderFix() {
    document.scrollingElement.scrollTop -=
        document.querySelector('.top-nav').getBoundingClientRect().height + window.innerHeight / 10;
}

function copyAnchor(e: MouseEvent) {
    // Suppress the navigation
    e.preventDefault();

    // Copy to clipboard
    navigator.clipboard.writeText((e.target as HTMLAnchorElement).href);
}

export function addAnchorLinks() {
    const headings = document.querySelectorAll(
        '#content h1, #content h2, #content h3, #content h4, #content h5, #content h6'
    );
    for (const heading of headings) {
        const btn = document.createElement('a');
        btn.classList.add('anchor-copy', 'mdi', 'mdi-link-variant');
        btn.href = `#${heading.id}`;
        btn.onclick = copyAnchor;
        btn.title = 'Click to copy anchor';
        heading.append(btn);
    }
}
