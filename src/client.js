import g from 'g.js/web';
import State from './state.js';

g.web.canvas(document.getElementById('primary'));

g.initialize(function ()
{
    g.is_running = true;

    g.state = new State();

    return true;
});

g.update(function (dt)
{
    g.state.time_s += dt;
});

g.web.draw(function (dt)
{
    if (!g.is_running) { return; }

    gl.clearColor(0.2, Math.sin(g.state.time_s), 0.25, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

});

g.start();
