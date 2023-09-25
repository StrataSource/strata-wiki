function anchorHeaderFix() {
    document.scrollingElement.scrollTop -=
        document.querySelector('.top-nav').getBoundingClientRect().height + window.innerHeight / 10;
}

function addAnchorLinks() {
    const headings = document.querySelectorAll(
        '#content h1, #content h2, #content h3, #content h4, #content h5, #content h6'
    );
    for (const heading of headings) {
        const btn = document.createElement('a');
        btn.classList.add('anchor-copy', 'mdi', 'mdi-link-variant');
        btn.href = `javascript:copyAnchor("${heading.id}")`;
        btn.title = 'Click to copy anchor';
        heading.append(btn);
    }
}

function copyAnchor(id) {
    navigator.clipboard.writeText(location.href + '#' + id);
}
