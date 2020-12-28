window.addEventListener('load', ():void => {
    const root: HTMLElement|null = document.querySelector('#root');
    if (!root) {
        throw new Error('#root element not found');
    }
    const heading: HTMLHeadingElement = document.createElement('h1');
    heading.innerHTML = 'Hello, world!';
    root.append(heading);

    const p: HTMLParagraphElement = document.createElement('p');
    p.innerHTML = 'Made by TypeScript (ts-loader) and no framework';
    root.append(p);
});
