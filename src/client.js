import g from 'g.js/web';

g.web.canvas(document.getElementById('primary'));

g.initialize(function ()
{
    g.is_running = true;

    return true;
});

g.update(function (dt)
{

});

g.web.draw(function (dt)
{
    if (!g.is_running) { return; }

    gl.clearColor(0.2, 0.2, 0.25, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

});

g.start();
