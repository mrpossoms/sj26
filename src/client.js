import g from 'g.js/web';
import State from './state.js';
import Renderer from './renderer.js';

g.web.canvas(document.getElementById('primary'));

g.initialize(function ()
{
    g.is_running = false;

    g.state = new State();

    g.web.assets.load(asset_list, function() {
        g.renderer = new Renderer(g.web.assets);
        g.is_running = true;
    });

    return true;
});

g.update(function (dt)
{
    g.state.time_s += dt;
});

g.web.draw(function (dt)
{
    if (!g.is_running) { return; }

    g.renderer.draw(g.state, dt);
});

g.start();
