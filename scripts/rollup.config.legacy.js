import json from "rollup-plugin-json";
import typescript from "rollup-plugin-typescript2";

export default {
	input: "src/index.ts",
	output: [
		{
			file: "build/WebRTCRecorder.legacy.js",
			format: "umd",
			indent: "\t",
			name: "WebRTCRecorder",
			sourcemap: true
		},
		{
			file: "build/WebRTCRecorder.legacy.module.js",
			format: "es",
			indent: "\t",
			sourcemap: false
		}
	],
	plugins: [
		json(),
		typescript({
			tsconfig: "./tsconfig.legacy.json"
		})
	]
};
