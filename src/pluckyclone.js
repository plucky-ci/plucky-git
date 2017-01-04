const {Task} = require('plucky-pipeliner');
const GitWrap = require('./gitwrap');
const path = require('path');

class PluckyClone extends Task {
	handler(state, next) {
		const {
			params = {},
		} = state;
		if(!params.repository) {
			return next(1, {status: 'repository must exist'});
		}
		if(!params.folder) {
			return next(1, {status: 'folder must exist'});
		}
		const gitWrap = new GitWrap(params.folder, params.repository);
		gitWrap.clone().then((result) => {
			return next(0, {result: path.join(process.cwd(), params.folder)});
		}).catch((error) => {
			return next(1, {status: error.toString()});
		});
	}
}

module.exports = { PluckyClone };