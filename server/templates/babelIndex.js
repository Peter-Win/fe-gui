window.addEventListener('load', () => {
    const root = document.querySelector('#root');

    const heading = document.createElement('h1');
    heading.innerHTML = <%= titleStr %>;
    root.append(heading);

    const p = document.createElement('p');
    p.innerHTML = 'Made by Babel with JavaScript and no framework';
    root.append(p);
});
