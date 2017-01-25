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

class PluckyCommitAndPush extends Task {
	handler(state, next) {
		const {
			params = {},
		} = state;

		if(!params.folder) {
			return next(1, {status: 'folder must exist'});
		}
		if(!params.file) {
			return newx(1, {status: 'file to commit must exist'});
		}

		const gitWrap = new GitWrap(params.folder, '');
		gitWrap.commit(params.file).then(() => {
			return next(0, {});
		}).catch((error) => {
			console.log('error');
		});
	}
}

module.exports = { PluckyClone, PluckyCommitAndPush };