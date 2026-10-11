varying mediump vec2 v_uv;
uniform sampler2D u_texture;
uniform lowp vec4 u_tint;
void main (void)
{
	// if (v_uv.x < 0.01 || v_uv.x > 0.99 ) {
	// 	gl_FragColor = vec4(0, 0, 0, 1);
	// 	return;
	// }

	// if (v_uv.y < 0.01 || v_uv.y > 0.99 ) {
	// 	gl_FragColor = vec4(0, 0, 0, 1);
	// 	return;
	// }

	gl_FragColor = texture2D(u_texture, v_uv) * u_tint; 
}
