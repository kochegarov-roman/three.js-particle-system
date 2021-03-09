uniform float time;
uniform vec4 vPosition;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec2 pixels;
uniform vec2 uvRate1;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
    gl_PointSize = 1000. * (1. / - mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
