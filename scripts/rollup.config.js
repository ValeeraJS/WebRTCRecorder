import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

export default {
	input: 'src/index.ts',
	plugins: [
		json(),
		typescript({
			tsconfig: './tsconfig.json'
		})
	],
	output: [
		{
			format: 'umd',
			name: 'WebRTCRecorder',
			file: 'build/WebRTCRecorder.js',
			sourceMap: true,
			indent: '\t'
		},
		{
			format: 'es',
			file: 'build/WebRTCRecorder.module.js',
			sourceMap: true,
			indent: '\t'
		}
	]
};
