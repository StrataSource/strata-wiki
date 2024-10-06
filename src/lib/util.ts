export function urlifyString(text: string) {
    text = encodeURI(
        text
            .toLowerCase()
            .replaceAll(" ", "-")
            .replace(/[^0-9a-z-]/gi, "")
    );

    if (text.endsWith("-")) {
        text = text.slice(0, -1);
    }

    return text;
}
