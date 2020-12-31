window.addEventListener('load', function(){
    var heading = document.createElement('h1');
    heading.innerHTML = <%= titleStr %>;
    document.querySelector('#root').append(heading);
});
